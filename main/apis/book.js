import path from 'path'
import { ipcMain, dialog } from 'electron'
import { 
  listSubdirectories, 
  checkDirectoryExists, 
  ensureDirectoryExists, 
  removeDirectory, 
  readMetaJson, 
  packDirectory, 
  unpackDirectory,
  writeOutlineJson,
  readOutlineJson,
  writeWordCountJson,
  readWordCountJson,
  packToTxtFile,
  importTxtFile,
} from '../helpers'
import prompt from 'electron-prompt';

const fs = require('fs').promises;

export function initBookApi(bookRoot) {
  ipcMain.on('list-books', async (event, arg) => {
    await ensureDirectoryExists(bookRoot);
    let books = await listSubdirectories(bookRoot);
    console.log('books', books);
    let bookJsons = [];
    for (let i=0; i<books.length; i++) {
      let bookPath = books[i];
      let bookJsonPath = path.join(bookPath, 'meta.json');
      let bookJson = await fs.readFile(bookJsonPath);
      bookJsons.push(JSON.parse(bookJson));
    }
    event.reply('list-books', bookJsons);
  });
  
  ipcMain.on('create-book', async (event, arg) => {
    try {
      await ensureDirectoryExists(bookRoot);
      let bookPath = path.join(bookRoot, arg.title);
      let exists = await checkDirectoryExists(bookPath);
      if (exists) {
        event.reply('create-book', {success: false, reason: '书名重复'});
        return;
      } else {
        await ensureDirectoryExists(bookPath);
      }
      // write book json
      let bookJsonPath = path.join(bookPath, 'meta.json');
      let bookJson = arg;
      bookJson.createTime = new Date().getTime();
      await fs.writeFile(bookJsonPath, JSON.stringify(bookJson));
      console.log('bookJsonPath', bookJsonPath);
      event.reply('create-book', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('create-book', {success: false, reason: '创建失败'});
    }
  });
  
  // get book info 
  ipcMain.on('get-book-info', async (event, arg) => {
    try {
      console.log('get-book-info', arg);
      let bookPath = path.join(bookRoot, arg);
      let bookJsonPath = path.join(bookPath, 'meta.json');
      let bookJson = await fs.readFile(bookJsonPath, 'utf-8');
      event.reply('get-book-info', {success: true, data: JSON.parse(bookJson)});
    } catch (error) {
      console.log(error);
      event.reply('get-book-info', {success: false, reason: '获取失败'});
    }
  });
  
  // update book info
  ipcMain.on('update-book-info', async (event, arg) => {
    try {
      console.log('update-book-info', arg);
      let bookPath = path.join(bookRoot, arg.title);
      let bookJsonPath = path.join(bookPath, 'meta.json');
      let bookJson = await fs.readFile(bookJsonPath, 'utf-8');
      bookJson = {...JSON.parse(bookJson), ...arg};
      bookJson.updateTime = new Date().getTime();
      await fs.writeFile(bookJsonPath, JSON.stringify(bookJson));
      event.reply('update-book-info', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('update-book-info', {success: false, reason: '更新失败'});
    }
  });

  // remove book directory
  ipcMain.on('remove-book', async (event, arg) => {
    try {
      console.log('remove-book', arg);
      let title = await prompt({
        title: '删除书籍',
        label: '请输入完整书名确认删除操作：',
        value: '',
        inputAttrs: {
          type: 'text'
        },
        type: 'input'
      });

      if (!title) {
        event.reply('remove-book', {success: false});
        return;
      }

      if (title !== arg) {
        event.reply('remove-book', {success: false, reason: '书名不匹配'});
        return;
      }

      let bookPath = path.join(bookRoot, arg);

      await removeDirectory(bookPath);
      event.reply('remove-book', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('remove-book', {success: false, reason: '删除失败'});
    }
  });
  
  // export book directory to zip file 
  // arg: {title: ''}
  ipcMain.on('export-book', async (event, arg) => {
    try {
      let savePath = await dialog.showSaveDialog({
        title: '导出书籍', 
        defaultPath: arg.title + '.zip',
        buttonLabel: '导出',
        filters: [{name: 'Zip', extensions: ['zip']}]
      });
      if (savePath.canceled) {
        event.reply('export-book', {success: false, reason: '取消导出'});
        return;
      }

      console.log('export-book', arg);
      let bookPath = path.join(bookRoot, arg.title);
      // export book directory to zip file
      await packDirectory(bookPath, savePath.filePath);
      event.reply('export-book', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('export-book', {success: false, reason: '导出失败'});
    }
  });

  // import book directory from zip file
  // arg: {zipFilePath: ''}
  ipcMain.on('import-book', async (event, arg) => {
    try {
      let result = await dialog.showOpenDialog({
        title: '导入书籍', 
        buttonLabel: '导入',
        filters: [
          {name: 'All', extensions: ['zip', 'txt']}
        ],
        properties: ['openFile']
      });
      if (result.canceled) {
        event.reply('import-book', {success: false, reason: '取消导入'});
        return;
      }
      console.log('import-book', arg);
      // import book directory from zip file
      for (let i=0; i<result.filePaths.length; i++) {
        let ext = path.extname(result.filePaths[i]);
        console.log('ext', ext);
        let title = path.basename(result.filePaths[i], ext);
        if (ext === '.zip') {
          await unpackDirectory(result.filePaths[i], path.join(bookRoot, title));
        } else if (ext === '.txt') {
          await importTxtFile(title, bookRoot, result.filePaths[i]);
        } else {
          console.log('unknown file type', ext);
          throw new Error('未知文件类型');
        }
      }
      event.reply('import-book', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('import-book', {success: false, reason: '导入失败'});
    }
  });

  // export book to a txt file
  // arg: {title: ''}
  ipcMain.on('export-book-txt', async (event, arg) => {
    try {
      let savePath = await dialog.showSaveDialog({
        title: '导出书籍', 
        defaultPath: arg.title + '.txt',
        buttonLabel: '导出',
        filters: [{name: 'Txt', extensions: ['txt']}]
      });
      if (savePath.canceled) {
        event.reply('export-book', {success: false, reason: '取消导出'});
        return;
      }

      console.log('export-book-txt', arg);
      let bookPath = path.join(bookRoot, arg.title);
      // export book directory to zip file
      await packToTxtFile(bookPath, savePath.filePath);
      event.reply('export-book-txt', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('export-book', {success: false, reason: '导出失败'});
    }
  });

  // save book outline JSON file in book directory
  // arg: {title: '', outline: {}}
  ipcMain.on('save-book-outline', async (event, arg) => {
    try {
      console.log('save-book-outline', arg);
      let bookPath = path.join(bookRoot, arg.title);
      await writeOutlineJson(bookPath, arg.outline);
      event.reply('save-book-outline', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('save-book-outline', {success: false, reason: '保存失败'});
    }
  });

  // load book outline JSON file in book directory
  // arg: {title: ''}
  ipcMain.on('load-book-outline', async (event, arg) => {
    try {
      console.log('load-book-outline', arg, bookRoot, arg.title);
      let bookPath = path.join(bookRoot, arg.title);
      let outline = await readOutlineJson(bookPath);
      event.reply('load-book-outline', {success: true, data: outline});
    } catch (error) {
      console.log(error);
      event.reply('load-book-outline', {success: false, reason: '加载失败'});
    }
  });

  // get book word count info {title: ''}
  ipcMain.on('get-book-word-count', async (event, arg) => {
    try {
      console.log('get-book-word-count', arg);
      let bookPath = path.join(bookRoot, arg.title);
      let wordCount = await readWordCountJson(bookPath);
      event.reply('get-book-word-count', {success: true, data: wordCount});
    } catch (error) {
      console.log(error);
      event.reply('get-book-word-count', {success: true, data: {total: 0, outline: 0, date: {}, volume: {}, chapter: {}}});
    }
  });
  
  // update book word count info {title: '', data: {}}
  ipcMain.on('update-book-word-count', async (event, arg) => {
    try {
      console.log('update-book-word-count', arg);
      let bookPath = path.join(bookRoot, arg.title);
      await writeWordCountJson(bookPath, arg.data);
      event.reply('update-book-word-count', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('update-book-word-count', {success: false, reason: '更新失败'});
    }
  });
}
