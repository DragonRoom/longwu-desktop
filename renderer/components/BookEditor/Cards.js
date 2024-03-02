import { Tag, Modal, Button, Input, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { Image, Card, Popconfirm } from 'antd';
import { useBase } from "../../hooks/useBase";
import { promisify } from "../../hooks/utils";

const { Meta } = Card;
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
      <button onClick={props.onClose} className="text-white rounded-full w-6 h-6 flex justify-center items-center opacity-0 hover:opacity-80 hover:bg-[#ff0000]">x</button>
    </div>
  </div>
}

const colors = ['blue', 'purple', 'cyan', 'volcano', 'orange', 'red', 'geekblue', 'green', 'magenta'];
const cardTags = ['人物', '物品', '事件', '地点', '副本', '伏笔', '背景', '其它'];

function NewCardModal(props) {
  const [cardTitle, setCardTitle] = useState('');
  const [cardContent, setCardContent] = useState('');
  const [cardReference, setCardReference] = useState(''); // '第X卷，第X章，第X段'
  const [selectedTags, setSelectedTags] = useState([]); // ['人物', '事件']
  const [imgs, setImgs] = useState([]);

  const { title } = useBase();

  const inputFileRef = useRef(null)

  const handleImageChange = (event) => {
    console.log('insert img');
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgs((pre)=>[...pre, reader.result]);
      }
      reader.readAsDataURL(file);
    }
  };

  return <Modal
    title="新建卡片"
    open={props.showNewCardModal}
    onOk={() => console.log('ok')}
    onCancel={() => props.setShowNewCardModal(false)}
    footer={[
      <button className="border p-2 w-20 m-2 rounded-lg hover:bg-gray-400 active:bg-gray-600 active:text-white" key="back" onClick={() => props.setShowNewCardModal(false)}>
        取消
      </button>,
      <button className="border p-2 w-20 m-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-400" key="submit" type="primary" onClick={async () => {
        console.log('submit');
        if (cardTitle === '') {
          message.warning('标题不能为空');
          return;
        }

        if (selectedTags.length === 0) {
          message.warning('请至少选择一个标签');
          return;
        }

        let cardJson = {
          cardTitle,
          cardContent,
          selectedTags,
          cardReference,
          imgs,
        }

        window.ipc.send('add-card', {bookTitle: title, content: cardJson});
        window.ipc.on('add-card', (ret) => {
          console.log('add-card', ret);
          if (!ret.success) {
            message.error('添加失败');
            return;
          }

          props.setShowNewCardModal(false);
          props.setUpdateCard(Date.now());
          message.success('添加成功');
        });
      }}>
        确定
      </button>,
    ]}
  >
    <div className="w-full h-full flex flex-col">
    <input className="m-2 p-2 border rounded-lg" placeholder="标题 / 人物名 / 副本名" value={cardTitle} onChange={e=>setCardTitle(e.target.value)} />
    <div className="flex ml-2">选择标签：
    {
      cardTags.map((tag, index) => <Tag key={index} onClick={()=>selectedTags.includes(tag) ? setSelectedTags((pre)=>[...pre].filter(v=>v !== tag)) : setSelectedTags((pre)=>[...pre, tag])} className="cursor-pointer" color={colors[index] + (selectedTags.includes(tag) ? "-inverse" : "")}>{tag}</Tag>)
    }
    </div>
    <textarea className="m-2 p-2 border rounded-lg" placeholder="内容" rows={5} value={cardContent} onChange={e=>setCardContent(e.target.value)} />
    <input className="m-2 p-2 border rounded-lg" placeholder="引用：第X卷，第X章，第X段" value={cardReference} onChange={e=>setCardReference(e.target.value)} />
    <Input className="m-2 p-2 border rounded-lg w-[456px]" placeholder="卡片图片" readOnly prefix={
      <div className="w-[450px]">
        <Button onClick={()=>inputFileRef.current.click()}>插入图片...</Button>
        {
          imgs.length > 0 && <div className="h-2" />
        }
        <div className="flex flex-wrap gap-1">
        {
          imgs.map((img, index) => <CloseableImage key={index} width={100} height={100} src={img} onClose={()=>setImgs((pre)=>pre.filter((v, i)=>i!==index))} />)
        }
        </div>
      </div>
    } />
    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} ref={inputFileRef}/>

    </div>
    
  </Modal>
}

