import React, { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  ContactsOutlined,
  OrderedListOutlined,
  FormOutlined,
  EyeOutlined,
  CloudSyncOutlined,
} from "@ant-design/icons";
import { Tooltip, Divider, Button, Popover, ColorPicker } from "antd";
import { Allotment, setSashSize } from "allotment";
import "allotment/dist/style.css";
import styles from "./basic.module.css";
import {
  isSupportQueryLocalFonts,
  queryFontList,
  queryTargetFontBlob,
} from 'local-font';

setSashSize(5);


export default function EditBook(props) {
  const router = useRouter();
  const { title } = router.query;
  const [showContent, setShowContent] = useState(true);
  const [showTree, setShowTree] = useState(true);
  const [showText, setShowText] = useState(true);
  const [showCard, setShowCard] = useState(true);
  const [color1, setColor1] = useState('#c0d4d7'); // bg color
  const [color2, setColor2] = useState('#e8e8e8'); // bg color
  const [colorFont, setColorFont] = useState('#000'); // font color
  const [colorPanel, setColorPanel] = useState('#ffffff80'); // panel color
  const [colorTitle, setColorTitle] = useState('#00000010'); // panel title color
  const [bgImage, setBgImage] = useState(null);
  const [bgOpacity, setBgOpacity] = useState(50);
  const [fonts, setFonts] = useState([]);

  useEffect(() => {
    if (isSupportQueryLocalFonts()) {
      queryFontList().then(v=>{
        setFonts(v.filter(v=>containsChinese(v.fullName)));
      }).catch(console.error); // FontData[]
    } else {
      console.log('不支持查询本地字体');
    }
  }, []);

  const StylePanel = (
    <div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">主题模板：</div>
        <select className="mr-5">
          <option value="1">模板1</option>
          <option value="2">模板2</option>
          <option value="3">模板3</option>
        </select>
      </div>

      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">背景颜色：</div>
        <ColorPicker showText value={color1} onChange={v=>setColor1(v.toHexString())} /> &nbsp;&nbsp;
        <ColorPicker showText value={color2} onChange={v=>setColor2(v.toHexString())} />
      </div>

      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">背景图片：</div>
        <Button size="small" className="mr-1">选取...</Button>
      </div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">面板颜色：</div>
        <ColorPicker showText value={colorPanel} onChange={v=>setColorPanel(v.toHexString())} /> &nbsp;&nbsp;
        <ColorPicker showText value={colorTitle} onChange={v=>setColorTitle(v.toHexString())} /> &nbsp;&nbsp;
      </div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">文字颜色：</div>
        <ColorPicker showText value={colorFont} onChange={v=>setColorFont(v.toHexString())} /> &nbsp;&nbsp;
      </div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">字体选择：</div>
        <select className="mr-5" onChange={async (e)=>{
          console.log('点击', e.target.value);
          updateFontFamily(e.target.value);
          // const textStyle = document.createElement("style");
          // textStyle.textContent = `@font-face {font-family: "dynamic-font";src: local("${e.target.value}");}`;
          // document.body.appendChild(textStyle);
          // document.body.style.fontFamily = "dynamic-font";          
        }}>
          {fonts.map((v)=><option key={v.postscriptName} value={v.postscriptName}>{v.fullName}</option>)}
        </select>
      </div>
      <div className="flex justify-center items-center mb-2">
        <Button type='primary' className="bg-blue-500 mr-3" size="small" onClick={()=>{
        }}>保存为模板</Button>
        <Button size="small" onClick={()=>{
          setColor1('#c0d4d7');
          setColor2('#e8e8e8');
          document.body.style.fontFamily = "sans-serif";          
          setColorFont('#000');
          setColorPanel('#ffffff80');
          setColorTitle('#00000010');
          setBgOpacity(50);
        }}>恢复默认</Button>

      </div>
    </div>
  );

  
  return (
    <React.Fragment>
      <Head>
        <title>{title} → 第1卷 风起云涌 | 第2章 苏醒 → 3,245字</title>
      </Head>
      <div 
        style={{ 
          backgroundImage: `linear-gradient(to top right, ${color1}, ${color2})`,
          color: colorFont,
        }}
        className={`h-[100vh] text-center items-center overflow-hidden`}
      >
        <div className="w-[600px] rounded-full bg-white m-auto rounded-t-none h-[26px] flex items-center text-center justify-center relative">
          <Tooltip title="返回书库" color={"blue"}>
            <Button
              onClick={() => {
                router.push("/home");
              }}
              className={` p-1 rounded hover:bg-blue-200 border-none absolute left-5`}
            >
              <img src="/images/home3.svg" width={15} alt="大纲" />
            </Button>
          </Tooltip>
          <Tooltip title="章节目录" color={"blue"}>
            <Button
              onClick={() => setShowContent(!showContent)}
              className={`${
                showContent ? "bg-gray-200" : ""
              } mr-2 p-1 pt-0 hover:bg-blue-200 rounded border-none`}
            >
              <OrderedListOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="大纲" color={"blue"}>
            <Button
              onClick={() => setShowTree(!showTree)}
              className={`cursor-pointer ${
                showTree ? "bg-gray-200" : ""
              } mr-2 p-1 hover:bg-blue-200 rounded border-none`}
            >
              <img src="/images/tree2.png" width={15} alt="大纲" />
            </Button>
          </Tooltip>
          <Tooltip title="正文" color={"blue"}>
            <Button
              onClick={() => setShowText(!showText)}
              className={`cursor-pointer ${
                showText ? "bg-gray-200" : ""
              } mr-2 p-1 pt-0 hover:bg-blue-200 rounded border-none`}
            >
              <FormOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="人物卡片" color={"blue"}>
            <Button
              onClick={() => setShowCard(!showCard)}
              className={`cursor-pointer ${
                showCard ? "bg-gray-200" : ""
              } mr-2 p-1 hover:bg-blue-200 rounded border-none`}
            >
              <img src="/images/card2.png" width={15} alt="大纲" />
            </Button>
          </Tooltip>
          
          {/* <Tooltip title="沉浸模式 (按Esc键退出沉浸模式)" color={"blue"}>
            <Button
              className={`cursor-pointer mr-2 p-1 pt-0 hover:bg-blue-200 rounded border-none`}
            >
              <EyeOutlined />
            </Button>
          </Tooltip> */}
          <Tooltip title="界面样式" placement="right" color={"blue"}>
            <Popover placement="bottomLeft" title={'界面样式调整'} content={StylePanel} trigger="click">
              <Button
                className={`cursor-pointer mr-2 p-1 hover:bg-blue-200 rounded border-none`}
              >
                <img src="/images/style2.png" width={15} alt="大纲" />
              </Button>
            </Popover>
          </Tooltip>

        </div>
        <Allotment
          snap={false}
          separator={false}
          defaultSizes={[100, 200, 200, 100]}
          className="flex w-full"
          onVisibleChange={(e) => {
            console.log("change", e);
          }}
        >
          <Allotment.Pane
            visible={showContent}
            className={styles.leftPane}
            minSize={180}
          >
            <div
              style={{
                backgroundColor: `${colorPanel}`,
              }}
            className={`h-full mt-2 w-full rounded-r-lg overflow-hidden border-2`}>
              <div style={{
                backgroundColor: `${colorTitle}`,
              }} className=" rounded-lg m-1">
                目录
              </div>
            </div>
          </Allotment.Pane>
          <Allotment.Pane
            visible={showTree}
            className={styles.rightPane}
            minSize={180}
          >
            <Allotment vertical separator={false}>
              <Allotment.Pane>
                <div
                  style={{
                    backgroundColor: `${colorPanel}`,
                  }}
                  className={`h-full mt-2 w-full rounded-lg overflow-hidden border-2`}>
                  <div style={{
                    backgroundColor: `${colorTitle}`,
                  }} className=" rounded-lg m-1">
                    大纲
                  </div>
                </div>
              </Allotment.Pane>
              <Allotment.Pane>
                <div
                  style={{
                    backgroundColor: `${colorPanel}`,
                  }} className={` h-full mt-[2px] w-full rounded-lg overflow-hidden border-2`}>
                  <div style={{
                    backgroundColor: `${colorTitle}`,
                  }} className=" rounded-lg m-1">
                    细纲 / 章纲
                  </div>
                </div>
              </Allotment.Pane>
            </Allotment>
            
          </Allotment.Pane>
          <Allotment.Pane
            visible={showText}
            className={styles.rightPane}
            minSize={200}
          >
            <div
              style={{
                backgroundColor: `${colorPanel}`,
              }} className={` h-full mt-2 w-full rounded-lg overflow-hidden border-2`}>
              <div style={{
                backgroundColor: `${colorTitle}`,
              }} className=" rounded-lg m-1">
                正文
              </div>
            </div>
          </Allotment.Pane>

          <Allotment.Pane
            visible={showCard}
            className={styles.rightPane}
            minSize={180}
          >
            <div
              style={{
                backgroundColor: `${colorPanel}`,
              }} className={` h-full mt-2 w-full rounded-l-lg overflow-hidden border-2`}>
              <div style={{
                backgroundColor: `${colorTitle}`,
              }} className=" rounded-lg m-1">
                卡片
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
    </React.Fragment>
  );
}

// 在外部初始化style元素，以便复用
const textStyle = document.createElement('style');
document.head.appendChild(textStyle); // 将style元素添加到head中，而不是body

function updateFontFamily(fontName) {
  // 只更新style元素的textContent来更改字体
  textStyle.textContent = `@font-face {font-family: "dynamic-font"; src: local("${fontName}");}`;
  document.body.style.fontFamily = "dynamic-font";
}

function containsChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}
