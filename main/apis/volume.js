import path from 'path'
import { ipcMain } from 'electron'
import { readMetaJson, writeMetaJson, listSubdirectories, ensureDirectoryExists, removeDirectory } from '../helpers'

export function initVolumeApi(bookRoot) {
  // add volume directory 
  ipcMain.on('add-volume-directory', async (event, arg) => {
    try {
      console.log('add-volume-directory', arg);
      let bookPath = path.join(bookRoot, arg.title);
      let volumes = await listSubdirectories(bookPath);
      console.log('volumes', volumes, bookPath);
      // fiter non-number directory
      volumes = volumes.filter((item) => {
        let volumeName = path.basename(item);
        return !isNaN(Number(volumeName));
      });
      console.log('volumes', volumes);
      // get the largest number of volume name number 
      let volumeNameNumber = 0;
      for (let i=0; i<volumes.length; i++) {
        let volumeName = path.basename(volumes[i]);
        let volumeNumber = Number(volumeName);
        if (volumeNumber > volumeNameNumber) {
          volumeNameNumber = volumeNumber;
        }
      }

      // create volume directory by number + 1
      let volumeNumber = (volumeNameNumber + 1).toString();
      let volumePath = path.join(bookPath, volumeNumber);
      await ensureDirectoryExists(volumePath);
      // write volume json
      await writeMetaJson(volumePath, {title: arg.volumeTitle, createTime: new Date().getTime()});

      volumes = await listSubdirectories(bookPath);
      volumes = volumes.filter((item) => {
        let volumeName = path.basename(item);
        return !isNaN(Number(volumeName));
      });
      // get number array
      let volumeNameNumbers = [];
      for (let i=0; i<volumes.length; i++) {
        let volumeName = path.basename(volumes[i]);
        let volumeNumber = Number(volumeName);
        volumeNameNumbers.push(volumeNumber);
      }
      // sort number array
      volumeNameNumbers.sort((a, b) => a - b);
      event.reply('add-volume-directory', {success: true, data: volumeNameNumbers});
    } catch (error) {
      console.log(error);
      event.reply('add-volume-directory', {success: false, reason: '添加失败'});
    }
  });

  // get volume list
  ipcMain.on('get-volume-list', async (event, title) => {
    try {
      console.log('get-volume-list', title);
      let bookPath = path.join(bookRoot, title);
      let volumes = await listSubdirectories(bookPath);
      volumes = volumes.filter((item) => {
        let volumeName = path.basename(item);
        return !isNaN(Number(volumeName));
      });
      // get number array
      let volumeNameNumbers = [];
      for (let i=0; i<volumes.length; i++) {
        let volumeName = path.basename(volumes[i]);
        let volumeNumber = Number(volumeName);
        volumeNameNumbers.push(volumeNumber);
      }
      // sort number array
      volumeNameNumbers.sort((a, b) => a - b);

      // get metajson from directory 
      let volumeJsons = {};
      for (let i=0; i<volumeNameNumbers.length; i++) {
        let volumePath = path.join(bookPath, volumeNameNumbers[i].toString());
        volumeJsons[i] = await readMetaJson(volumePath);
      }
      event.reply('get-volume-list', {success: true, data: volumeJsons});
    } catch (error) {
      console.log(error);
      event.reply('get-volume-list', {success: false, reason: '获取失败'});
    }
  });

  // remove volume directory
  ipcMain.on('remove-volume-directory', async (event, arg) => {
    try {
      console.log('remove-volume-directory', arg);
      let bookPath = path.join(bookRoot, arg.title);
      let volumePath = path.join(bookPath, arg.volume);
      let json = await readMetaJson(volumePath);
      if (json.title !== arg.volumeTitle) {
        event.reply('remove-volume-directory', {success: false, reason: '卷名不匹配'});
        return;
      }
      await removeDirectory(volumePath);
      event.reply('remove-volume-directory', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('remove-volume-directory', {success: false, reason: '删除失败'});
    }
  });

  // update volume meta json
  ipcMain.on('update-volume-meta-json', async (event, arg) => {
    try {
      console.log('update-volume-meta-json', arg);
      let bookPath = path.join(bookRoot, arg.title);
      let volumePath = path.join(bookPath, arg.volume);
      console.log('volumePath', volumePath, arg.volumeTitle);
      
      await writeMetaJson(volumePath, {
        title: arg.volumeTitle,
        createTime: Date.now(),
      });
      event.reply('update-volume-meta-json', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('update-volume-meta-json', {success: false, reason: '更新失败'});
    }
  });

}