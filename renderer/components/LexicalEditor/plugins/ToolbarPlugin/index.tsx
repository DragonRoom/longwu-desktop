/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {INSERT_EMBED_COMMAND} from '@lexical/react/LexicalAutoEmbedPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$isDecoratorBlockNode} from '@lexical/react/LexicalDecoratorBlockNode';
import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from '@lexical/selection';
import {$isTableNode} from '@lexical/table';
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  DEPRECATED_$isGridSelection,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_DOWN_COMMAND,
  KEY_MODIFIER_COMMAND,
  LexicalEditor,
  NodeKey,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  createCommand,
} from 'lexical';
import {Dispatch, useCallback, useEffect, useState} from 'react';
import * as React from 'react';
import {IS_APPLE} from '../../../shared/src/environment';

import useModal from '../../hooks/useModal';
import catTypingGif from '../../images/cat-typing.gif';
import {$createStickyNode} from '../../nodes/StickyNode';
import DropDown, {DropDownItem} from '../../ui/DropDown';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {sanitizeUrl} from '../../utils/url';
import {EmbedConfigs} from '../AutoEmbedPlugin';
import {INSERT_COLLAPSIBLE_COMMAND} from '../CollapsiblePlugin';
import {InsertEquationDialog} from '../EquationsPlugin';
import {INSERT_EXCALIDRAW_COMMAND} from '../ExcalidrawPlugin';
import {
  INSERT_IMAGE_COMMAND,
  InsertImageDialog,
  InsertImagePayload,
} from '../ImagesPlugin';
import {InsertInlineImageDialog} from '../InlineImagePlugin';
import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog';
import {INSERT_PAGE_BREAK} from '../PageBreakPlugin';
import {InsertPollDialog} from '../PollPlugin';
import {InsertNewTableDialog, InsertTableDialog} from '../TablePlugin';
import { message } from 'antd';

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: '待办事项',
  code: '代码段',
  h1: '1级标题',
  h2: '2级标题',
  h3: '3级标题',
  h4: '4级标题',
  h5: '5级标题',
  h6: '6级标题',
  number: 'Numbered List',
  paragraph: '正文',
  quote: '引用',
};

const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
  ['21px', '21px'],
  ['22px', '22px'],
  ['23px', '23px'],
  ['24px', '24px'],
  ['25px', '25px'],
  ['26px', '26px'],
  ['27px', '27px'],
  ['28px', '28px'],
  ['29px', '29px'],
  ['30px', '30px'],
];

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, ''>]: {
    icon: string;
    iconRTL: string;
    name: string;
  };
} = {
  center: {
    icon: 'center-align',
    iconRTL: 'right-align',
    name: 'Center Align',
  },
  end: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: 'End Align',
  },
  justify: {
    icon: 'justify-align',
    iconRTL: 'justify-align',
    name: 'Justify Align',
  },
  left: {
    icon: 'left-align',
    iconRTL: 'left-align',
    name: 'Left Align',
  },
  right: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: 'Right Align',
  },
  start: {
    icon: 'left-align',
    iconRTL: 'right-align',
    name: 'Start Align',
  },
};

