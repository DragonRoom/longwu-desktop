import { createGlobalStore } from 'hox';
import { useEffect, useMemo, useState } from 'react';

import { useWordCnt } from './useWordCnt';

function _useCurrent() {
  const [currentVolume, setCurrentVolume] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);

  const { chapters } = useWordCnt();

  const currentDetailOutline = useMemo(() => {
    return chapters[currentVolume + '-' + currentChapter] ? chapters[currentVolume + '-' + currentChapter].detailOutline : 0;
  }, [chapters, currentChapter, currentVolume]);

  const currentTextContent = useMemo(() => {
    return chapters[currentVolume + '-' + currentChapter] ? chapters[currentVolume + '-' + currentChapter].textContent : 0;
  }, [chapters, currentChapter, currentVolume]);

  const selectedKeys = useMemo(()=>{
    return currentVolume && currentChapter ? [(Number(currentVolume) - 1) + '-' + (Number(currentChapter) - 1)]:[];
  }, [currentVolume, currentChapter]);

  return {
    currentVolume,
    setCurrentVolume,
    currentChapter,
    setCurrentChapter,

    currentDetailOutline,
    currentTextContent,
    selectedKeys,
  }
}

const [useCurrent, getCurrent] = createGlobalStore(_useCurrent);

export { useCurrent, getCurrent };
