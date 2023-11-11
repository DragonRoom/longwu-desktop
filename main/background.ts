import path from 'path'
import { app, ipcMain, nativeTheme } from 'electron'
import serve from 'electron-serve'
import { createWindow, readMetaJson } from './helpers'
import { defaultThemes } from './themes'
import { writeMetaJson, listSubdirectories, checkDirectoryExists, ensureDirectoryExists } from './helpers'

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

// save themes list json 
ipcMain.on('save-themes-list', async (event, arg) => {
  try {
    console.log('save-themes-list', arg);
    let themesListPath = path.join(app.getPath('userData'), 'themes.json');
    await fs.writeFile(themesListPath, JSON.stringify(arg), 'utf-8');
    event.reply('save-themes-list', {success: true});
  } catch (error) {
    console.log(error);
    event.reply('save-themes-list', {success: false, reason: '保存失败'});
  }
});

// get themes list json
ipcMain.on('get-themes-list', async (event, arg) => {
  try {
    let themesListPath = path.join(app.getPath('userData'), 'themes.json');
    let themesList = await fs.readFile(themesListPath, 'utf-8');
    event.reply('get-themes-list', {success: true, data: JSON.parse(themesList)});
  } catch (error) {
    console.log(error);
    if (error.code === 'ENOENT') {
      event.reply('get-themes-list', {success: true, data: defaultThemes});
      let themesListPath = path.join(app.getPath('userData'), 'themes.json');
      await fs.writeFile(themesListPath, JSON.stringify(defaultThemes), 'utf-8');
      return;
    }
    event.reply('get-themes-list', {success: false, reason: '获取失败'});
  }
});

// add volume directory 
ipcMain.on('add-volume-directory', async (event, arg) => {
  try {
    console.log('add-volume-directory', arg);
    let bookPath = path.join(bookRoot, arg.title);
    let volumes = await listSubdirectories(bookPath);
    console.log('volumes', volumes, bookPath);
    // fiter non-number directory
    volumes = (volumes as any).filter((item) => {
      let volumeName = path.basename(item);
      return !isNaN(Number(volumeName));
    });
    console.log('volumes', volumes);
    // get the largest number of volume name number 
    let volumeNameNumber = 0;
    for (let i=0; i<(volumes as any).length; i++) {
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
    volumes = (volumes as any).filter((item) => {
      let volumeName = path.basename(item);
      return !isNaN(Number(volumeName));
    });
    // get number array
    let volumeNameNumbers = [];
    for (let i=0; i<(volumes as any).length; i++) {
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
ipcMain.on('get-volume-list', async (event, arg) => {
  try {
    console.log('get-volume-list', arg);
    let bookPath = path.join(bookRoot, arg);
    let volumes = await listSubdirectories(bookPath);
    volumes = (volumes as any).filter((item) => {
      let volumeName = path.basename(item);
      return !isNaN(Number(volumeName));
    });
    // get number array
    let volumeNameNumbers = [];
    for (let i=0; i<(volumes as any).length; i++) {
      let volumeName = path.basename(volumes[i]);
      let volumeNumber = Number(volumeName);
      volumeNameNumbers.push(volumeNumber);
    }
    // sort number array
    volumeNameNumbers.sort((a, b) => a - b);

    // get metajson from directory 
    let volumeJsons = {};
    for (let i=0; i<(volumeNameNumbers as any).length; i++) {
      let volumePath = path.join(bookPath, volumeNameNumbers[i].toString());
      let volumeJson = await readMetaJson(volumePath);
      volumeJsons[i] = JSON.parse(volumeJson);
    }
    event.reply('get-volume-list', {success: true, data: volumeJsons});
  } catch (error) {
    console.log(error);
    event.reply('get-volume-list', {success: false, reason: '获取失败'});
  }
});

