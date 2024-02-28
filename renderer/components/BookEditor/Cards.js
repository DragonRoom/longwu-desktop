import { Tag, Modal } from "antd";
import { useState } from "react";

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



export default function Cards(props) {
  const [cards, setCards] = useState([]);
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
      </div>
      {
        showNewCardModal && (
          <Modal
            title="新建卡片"
            open={showNewCardModal}
            onOk={() => console.log('ok')}
            onCancel={() => setShowNewCardModal(false)}
            footer={[
              <button className="border p-2 w-20 m-2 rounded-lg hover:bg-gray-400 active:bg-gray-600 active:text-white" key="back" onClick={() => setShowNewCardModal(false)}>
                取消
              </button>,
              <button className="border p-2 w-20 m-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-400" key="submit" type="primary" onClick={() => setShowNewCardModal(false)}>
                确定
              </button>,
            
            ]}
          >
            <div className="w-full h-full flex flex-col">
            <input className="m-2 p-2 border rounded-lg" placeholder="标题" />
            <div className="flex ml-2">选择卡片标签：
              <Tag className="cursor-pointer" color="purple">人物</Tag>
              <Tag className="cursor-pointer" color="cyan">事件</Tag>
              <Tag className="cursor-pointer" color="volcano">地点</Tag>
              <Tag className="cursor-pointer" color="orange">副本</Tag>
              <Tag className="cursor-pointer" color="red">伏笔</Tag>
              <Tag className="cursor-pointer" color="geekblue">线索</Tag>
              <Tag className="cursor-pointer" color="green">背景</Tag>
            </div>
            <textarea className="m-2 p-2 border rounded-lg" placeholder="内容" rows={5} />
            <input className="m-2 p-2 border rounded-lg" placeholder="引用" />
            <input className="m-2 p-2 border rounded-lg" placeholder="图片" />
            </div>
            
          </Modal>
        )
      }
    </div>
  );
}
