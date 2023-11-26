import path from 'path'
import { ipcMain } from 'electron'
import { readMetaJson, writeMetaJson, listSubdirectories, ensureDirectoryExists, removeDirectory } from '../helpers'

export function initChapterApi(bookRoot) {
  // list chapters in volume directory
  // arg: {bookTitle: '', volumeNumber: ''}
  ipcMain.on('list-chapters', async (event, arg) => {
    try {
      console.log('list-chapters', arg);
      let volumePath = path.join(bookRoot, arg.bookTitle, arg.volumeNumber);
      let chapters = await listSubdirectories(volumePath);
      // get number array of chapters
      let chapterNameNumbers = [];
      for (let i=0; i<chapters.length; i++) {
        let chapterName = path.basename(chapters[i]);
        let chapterNumber = Number(chapterName);
        chapterNameNumbers.push(chapterNumber);
      }
      // sort number array
      chapterNameNumbers.sort((a, b) => a - b);

      let chapterJsons = {};
      for (let i=0; i<chapterNameNumbers.length; i++) {
        let chapterNumber = chapterNameNumbers[i];
        let chapterPath = path.join(volumePath, chapterNumber.toString());
        let chapterJson = await readMetaJson(chapterPath);
        chapterJsons[chapterNumber] = chapterJson;
      }
      event.reply('list-chapters', {success: true, data: chapterJsons});
    } catch (error) {
      console.log(error);
      event.reply('list-chapters', {success: false, reason: '获取失败'});
    }
  });

  // create chapter directory in volume directory
  // arg: {bookTitle: '', volumeNumber: '', chapterTitle: ''}
  ipcMain.on('create-chapter', async (event, arg) => {
    try {
      console.log('create-chapter', arg);
      let volumePath = path.join(bookRoot, arg.bookTitle, arg.volumeNumber);
      let chapters = await listSubdirectories(volumePath);
      // get number array of chapters
      let chapterNameNumbers = [];
      for (let i=0; i<chapters.length; i++) {
        let chapterName = path.basename(chapters[i]);
        let chapterNumber = Number(chapterName);
        chapterNameNumbers.push(chapterNumber);
      }
      // sort number array
      chapterNameNumbers.sort((a, b) => a - b);
      // get the largest number of chapter name number 
      let chapterNameNumber = 0;
      for (let i=0; i<chapterNameNumbers.length; i++) {
        let chapterNumber = chapterNameNumbers[i];
        if (chapterNumber > chapterNameNumber) {
          chapterNameNumber = chapterNumber;
        }
      }

      // create chapter directory by number + 1
      let chapterNumber = (chapterNameNumber + 1).toString();
      let chapterPath = path.join(volumePath, chapterNumber);
      await ensureDirectoryExists(chapterPath);
      // write chapter json
      await writeMetaJson(chapterPath, {title: arg.chapterTitle, createTime: new Date().getTime()});

      chapters = await listSubdirectories(volumePath);
      // get number array of chapters
      chapterNameNumbers = [];
      for (let i=0; i<chapters.length; i++) {
        let chapterName = path.basename(chapters[i]);
        let chapterNumber = Number(chapterName);
        chapterNameNumbers.push(chapterNumber);
      }
      // sort number array
      chapterNameNumbers.sort((a, b) => a - b);
      event.reply('create-chapter', {success: true, data: chapterNameNumbers});
    } catch (error) {
      console.log(error);
      event.reply('create-chapter', {success: false, reason: '创建失败'});
    }
  });

  // update metajson of chapter in volume directory
  // arg: {bookTitle: '', volumeNumber: '', chapterNumber: '', metaJson: {title: '', updateTime: '', wordCount: ''}}
  ipcMain.on('update-chapter-meta', async (event, arg) => {
    try {
      console.log('update-chapter-meta', arg);
      let chapterPath = path.join(bookRoot, arg.bookTitle, arg.volumeNumber, arg.chapterNumber);
      await writeMetaJson(chapterPath, {...arg.metaJson, updateTime: new Date().getTime()});
      event.reply('update-chapter-meta', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('update-chapter-meta', {success: false, reason: '更新失败'});
    }
  });

  // remove chapter directory in volume directory
  // arg: {bookTitle: '', volumeNumber: '', chapterNumber: '', chapterTitle: ''}
  ipcMain.on('remove-chapter', async (event, arg) => {
    try {
      console.log('remove-chapter', arg);
      let chapterPath = path.join(bookRoot, arg.bookTitle, arg.volumeNumber, arg.chapterNumber);
      // compare chapter title
      let chapterJson = await readMetaJson(chapterPath);
      if (chapterJson.title !== arg.chapterTitle) {
        event.reply('remove-chapter', {success: false, reason: '章节标题不匹配'});
        return;
      }
      await removeDirectory(chapterPath);
      event.reply('remove-chapter', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('remove-chapter', {success: false, reason: '删除失败'});
    }
  });

  // update chapter metajson in chapter directory
  // arg: {bookTitle: '', volumeNumber: '', chapterNumber: '', metaJson: {}}
  ipcMain.on('update-chapter', async (event, arg) => {
    try {
      console.log('update-chapter', arg);
      let chapterPath = path.join(bookRoot, arg.bookTitle, arg.volumeNumber, arg.chapterNumber);
      await writeMetaJson(chapterPath, {...arg.metaJson, updateTime: new Date().getTime()});
      event.reply('update-chapter', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('update-chapter', {success: false, reason: '更新失败'});
    }
  });
}