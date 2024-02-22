import { useEffect, useState } from "react";
import { Button, Popover, Tree } from "antd";
import {
  FormOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { formatNumber } from "./utils";
import { useBase } from "../../hooks/useBase";
import { useCurrent } from "../../hooks/useCurrent";
import { useWordCnt } from "../../hooks/useWordCnt";


export default function ContentTree() {
  const [showRenamePanel, setShowRenamePanel] = useState({});
  const [newName, setNewName] = useState('');
  const [volume, setVolume] = useState('');
  const [chapter, setChapter] = useState('');
  const { contentTree, title, setShowText } = useBase();
  const { setCurrentVolume, setCurrentChapter, selectedKeys } = useCurrent();
  const { chapters } = useWordCnt();


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
              <span className="text-gray-400 ml-1 text-xs">{formatNumber(chapters[nodeData.volume + '-' + nodeData.chapter]?.textContent)}</span>
            </span>
          );
        }}
      />
    }
  </>
}
