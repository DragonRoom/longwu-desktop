import React, { useRef } from "react";

import { useTheme } from "../../hooks/useTheme";

import { Button, ColorPicker} from "antd";

export default function StylePanel() {
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

  const inputFileRef = useRef(null)
  const handleImageChange = (event) => {
    console.log('select bg img1');
    const file = event.target.files[0];
    console.log('select bg img2', file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('select bg img3');

        setBgImage(reader.result);
        console.log(reader.result);
      }
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">主题模板：</div>
        <select
          className="mr-5"
          value={currentTheme}
          onChange={(e) => {
            console.log("点击", e.target.value);
            setCurrentTheme(e.target.value);
          }}
        >
          {customThemes.map((v, i) => (
            <option key={i} value={i}>
              {v.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">背景颜色：</div>
        <ColorPicker
          showText
          value={color1}
          onChange={(v) => setColor1(v.toHexString())}
        />{" "}
        &nbsp;&nbsp;
        <ColorPicker
          showText
          value={color2}
          onChange={(v) => setColor2(v.toHexString())}
        />
      </div>

      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">背景图片：</div>
        <Button
          size="small"
          className="mr-1"
          onClick={() => {
            inputFileRef.current.click();
          }}
        >
          选取...
        </Button>
      </div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">面板颜色：</div>
        <ColorPicker
          showText
          value={colorPanel}
          onChange={(v) => setColorPanel(v.toHexString())}
        />{" "}
        &nbsp;&nbsp;
        <ColorPicker
          showText
          value={colorTitle}
          onChange={(v) => setColorTitle(v.toHexString())}
        />{" "}
        &nbsp;&nbsp;
      </div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">文字颜色：</div>
        <ColorPicker
          showText
          value={colorFont}
          onChange={(v) => setColorFont(v.toHexString())}
        />{" "}
        &nbsp;&nbsp;
      </div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">字体选择：</div>
        <select
          className="mr-5"
          onChange={async (e) => {
            console.log("点击", e.target.value);
            updateFontFamily(e.target.value);
          }}
        >
          {fonts.map((v) => (
            <option key={v.postscriptName} value={v.postscriptName}>
              {v.fullName}
            </option>
          ))}
        </select>
      </div>
      {/* 设置行间距和段间距 */}
      <div className="flex justify-start items-center mb-5 gap-4">
        <div className="mr-4">段间距：</div>
        <input
          className="w-[80px] text-center"
          type="range" min="0" max="3" step="0.1"
          value={paragraphHeight}
          onChange={(e) => {
            setParagraphHeight(Number(e.target.value));
          }}
        />
        <div className="mr-4">行间距：</div>
        <input
          className="w-[80px] text-center"
          type="range" min="1" max="3" step="0.1"
          value={lineHeight}
          onChange={(e) => {
            setLineHeight(Number(e.target.value));
          }}
        />
      </div>

      
      <div className="flex justify-center items-center mb-2">
        <Button
          type="primary"
          className="bg-blue-500 mr-3"
          size="small"
          onClick={() => {
            console.log("保存为模板", customThemes.length);
            let userTheme = {
              title: "自定义主题" + customThemes.length,
              bgColor1: color1,
              bgColor2: color2,
              panelColor: colorPanel,
              panelTitle: colorTitle,
              fontColor: colorFont,
              bgImg: bgImage,
              fontName: null,
              paragraphHeight: paragraphHeight,
              lineHeight: lineHeight,
            };
            window.ipc.send('save-themes-list', [...customThemes, userTheme]);
            window.ipc.on('save-themes-list', (arg) => {
              console.log('save-themes-list', arg);
            });
            console.log('保存为模板', userTheme);
            setCustomThemes((pre)=>[...pre, userTheme]);
            setCurrentTheme(customThemes.length);
          }}
        >
          保存为模板
        </Button>
        <Button
          size="small"
          onClick={() => {
            setCurrentTheme(0);
          }}
        >
          恢复默认
        </Button>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
          ref={inputFileRef}
        />
      </div>
    </div>
  );
}
