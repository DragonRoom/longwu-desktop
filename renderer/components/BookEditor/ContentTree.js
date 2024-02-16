import { useState } from "react";
import { Button, Popover, Tree } from "antd";
import {
  FormOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { formatNumber } from "./utils";

const iconStyle = ({ selected }) => (selected ? <img src="/images/openChapter.svg" width={22} alt="章" /> : <img src="/images/chapter.svg" width={22} alt="章" />);

const treeData = [
  {
    title: '第1卷 风起萧墙',
    key: '0-0',
    icon: <img src="/images/volume.svg" width={22} alt="卷" />,
    words: 41245,
    children: [
      {
        title: '第1章 苏醒',
        key: '0-0-0',
        icon:  iconStyle,
        words: 3245,
      },
      {
        title: '第2章 重生',
        key: '0-0-1',
        icon: iconStyle,
        words: 3015,
      },
      {
        title: '第3章 冲突',
        key: '0-0-2',
        icon: iconStyle,
        words: 3515,
      },
      {
        title: '第4章 反转',
        key: '0-0-3',
        icon: iconStyle,
        words: 2015,
      },
      {
        title: '第5章 横行',
        key: '0-0-4',
        icon: iconStyle,
        words: 5015,
      },
      {
        title: '第6章 结局',
        key: '0-0-5',
        icon: iconStyle,
        words: 4015,
      },
    ],
  },
];

export default function ContentTree(props) {
  const [showRenamePanel, setShowRenamePanel] = useState({});
  const [newName, setNewName] = useState('');
  const [volume, setVolume] = useState('');
  const [chapter, setChapter] = useState('');

  const title = props.title;
  const RenamePanel = (
    <div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-0">新名称：</div>
        <input type="text" className=" border mr-3" value={newName} onChange={e=>setNewName(e.target.value)} />
        <Button type='primary' className="bg-blue-500" size="small" onClick={async ()=>{
          if (!window.ipc) return;

          if (!chapter) {
            console.log('修改分卷名称');

            window.ipc.send('update-volume-meta-json', {title, volume: volume, volumeTitle: newName});
            window.ipc.on('update-volume-meta-json', (arg) => {
              console.log('update-volume-meta-json', arg);
              // arg is an array of themes
              if (arg.success) {
                console.log('volumes', arg.data);
                // setCustomThemes(arg.data);
                setShowRenamePanel(false);
                setNewName('');
                props.setTreeUpdater(Date.now());
              }
            });
          } else {
            console.log('修改章节名称');
            window.ipc.send('update-chapter-meta', {bookTitle: title, volumeNumber: volume, chapterNumber: chapter, volumeTitle: newName,
              metaJson: {title: newName, updateTime: Date.now(), wordCount: 0}
            });
            window.ipc.on('update-chapter-meta', (arg) => {
              console.log('update-chapter-meta', arg);
              // arg is an array of themes
              if (arg.success) {
                console.log('chapters', arg.data);
                // setCustomThemes(arg.data);
                setShowRenamePanel(false);
                setNewName('');
                props.setTreeUpdater(Date.now());
              }
            });
          }

          
          }}>确定</Button>
      </div>
    </div>
  );

  return <Tree
    showIcon
    defaultExpandAll
    // defaultSelectedKeys={['0-0']}
    switcherIcon={<DownOutlined />}
    treeData={props.contentTree}
    onSelect={(selectedKeys, info) => {
      console.log('selected', selectedKeys, info);
      props.setCurrentVolume(info.node.volume);
      if (info.node.key.includes('-')) {
        props.setCurrentChapter(info.node.key);
      }
    }}
    showLine
    titleRender={(nodeData) => {
      return (
        <span className="relative group">
          <span>{nodeData.title}</span>
          <Popover placement="left" title={'修改名称'} open={showRenamePanel[nodeData.key]} onOpenChange={(v)=>{
            setNewName(nodeData.title);
            setVolume(nodeData.volume);
            setChapter(nodeData.chapter);
            setShowRenamePanel((pre)=>({...pre, [nodeData.key]:v}));
          }} content={RenamePanel} trigger="click">
          <button className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" 
            onClick={()=>{
              console.log('编辑章节');
            }}
          >
            <FormOutlined />
          </button>
          </Popover>
          
          <span className="text-gray-400 ml-1 text-xs">{formatNumber(nodeData.words)}</span>
        </span>
      );
    }}
  />
}
