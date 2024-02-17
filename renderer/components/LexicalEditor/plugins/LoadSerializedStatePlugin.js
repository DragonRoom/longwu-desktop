import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { parseEditorState } from 'lexical';

// 假设你有一个序列化的编辑器状态字符串
const serializedEditorState = '{"blocks":[{"type":"paragraph","children":[{"text":"Hello, world!"}]}]}';

const LoadSerializedStatePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 反序列化JSON字符串
    const editorStateJSON = JSON.parse(serializedEditorState);

    editor.update(() => {
      // 解析编辑器状态并应用
      const editorState = parseEditorState(editorStateJSON);
      editor.setEditorState(editorState);
    });
  }, [editor]);

  return null;
};

export default LoadSerializedStatePlugin;
