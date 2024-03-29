'use client';
import { useRouter } from 'next/router';
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { Button, Input, Statistic, Popover, message } from 'antd';
import { UserOutlined, CrownOutlined, BulbOutlined, EditOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dynamic from "next/dynamic";
const ClientButton = dynamic(
  () => {
    return import("../../components/ClientButton");
  },
  { ssr: false }
);

const { TextArea } = Input;

const data = [
  { date: '10月27日', value: '2300' },
  { date: '10月28日', value: '5321' },
  { date: '10月29日', value: '4321' },
  { date: '今日', value: '3321' },
  // ...其他数据
];


export default function BookInfo(props) {
  const router = useRouter();
  const { title } = router.query;

  const [mainCharacter, setMainCharacter] = useState('');
  const [type, setType] = useState('');
  const [author, setAuthor] = useState('');
  const [intro, setIntro] = useState('');
  const [cover, setCover] = useState('/images/cover.png');
  const [memo, setMemo] = useState('');
  const [wordCnt, setWordCnt] = useState({});

  const dateCnt = useMemo(()=>{
    if (!wordCnt.date) return [];
    let result = [];
    for (let key in wordCnt.date) {
      result.push({date: key, value: wordCnt.date[key]});
    }
    // sort by date desc 
    result.sort((a, b)=>{
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    // get last 7 days
    result = result.slice(0, 7);
    return result;
  }, [wordCnt])

  const inputFileRef = useRef(null)
  const handleImageChange = (event) => {
    console.log('select cover img');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setCover(reader.result);
            updateBookInfo('cover', reader.result);
        }
        reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (title) {
      if (!window.ipc) return;
      // fetch book info from ipc
      window.ipc.send('get-book-info', title);
      window.ipc.on('get-book-info', (arg) => {
        console.log(arg);
        if (!arg) return;
        setMainCharacter(arg.data.mainCharacter);
        setType(arg.data.type);
        setAuthor(arg.data.author);
        setIntro(arg.data.intro);
        setCover(arg.data.cover);
        setMemo(arg.data.memo);
      });

      window.ipc.send('get-book-word-count', {title});
      window.ipc.on('get-book-word-count', (arg) => {
        console.log(arg);
        if (arg.success) {
          setWordCnt(arg.data);
        }
      });

      window.bookTitle = title;
    }
  }, []);

  const updateBookInfo = async (key, value) => {
    if (!window.ipc) return;
    // fetch book info from ipc
    window.ipc.send('update-book-info', {title, [key]: value});
    window.ipc.on('update-book-info', (arg) => {
      console.log(arg);
    });
  }

  return <React.Fragment>
  <Head>
    <title>龙空 - 作品信息 - {title}</title>
  </Head>
  <div className="h-[100vh] p-10 flex items-center justify-center">
    <div className='rounded-2xl shadow-2xl w-[950px] h-[610px] bg-gradient-to-tl from-blue-custom to-white'>
      <div className='flex h-[390px]'>
        <div className='w-[68%] rounded-l-2xl p-8 pr-0'>
          <div className='flex'>
          <div className='border rounded-2xl p-5 mr-5 w-full shadow-lg'>
            <div className='font-bold text-xl mb-2'>{title}</div>
            <EditableLabel title='备注' value={memo} onUpdate={(value)=>{
              setMemo(value);
              updateBookInfo('memo', value);
            }} />
          </div>
          <div className='border rounded-2xl p-5 w-full shadow-lg'>
            <EditableLabel title='作者' value={author} onUpdate={(value)=>{
              setAuthor(value);
              updateBookInfo('author', value);
            }} />
            <EditableLabel title='类型' value={type} onUpdate={(value)=>{
              setType(value);
              updateBookInfo('type', value);
            }} />
            <EditableLabel title='主角' value={mainCharacter} onUpdate={(value)=>{
              setMainCharacter(value);
              updateBookInfo('mainCharacter', value);
            }} />
          </div>
          </div>
          <div className='border rounded-2xl p-5 w-full shadow-lg mt-5'>
          <EditableTextArea title='内容简介' value={intro} onUpdate={(value)=>{
              setIntro(value);
              updateBookInfo('intro', value);
            }} />
          </div>
        </div>
        <div className="w-[32%] p-8" >
          <div className={`border-2 rounded-xl h-[327px] shadow-xl bg-[#def2f9c6] flex flex-col items-center justify-center relative`} >
            <img src={cover} alt="Cover Image" className="absolute inset-0 w-full h-full object-cover rounded-xl z-0"/>
            <div className='opacity-0 hover:opacity-100 absolute inset-0 w-full h-full object-cover rounded-xl z-0 p-10 flex  flex-col'>
              <div className='bg-gray-100 bg-opacity-80 drop-shadow-2xl shadow-lg p-2 rounded-2xl mt-40 mb-2 z-10 cursor-pointer text-center' onClick={()=>{
                inputFileRef.current.click();
              }}>
                更换封面 <EditOutlined className='cursor-pointer opacity-50' />
              </div>
              <ClientButton>
                保存封面图片 <EditOutlined className='cursor-pointer opacity-50' />
              </ClientButton>
            </div>
            
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} ref={inputFileRef}/>
          </div>
        </div>
      </div>
      <div className='rounded-l-2xl p-8 pt-0'>
        <div className='border rounded-2xl p-5 mr-5 w-full shadow-lg mb-5 text-gray-600'>
          <div className='mb-2 text-lg'>总字数:&nbsp; <span className='font-bold'>{formatNumber(wordCnt.total)}</span> </div>
          <TimeLine data={dateCnt} />
        </div>
        <div className='flex justify-around'>
          <Button className='bg-[#04D8B2] text-white font-bold rounded-full border-none h-[40px] w-[140px] shadow' onClick={()=>{
            router.push('/book/edit/' + title);
          }}>开始创作</Button>
          <Popover content={ExportPanel} title={<div className='w-[100%] text-center'>导出作品<br/><div className='text-sm'>注: .zip是完整数据打包，其余只包含文本内容</div><div className='text-sm'>如需导入，可在新建作品页选从文件导入</div></div>}>
            <Button className='bg-[#c49af1] text-white font-bold rounded-full border-none h-[40px] w-[140px] shadow' >导出作品</Button>
          </Popover>
          {/* <Button className='bg-[#6bbbbc] text-white font-bold rounded-full border-none h-[40px] w-[140px] shadow' disabled>自动备份</Button> */}
          <Button className='bg-[#c57f7f] text-white font-bold rounded-full border-none h-[40px] w-[140px] shadow' onClick={()=>{
            if (!window.ipc) return;
            window.ipc.send('remove-book', title);
            window.ipc.on('remove-book', (arg) => {
              console.log(arg);
              if (arg.success) {
                router.push('/home');
              } else {
                if (arg.reason) {
                  message.error(arg.reason);
                }
              }
            });
          }} >删除作品</Button>
          <Button className='bg-[#049cd8] text-white font-bold rounded-full border-none h-[40px] w-[140px] shadow' onClick={()=>{
            router.push('/home');
          }}>返回书库</Button>
        </div>
      </div>
      
    </div>
  </div>
</React.Fragment>
}

