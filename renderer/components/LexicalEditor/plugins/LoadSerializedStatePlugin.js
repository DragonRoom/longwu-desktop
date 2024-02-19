import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLEAR_EDITOR_COMMAND } from 'lexical';

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

    if (namespace === 'DetailOutline') {
      if (!title || !volume || !chapter) {
        console.log('title, volume, chapter not found');
        return;
      }
      window.ipc.send('load-chapter-detail-outline', {bookTitle: title, volumeNumber: volume, chapterNumber: chapter});
      window.ipc.on('load-chapter-detail-outline', (arg) => {
        console.log('load-chapter-detail-outline', arg);
        if (arg.success) {
          editor.update(() => {
            // 解析编辑器状态并应用
            const editorState = editor.parseEditorState(arg.data);
            editor.setEditorState(editorState);
          });
        } else {
          console.log('clear');
          editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        }
      });
    }

    if (namespace === 'TextContent') {
      if (!title || !volume || !chapter) {
        console.log('title, volume, chapter not found');
        return;
      }
      window.ipc.send('load-chapter-content', {bookTitle: title, volumeNumber: volume, chapterNumber: chapter});
      window.ipc.on('load-chapter-content', (arg) => {
        console.log('load-chapter-content', arg);
        if (arg.success) {
          editor.update(() => {
            // 解析编辑器状态并应用
            const editorState = editor.parseEditorState(arg.data);
            editor.setEditorState(editorState);
          });
        } else {
          console.log('clear');
          editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        }
      });
    }

    
  }, [editor, title, namespace, volume, chapter]);

  return null;
};

export default LoadSerializedStatePlugin;
