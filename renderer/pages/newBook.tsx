import React, { useState, useRef, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Input } from 'antd';
import { UserOutlined, CrownOutlined, BulbOutlined } from '@ant-design/icons';
const { TextArea } = Input;

export default function NewBook() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mainCharacter, setMainCharacter] = useState('');
  const [type, setType] = useState('');
  const [author, setAuthor] = useState('');
  const [intro, setIntro] = useState('');
  const [cover, setCover] = useState('/images/cover.png');
  const titleStatus = useMemo(()=>{
    if (title) {
      return '';
    }
    return 'error';
  }, [title]);

  const inputFileRef = useRef(null)
  const handleImageChange = (event) => {
    console.log('select cover img');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setCover((reader as any).result);
        }
        reader.readAsDataURL(file);
    }
  };
  return (
    <React.Fragment>
      <Head>
        <title>龙空 - 新建作品</title>
      </Head>
      <div className="h-[100vh] p-10 flex items-center justify-center">
        <div className='rounded-2xl shadow-2xl w-[800px] h-[596px] bg-gradient-to-tl from-blue-custom to-white flex'>
          <div className='w-[50%] bg-white rounded-l-2xl p-8'>
            <div className='font-bold text-lg'>新建作品</div>
            <Input size="large" placeholder="请输入作品名称" prefix={<CrownOutlined />} className='mt-5' value={title} onChange={e=>setTitle(e.target.value)} status={titleStatus} />
            <Input size="large" placeholder="请输入主要人物" prefix={<UserOutlined />} className='mt-5' value={mainCharacter} onChange={e=>setMainCharacter(e.target.value)} />
            <Input size="large" placeholder="请输入作品类型" prefix={<BulbOutlined />} className='mt-5' value={type} onChange={e=>setType(e.target.value)} />
            <Input size="large" placeholder="请输入作者笔名" prefix={<img src='/images/Author.png' alt='author' width={16} />} className='mt-5' value={author} onChange={e=>setAuthor(e.target.value)} />
            <TextArea size="large" rows={7} placeholder="请输入剧情简介" className='mt-5' value={intro} onChange={e=>setIntro(e.target.value)} />
          </div>
          <div className="w-[50%] p-8" >
            <div className={`border-2 rounded-xl h-[90%] shadow bg-[#def2f9c6] flex flex-col items-center justify-center cursor-pointer relative`} onClick={()=>{
              inputFileRef.current.click();
            }}>
              <img src={cover} alt="Cover Image" className="absolute inset-0 w-full h-full object-cover rounded-xl z-0"/>
              <div className='text-5xl font-extrabold drop-shadow-4xl shadow-lg m-5 text-stroke z-10'>{title}</div>
              <div className='bg-gray-100 bg-opacity-80 drop-shadow-2xl shadow-lg rounded-2xl p-10 pt-5 pb-5 mt-20 mb-20 z-10'>
                点击选择作品封面图片...
              </div>
              <div className='text-2xl font-bold drop-shadow-2xl shadow-lg rounded-2xl text-stroke z-10'>{author? author + ' 著' : ''}</div>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} ref={inputFileRef}/>
            </div>

            <button className='m-4 bg-blue-400 pt-2 pb-2 pl-14 pr-14 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#89d4d6] disabled:bg-gray-300 disabled:cursor-not-allowed' disabled={titleStatus === 'error'} onClick={async ()=>{
              window.ipc.send('create-book', {
                title,
                mainCharacter,
                type,
                author,
                intro,
                cover,
              });
              window.ipc.on('create-book', (arg: any) => {
                console.log('create-book', arg);  // 打印来自主进程的消息
                if (arg.success) {
                  router.push('/home');
                } else {
                  alert(arg.reason);
                }
              });
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
