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

    iconStyle,
  }
}

const [useBase, getBase] = createGlobalStore(_useBase);

export { useBase, getBase };
