import { createGlobalStore } from 'hox';
import { useEffect, useMemo, useState } from 'react';
import {
  isSupportQueryLocalFonts,
  queryFontList,
} from 'local-font';

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

function containsChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
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

  useEffect(()=>{
    setColor1(customThemes[currentTheme]?.bgColor1 || '#c0d4d7');
    setColor2(customThemes[currentTheme]?.bgColor2 || '#e8e8e8');
    setColorPanel(customThemes[currentTheme]?.panelColor || '#ffffff80');
    setColorTitle(customThemes[currentTheme]?.panelTitle || '#00000010');
    setColorFont(customThemes[currentTheme]?.fontColor || '#000');
    setBgImage(customThemes[currentTheme]?.bgImg || null);
    if (customThemes[currentTheme]?.fontName) {
      updateFontFamily(customThemes[currentTheme]?.fontName);
    }
  }, [currentTheme, customThemes]);

  useEffect(() => {
    if (isSupportQueryLocalFonts()) {
      queryFontList().then(v=>{
        setFonts(v.filter(v=>containsChinese(v.fullName)));
      }).catch(console.error); // FontData[]
    } else {
      console.log('不支持查询本地字体');
    }

    // get-themes-list from window.ipc 
    if (window.ipc) {
      window.ipc.send('get-themes-list', {});
      window.ipc.on('get-themes-list', (arg) => {
        // arg is an array of themes
        if (arg.success) {
          setCustomThemes(arg.data);
        }
      });
    }
  }, []);


  return {
    color1,
    color2,
    colorFont,
    colorPanel,
    colorTitle,
    bgImage,
    fonts,
    customThemes,
    currentTheme,
    setCurrentTheme,
    updateFontFamily,
  }
}

const [useTheme, getTheme] = createGlobalStore(_useTheme);

export { useTheme, getTheme };