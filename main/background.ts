import path from 'path'
import { app, ipcMain, nativeTheme } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
const fs = require('fs').promises;

const isProd = process.env.NODE_ENV === 'production'
console.log('path', app.getPath('userData'));
if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}
console.log('path2', app.getPath('userData'));

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    // mainWindow.webContents.openDevTools()
  }

  nativeTheme.themeSource = 'light';
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})

// apis

let bookRoot = path.join(app.getPath('userData'), 'Books');
async function ensureDirectoryExists(directoryPath) {
  try {
    await fs.access(directoryPath);
  } catch (error) {
    // 如果目录不存在，则创建它
    await fs.mkdir(directoryPath, { recursive: true });
    console.log('目录已创建成功');
  }
}

async function checkDirectoryExists(directoryPath) {
  try {
    await fs.access(directoryPath);
    return true;
  } catch (error) {
    return false
  }
}

function listSubdirectories(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (error, entries) => {
      if (error) {
        reject(error);
      } else {
        // 使用 filter 筛选出是目录的条目，并获取它们的名称
        const subdirectories = entries
          .filter(entry => entry.isDirectory())
          .map(dir => path.join(directoryPath, dir.name));
        resolve(subdirectories);
      }
    });
  });
}

ipcMain.on('list-books', async (event, arg) => {
  await ensureDirectoryExists(bookRoot);
  let books = await listSubdirectories(bookRoot);
  console.log('books', books);
  let bookJsons = [];
  for (let i=0; i<(books as any).length; i++) {
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