function ModifyCardModal(props) {
  const [cardTitle, setCardTitle] = useState(props.card.cardTitle);
  const [cardContent, setCardContent] = useState(props.card.cardContent);
  const [cardReference, setCardReference] = useState(props.card.cardReference); // '第X卷，第X章，第X段'
  const [selectedTags, setSelectedTags] = useState(props.card.selectedTags); // ['人物', '事件']
  const [imgs, setImgs] = useState(props.card.imgs);

  const { title } = useBase();

  const inputFileRef = useRef(null)

  const handleImageChange = (event) => {
    console.log('insert img');
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgs((pre)=>[...pre, reader.result]);
      }
      reader.readAsDataURL(file);
    }
  };

  return <Modal
    title="编辑卡片"
    open={props.showModifyCardModal}
    onOk={() => console.log('ok')}
    onCancel={() => props.setShowModifyCardModal(false)}
    footer={[
      <Popconfirm title="确定删除卡片？" onConfirm={() => {
        window.ipc.send('remove-card', {bookTitle: title, cardNumber: props.cardNumber});
        window.ipc.on('remove-card', (ret) => {
          console.log('remove-card', ret);
          if (!ret.success) {
            message.error('删除失败');
            return;
          }

          props.setShowModifyCardModal(false);
          props.setUpdateCard(Date.now());
          message.success('删除成功');
        });
      }} okText="确定" cancelText="取消" 
      okButtonProps={{style: {background: 'red'}}}
      
      >
        <button className="border p-2 w-20 m-2 rounded-lg bg-[#aa0000] text-white hover:bg-[#ff0000] active:bg-gray-700" key="del">
          删除
        </button>
      </Popconfirm>,
      <button className="border p-2 w-20 m-2 rounded-lg hover:bg-gray-400 active:bg-gray-600 active:text-white" key="back" onClick={() => props.setShowModifyCardModal(false)}>
        取消
      </button>,
      <button className="border p-2 w-20 m-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-400" key="submit" type="primary" onClick={async () => {
        console.log('submit');
        if (cardTitle === '') {
          message.warning('标题不能为空');
          return;
        }

        if (selectedTags.length === 0) {
          message.warning('请至少选择一个标签');
          return;
        }

        let cardJson = {
          cardTitle,
          cardContent,
          selectedTags,
          cardReference,
          imgs,
        }

        window.ipc.send('update-card', {bookTitle: title, cardNumber: props.cardNumber, content: cardJson});
        window.ipc.on('update-card', (ret) => {
          console.log('update-card', ret);
          if (!ret.success) {
            message.error('保存失败');
            return;
          }

          props.setShowModifyCardModal(false);
          props.setUpdateCard(Date.now());
          message.success('保存成功');
        });
      }}>
        保存
      </button>,
    ]}
  >
    <div className="w-full h-full flex flex-col">
    <input className="m-2 p-2 border rounded-lg" placeholder="标题 / 人物名 / 副本名" value={cardTitle} onChange={e=>setCardTitle(e.target.value)} />
    <div className="flex ml-2">选择标签：
    {
      cardTags.map((tag, index) => <Tag key={index} onClick={()=>selectedTags.includes(tag) ? setSelectedTags((pre)=>[...pre].filter(v=>v !== tag)) : setSelectedTags((pre)=>[...pre, tag])} className="cursor-pointer" color={colors[index] + (selectedTags.includes(tag) ? "-inverse" : "")}>{tag}</Tag>)
    }
    </div>
    <textarea className="m-2 p-2 border rounded-lg" placeholder="内容" rows={5} value={cardContent} onChange={e=>setCardContent(e.target.value)} />
    <input className="m-2 p-2 border rounded-lg" placeholder="引用：第X卷，第X章，第X段" value={cardReference} onChange={e=>setCardReference(e.target.value)} />
    <Input className="m-2 p-2 border rounded-lg w-[456px]" placeholder="卡片图片" readOnly prefix={
      <div className="w-[450px]">
        <Button onClick={()=>inputFileRef.current.click()}>插入图片...</Button>
        {
          imgs.length > 0 && <div className="h-2" />
        }
        <div className="flex flex-wrap gap-1">
        {
          imgs.map((img, index) => <CloseableImage key={index} width={100} height={100} src={img} onClose={()=>setImgs((pre)=>pre.filter((v, i)=>i!==index))} />)
        }
        </div>
      </div>
    } />
    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} ref={inputFileRef}/>

    </div>
    
  </Modal>
}


export default function Cards(props) {
  const [cards, setCards] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // ['人物', '事件']
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [showModifyCardModal, setShowModifyCardModal] = useState(false);
  const [updateCard, setUpdateCard] = useState(0);
  const [currentCard, setCurrentCard] = useState({});
  const [cardNumber, setCardNumber] = useState(0);
  const { title } = useBase();

  useEffect(()=>{
    if (!title) return;

    window.ipc.send('list-cards', {bookTitle: title});
    window.ipc.on('list-cards', (ret) => {
      console.log('list-cards', ret);
      if (!ret.success) {
        message.error('获取卡片失败');
        return;
      }

      setCards(ret.data);
    });
  }, [updateCard, title])

  return (
    <div className="w-full flex flex-col overflow-auto" style={{height: "calc(100% - 40px)"}}>
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
      <div className="flex-grow-1 flex flex-wrap m-2 gap-1">
        {
          Object.keys(cards).map((key, index) => <Card key={index} hoverable size="small" title={cards[key].cardTitle} className="w-[200px] h-[200px] relative overflow-hidden" onClick={()=>{
            console.log('card', cards[key]);
            setCurrentCard(cards[key]);
            setCardNumber(key);
            setShowModifyCardModal(true);
          }}>
            {
              cards[key].imgs && cards[key].imgs.length > 0 && <img className="rounded-lg" src={cards[key].imgs[0]} />
            }
            <pre className="h-[200px] text-left bg-white text-gray-950 whitespace-pre-wrap">{cards[key].cardContent}</pre>
          </Card>)
        }
      </div>
      {
        showNewCardModal && <NewCardModal showNewCardModal={showNewCardModal} setShowNewCardModal={setShowNewCardModal} setUpdateCard={setUpdateCard} />
      }
      {
        showModifyCardModal && <ModifyCardModal showModifyCardModal={showModifyCardModal} setShowModifyCardModal={setShowModifyCardModal} setUpdateCard={setUpdateCard} card={currentCard} cardNumber={cardNumber} />
      }
    </div>
  );
}
