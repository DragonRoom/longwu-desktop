import { useEffect, useState } from "react";
import { Button, Popover, Tree, Popconfirm } from "antd";
import {
  FormOutlined,
  DownOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { formatNumber } from "./utils";
import { useBase } from "../../hooks/useBase";
import { useCurrent } from "../../hooks/useCurrent";
import { useWordCnt } from "../../hooks/useWordCnt";
import { promisify } from "../../hooks/utils";


export default function ContentTree() {
  const [showRenamePanel, setShowRenamePanel] = useState({});
  const [newName, setNewName] = useState('');
  const [volume, setVolume] = useState('');
  const [chapter, setChapter] = useState('');
  const { contentTree, title, setShowText, treeUpdater, setContentTree, iconStyle, setTreeUpdater } = useBase();
  const { setCurrentVolume, setCurrentChapter, selectedKeys } = useCurrent();
  const { chapters, volume: volumeWordCnt } = useWordCnt();

  useEffect(() => {
    if (!title) return;

    // load contentTree from file
    const func = async () => {
      window.ipc.send('get-volume-list', title);
      let arg = await promisify(window.ipc.on, 'get-volume-list');
      console.log('get-volume-list', arg);
      let _contentTree = [];
      let volumeTitles = Object.values(arg.data).map(v=>v.title);
      console.log('volumeTitles', volumeTitles);
      if (volumeTitles.length === 0) {
        console.log('no volume');
        window.dispatchEvent(new Event('new-volume-keydown'));
        setTimeout(()=>{
          window.dispatchEvent(new Event('new-chapter-keydown'));
        }, 1000);        
      }

      for (let i=0; i<volumeTitles.length; i++) {
        _contentTree.push({
          title: volumeTitles[i],
          volume: (i + 1).toString(),
          key: i.toString(),
          icon: <img src="/images/volume.svg" width={22} alt="卷" />,
          words: 0,
          children: [],
        });

        window.ipc.send('list-chapters', {bookTitle: title, volumeNumber: (i + 1).toString()});
        let arg2 = await promisify(window.ipc.on, 'list-chapters');
        console.log('list-chapters', arg2);
        let chapterTitles = Object.values(arg2.data).map(v=>v.title);
        console.log('chapterTitles', chapterTitles);
        for (let j=0; j<chapterTitles.length; j++) {
          _contentTree[i].children.push({
            title: chapterTitles[j],
            volume: (i + 1).toString(),
            chapter: (j + 1).toString(),
            key: i.toString() + '-' + j.toString(),
            icon: iconStyle,
            words: 0,
          });
        }
      }

      if (_contentTree.length > 0) {
        setCurrentVolume(()=>_contentTree.length.toString());
      }

      console.log('contentTree', _contentTree);
      setContentTree(() => _contentTree);
    }

    func().then(console.log('update contentTree finish')).catch(console.error);
  }, [treeUpdater, title]);


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
                setShowRenamePanel(false);
                setNewName('');
                setTreeUpdater(Date.now());
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
                setShowRenamePanel(false);
                setNewName('');
                setTreeUpdater(Date.now());
              }
            });
          }

          
          }}>确定</Button>
      </div>
    </div>
  );

  return <>
    {
      contentTree.length > 0 && <Tree
        showIcon
        defaultExpandAll={true}
        autoExpandParent={true}
        // defaultSelectedKeys={['0-0']}
        switcherIcon={<DownOutlined />}
        treeData={contentTree}
        selectedKeys={selectedKeys}
        onSelect={(selectedKeysValue, info) => {
          console.log('selected', selectedKeysValue, info);
          if (!info.selected) {
            console.log('set current 0');
            setCurrentVolume(()=>0);
            setCurrentChapter(()=>0);
            setShowText(false);
            return;
          }
          if (info.node.key.includes('-')) {
            console.log('set current', info.node.volume, info.node.chapter);
            setCurrentVolume(()=>info.node.volume);
            setCurrentChapter(()=>info.node.chapter);
            setShowText(true);
          } else {
            setCurrentVolume(info.node.volume);
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
              {
                getTileKeys(contentTree).includes(nodeData.key) && <Popconfirm
                  title={"删除" + (nodeData.key.includes('-') ? "章节" : "分卷")}
                  description="删除后不可恢复，是否确认删除？"
                  onConfirm={()=>{
                    let isChapter = nodeData.key.includes('-');
                    if (isChapter) {
                      window.ipc.send('remove-chapter', {bookTitle: title, volumeNumber: nodeData.volume, chapterNumber: nodeData.chapter, chapterTitle: nodeData.title});
                      window.ipc.on('remove-chapter', (arg) => {
                        console.log('remove-chapter', arg);
                        if (arg.success) {
                          console.log('chapters', arg.data);
                          setTreeUpdater(Date.now());
                        }
                      });
                    } else {
                      window.ipc.send('remove-volume-directory', {title: title, volume: nodeData.volume, volumeTitle: nodeData.title});
                      window.ipc.on('remove-volume-directory', (arg) => {
                        console.log('remove-volume-directory', arg);
                        if (arg.success) {
                          console.log('volumes', arg.data);
                          setTreeUpdater(Date.now());
                        }
                      });
                    }
                  }}
                  onCancel={()=>{
                    console.log('cancel', nodeData);
                  }}
                  okText="确认"
                  cancelText="取消"
                  okButtonProps={{style: {background: 'red'}}}
                >
                <button className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" 
                  onClick={()=>{
                    console.log('编辑章节');
                  }}
                >
                  <CloseOutlined />
                </button>
                </Popconfirm>
              }
              
              {
                nodeData.key.includes('-') 
                  ? <span className="text-gray-400 ml-1 text-xs">{formatNumber(chapters[nodeData.volume + '-' + nodeData.chapter]?.textContent)}</span> 
                  : <span className="text-gray-400 ml-1 text-xs">{formatNumber(volumeWordCnt[nodeData.volume])}</span> 
              }
            </span>
          );
        }}
      />
    }
  </>
}

function getTileKeys(_tree) {
  let keys = [];
  keys.push(_tree[_tree.length - 1]?.key);
  for (let i=0; i<_tree.length; i++) {
    if (_tree[i].children.length === 0) {
      continue;
    };
    keys.push(_tree[i].children[_tree[i].children.length - 1]?.key);
  }
  return keys;
}