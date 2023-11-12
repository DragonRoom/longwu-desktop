import path from 'path'
import { app, ipcMain } from 'electron'
import { defaultThemes } from '../helpers/themes'

const fs = require('fs').promises;

export function initThemeApi() {
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
}

