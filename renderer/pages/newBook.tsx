import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Input } from 'antd';
import { UserOutlined, CrownOutlined, BulbOutlined } from '@ant-design/icons';
const { TextArea } = Input;

export default function NewBook() {
  const router = useRouter();
  return (
    <React.Fragment>
      <Head>
        <title>龙空 - 新建作品</title>
      </Head>
      <div className="h-[100vh] p-10 flex items-center justify-center">
        <div className='rounded-2xl shadow-2xl w-[800px] h-[500px] bg-gradient-to-tl from-blue-custom to-white flex'>
          <div className='w-[50%] bg-white rounded-l-2xl p-8'>
            <div className='font-bold text-lg'>新建作品</div>
            <Input size="large" placeholder="请输入作品名称" prefix={<CrownOutlined />} className='mt-5' />
            <Input size="large" placeholder="请输入主要人物" prefix={<UserOutlined />} className='mt-5' />
            <Input size="large" placeholder="请输入作品类型" prefix={<BulbOutlined />} className='mt-5' />
            <TextArea rows={7} placeholder="请输入剧情简介" className='mt-5' />
          </div>
          <div className='w-[50%] p-8' >
            <div className='border-2 rounded-xl h-[90%] shadow bg-[#def2f9c6] flex items-center justify-center cursor-pointer'>点击选择封面图片...</div>
            <button className='m-4 bg-blue-400 pt-2 pb-2 pl-14 pr-14 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#89d4d6]' onClick={()=>{
              router.push('/home');
            }}>确认</button>
            <button className='bg-[#89d3d69c] pt-2 pb-2 pl-14 pr-14 rounded-xl shadow-lg hover:bg-[#eea298]' onClick={()=>{
              router.push('/home');
            }}>取消</button>
          </div>
          
        </div>
      </div>
    </React.Fragment>
  )
}