function dropDownActiveClass(active: boolean) {
  if (active) return 'active dropdown-item-active';
  else return '';
}

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (
        $isRangeSelection(selection) ||
        DEPRECATED_$isGridSelection(selection)
      ) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection();

        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection))
              selection.insertRawText(textContent);
          }
        }
      });
    }
  };

  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={'icon block-type ' + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style">
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
        onClick={formatParagraph}>
        <i className="icon paragraph" />
        <span className="text">普通文本</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h1')}
        onClick={() => formatHeading('h1')}>
        <i className="icon h1" />
        <span className="text">1级标题</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h2')}
        onClick={() => formatHeading('h2')}>
        <i className="icon h2" />
        <span className="text">2级标题</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h3')}
        onClick={() => formatHeading('h3')}>
        <i className="icon h3" />
        <span className="text">3级标题</span>
      </DropDownItem>
      {/* <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'bullet')}
        onClick={formatBulletList}>
        <i className="icon bullet-list" />
        <span className="text">Bullet List</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'number')}
        onClick={formatNumberedList}>
        <i className="icon numbered-list" />
        <span className="text">Numbered List</span>
      </DropDownItem> */}
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'check')}
        onClick={formatCheckList}>
        <i className="icon check-list" />
        <span className="text">待办事项</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'quote')}
        onClick={formatQuote}>
        <i className="icon quote" />
        <span className="text">引用</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'code')}
        onClick={formatCode}>
        <i className="icon code" />
        <span className="text">代码段</span>
      </DropDownItem>
    </DropDown>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}

function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style],
  );

  const buttonAriaLabel =
    style === 'font-family'
      ? 'Formatting options for font family'
      : 'Formatting options for font size';

  return (
    <DropDown
      disabled={disabled}
      buttonClassName={'toolbar-item ' + style}
      buttonLabel={value}
      buttonIconClassName={
        style === 'font-family' ? 'icon block-type font-family' : ''
      }
      buttonAriaLabel={buttonAriaLabel}>
      {(style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
        ([option, text]) => (
          <DropDownItem
            className={`item ${dropDownActiveClass(value === option)} ${
              style === 'font-size' ? 'fontsize-item' : ''
            }`}
            onClick={() => handleClick(option)}
            key={option}>
            <span className="text">{text}</span>
          </DropDownItem>
        ),
      )}
    </DropDown>
  );
}

function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || 'left'];

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatOption.name}
      buttonIconClassName={`icon ${
        isRTL ? formatOption.iconRTL : formatOption.icon
      }`}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel="Formatting options for text alignment">
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className="item">
        <i className="icon left-align" />
        <span className="text">Left Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="item">
        <i className="icon center-align" />
        <span className="text">Center Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="item">
        <i className="icon right-align" />
        <span className="text">Right Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className="item">
        <i className="icon justify-align" />
        <span className="text">Justify Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'start');
        }}
        className="item">
        <i
          className={`icon ${
            isRTL
              ? ELEMENT_FORMAT_OPTIONS.start.iconRTL
              : ELEMENT_FORMAT_OPTIONS.start.icon
          }`}
        />
        <span className="text">Start Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'end');
        }}
        className="item">
        <i
          className={`icon ${
            isRTL
              ? ELEMENT_FORMAT_OPTIONS.end.iconRTL
              : ELEMENT_FORMAT_OPTIONS.end.icon
          }`}
        />
        <span className="text">End Align</span>
      </DropDownItem>
      <Divider />
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        }}
        className="item">
        <i className={'icon ' + (isRTL ? 'indent' : 'outdent')} />
        <span className="text">Outdent</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }}
        className="item">
        <i className={'icon ' + (isRTL ? 'outdent' : 'indent')} />
        <span className="text">Indent</span>
      </DropDownItem>
    </DropDown>
  );
}

export const SHOW_FIND_WINDOW_COMMAND = createCommand();

