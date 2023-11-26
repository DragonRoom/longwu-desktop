import path from 'path'
import { ipcMain } from 'electron'
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
} from '../helpers'

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
      let bookPath = path.join(bookRoot, arg);
      // compare book title
      let bookJson = await readMetaJson(bookPath);
      if (bookJson.title !== arg) {
        event.reply('remove-book', {success: false, reason: '书名不匹配'});
        return;
      }

      await removeDirectory(bookPath);
      event.reply('remove-book', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('remove-book', {success: false, reason: '删除失败'});
    }
  });
  
  // export book directory to zip file 
  // arg: {title: '', zipFilePath: ''}
  ipcMain.on('export-book', async (event, arg) => {
    try {
      console.log('export-book', arg);
      let bookPath = path.join(bookRoot, arg.title);
      // export book directory to zip file
      await packDirectory(bookPath, arg.zipFilePath);
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
      console.log('import-book', arg);
      let bookPath = path.join(bookRoot, arg.title);
      // import book directory from zip file
      await unpackDirectory(arg.zipFilePath, bookPath);
      event.reply('import-book', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('import-book', {success: false, reason: '导入失败'});
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
      console.log('load-book-outline', arg);
      let bookPath = path.join(bookRoot, arg);
      let outline = await readOutlineJson(bookPath);
      event.reply('load-book-outline', {success: true, data: outline});
    } catch (error) {
      console.log(error);
      event.reply('load-book-outline', {success: false, reason: '加载失败'});
    }
  });
}
