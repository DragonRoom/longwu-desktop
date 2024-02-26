import { useEffect } from 'react';
import { useBase } from './useBase';
import { useCurrent } from './useCurrent';

export const useKeydownEffect = () => {
  const { title, setShowText, setTreeUpdater } = useBase();
  const { currentVolume, setCurrentChapter, setCurrentVolume } = useCurrent();

  useEffect(() => {
    if (!title) {
      return;
    }
    const newChapter = async () => {
      console.log("快速添加章节");
      if (!currentVolume) {
        return;
      }

      window.ipc.send("create-chapter", {
        bookTitle: title,
        volumeNumber: currentVolume,
        chapterTitle: '未命名章节',
      });
      window.ipc.on("create-chapter", (arg) => {
        console.log("create-chapter", arg);
        if (arg.success) {
          console.log("chapters", arg.data);
          setCurrentChapter(()=>arg.data.length.toString());
          setShowText(true);
          setTreeUpdater(Date.now());
        } else {
          console.error("create-chapter", arg);
        }
      });
    }

    const newVolume = async () => {
      console.log('快速添加分卷');
      window.ipc.send('add-volume-directory', {title, volumeTitle: '正文卷'});
      window.ipc.on('add-volume-directory', (arg) => {
        console.log('add-volume-directory', arg);
        if (arg.success) {
          console.log('volumes', arg.data);
          setCurrentVolume(()=>arg.data.length.toString());
          setTreeUpdater(Date.now());
        }
      });
    }


    window.addEventListener('new-chapter-keydown', newChapter);
    window.addEventListener('new-volume-keydown', newVolume);

    return () => {
      window.removeEventListener('new-chapter-keydown', newChapter);
      window.removeEventListener('new-volume-keydown', newVolume);
    }
  }, [title, currentVolume]);
}
