import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createCommand, KEY_DOWN_COMMAND, COMMAND_PRIORITY_NORMAL, RootNode } from 'lexical';

// 创建一个命令，用于执行序列化逻辑
export const SERIALIZE_COMMAND = createCommand();

const SerializeOnEnterPlugin = (props) => {
  const [editor] = useLexicalComposerContext();
  const namespace = props.namespace;
  const title = props.title;
  useEffect(() => {
    // 注册一个命令来监听按键事件
    const removeKeyDownCommandListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        const keyboardEvent = event;
        // 检查是否按下了Enter键
        if (keyboardEvent.key === 'Enter') {
          // 阻止默认的Enter键行为
          // keyboardEvent.preventDefault();
          // 执行序列化命令
          editor.dispatchCommand(SERIALIZE_COMMAND, null);
          return true; // 表示命令已处理
        }
        return false; // 表示命令未处理，允许其他命令处理器运行
      },
      COMMAND_PRIORITY_NORMAL
    );

    const removeNodeTransformListener = editor.registerNodeTransform(RootNode, (rootNode) => {
      const textContentSize = rootNode.getTextContentSize();

      const event = new CustomEvent('wordCountUpdated', { detail: { [namespace]: textContentSize } });
      window.dispatchEvent(event);
    });

    // 注册一个命令处理器，用于处理序列化命令
    const removeSerializeCommandListener = editor.registerCommand(
      SERIALIZE_COMMAND,
      () => {
        editor.update(() => {
          const editorState = editor.getEditorState();
          // const serializedState = JSON.stringify(editorState.toJSON());
          // console.log(namespace, 'serializedState:', serializedState); // 执行序列化逻辑，例如打印到控制台或存储
          if (!window.ipc) {
            console.log('ipc not found');
            return;
          }
          if(namespace === 'MainOutline') {
            if (!title) {
              console.log('title not found');
              return;
            }
            window.ipc.send('save-book-outline', {title, outline: editorState.toJSON()});
            window.ipc.on('save-book-outline', (arg) => {
              console.log('save-book-outline', arg);
            });
          }
        });

        return true; // 表示命令已处理
      },
      COMMAND_PRIORITY_NORMAL
    );

    // 组件卸载时移除监听器
    return () => {
      removeKeyDownCommandListener();
      removeSerializeCommandListener();
      removeNodeTransformListener();
    };
  }, [editor, namespace, title]);

  return null; // 插件不渲染任何UI组件
};

export default SerializeOnEnterPlugin;
