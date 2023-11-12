import path from 'path'
import { app, ipcMain, nativeTheme } from 'electron'
import serve from 'electron-serve'
import { createWindow, readMetaJson } from './helpers'
import { writeMetaJson, listSubdirectories, ensureDirectoryExists } from './helpers'
import { initBookApi } from './apis/book'
import { initThemeApi } from './apis/theme'
import { initVolumeApi } from './apis/volume'

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

initBookApi(bookRoot);

initThemeApi();

initVolumeApi(bookRoot);

