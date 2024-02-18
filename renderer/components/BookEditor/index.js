import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  ContactsOutlined,
  OrderedListOutlined,
  FormOutlined,
  EyeOutlined,
  CloudSyncOutlined,
  CloseOutlined,
  PlusCircleOutlined,
  PlusSquareOutlined,
  DownOutlined,
  FrownFilled,
  FrownOutlined,
  MehOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { Tooltip, Divider, Button, Popover, ColorPicker, Tree, Dropdown } from "antd";
import { Allotment, setSashSize } from "allotment";
import "allotment/dist/style.css";
import styles from "./basic.module.css";
import {
  isSupportQueryLocalFonts,
  queryFontList,
} from 'local-font';

import LexicalEditor from '../LexicalEditor';
import { formatNumber, promisify } from "./utils";

import ContentTree from './ContentTree';

if (typeof window !== 'undefined' && window.document) {
  setSashSize(5);
}

const iconStyle = ({ selected }) => (selected ? <img src="/images/openChapter.svg" width={22} alt="章" /> : <img src="/images/chapter.svg" width={22} alt="章" />);

export default function BookEditor(props) {
  const router = useRouter();
  const { title } = props.title;
  const [showContent, setShowContent] = useState(true);
  const [showTree, setShowTree] = useState(true);
  const [showText, setShowText] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [color1, setColor1] = useState('#c0d4d7'); // bg color
  const [color2, setColor2] = useState('#e8e8e8'); // bg color
  const [colorFont, setColorFont] = useState('#000'); // font color
  const [colorPanel, setColorPanel] = useState('#ffffff80'); // panel color
  const [colorTitle, setColorTitle] = useState('#00000010'); // panel title color
  const [bgImage, setBgImage] = useState(null);
  const [fonts, setFonts] = useState([]);
  const [customThemes, setCustomThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [newVolumeName, setNewVolumeName] = useState('');
  const [showNewVolumePanel, setShowNewVolumePanel] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [showNewChapterPanel, setShowNewChapterPanel] = useState(false);
  const [contentTree, setContentTree] = useState([]);
  const [treeUpdater, setTreeUpdater] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);

  const showEditors = () => {
    // setShowCard(true);
    // setShowTree(true);
    setShowText(true);
  }

  useEffect(() => {
    if (!window.ipc) {
      return;
    }

    const func = async () => {
      window.ipc.send('get-volume-list', title);
      let arg = await promisify(window.ipc.on, 'get-volume-list');
      console.log('get-volume-list', arg);
      let _contentTree = [];
      let volumeTitles = Object.values(arg.data).map(v=>v.title);
      console.log('volumeTitles', volumeTitles);
      for (let i=0; i<volumeTitles.length; i++) {
        _contentTree.push({
          title: volumeTitles[i],
          volume: (i + 1).toString(),
          key: i.toString(),
          icon: <img src="/images/volume.svg" width={22} alt="卷" />,
          words: 0,
          children: [],
        });

        window.ipc.send('list-chapters', {bookTitle: title, volumeNumber: (i + 1).toString()});
        let arg2 = await promisify(window.ipc.on, 'list-chapters');
        console.log('list-chapters', arg2);
        let chapterTitles = Object.values(arg2.data).map(v=>v.title);
        console.log('chapterTitles', chapterTitles);
        for (let j=0; j<chapterTitles.length; j++) {
          _contentTree[i].children.push({
            title: chapterTitles[j],
            volume: (i + 1).toString(),
            chapter: (j + 1).toString(),
            key: i.toString() + '-' + j.toString(),
            icon: iconStyle,
            words: 0,
          });
        }
      }

      console.log('contentTree', _contentTree);
      setContentTree(_contentTree);
    }

    func().then(console.log('update contentTree finish')).catch(console.error);

  }, [treeUpdater, title]);

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

  const StylePanel = (
    <div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">主题模板：</div>
        <select className="mr-5" value={currentTheme} onChange={e=>{
          console.log('点击', e.target.value);
          setCurrentTheme(e.target.value);
        }}>
          {customThemes.map((v, i)=><option key={i} value={i}>{v.title}</option>)}
        </select>
      </div>

      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">背景颜色：</div>
        <ColorPicker showText value={color1} onChange={v=>setColor1(v.toHexString())} /> &nbsp;&nbsp;
        <ColorPicker showText value={color2} onChange={v=>setColor2(v.toHexString())} />
      </div>

      <div className="flex justify-start items-center mb-5">
        <div className="mr-4">背景图片：</div>
        <Button size="small" className="mr-1" onClick={()=>{
          inputFileRef.current.click();
        }}>选取...</Button>
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
        }}>
          {fonts.map((v)=><option key={v.postscriptName} value={v.postscriptName}>{v.fullName}</option>)}
        </select>
      </div>
      <div className="flex justify-center items-center mb-2">
        <Button type='primary' className="bg-blue-500 mr-3" size="small" onClick={()=>{
        }}>保存为模板</Button>
        <Button size="small" onClick={()=>{
          setCurrentTheme(0);
        }}>恢复默认</Button>
        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} ref={inputFileRef}/>
      </div>
    </div>
  );

  const NewVolumePanel = (
    <div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-0">分卷名称：</div>
        <input type="text" className=" border mr-3" value={newVolumeName} onChange={e=>setNewVolumeName(e.target.value)} />
        <Button type='primary' className="bg-blue-500" size="small" onClick={async ()=>{
          console.log('添加分卷');
          if (!window.ipc) return;
          window.ipc.send('add-volume-directory', {title, volumeTitle: newVolumeName});
          window.ipc.on('add-volume-directory', (arg) => {
            console.log('add-volume-directory', arg);
            // arg is an array of themes
            if (arg.success) {
              console.log('volumes', arg.data);
              // setCustomThemes(arg.data);
              setShowNewVolumePanel(false);
              setNewVolumeName('');
              setCurrentVolume(arg.data.length.toString());
              setTreeUpdater(Date.now());
            }
          });
          }}>确定</Button>
      </div>
    </div>
  );

  const NewChapterPanel = (
    <div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-0">章节名称：</div>
        <input type="text" className=" border mr-3" value={newChapterName} onChange={e=>setNewChapterName(e.target.value)} />
        <Button type='primary' className="bg-blue-500" size="small" onClick={async ()=>{
          console.log('添加章节');
          if (!window.ipc) return;
          window.ipc.send('create-chapter', {bookTitle: title, volumeNumber: currentVolume, chapterTitle: newChapterName});
          window.ipc.on('create-chapter', (arg) => {
            console.log('create-chapter', arg);
            // arg is an array of themes
            if (arg.success) {
              console.log('chapters', arg.data);
              // setCustomThemes(arg.data);
              setShowNewChapterPanel(false);
              setNewChapterName('');
              setCurrentChapter(arg.data.length.toString());
              showEditors();
              setTreeUpdater(Date.now());
            }
          });
          }}>确定</Button>
      </div>
    </div>
  );
  
  return (
    <React.Fragment>
      <Head>
        <title>{title} → {contentTree.find(v=>v.volume === currentVolume)?.title} | {contentTree.find(v=>v.volume === currentVolume)?.children.find(v=>v.chapter === currentChapter)?.title}</title>
      </Head>
      <div 
        style={{ 
          backgroundImage: bgImage ? `url(${bgImage})` : `linear-gradient(to top right, ${color1}, ${color2})`,
          color: colorFont,
        }}
        className={`h-[100vh] text-center items-center overflow-hidden relative`}
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
        <div className="h-2"></div>
        <div
          style={{height: 'calc(100% - 40px)'}}
        className="relative h-full">
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
            className={`h-full w-full rounded-r-lg overflow-hidden border-2 relative`}>
              <div style={{
                backgroundColor: `${colorTitle}`,
              }} className=" rounded-lg m-1">
                目录
                <Button onClick={()=>setShowContent(!showContent)} size="small" className="absolute right-[1px] border-none top-[1px]" >
                  <CloseOutlined />
                </Button>
              </div>
              <div className="mr-1 ml-1 flex justify-between">
                <Popover placement="bottomLeft" title={'添加分卷'} open={showNewVolumePanel} onOpenChange={v=>setShowNewVolumePanel(v)} content={NewVolumePanel} trigger="click">
                  <Button size='small' className="p-0 bg-gray-200 hover:bg-blue-200 rounded-full border-none relative w-[24px] overflow-hidden hover:w-[84px]" >
                    <PlusSquareOutlined  className="absolute top-[5px] left-[5px]" />
                    <span className="absolute top-[1px] left-[15px]">添加分卷</span>
                  </Button>
                </Popover>
                <Popover placement="bottomLeft" title={'添加章节'} open={showNewChapterPanel} onOpenChange={v=>setShowNewChapterPanel(v)} content={NewChapterPanel} trigger="click">
                  <Button size='small' className="p-0 bg-gray-200 hover:bg-blue-200 rounded-full border-none relative w-[24px] overflow-hidden hover:w-[84px]">
                    <PlusCircleOutlined className="absolute top-[5px] left-[5px]" />
                    <span className="absolute top-[1px] left-[15px]">添加章节</span>
                  </Button>
                </Popover>
              </div>
              <div className="h-full w-full overflow-scroll text-left">
                {
                  contentTree.length === 0 && <div className="h-full w-full flex items-center justify-center">
                    <pre className="bg-gray-200 text-gray-500 rounded-3xl text-sm p-4 whitespace-pre-wrap m-4">温馨提示: <br/>1)点击左上角[+]添加新卷; <br/>2)点击右上角[+]添加章节; <br/>3)点击章节, 开始写作 :)</pre>
                  </div>
                }
                <div className="h-full p-2 inline-block whitespace-nowrap">
                  <ContentTree title={title}
                    contentTree={contentTree} 
                    setTreeUpdater={setTreeUpdater} 
                    setCurrentChapter={setCurrentChapter} 
                    setCurrentVolume={setCurrentVolume} 
                    showEditors={showEditors}
                  />
                </div>
                
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
                  className={`h-full w-full rounded-lg overflow-hidden border-2 relative`}>
                  <div style={{
                    backgroundColor: `${colorTitle}`,
                  }} className=" rounded-lg m-1">
                    大纲 <span className="text-gray-500">{formatNumber(3245)}</span>
                    <Button onClick={()=>setShowTree(!showTree)} size="small" className="absolute right-[1px] border-none top-[1px]" >
                      <CloseOutlined />
                    </Button>
                  </div>
                  <div className="h-full w-full">
                    <LexicalEditor namespace="MainOutline" title={title} volume={currentVolume} chapter={currentChapter} />
                  </div>
                </div>
              </Allotment.Pane>
              <Allotment.Pane>
                <div
                  style={{
                    backgroundColor: `${colorPanel}`,
                  }} className={`h-full mt-[0px] w-full rounded-lg overflow-hidden border-2 relative`}>
                  <div style={{
                    backgroundColor: `${colorTitle}`,
                  }} className=" rounded-lg m-1">
                    细纲 / 章纲 <span className="text-gray-500">{formatNumber(3245)}</span>
                    <Button  onClick={()=>setShowTree(!showTree)} size="small" className="absolute right-[1px] border-none top-[1px]" >
                      <CloseOutlined />
                    </Button>
                  </div>
                  <div className="h-full w-full">
                    <LexicalEditor namespace="DetailOutline" title={title} volume={currentVolume} chapter={currentChapter} />
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
              }} className={`h-full w-full rounded-lg overflow-hidden border-2 relative`}>
              <div style={{
                backgroundColor: `${colorTitle}`,
              }} className=" rounded-lg m-1">
                正文 <span className="text-gray-500">{formatNumber(3245)}</span>
                <Button onClick={()=>setShowText(!showText)} size="small" className="absolute right-[1px] border-none top-[1px]" >
                  <CloseOutlined />
                </Button>
              </div>
              <div className="h-full w-full relative">
                <LexicalEditor namespace="TextContent" title={title} volume={currentVolume} chapter={currentChapter} />
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
              }} className={` h-full w-full rounded-l-lg overflow-hidden border-2 relative`}>
              <div style={{
                backgroundColor: `${colorTitle}`,
              }} className=" rounded-lg m-1">
                卡片
                <Button onClick={()=>setShowCard(!showCard)} size="small" className="absolute right-[1px] border-none top-[1px]" >
                  <CloseOutlined />
                </Button>
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
        </div>
      </div>
    </React.Fragment>
  );
}


// 在外部初始化style元素，以便复用
let textStyle;
if (typeof window !== 'undefined' && window.document) {
  textStyle = document.createElement('style');
  document.head.appendChild(textStyle); // 将style元素添加到head中，而不是body
}

function updateFontFamily(fontName) {
  // 只更新style元素的textContent来更改字体
  textStyle.textContent = `@font-face {font-family: "dynamic-font"; src: local("${fontName}");}`;
  document.body.style.fontFamily = "dynamic-font";
}

function containsChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}