function EditableLabel(props) {
  const [editing, setEditing] = useState(false);
  const onUpdate = props.onUpdate;
  return <div className='flex'>
    <div className='text-gray-500 mb-1'>{props.title}: &nbsp;
    {
      editing ? <Input defaultValue={props.value} size="small" bordered={editing} className='w-[150px]' onPressEnter={(e)=>{
        setEditing(false);
        console.log(e.target.value);
        if (onUpdate) {
          onUpdate(e.target.value);
        }
      }} /> : props.value
    }
    </div> 
    <EditOutlined className='cursor-pointer opacity-50' onClick={()=>setEditing(!editing)} />
  </div>
}

function EditableTextArea(props) {
  const [editing, setEditing] = useState(false);
  const onUpdate = props.onUpdate;
  return <div className='flex w-full opacity-70 h-[136px]'>
    <div>
      <div className='mb-1'>{props.title}: &nbsp;
      <EditOutlined className='cursor-pointer opacity-50' onClick={()=>setEditing(!editing)} />
    </div>
    {
      editing ? <TextArea defaultValue={props.value} autoSize={{ minRows: 4, maxRows: 4 }} bordered={editing} size="small" className='w-[580px] rounded-2xl' onPressEnter={(e)=>{
        setEditing(false);
        console.log(e.target.value);
        if (onUpdate) {
          onUpdate(e.target.value);
        }
      }} /> : props.value
    }
    </div> 
  </div>
}

function TimeLine(props) {
  const data = props.data;
  return <div className='flex relative justify-around'>
    <div className='flex w-[800px] overflow-hidden'>
    {
      data.map((item, index)=>{
        return <div className='flex flex-col items-center' key={index}>
        <div className='w-[100px] text-center mb-0'>{item.date}</div>
        <EnvironmentOutlined />
        <div className='w-[160px] text-center'>{formatNumber(item.value)}</div>
      </div>
      })
    }
    </div>
    
    <div className='absolute top-8 w-[800px] h-[1px] bg-gray-400'></div>

  </div>
}

// 输入数字，返回格式： XX 万 XXXX 字
export function formatNumber(num) {
  if (num < 10000) {
    return formatNumberWithCommas(num) + ' 字';
  } else {
    return (num / 10000).toFixed(0) + '万 ' + formatNumberWithCommas(num % 10000) + '字';
  }
}

// 给数字加千位符
function formatNumberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



function ExportPanel() {
  return <div className='flex flex-col'>
    <div className='flex flex-wrap justify-center gap-2 w-[300px] text-center items-center'>
      <Button className='bg-[#233a6e] text-white font-bold rounded-full border-none h-[40px] w-[140px] shadow' onClick={async ()=>{
        if (!window.ipc) return;
        window.ipc.send('export-book', {title: window.bookTitle});
        window.ipc.on('export-book', (arg) => {
          console.log(arg);
          if (arg.success) {
            message.success('导出成功');
          } else {
            if (arg.reason) {
              message.error(arg.reason);
            }
          }
        });
      }} >导出.zip</Button>
      <Button className='bg-[#4a79e8] text-white font-bold rounded-full border-none h-[40px] w-[140px] shadow' onClick={async ()=>{
        if (!window.ipc) return;
        window.ipc.send('export-book-txt', {title: window.bookTitle});
        window.ipc.on('export-book-txt', (arg) => {
          console.log(arg);
          if (arg.success) {
            message.success('导出成功');
          } else {
            if (arg.reason) {
              message.error(arg.reason);
            }
          }
        });
      }} >导出.txt</Button>
      <Button className='bg-[#287c6d] text-white font-bold rounded-full border-none h-[40px] w-[140px] shadow' onClick={async ()=>{
        if (!window.ipc) return;
        window.ipc.send('export-book-docx', {title: window.bookTitle});
        window.ipc.on('export-book-docx', (arg) => {
          console.log(arg);
          if (arg.success) {
            message.success('导出成功');
          } else {
            if (arg.reason) {
              message.error(arg.reason);
            }
          }
        });
      }} >导出.docx</Button>
      <Button className='bg-[#4c8029] text-white font-bold rounded-full border-none h-[40px] w-[140px] shadow cursor-not-allowed' disabled >导出.pdf</Button>
    </div>
  </div>
}