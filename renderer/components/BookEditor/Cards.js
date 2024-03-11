import { Tag, Modal, Button, Input, message, Popover } from "antd";
import { useEffect, useRef, useState } from "react";
import { Image, Card, Popconfirm } from 'antd';
import { useBase } from "../../hooks/useBase";
import { promisify } from "../../hooks/utils";
import { useCurrent } from "../../hooks/useCurrent";

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
  const { currentVolume, currentChapter }= useCurrent();

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

  useEffect(() => {
    setCardReference(`卡片创建于：第${currentVolume}卷，第${currentChapter}章`);
  }, [currentVolume, currentChapter]);

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
  const [selectedTags, setSelectedTags] = useState(['全部']); // ['人物', '事件']
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [showModifyCardModal, setShowModifyCardModal] = useState(false);
  const [updateCard, setUpdateCard] = useState(0);
  const [currentCard, setCurrentCard] = useState({});
  const [cardNumber, setCardNumber] = useState(0);
  const { title } = useBase();
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'title' | 'content' | 'all'
  const [filterChapter, setFilterChapter] = useState({volume: '', chapter: ''}); // 'all' | 'current' | 'custom'

  useEffect(()=>{
    if (!title) return;

    window.ipc.send('list-cards', {bookTitle: title});
    window.ipc.on('list-cards', (ret) => {
      console.log('list-cards', ret);
      if (!ret.success) {
        console.error('获取卡片失败');
        return;
      }

      setCards(ret.data);
    });

    const newCard = () => {
      console.log('快速添加卡片');
      setShowNewCardModal(true);
    }

    window.addEventListener('new-card-keydown', newCard);
    return () => {
      window.removeEventListener('new-card-keydown', newCard);
    }
  }, [updateCard, title])

  return (
    <div className="w-full flex flex-col overflow-auto" style={{height: "calc(100% - 40px)"}}>
      <button className="m-2 border flex-grow-1 rounded-lg p-2 hover:bg-[#a3f3dcee] border-blue-200 active:bg-blue-300 active:text-white" onClick={() => {
        setShowNewCardModal(true);
      }}>+ 新建卡片</button>
      <div className="flex-grow-1 flex flex-wrap m-2">
        {
          ['全部', ...cardTags].map((tag, index) => <Tag key={index} onClick={()=>{
            selectedTags.includes(tag) ? setSelectedTags((pre)=>[...pre].filter(v=>v !== tag)) : setSelectedTags((pre)=>[...pre, tag]);
            if (tag !== '全部') {
              setSelectedTags((pre)=>pre.filter(v=>v !== '全部'));
            } else {
              setSelectedTags(['全部']);
            }

          }} className="cursor-pointer mb-1" color={colors[index] + (selectedTags.includes(tag) ? "-inverse" : "")}>
            {tag + '(' + (tag === '全部' ? Object.values(cards).length : Object.values(cards).filter(v=>v.selectedTags.includes(tag)).length)  + ')'}
          </Tag>)
        }
        
      </div>
      <div>
      <Popover content={<div className="flex gap-1 justify-center items-center">
          <Input value={searchText} onChange={e=>setSearchText(e.target.value)} />
          <select value={searchType} onChange={e=>setSearchType(e.target.value)} className="border border-solid border-gray-300 p-1 rounded-lg">
            <option value="all">全部 ▼</option>
            <option value="title">标题 ▼</option>
            <option value="content">内容 ▼</option>
          </select>
        </div>} title="搜索卡片" trigger="click">
          <Tag className="cursor-pointer mb-1" color={searchText ? 'blue-inverse' : ''}>🔍 搜索</Tag>
        </Popover>
        <Popover content={<div className="flex gap-2 justify-center items-center">
          <div className="flex justify-center items-center gap-1">
            <div>第</div>
            <Input className="w-10 text-center" value={filterChapter.volume} onChange={e=>setFilterChapter({...filterChapter, volume: e.target.value})} />
            <div>卷</div>
          </div>
          <div className="flex justify-center items-center gap-1">
            <div>第</div>
            <Input className="w-10 text-center" value={filterChapter.chapter} onChange={e=>setFilterChapter({...filterChapter, chapter: e.target.value})} />
            <div>章</div>
          </div>
          <Button onClick={()=>setFilterChapter({volume:'', chapter:''})}>清除筛选</Button>
        </div>} title="筛选卡片" trigger="click">
        <Tag className="cursor-pointer mb-1" color={(filterChapter.volume !== '' || filterChapter.chapter !== '') ? 'blue-inverse' : ''}>▼ 筛选</Tag>
        </Popover>
      </div>
      <div className="flex-grow-1 flex flex-wrap m-2 gap-1">
        {
          Object.keys(cards)
            .filter((key)=>filterChapter.volume === '' || cards[key].cardReference.includes(`第${filterChapter.volume}卷`))
            .filter((key)=>filterChapter.chapter === '' || cards[key].cardReference.includes(`第${filterChapter.chapter}章`))
            .filter((key)=>searchText === '' || (searchType === 'title' && cards[key].cardTitle.includes(searchText)) || (searchType === 'content' && cards[key].cardContent.includes(searchText)) || (searchType === 'all' && (cards[key].cardTitle.includes(searchText) || cards[key].cardContent.includes(searchText))))
            .filter((key)=>selectedTags.includes('全部') || cards[key].selectedTags.some(v=>selectedTags.includes(v))).map((key, index) => <Card key={index} hoverable size="small" title={cards[key].cardTitle} className="w-[200px] h-[200px] relative overflow-hidden" onClick={()=>{
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
