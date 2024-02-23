import { createGlobalStore } from 'hox';
import { useCallback, useEffect, useState } from 'react';

import { useBase } from './useBase';

function _useWordCnt() {
  const [total, setTotal] = useState(0);
  const [outline, setOutline] = useState(0);
  const [dates, setDates] = useState({});
  const [volume, setVolume] = useState({});
  const [chapters, setChapters] = useState({});
  const [loading, setLoading] = useState(false);

  const updateWordCnt = useCallback((namespace, newCnt, volume, chapter) => {
    console.log('updateWordCnt', namespace, newCnt, loading);
    if (loading) {
      return;
    }
    try {
      let additional = 0;
      let old = 0;
  
      if (namespace === 'MainOutline') {
        setOutline((prev) => {
          old = prev;
          return newCnt
        });
      } else if (namespace === 'DetailOutline') {
        setChapters((prev) => {
          let _prev = {...prev};
          if (!_prev[volume + '-' + chapter]) {
            _prev[volume + '-' + chapter] = {detailOutline: 0, textContent: 0};
          }
          old = _prev[volume + '-' + chapter].detailOutline;
          _prev[volume + '-' + chapter].detailOutline = newCnt;
          return _prev;
        });
      } else if (namespace === 'TextContent') {
        setChapters((prev) => {
          let _prev = {...prev};
          if (!_prev[volume + '-' + chapter]) {
            _prev[volume + '-' + chapter] = {detailOutline: 0, textContent: 0};
          }
          old = _prev[volume + '-' + chapter].textContent;
          _prev[volume + '-' + chapter].textContent = newCnt;
          return _prev;
        });
      }
  
      additional = newCnt - old;
      setTotal((prev) => prev + additional);
  
      setDates((prev) => {
        let _prev = {...prev};
        // get day string of today
        let today = new Date();
        let todayString = today.toISOString().split('T')[0];
        if (!_prev[todayString]) {
          _prev[todayString] = 0;
        }
        _prev[todayString] += additional;
        return _prev;
      });
      
      setVolume((prev) => {
        let _prev = {...prev};
        if (!_prev[volume]) {
          _prev[volume] = 0;
        }
        _prev[volume] += additional;
        return _prev;
      });
    } catch (error) {
      console.error(error);
    }
  }, [loading]);

  return {
    total,
    setTotal,
    outline,
    setOutline,
    dates,
    setDates,
    volume,
    setVolume,
    chapters,
    setChapters,

    setLoading,

    updateWordCnt,
  }
}

const [useWordCnt, getWordCnt] = createGlobalStore(_useWordCnt);

export { useWordCnt, getWordCnt };
