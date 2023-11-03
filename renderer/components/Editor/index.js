import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';

// 这是Lexical编辑器的初始配置对象
const editorConfig = {
  // 此处添加更多配置选项
};

export default function Editor(props) {
  const [value, setValue] = React.useState('');

  // 定义一个处理Lexical状态变化的函数
  const onChange = (editorState) => {
    // 使用editorState.toString()来获取纯文本内容
    const textContent = editorState.toString();
    setValue(textContent);
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor" style={{ height: '100%' }}>
        {/* 使用PlainTextPlugin来支持纯文本编辑 */}
        <PlainTextPlugin
          contentEditable={<ContentEditable className="editor__content-editable" style={{ height: '100%', width: '100%', border: '1px solid orange', boxSizing: 'border-box' }} />}
        />
        {/* 使用OnChangePlugin来监听编辑器状态的变化 */}
        <OnChangePlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
}
