import { createGlobalStore } from 'hox';
import { useEffect, useMemo, useState } from 'react';

// 在外部初始化style元素，以便复用
let textStyle;
if (typeof window !== 'undefined') {
  textStyle = document.createElement('style');
  document.head.appendChild(textStyle); // 将style元素添加到head中，而不是body
}

function updateFontFamily(fontName) {
  if (typeof window !== 'undefined') {
    // 只更新style元素的textContent来更改字体
    textStyle.textContent = `@font-face {font-family: "dynamic-font"; src: local("${fontName}");}`;
    document.body.style.fontFamily = "dynamic-font";
  }
}

function _useTheme() {
  const [color1, setColor1] = useState('#c0d4d7'); // bg color
  const [color2, setColor2] = useState('#e8e8e8'); // bg color
  const [colorFont, setColorFont] = useState('#000'); // font color
  const [colorPanel, setColorPanel] = useState('#ffffff80'); // panel color
  const [colorTitle, setColorTitle] = useState('#00000010'); // panel title color
  const [bgImage, setBgImage] = useState(null);
  const [fonts, setFonts] = useState([]);
  const [customThemes, setCustomThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [paragraphHeight, setParagraphHeight] = useState(1.0);
  const [lineHeight, setLineHeight] = useState(1.8);

  return {
    color1,
    setColor1,
    color2,
    setColor2,
    colorFont,
    setColorFont,
    colorPanel,
    setColorPanel,
    colorTitle,
    setColorTitle,
    bgImage,
    setBgImage,
    fonts,
    setFonts,
    customThemes,
    setCustomThemes,
    currentTheme,
    setCurrentTheme,
    paragraphHeight,
    setParagraphHeight,
    lineHeight,
    setLineHeight,

    updateFontFamily,
  }
}

const [useTheme, getTheme] = createGlobalStore(_useTheme);

export { useTheme, getTheme };