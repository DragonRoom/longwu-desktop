import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ContactsOutlined, OrderedListOutlined, FormOutlined, EyeOutlined, CloudSyncOutlined } from '@ant-design/icons';
import { Tooltip, Divider } from 'antd';
import Split from 'react-split';

export default function EditBook(props) {
  const router = useRouter();
  const { title } = router.query;

  return <React.Fragment>
  <Head>
    <title>{title} → 第1卷 风起云涌 | 第2章 苏醒 → 3,245字</title>
  </Head>
  <div className='h-[100vh] text-center items-center'>
    <div className='w-[600px] rounded-full bg-white m-auto rounded-t-none h-[26px] flex items-center text-center justify-center'>
      <Tooltip title="章节目录" color={'blue'}>
        <OrderedListOutlined className='cursor-pointer bg-gray-200 hover:bg-blue-200 p-[2px] pr-[4px] pl-[4px] rounded transform hover:scale-105 transition-all mr-2' />
      </Tooltip>
      <Tooltip title="大纲" color={'blue'}>
        <img src='/images/tree2.png' width={25} alt='大纲' className='cursor-pointer bg-gray-200 hover:bg-blue-200 p-[2px] pr-[4px] pl-[4px] rounded transform hover:scale-105 transition-all mr-2' />
      </Tooltip>
      <Tooltip title="正文" color={'blue'}>
        <FormOutlined className='cursor-pointer bg-gray-200 hover:bg-blue-200 p-[2px] pr-[4px] pl-[4px] rounded transform hover:scale-105 transition-all mr-2' />
      </Tooltip>
      <Tooltip title="沉浸模式(按Esc键退出沉浸模式)" color={'blue'}>
        <EyeOutlined className='cursor-pointer bg-gray-200 hover:bg-blue-200 p-[2px] pr-[4px] pl-[4px] rounded transform hover:scale-105 transition-all mr-2' />
      </Tooltip>
      <Tooltip title="界面样式" color={'blue'}>
        <img src='/images/style2.png' width={25} alt='样式' className='cursor-pointer bg-gray-200 hover:bg-blue-200 p-[2px] pr-[4px] pl-[4px] rounded transform hover:scale-105 transition-all mr-2' />
      </Tooltip>
      <Tooltip title="人物卡片" color={'blue'}>
        <img src='/images/card2.png' width={25} alt='卡片' className='cursor-pointer bg-gray-200 hover:bg-blue-200 p-[1px] pr-[2px] pl-[2px] rounded transform hover:scale-105 transition-all' />
      </Tooltip>
    </div>
    <Split className='flex h-full pb-10 w-full'
      sizes={[20, 60, 20]}
      minSize={100}
      expandToMin={false}
      gutterSize={10}
      gutterAlign="center"
      snapOffset={30}
      dragInterval={1}
      direction="horizontal"
      cursor="col-resize"
    >
      <div className='bg-white h-full mt-2 w-[500px] rounded-r-lg'>目录</div>
      <div className='bg-white h-full mt-2 w-full rounded-lg'>正文</div>
      <div className='bg-white h-full mt-2 w-[500px] rounded-l-lg'>卡片</div>
    </Split>
  </div>
  </React.Fragment>
}
