import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ContactsOutlined, OrderedListOutlined, FormOutlined } from '@ant-design/icons';
import { Tooltip, Divider } from 'antd';

export default function EditBook(props) {
  const router = useRouter();
  const { title } = router.query;

  const leftRef = useRef(null);
  const midRef = useRef(null);
  const rightRef = useRef(null);

  const handleMouseDownLeft = (e) => {
    console.log('1');
    window.isResizingLeft = true;
    document.addEventListener('mousemove', handleMouseMoveLeft);
    document.addEventListener('mouseup', () => {
      console.log('2');
      window.isResizingLeft = false;
      document.removeEventListener('mousemove', handleMouseMoveLeft);
    });
  };

  const handleMouseMoveLeft = (e) => {
    console.log('3', window.isResizingLeft, e.clientX);
    if (window.isResizingLeft && leftRef.current) {
      leftRef.current.style.width = `${e.clientX * 2}px`;
      console.log('4');
    }
  };

  const handleMouseDownRight = (e) => {
    window.isResizingRight = true;
    document.addEventListener('mousemove', handleMouseMoveRight);
    document.addEventListener('mouseup', () => {
      window.isResizingRight = false;
      document.removeEventListener('mousemove', handleMouseMoveRight);
    });
  };

  const handleMouseMoveRight = (e) => {
    if (window.isResizingRight && midRef.current) {
      rightRef.current.style.width = `${(window.innerWidth - e.clientX)*2}px`;
    }
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
    <div className='flex h-full pb-10 w-full'>
      <div ref={leftRef} className='bg-white h-full mt-2 w-[500px] rounded-r-lg'>Hello</div>
      <div onMouseDown={handleMouseDownLeft} className='p-1 cursor-ew-resize'></div>
      <div ref={midRef} className='bg-white h-full mt-2 w-full rounded-lg'>Hello</div>
      <div onMouseDown={handleMouseDownRight} className='p-1 cursor-ew-resize'></div>
      <div ref={rightRef} className='bg-white h-full mt-2 w-[500px] rounded-l-lg'>Hello</div>
    </div>
  </div>
  </React.Fragment>
}
