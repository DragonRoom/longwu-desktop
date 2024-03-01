import { Tag, Modal, Button, Input } from "antd";
import { useState } from "react";
import { Image } from 'antd';
/*
Card {
  id: string,
  title: string,
  content: string,
  tags: string[],
  createdAt: Date,
  updatedAt: Date,
}
*/

function CloseableImage(props) {
  return <div className="relative">
    <Image {...props} />
    <div className="absolute top-0 right-0">
      <button onClick={props.onClose} className="text-white rounded-full w-6 h-6 flex justify-center items-center opacity-0 hover:opacity-80 hover:bg-[#ff00ff]">x</button>
    </div>
  </div>
}

function NewCardModal(props) {
  const [selectedTags, setSelectedTags] = useState([]); // ['人物', '事件']

  return <Modal
    title="新建卡片"
    open={props.showNewCardModal}
    onOk={() => console.log('ok')}
    onCancel={() => props.setShowNewCardModal(false)}
    footer={[
      <button className="border p-2 w-20 m-2 rounded-lg hover:bg-gray-400 active:bg-gray-600 active:text-white" key="back" onClick={() => props.setShowNewCardModal(false)}>
        取消
      </button>,
      <button className="border p-2 w-20 m-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-400" key="submit" type="primary" onClick={() => props.setShowNewCardModal(false)}>
        确定
      </button>,
    
    ]}
  >
    <div className="w-full h-full flex flex-col">
    <input className="m-2 p-2 border rounded-lg" placeholder="标题 / 人物名 / 副本名" />
    <div className="flex ml-2">选择标签：
      <Tag onClick={()=>selectedTags.includes('人物') ? setSelectedTags((pre)=>[...pre].filter(v=>v !== '人物')) : setSelectedTags((pre)=>[...pre, "人物"])} className="cursor-pointer" color={"purple" + (selectedTags.includes('人物') ? "-inverse" : "")}>人物</Tag>
      <Tag onClick={()=>selectedTags.includes('事件') ? setSelectedTags((pre)=>[...pre].filter(v=>v !== '事件')) : setSelectedTags((pre)=>[...pre, "事件"])} className="cursor-pointer" color={"cyan" + (selectedTags.includes('事件') ? "-inverse" : "")}>事件</Tag>
      <Tag onClick={()=>selectedTags.includes('地点') ? setSelectedTags((pre)=>[...pre].filter(v=>v !== '地点')) : setSelectedTags((pre)=>[...pre, "地点"])} className="cursor-pointer" color={"volcano" + (selectedTags.includes('地点') ? "-inverse" : "")}>地点</Tag>
      <Tag onClick={()=>selectedTags.includes('副本') ? setSelectedTags((pre)=>[...pre].filter(v=>v !== '副本')) : setSelectedTags((pre)=>[...pre, "副本"])} className="cursor-pointer" color={"orange" + (selectedTags.includes('副本') ? "-inverse" : "")}>副本</Tag>
      <Tag onClick={()=>selectedTags.includes('伏笔') ? setSelectedTags((pre)=>[...pre].filter(v=>v !== '伏笔')) : setSelectedTags((pre)=>[...pre, "伏笔"])} className="cursor-pointer" color={"red" + (selectedTags.includes('伏笔') ? "-inverse" : "")}>伏笔</Tag>
      <Tag onClick={()=>selectedTags.includes('线索') ? setSelectedTags((pre)=>[...pre].filter(v=>v !== '线索')) : setSelectedTags((pre)=>[...pre, "线索"])} className="cursor-pointer" color={"geekblue" + (selectedTags.includes('线索') ? "-inverse" : "")}>线索</Tag>
      <Tag onClick={()=>selectedTags.includes('背景') ? setSelectedTags((pre)=>[...pre].filter(v=>v !== '背景')) : setSelectedTags((pre)=>[...pre, "背景"])} className="cursor-pointer" color={"green" + (selectedTags.includes('背景') ? "-inverse" : "")}>背景</Tag>
      <Tag onClick={()=>selectedTags.includes('其它') ? setSelectedTags((pre)=>[...pre].filter(v=>v !== '其它')) : setSelectedTags((pre)=>[...pre, "其它"])} className="cursor-pointer" color={"magenta" + (selectedTags.includes('其它') ? "-inverse" : "")}>其它</Tag>
    </div>
    <textarea className="m-2 p-2 border rounded-lg" placeholder="内容" rows={5} />
    <input className="m-2 p-2 border rounded-lg" placeholder="引用：第X卷，第X章，第X段" />
    <Input className="m-2 p-2 border rounded-lg w-[456px]" placeholder="卡片图片" readOnly prefix={
      <div className="w-[450px]">
        <Button>插入图片...</Button>
        <div className="h-2" />
        <div className="flex flex-wrap gap-1">
        <CloseableImage width={140} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        <CloseableImage width={140} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        <CloseableImage width={140} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        <CloseableImage width={140} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        <CloseableImage width={140} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        <CloseableImage width={140} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        <CloseableImage width={140} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
        </div>
      </div>
    } />
    </div>
    
  </Modal>
}


export default function Cards(props) {
  const [cards, setCards] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // ['人物', '事件']
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  return (
    <div className="h-full w-full flex flex-col">
      <button className="m-2 border flex-grow-1 rounded-lg p-2 hover:bg-[#a3f3dcee] border-blue-200 active:bg-blue-300 active:text-white" onClick={() => {
        setShowNewCardModal(true);
      }}>+ 新建卡片</button>
      <div className="flex-grow-1 flex flex-wrap m-2">
        <Tag className="cursor-pointer mb-1" color="blue">全部(0)</Tag>
        <Tag className="cursor-pointer mb-1" color="purple">人物(1)</Tag>
        <Tag className="cursor-pointer mb-1" color="cyan">事件</Tag>
        <Tag className="cursor-pointer mb-1" color="volcano">地点</Tag>
        <Tag className="cursor-pointer mb-1" color="orange">副本</Tag>
        <Tag className="cursor-pointer mb-1" color="red">伏笔</Tag>
        <Tag className="cursor-pointer mb-1" color="geekblue">线索</Tag>
        <Tag className="cursor-pointer mb-1" color="green">背景</Tag>
        <Tag className="cursor-pointer mb-1" color="magenta">其它</Tag>
      </div>
      {
        showNewCardModal && <NewCardModal showNewCardModal={showNewCardModal} setShowNewCardModal={setShowNewCardModal} />
      }
    </div>
  );
}
