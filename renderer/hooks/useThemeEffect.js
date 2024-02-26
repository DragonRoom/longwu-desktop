import { useEffect, useMemo, useState } from 'react';
import {
  isSupportQueryLocalFonts,
  queryFontList,
} from 'local-font';
import { useTheme } from './useTheme';

function containsChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

export const useThemeEffect = () => {
  const { 
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
  } = useTheme();


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
    if (customThemes[currentTheme]?.paragraphHeight) {
      setParagraphHeight(customThemes[currentTheme]?.paragraphHeight);
    } else {
      setParagraphHeight(1.0);
    }
    if (customThemes[currentTheme]?.lineHeight) {
      setLineHeight(customThemes[currentTheme]?.lineHeight);
    } else {
      setLineHeight(1.8);
    }
  }, [currentTheme, customThemes]);

  useEffect(()=>{
    if (Number(paragraphHeight) > 0) {
      console.log('paragraphHeight', Number(paragraphHeight) + 'em');
      document.querySelectorAll('.PlaygroundEditorTheme__paragraph').forEach(function(p) {
        p.style.marginTop = Number(paragraphHeight) + 'em';
      });
    }

    if (Number(lineHeight) > 0) {
      console.log('lineHeight', Number(lineHeight) + 'em');
      document.querySelectorAll('.PlaygroundEditorTheme__paragraph').forEach(function(p) {
        p.style.lineHeight = Number(lineHeight) + 'em';
      });
    }
  }, [paragraphHeight, lineHeight])

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
}