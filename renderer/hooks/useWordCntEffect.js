import { useEffect } from "react";
import { useBase } from "./useBase";
import { useWordCnt } from "./useWordCnt";

export const useWordCntEffect = () => {
  const {title} = useBase();
  const {
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
    loading,
    setLoading,
  } = useWordCnt();

  useEffect(() => {
    console.log('title', title);
    if (!title) {
      return;
    }
    setLoading(true);
    // load first time from file 
    window.ipc.send('get-book-word-count', {title});
    window.ipc.on('get-book-word-count', (arg) => {
      if (arg.success) {
        console.log('get-book-word-count', arg.data);
        setTotal(()=>arg.data.total);
        setOutline(()=>arg.data.outline);
        setDates(()=>arg.data.date);
        setVolume(()=>arg.data.volume);
        setChapters(()=>arg.data.chapter);
      } else {
        console.error('get-book-word-count', arg);
      }
      setLoading(false);
    });
  }, [title]);

  useEffect(() => {
    if (loading) {
      return;
    }
    
    // 设置一个延迟执行的更新函数
    const timer = setTimeout(() => {
      console.log('updateWordCnt', title, total, outline, dates, volume, chapters);
      window.ipc.send('update-book-word-count', {title, data: {total, outline, date: dates, volume, chapter: chapters}});
      window.ipc.on('update-book-word-count', (arg) => {
        console.log('update-book-word-count return', arg);
      });
    }, 1000); // 3秒延迟

    // 清理函数：如果依赖项在3秒内变化，则取消前一个延迟执行的更新操作
    return () => clearTimeout(timer);
  }, [title, total, outline, dates, volume, chapters])

}

