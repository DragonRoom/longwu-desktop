// Random Name Panel for Book Editor

import { Button, Card, Tabs, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { getName, getDao, getBook, getSkill,
  getCreature, getMaterial, getTalisman, 
  getAlchemy, getClan, getNation, 
  getLocation, getZone } from "random_chinese_fantasy_names";

import copy from 'copy-to-clipboard';

const types = ['人名','法号','功法','秘籍','生灵','材料','法宝','丹药','门派','国家','地点','大陆'];
const rarityType = ['common','uncommon','rare','epic','legendary', 'mythic', 'exotic'];
const colors = ['','green','blue','purple','orange','red','gold'];

const NamePanel = ({_type}) => {
  const [names, setNames] = useState([]);
  const [updater, setUpdater] = useState(0);
  useEffect(() => {
    const func = {
      '人名': getName,
      '法号': getDao,
      '功法': getSkill,
      '秘籍': getBook,
      '生灵': getCreature,
      '材料': getMaterial,
      '法宝': getTalisman,
      '丹药': getAlchemy,
      '门派': getClan,
      '国家': getNation,
      '地点': getLocation,
      '大陆': getZone,
    };
    console.log('type', _type);
    let ret = func[_type](60);
    setNames(ret);
  }, [_type, updater]);
  return <Card className="w-[500px]" >
    <Button className="mb-2" onClick={()=>setUpdater(Date.now())}>随机生成</Button>
    <div className="flex flex-wrap gap-1">
      {names.map((name, index) => {
        return <Tag onClick={()=>{
          copy(name.name ? name.name : name);
          message.success('已复制到剪贴板');
        }} color={name.rarity ? colors[rarityType.indexOf(name.rarity)] : '' } className="cursor-pointer" key={index}>{name.name ? name.name : name}</Tag>
      })}
    </div>
  </Card>
}

export const RandomPanel = () => {
  return <div>
    <Tabs defaultActiveKey="0"
      className="w-[500px]"
      size="small"
      type="card"
      items={types.map((name, index) => {
        return {
          key: index.toString(),
          label: name,
          children: <NamePanel _type={name} />
        }
      })}
    />
  </div>
}
