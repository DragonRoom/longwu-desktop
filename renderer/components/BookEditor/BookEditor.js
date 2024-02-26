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


import { HoxRoot } from 'hox';

import LexicalEditor from '../LexicalEditor';

import { formatNumber } from "./utils";

import ContentTree from './ContentTree';

import { useBase } from '../../hooks/useBase';
import { useWordCnt } from '../../hooks/useWordCnt';
import { useCurrent } from '../../hooks/useCurrent';
import { useTheme } from "../../hooks/useTheme";

import NewChapterPanel from "./NewChapterPanel";
import NewVolumePanel from "./NewVolumePanel";
import StylePanel from "./StylePanel";
import { useThemeEffect } from "../../hooks/useThemeEffect";
import { useWordCntEffect } from "../../hooks/useWordCntEffect";
import { useKeydownEffect } from "../../hooks/useKeydownEffect";

if (typeof window !== 'undefined' && window.document) {
  setSashSize(5);
}

export default function BookEditor(props) {
  const router = useRouter();
  const { title } = props.title;

  useThemeEffect();
  useWordCntEffect();
  useKeydownEffect();


  const { 
    setTitle,

    showText, 
    setShowText,
    showCard,
    setShowCard,
    showContent,
    setShowContent,
    showTree,
    setShowTree,
    contentTree,
    
    showNewVolumePanel,
    setShowNewVolumePanel,
    showNewChapterPanel,
    setShowNewChapterPanel,
  } = useBase();

  const { currentVolume, currentChapter, currentDetailOutline, currentTextContent } = useCurrent();

  const { outline } = useWordCnt();

  const { 
    color1,
    color2,
    colorFont,
    colorPanel,
    colorTitle,
    bgImage,
    paragraphHeight,
    lineHeight,
  } = useTheme();

  useEffect(()=>{
    if (title) {
      setTitle(()=>title);
    }
  }, [title]);

  return (
    <React.Fragment>
      <Head>
        <title>{title} → {contentTree.find(v=>v.volume === currentVolume)?.title} | {contentTree.find(v=>v.volume === currentVolume)?.children.find(v=>v.chapter === currentChapter)?.title}</title>
      </Head>
      <HoxRoot>
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
                {
                  !!currentVolume && <Popover placement="bottomLeft" title={'添加章节'} open={showNewChapterPanel} onOpenChange={v=>setShowNewChapterPanel(v)} content={NewChapterPanel} trigger="click">
                    <Button size='small' className="p-0 bg-gray-200 hover:bg-blue-200 rounded-full border-none relative w-[24px] overflow-hidden hover:w-[84px]">
                      <PlusCircleOutlined className="absolute top-[5px] left-[5px]" />
                      <span className="absolute top-[1px] left-[15px]">添加章节</span>
                    </Button>
                  </Popover>
                }
              </div>
              <div style={{ height: 'calc(100% - 20px)' }} className="w-full overflow-scroll text-left">
                {
                  contentTree.length === 0 && <div className="h-full w-full flex items-center justify-center">
                    <pre className="bg-gray-200 text-gray-500 rounded-3xl text-sm p-4 whitespace-pre-wrap m-4">温馨提示: <br/>1)点左上角[+]添加卷; <br/>2)点右上角[+]添加章; <br/>3)或使用快捷键F8,F9:)</pre>
                  </div>
                }
                <div className="p-2 inline-block whitespace-nowrap">
                <ContentTree />
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
                    大纲 <span className="text-gray-500">{formatNumber(outline)}</span>
                    <Button onClick={()=>setShowTree(!showTree)} size="small" className="absolute right-[1px] border-none top-[1px]" >
                      <CloseOutlined />
                    </Button>
                  </div>
                  <div className="h-full w-full">
                    {
                      title && <LexicalEditor namespace="MainOutline" title={title} />
                    }
                  </div>
                </div>
              </Allotment.Pane>
              {
                currentChapter && <Allotment.Pane>
                <div
                  style={{
                    backgroundColor: `${colorPanel}`,
                  }} className={`h-full mt-[0px] w-full rounded-lg overflow-hidden border-2 relative`}>
                  <div style={{
                    backgroundColor: `${colorTitle}`,
                  }} className=" rounded-lg m-1">
                    细纲 / 章纲 <span className="text-gray-500">{formatNumber(currentDetailOutline)}</span>
                    <Button  onClick={()=>setShowTree(!showTree)} size="small" className="absolute right-[1px] border-none top-[1px]" >
                      <CloseOutlined />
                    </Button>
                  </div>
                  <div className="h-full w-full">
                    {
                      title && currentVolume && currentChapter && <LexicalEditor namespace="DetailOutline" title={title} volume={currentVolume} chapter={currentChapter} />
                    }
                  </div>
                </div>
              </Allotment.Pane>
              }
              
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
                正文 <span className="text-gray-500">{formatNumber(currentTextContent)}</span>
                <Button onClick={()=>setShowText(!showText)} size="small" className="absolute right-[1px] border-none top-[1px]" >
                  <CloseOutlined />
                </Button>
              </div>
              <div className="h-full w-full relative">
                {
                  title && currentVolume && currentChapter && <LexicalEditor namespace="TextContent" title={title} volume={currentVolume} chapter={currentChapter} />
                }
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
      </HoxRoot>
    </React.Fragment>
  );
}
