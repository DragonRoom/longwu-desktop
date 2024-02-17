import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, createCommand, KEY_DOWN_COMMAND, COMMAND_PRIORITY_NORMAL } from 'lexical';

// 创建一个命令，用于执行序列化逻辑
const SERIALIZE_COMMAND = createCommand();

const SerializeOnEnterPlugin = () => {
  const [editor] = useLexicalComposerContext();

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

    // 注册一个命令处理器，用于处理序列化命令
    const removeSerializeCommandListener = editor.registerCommand(
      SERIALIZE_COMMAND,
      () => {
        editor.update(() => {
          const editorState = editor.getEditorState();
          const serializedState = JSON.stringify(editorState.toJSON());
          console.log('serializedState:', serializedState); // 执行序列化逻辑，例如打印到控制台或存储
        });
        return true; // 表示命令已处理
      },
      COMMAND_PRIORITY_NORMAL
    );

    // 组件卸载时移除监听器
    return () => {
      removeKeyDownCommandListener();
      removeSerializeCommandListener();
    };
  }, [editor]);

  return null; // 插件不渲染任何UI组件
};

export default SerializeOnEnterPlugin;
