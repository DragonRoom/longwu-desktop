import { useState } from "react";
import { Button } from "antd";
import { useCurrent } from "../../hooks/useCurrent";
import { useBase } from "../../hooks/useBase";

export default function NewVolumePanel(props) {
  const { setCurrentVolume } = useCurrent();
  const { title, setShowNewVolumePanel, setTreeUpdater } = useBase();
  const [newVolumeName, setNewVolumeName] = useState("");

  return (
    <div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-0">分卷名称：</div>
        <input type="text" placeholder="第?卷 分卷名称" className=" border mr-3" value={newVolumeName} onChange={e=>setNewVolumeName(e.target.value)} />
        <Button type='primary' className="bg-blue-500" size="small" onClick={async ()=>{
          console.log('添加分卷');
          window.ipc.send('add-volume-directory', {title, volumeTitle: newVolumeName});
          window.ipc.on('add-volume-directory', (arg) => {
            console.log('add-volume-directory', arg);
            if (arg.success) {
              console.log('volumes', arg.data);
              setShowNewVolumePanel(false);
              setNewVolumeName('');
              setCurrentVolume(()=>arg.data.length.toString());
              setTreeUpdater(Date.now());
            }
          });
          }}>确定</Button>
      </div>
    </div>
  );;
}
