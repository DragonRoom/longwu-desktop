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

setSashSize(5);


export default function EditBook(props) {
  const router = useRouter();
  const { title } = router.query;
  const [showContent, setShowContent] = useState(true);
  const [showTree, setShowTree] = useState(true);
  const [showText, setShowText] = useState(true);
  const [showCard, setShowCard] = useState(true);


  return (
    <React.Fragment>
      <Head>
        <title>{title} → 第1卷 风起云涌 | 第2章 苏醒 → 3,245字</title>
      </Head>
      <div className="h-[100vh] text-center items-center">
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
            <Popover placement="bottomLeft" title={'界面样式调整'} content={stylePanel} trigger="click">
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
            <div className="bg-white h-full mt-2 w-full rounded-r-lg overflow-hidden border-2">
              <div className="bg-gray-500 bg-opacity-10 rounded-lg m-1">
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
                <div className="bg-white h-full mt-2 w-full rounded-lg overflow-hidden border-2">
                  <div className="bg-gray-500 bg-opacity-10 rounded-lg m-1">
                    大纲
                  </div>
                </div>
              </Allotment.Pane>
              <Allotment.Pane>
                <div className="bg-white h-full mt-[2px] w-full rounded-lg overflow-hidden border-2">
                  <div className="bg-gray-500 bg-opacity-10 rounded-lg m-1">
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
            <div className="bg-white h-full mt-2 w-full rounded-lg overflow-hidden border-2">
              <div className="bg-gray-500 bg-opacity-10 rounded-lg m-1">
                正文
              </div>
            </div>
          </Allotment.Pane>

          <Allotment.Pane
            visible={showCard}
            className={styles.rightPane}
            minSize={180}
          >
            <div className="bg-white h-full mt-2 w-full rounded-l-lg overflow-hidden border-2">
              <div className="bg-gray-500 bg-opacity-10 rounded-lg m-1">
                卡片
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
    </React.Fragment>
  );
}

const stylePanel = (
  <div>
    <div className="flex justify-start items-center mb-3">
      <div className="mr-4">背景颜色：</div>
      <ColorPicker /> &nbsp;&nbsp;
      <ColorPicker />
      </div>
    <div className="flex justify-start items-center mb-3">字体选择：</div>
    <div>
      <Button className="bg-blue-500 m-3 mb-1 " type="primary">应用</Button>
      <Button>还原</Button>
    </div>
  </div>
);