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
  writeWordCountJson,
  readWordCountJson,
} from '../helpers'
import prompt from 'electron-prompt';

const fs = require('fs').promises;

let wordCountMemoryDb = {
  title: '',
  total: 0,
  outline: 0,
  date: {},
  volume: {},
  chapter: {},
};

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
      if (arg.title !== wordCountMemoryDb.title) {
        let bookPath = path.join(bookRoot, arg.title);
        let wordCount = await readWordCountJson(bookPath);
        wordCountMemoryDb = wordCount;
        event.reply('get-book-word-count', {success: true, data: wordCount});
      } else {
        event.reply('get-book-word-count', {success: true, data: wordCountMemoryDb});
      }
    } catch (error) {
      console.log(error);
      wordCountMemoryDb.title = arg.title;
      event.reply('get-book-word-count', {success: true, data: wordCountMemoryDb});
    }
  });
  
  // update book word count info {title: '', volume, chapter, change: { type: 'MainOutline/DetailOutline/TextContent', value: 0}}
  ipcMain.on('update-book-word-count', async (event, arg) => {
    try {
      console.log('update-book-word-count', arg);
      const { volume, chapter } = arg;
      if (arg.title !== wordCountMemoryDb.title) {
        let bookPath = path.join(bookRoot, arg.title);
        let wordCount = await readWordCountJson(bookPath);
        wordCountMemoryDb = wordCount;
      }
      let change = arg.change;
      let additional = 0;
      let old = 0;
      if (change.type === 'MainOutline') {
        old = wordCountMemoryDb.outline;
        wordCountMemoryDb.outline = change.value;
      } else if (change.type === 'DetailOutline') {
        if (!wordCountMemoryDb.chapter[volume + '-' + chapter]) {
          wordCountMemoryDb.chapter[volume + '-' + chapter] = {detailOutline: 0, textContent: 0};
        }
        old = wordCountMemoryDb.chapter[volume + '-' + chapter].detailOutline;
        wordCountMemoryDb.chapter[volume + '-' + chapter].detailOutline = change.value;
      } else if (change.type === 'TextContent') {
        if (!wordCountMemoryDb.chapter[volume + '-' + chapter]) {
          wordCountMemoryDb.chapter[volume + '-' + chapter] = {detailOutline: 0, textContent: 0};
        }
        old = wordCountMemoryDb.chapter[volume + '-' + chapter].textContent;
        wordCountMemoryDb.chapter[volume + '-' + chapter].textContent = change.value;
      }

      additional = change.value - old;
      wordCountMemoryDb.total += additional;
      // get day string of today
      let today = new Date();
      let todayString = today.toISOString().split('T')[0];
      if (!wordCountMemoryDb.date[todayString]) {
        wordCountMemoryDb.date[todayString] = 0;
      }
      wordCountMemoryDb.date[todayString] += additional;

      if (!wordCountMemoryDb.volume[volume]) {
        wordCountMemoryDb.volume[volume] = 0;
      }
      wordCountMemoryDb.volume[volume] += additional;
      event.reply('update-book-word-count', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('update-book-word-count', {success: false, reason: '更新失败'});
    }
  });

  // save wordCountMemoryDb to word count JSON file in book directory every 5 seconds
  const saveWordCount = async () => {
    console.log('save wordCountMemoryDb 0', wordCountMemoryDb);
    if (wordCountMemoryDb.title) {
      let bookPath = path.join(bookRoot, wordCountMemoryDb.title);
      await writeWordCountJson(bookPath, wordCountMemoryDb);
    }
  }

  setInterval(saveWordCount, 5000);
}