function FindDialog(props) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [foundCnt, setFoundCnt] = useState(0);
  const [editor] = useLexicalComposerContext();

  return (
    <div className='w-[400px]'>
      <div className='flex justify-center items-center gap-1'>
        <div>查找内容：</div>
        <input type="text" className='bg-white border-blue-500 border rounded-lg' value={findText} onChange={e=>setFindText(e.target.value)} />
        <button onClick={()=>{
          editor.getEditorState().read(() => {
            console.log('obj', $getRoot().exportJSON());
            const text = $getRoot().getTextContent();
            const reg = new RegExp(findText, 'g');
            const matches = text.match(reg);
            setFoundCnt(matches?.length || 0);
          });
        }} className='border bg-blue-100 w-[100px] pr-2 pl-2 rounded-lg hover:bg-blue-400'>查找全部</button>
      </div>
      <div className='h-4' />
      <div className='flex justify-center items-center gap-1'>
        <div>替换内容：</div>
        <input type="text" className='bg-white border-blue-500 border rounded-lg' value={replaceText} onChange={e=>setReplaceText(e.target.value)} />
        <button onClick={()=>{
          editor.update(() => {
            const editorState = editor.getEditorState();
            const obj = editorState.toJSON();
            obj.root.children.forEach((child, idx) => {
              (child as any).children.forEach((item, idx) => {
                if (item.text) {
                  (item as any).text = (item as any).text.replace(new RegExp(findText, 'g'), replaceText);
                }
              });
            });
            editor.setEditorState(editor.parseEditorState(obj));
          });

          message.success('替换成功');
        }} className='border bg-blue-100 w-[100px] pr-2 pl-2 rounded-lg hover:bg-blue-400'>替换全部</button>
      </div>
      <div className='h-4' />
      <div>- 共找到{foundCnt}个匹配项。</div>
    </div>
  )
}

