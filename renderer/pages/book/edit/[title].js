import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ContactsOutlined, OrderedListOutlined, FormOutlined } from '@ant-design/icons';
import { Tooltip, Divider } from 'antd';


export default function EditBook(props) {
  const router = useRouter();
  const { title } = router.query;

  const topDivRef = useRef(null);
  const bottomDivRef = useRef(null);
  const rightDivRef = useRef(null);

  const handleVerticalResizeMouseDown = (e) => {
    e.preventDefault();

    const startY = e.clientY;
    const startHeightTop = topDivRef.current.offsetHeight;
    const startHeightBottom = bottomDivRef.current.offsetHeight;

    const doMouseMove = (e) => {
      const deltaY = e.clientY - startY;
      topDivRef.current.style.height = `${startHeightTop + deltaY}px`;
      bottomDivRef.current.style.height = `${startHeightBottom - deltaY}px`;
    };

    const doMouseUp = () => {
      document.removeEventListener('mousemove', doMouseMove);
      document.removeEventListener('mouseup', doMouseUp);
    };

    document.addEventListener('mousemove', doMouseMove);
    document.addEventListener('mouseup', doMouseUp);
  };

  const handleHorizontalResizeMouseDown = (e) => {
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = rightDivRef.current.offsetWidth;

    const doMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      rightDivRef.current.style.width = `${startWidth - deltaX}px`;
    };

    const doMouseUp = () => {
      document.removeEventListener('mousemove', doMouseMove);
      document.removeEventListener('mouseup', doMouseUp);
    };

    document.addEventListener('mousemove', doMouseMove);
    document.addEventListener('mouseup', doMouseUp);
  };
  
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
      <Tooltip title="人物卡片" color={'blue'}>
        <ContactsOutlined className='cursor-pointer bg-gray-200 hover:bg-blue-200 p-[2px] pr-[4px] pl-[4px] rounded transform hover:scale-105 transition-all' />
      </Tooltip>
    </div>
    <div className='flex'>
      <div className='w-full'>
        <div ref={topDivRef} className='bg-white h-[46vh] mt-2 w-full rounded-r-lg'>Hello</div>
        <div onMouseDown={handleVerticalResizeMouseDown} className='p-1 cursor-ns-resize'></div>
        <div ref={bottomDivRef} className='bg-white h-[46.8vh] w-full rounded-r-lg'>Hello</div>
      </div>
      <div onMouseDown={handleHorizontalResizeMouseDown} className='p-1 cursor-ew-resize'></div>
      <div ref={rightDivRef} className='bg-white h-[94vh] mt-2 w-full rounded-lg'>Hello</div>
      <div className='p-1 cursor-ew-resize'></div>
      <div className='bg-white h-[94vh] mt-2 w-full rounded-l-lg'>Hello</div>
    </div>
  </div>
  </React.Fragment>
}
