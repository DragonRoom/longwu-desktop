// Random Name Panel for Book Editor

import { Card } from "antd";
import { useEffect, useState } from "react";

export const RandomPanel = () => {
  const [names, setNames] = useState([]);
  const [nameLength, setNameLength] = useState(3);
  const [nameCount, setNameCount] = useState(10);

  useEffect(()=>{
    console.log('random-name', nameLength, nameCount);
    window.ipc.send('random-name', {length: nameLength, count: nameCount});
    window.ipc.on('random-name', (arg) => {
      console.log('random-name', arg);
      if (arg.success) {
        setNames(arg.data);
      }
    });
  }, [nameLength, nameCount]);

  return <div>
    <Card title="随机中文名" className="w-[300px]">
      姓名长度：<input type="number" value={nameLength} onChange={e=>setNameLength(e.target.value)} className="text-center border rounded-lg"/>
      <br />
      起名数量：<input type="number" value={nameCount} onChange={e=>setNameCount(e.target.value)} className="text-center border rounded-lg"/>
      <br />
      <div className="mt-2 flex gap-1 flex-wrap max-w-[260px]">
      {
        names.map((name, index) => {
          return <div key={index} className="bg-gray-200 rounded-lg p-1">{name}</div>
        })
      }
      </div>
    </Card>
  </div>
}
