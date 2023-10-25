import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { Tooltip } from 'antd';

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>龙屋</title>
      </Head>
      <div className="h-[100vh] p-10">
        <Tooltip title="新建作品" color={'#2db7f5'}>
        <div className='w-[160px] h-[220px] bg-[#fefefed2] rounded-2xl shadow-2xl cursor-pointer flex items-center justify-center group'>
          <img src='/images/add.png' alt='add' width={64} className='transform group-hover:rotate-90 transition duration-500' />
        </div>
        </Tooltip>
        
      </div>
    </React.Fragment>
  )
}
