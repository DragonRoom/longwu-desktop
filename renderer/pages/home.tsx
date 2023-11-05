import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { Tooltip } from 'antd';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  useEffect(()=>{
    if (!window.ipc) return;
    // 监听主进程的响应
    window.ipc.on('list-books', (arg) => {
      console.log('list-books', arg);  // 打印来自主进程的消息
      setBooks(arg as any);
    });

    // 向主进程发送消息
    window.ipc.send('list-books', '');
  }, []);
  return (
    <React.Fragment>
      <Head>
        <title>龙屋</title>
      </Head>
      <div className="min-h-[100vh] p-10 pr-0">
        <div className="flex flex-row flex-wrap" >
          {
            books.sort((a,b)=>(a.createTime - b.createTime)).map((book, index)=>{
              return (
                <div key={book.title + '_' + book.createTime} className='w-[160px] h-[220px] bg-[#fefefed2] rounded-2xl shadow-2xl drop-shadow-xl cursor-pointer flex items-center justify-center relative group mr-5 mb-5' onClick={()=>{
                  router.push(`/book/${book.title}`);
                }}>
                  <img src={book.cover} alt={book.title} className='w-[160px] h-[220px] rounded-2xl object-cover' />
                  {
                    book.cover.includes('cover.png') && <div className='absolute inset-0 flex flex-col items-center justify-center'>
                      <div className='text-2xl font-bold text-white drop-shadow-2xl shadow-lg m-5 mb-[80px] text-stroke-2'>{book.title}</div>
                      <div className='text-xl font-bold text-white drop-shadow-2xl shadow-lg m-5 text-stroke-2'>{book.author ? book.author + ' 著': ''}</div>
                    </div>
                  }
                </div>
              )
            })
          }
          <Tooltip title="新建作品" color={'#2db7f5'}>
          <div className='w-[160px] h-[220px] bg-[#fefefed2] rounded-2xl shadow-2xl cursor-pointer flex items-center justify-center group' onClick={()=>{
            router.push('/newBook');
          }}>
            <img src='/images/add.png' alt='add' width={64} className='transform group-hover:rotate-90 transition duration-500' />
          </div>
          </Tooltip>
        </div>
      </div>
    </React.Fragment>
  )
}
