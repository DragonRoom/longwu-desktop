import { createGlobalStore } from 'hox';
import { useEffect, useState } from 'react';
import { promisify } from './utils';

const iconStyle = ({ selected }) => (selected ? <img src="/images/openChapter.svg" width={22} alt="章" /> : <img src="/images/chapter.svg" width={22} alt="章" />);

function _useBase() {
  const [title, setTitle] = useState('');
  const [showNewVolumePanel, setShowNewVolumePanel] = useState(false);
  const [showNewChapterPanel, setShowNewChapterPanel] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [showTree, setShowTree] = useState(true);
  const [showText, setShowText] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [treeUpdater, setTreeUpdater] = useState(0);
  const [contentTree, setContentTree] = useState([]);

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

      console.log('contentTree', _contentTree);
      setContentTree(_contentTree);
    }

    func().then(console.log('update contentTree finish')).catch(console.error);
  }, [treeUpdater, title]);

  return {
    title,
    setTitle,

    showText, 
    setShowText,
    showCard,
    setShowCard,
    showContent,
    setShowContent,
    showTree,
    setShowTree,
    treeUpdater,
    setTreeUpdater,
    contentTree,
    setContentTree,

    showNewVolumePanel,
    setShowNewVolumePanel,
    showNewChapterPanel,
    setShowNewChapterPanel,
  }
}

const [useBase, getBase] = createGlobalStore(_useBase);

export { useBase, getBase };
