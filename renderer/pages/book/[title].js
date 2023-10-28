import { useRouter } from 'next/router';
import React, { useState, useRef, useMemo } from 'react'
import Head from 'next/head'
import { Input } from 'antd';
import { UserOutlined, CrownOutlined, BulbOutlined,EditOutlined } from '@ant-design/icons';
const { TextArea } = Input;


export default function BookInfo(props) {
  const router = useRouter();
  const { title } = router.query;

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
            setCover(reader.result);
        }
        reader.readAsDataURL(file);
    }
  };

  return <React.Fragment>
  <Head>
    <title>龙空 - 作品信息</title>
  </Head>
  <div className="h-[100vh] p-10 flex items-center justify-center">
    <div className='rounded-2xl shadow-2xl w-[950px] h-[596px] bg-gradient-to-tl from-blue-custom to-white'>
      <div className='flex h-[390px]'>
        <div className='w-[70%] rounded-l-2xl p-8 pr-0'>
          <div className='flex'>
          <div className='border rounded-2xl p-5 mr-5 w-full shadow-lg'>
            <div className='font-bold text-xl mb-2'>{title}</div>
            <div className='flex'><div className='text-gray-400'>备注: &nbsp;</div> <EditOutlined className='cursor-pointer opacity-50' /></div>
          </div>
          <div className='border rounded-2xl p-5 w-full shadow-lg'>
            <div className='flex mb-1'><div className='text-gray-400'>作者: &nbsp;</div> <EditOutlined className='cursor-pointer opacity-50' /></div>
            <div className='flex mb-1'><div className='text-gray-400'>类型: &nbsp;</div> <EditOutlined className='cursor-pointer opacity-50' /></div>
            <div className='flex'><div className='text-gray-400'>人物: &nbsp;</div> <EditOutlined className='cursor-pointer opacity-50' /></div>
          </div>
          </div>
          <div className='border rounded-2xl p-5 w-full shadow-lg mt-5'>
          <div className='flex'><div className='text-gray-400'>内容简介: &nbsp;</div> <EditOutlined className='cursor-pointer opacity-50' /></div>

          <TextArea autoSize={{ minRows: 4, maxRows: 4 }} bordered={false} disabled={true} size="large" rows={4} placeholder="请输入剧情简介" className='mt-1' value={intro} onChange={e=>setIntro(e.target.value)} />

          </div>
        </div>
        <div className="w-[30%] p-8" >
          <div className={`border-2 rounded-xl h-[327px] shadow-xl bg-[#def2f9c6] flex flex-col items-center justify-center relative`} >
            <img src={cover} alt="Cover Image" className="absolute inset-0 w-full h-full object-cover rounded-xl z-0"/>
            <div className='opacity-0 hover:opacity-100 absolute inset-0 w-full h-full object-cover rounded-xl z-0 p-10 flex  flex-col'>
              <div className='bg-gray-100 bg-opacity-80 drop-shadow-2xl shadow-lg p-2 rounded-2xl mt-40 mb-2 z-10 cursor-pointer text-center' onClick={()=>{
                inputFileRef.current.click();
              }}>
                更换封面 <EditOutlined className='cursor-pointer opacity-50' />
              </div>
              <div className='bg-gray-100 bg-opacity-80 drop-shadow-2xl shadow-lg p-2 rounded-2xl mt-2 z-10 cursor-pointer text-center' onClick={()=>{
                inputFileRef.current.click();
              }}>
                保存封面图片 <EditOutlined className='cursor-pointer opacity-50' />
              </div>
            </div>
            
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} ref={inputFileRef}/>
          </div>
        </div>
      </div>
      <div className='border'>Hello</div>
      <div className='border'>Hello</div>
    </div>
  </div>
</React.Fragment>
}
