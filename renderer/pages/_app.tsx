'use client';
import React from 'react'
import type { AppProps } from 'next/app'

import '../styles/fonts.css';
import '../styles/globals.css'

import '../components/LexicalEditor/ui/EquationEditor.css'
import '../components/LexicalEditor/ui/ColorPicker.css'
import '../components/LexicalEditor/ui/Select.css'
import '../components/LexicalEditor/ui/Input.css'
import '../components/LexicalEditor/ui/Checkbox.css'
import '../components/LexicalEditor/ui/ContentEditable.css'
import '../components/LexicalEditor/ui/Modal.css'
import '../components/LexicalEditor/ui/Button.css'
import '../components/LexicalEditor/ui/Placeholder.css'
import '../components/LexicalEditor/ui/Dialog.css'
import '../components/LexicalEditor/ui/KatexEquationAlterer.css'
import '../components/LexicalEditor/nodes/InlineImageNode.css'
import '../components/LexicalEditor/nodes/PageBreakNode/index.css'
import '../components/LexicalEditor/nodes/PollNode.css'
import '../components/LexicalEditor/nodes/ExcalidrawNode/ExcalidrawModal.css'
import '../components/LexicalEditor/nodes/ImageNode.css'
import '../components/LexicalEditor/nodes/StickyNode.css'
import '../components/LexicalEditor/plugins/TableCellResizer/index.css'
import '../components/LexicalEditor/plugins/CodeActionMenuPlugin/index.css'
import '../components/LexicalEditor/plugins/CodeActionMenuPlugin/components/PrettierButton/index.css'
import '../components/LexicalEditor/plugins/CommentPlugin/index.css'
import '../components/LexicalEditor/plugins/FloatingLinkEditorPlugin/index.css'
import '../components/LexicalEditor/plugins/FloatingTextFormatToolbarPlugin/index.css'
import '../components/LexicalEditor/plugins/DraggableBlockPlugin/index.css'
import '../components/LexicalEditor/plugins/CollapsiblePlugin/Collapsible.css'
import '../components/LexicalEditor/plugins/TableOfContentsPlugin/index.css'
import '../components/LexicalEditor/index.css'
import '../components/LexicalEditor/themes/CommentEditorTheme.css'
import '../components/LexicalEditor/themes/PlaygroundEditorTheme.css'
import '../components/LexicalEditor/themes/StickyEditorTheme.css'

// if (process.platform === 'win32') {
//   require("../styles/custom-scrollbar.css");
// }

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