export default function ToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [rootType, setRootType] =
    useState<keyof typeof rootTypeToRootName>('root');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null,
  );
  const [fontSize, setFontSize] = useState<string>('15px');
  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#fff');
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('');
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType('table');
      } else {
        setRootType('root');
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : '',
            );
            return;
          }
        }
      }
      // Handle buttons
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000'),
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff',
        ),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
      );
      setElementFormat(
        ($isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType()) || 'left',
      );
    }
  }, [activeEditor]);

  useEffect(()=>{
    const removeShowCmd = editor.registerCommand(
      SHOW_FIND_WINDOW_COMMAND,
      (_payload) => {
        showModal('查找 & 替换', (onClose) => {
          return <FindDialog />
        });
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    return () => {
      removeShowCmd();
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const {code, ctrlKey, metaKey} = event;

        if (code === 'KeyK' && (ctrlKey || metaKey)) {
          event.preventDefault();
          if (!isLink) {
            setIsLinkEditMode(true);
          } else {
            setIsLinkEditMode(false);
          }
          return activeEditor.dispatchCommand(
            TOGGLE_LINK_COMMAND,
            sanitizeUrl('https://'),
          );
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            if (idx === 0 && anchor.offset !== 0) {
              node = node.splitText(anchor.offset)[1] || node;
            }
            if (idx === nodes.length - 1) {
              node = node.splitText(focus.offset)[0] || node;
            }

            if (node.__style !== '') {
              node.setStyle('');
            }
            if (node.__format !== 0) {
              node.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(node).setFormat('');
            }
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat('');
          }
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({color: value});
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string) => {
      console.log('onBgColorSelect', value);
      applyStyleText({'background-color': value});
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey],
  );
  const insertGifOnClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  return (
    <div className="toolbar">
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        title={IS_APPLE ? '撤销 (⌘Z)' : '撤销 (Ctrl+Z)'}
        type="button"
        className="toolbar-item spaced"
        aria-label="Undo">
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        title={IS_APPLE ? '重做 (⌘Y)' : '重做 (Ctrl+Y)'}
        type="button"
        className="toolbar-item"
        aria-label="Redo">
        <i className="format redo" />
      </button>
      <Divider />
      <button
        onClick={() => {
          activeEditor.dispatchCommand(SHOW_FIND_WINDOW_COMMAND, undefined);
        }}
        title={IS_APPLE ? "查找 & 替换 (⌘F)":"查找 & 替换 (Ctrl+F)"}
        type="button"
        className="toolbar-item spaced"
        aria-label="Find & Replace">
        <i className="format find" />
      </button>
      <Divider />
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown
            disabled={!isEditable}
            blockType={blockType}
            rootType={rootType}
            editor={editor}
          />
          <Divider />
        </>
      )}
      {blockType === 'code' ? (
        <DropDown
          disabled={!isEditable}
          buttonClassName="toolbar-item code-language"
          buttonLabel={getLanguageFriendlyName(codeLanguage)}
          buttonAriaLabel="Select language">
          {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
            return (
              <DropDownItem
                className={`item ${dropDownActiveClass(
                  value === codeLanguage,
                )}`}
                onClick={() => onCodeLanguageSelect(value)}
                key={value}>
                <span className="text">{name}</span>
              </DropDownItem>
            );
          })}
        </DropDown>
      ) : (
        <>
          {/* <FontDropDown
            disabled={!isEditable}
            style={'font-family'}
            value={fontFamily}
            editor={editor}
          /> */}
          <FontDropDown
            disabled={!isEditable}
            style={'font-size'}
            value={fontSize}
            editor={editor}
          />
          <Divider />
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
            className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
            title={IS_APPLE ? '加粗 (⌘B)' : '加粗 (Ctrl+B)'}
            type="button"
            aria-label={`Format text as bold. Shortcut: ${
              IS_APPLE ? '⌘B' : 'Ctrl+B'
            }`}>
            <i className="format bold" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
            className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
            title={IS_APPLE ? '斜体 (⌘I)' : '斜体 (Ctrl+I)'}
            type="button"
            aria-label={`Format text as italics. Shortcut: ${
              IS_APPLE ? '⌘I' : 'Ctrl+I'
            }`}>
            <i className="format italic" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }}
            className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
            title={IS_APPLE ? '下划线 (⌘U)' : '下划线 (Ctrl+U)'}
            type="button"
            aria-label={`Format text to underlined. Shortcut: ${
              IS_APPLE ? '⌘U' : 'Ctrl+U'
            }`}>
            <i className="format underline" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
            }}
            className={'toolbar-item spaced ' + (isCode ? 'active' : '')}
            title="代码段"
            type="button"
            aria-label="Insert code block">
            <i className="format code" />
          </button>
          <button
            disabled={!isEditable}
            onClick={insertLink}
            className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
            aria-label="Insert link"
            title="超链接"
            type="button">
            <i className="format link" />
          </button>
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting text color"
            buttonIconClassName="icon font-color"
            color={fontColor}
            onChange={onFontColorSelect}
            title="文字颜色"
          />
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting background color"
            buttonIconClassName="icon bg-color"
            color={bgColor}
            onChange={onBgColorSelect}
            title="文字底色"
          />
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel=""
            buttonAriaLabel="Formatting options for additional text styles"
            buttonIconClassName="icon dropdown-more">
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  FORMAT_TEXT_COMMAND,
                  'strikethrough',
                );
              }}
              className={'item ' + dropDownActiveClass(isStrikethrough)}
              title="删除线"
              aria-label="Format text with a strikethrough">
              <i className="icon strikethrough" />
              <span className="text">删除线</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
              }}
              className={'item ' + dropDownActiveClass(isSubscript)}
              title="下标"
              aria-label="Format text with a subscript">
              <i className="icon subscript" />
              <span className="text">下标</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  FORMAT_TEXT_COMMAND,
                  'superscript',
                );
              }}
              className={'item ' + dropDownActiveClass(isSuperscript)}
              title="上标"
              aria-label="Format text with a superscript">
              <i className="icon superscript" />
              <span className="text">上标</span>
            </DropDownItem>
            <DropDownItem
              onClick={clearFormatting}
              className="item"
              title="Clear text formatting"
              aria-label="Clear all text formatting">
              <i className="icon clear" />
              <span className="text">清除格式</span>
            </DropDownItem>
          </DropDown>
          <Divider />
          {rootType === 'table' && (
            <>
              <DropDown
                disabled={!isEditable}
                buttonClassName="toolbar-item spaced"
                buttonLabel="Table"
                buttonAriaLabel="Open table toolkit"
                buttonIconClassName="icon table secondary">
                <DropDownItem
                  onClick={() => {
                    /**/
                  }}
                  className="item">
                  <span className="text">TODO</span>
                </DropDownItem>
              </DropDown>
              <Divider />
            </>
          )}
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel="插入"
            buttonAriaLabel="Insert specialized editor node"
            buttonIconClassName="icon plus">
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  INSERT_HORIZONTAL_RULE_COMMAND,
                  undefined,
                );
              }}
              className="item">
              <i className="icon horizontal-rule" />
              <span className="text">分行符</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(INSERT_PAGE_BREAK, undefined);
              }}
              className="item">
              <i className="icon page-break" />
              <span className="text">分页符</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                showModal('Insert Image', (onClose) => (
                  <InsertImageDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                  />
                ));
              }}
              className="item">
              <i className="icon image" />
              <span className="text">图片</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                showModal('插入图片', (onClose) => (
                  <InsertInlineImageDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                  />
                ));
              }}
              className="item">
              <i className="icon image" />
              <span className="text">行内图片</span>
            </DropDownItem>
            <DropDownItem
              onClick={() =>
                insertGifOnClick({
                  altText: 'Cat typing on a laptop',
                  src: '/images/cat-typing.gif',
                })
              }
              className="item">
              <i className="icon gif" />
              <span className="text">GIF</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  INSERT_EXCALIDRAW_COMMAND,
                  undefined,
                );
              }}
              className="item">
              <i className="icon diagram-2" />
              <span className="text">自由绘制</span>
            </DropDownItem>
            {/* <DropDownItem
              onClick={() => {
                showModal('Insert Table', (onClose) => (
                  <InsertTableDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                  />
                ));
              }}
              className="item">
              <i className="icon table" />
              <span className="text">Table</span>
            </DropDownItem> */}
            <DropDownItem
              onClick={() => {
                showModal('Insert Table', (onClose) => (
                  <InsertNewTableDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                  />
                ));
              }}
              className="item">
              <i className="icon table" />
              <span className="text">表格</span>
            </DropDownItem>
            {/* <DropDownItem
              onClick={() => {
                showModal('Insert Poll', (onClose) => (
                  <InsertPollDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                  />
                ));
              }}
              className="item">
              <i className="icon poll" />
              <span className="text">Poll</span>
            </DropDownItem> */}
            <DropDownItem
              onClick={() => {
                showModal('Insert Columns Layout', (onClose) => (
                  <InsertLayoutDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                  />
                ));
              }}
              className="item">
              <i className="icon columns" />
              <span className="text">左右分栏</span>
            </DropDownItem>

            <DropDownItem
              onClick={() => {
                showModal('Insert Equation', (onClose) => (
                  <InsertEquationDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                  />
                ));
              }}
              className="item">
              <i className="icon equation" />
              <span className="text">数学公式</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                editor.update(() => {
                  const root = $getRoot();
                  const stickyNode = $createStickyNode(0, 0);
                  root.append(stickyNode);
                });
              }}
              className="item">
              <i className="icon sticky" />
              <span className="text">便签纸</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
              }}
              className="item">
              <i className="icon caret-right" />
              <span className="text">折叠面板</span>
            </DropDownItem>
            {/* {EmbedConfigs.map((embedConfig) => (
              <DropDownItem
                key={embedConfig.type}
                onClick={() => {
                  activeEditor.dispatchCommand(
                    INSERT_EMBED_COMMAND,
                    embedConfig.type,
                  );
                }}
                className="item">
                {embedConfig.icon}
                <span className="text">{embedConfig.contentName}</span>
              </DropDownItem>
            ))} */}
          </DropDown>
        </>
      )}
      <Divider />
      {/* <ElementFormatDropdown
        disabled={!isEditable}
        value={elementFormat}
        editor={editor}
        isRTL={isRTL}
      /> */}

      {modal}
    </div>
  );
}
