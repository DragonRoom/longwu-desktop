import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// 假设你有一个序列化的编辑器状态字符串
const serializedEditorState = '{"blocks":[{"type":"paragraph","children":[{"text":"Hello, world!"}]}]}';

const LoadSerializedStatePlugin = (props) => {
  const [editor] = useLexicalComposerContext();

  const { title, namespace, volume, chapter } = props;

  useEffect(() => {
    if (!window.ipc) {
      console.log('ipc not found');
      return;
    }
    if (!namespace) {
      console.log('namespace not found');
      return;
    }

    if (namespace === 'MainOutline') {
      if (!title) {
        console.log('title not found');
        return;
      }
      window.ipc.send('load-book-outline', {title});
      window.ipc.on('load-book-outline', (arg) => {
        console.log('load-book-outline', arg);
        if (arg.success) {
          editor.update(() => {
            // 解析编辑器状态并应用
            const editorState = editor.parseEditorState(arg.data);
            editor.setEditorState(editorState);
          });
        }
      });
    }

    
  }, [editor, title, namespace, volume, chapter]);

  return null;
};

export default LoadSerializedStatePlugin;
