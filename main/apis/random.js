const randomName = require('chinese-random-name');
const randomSkill = require("chinese-random-skill");
import { ipcMain } from 'electron'

export function initRandomApi() {
  // arg: {length: 3, count: 10}
  ipcMain.on('random-name', async (event, arg) => {
    console.log('random-name', arg.length, arg.count);
    try {
      let rets = [];
      for (let i=0; i<arg.count; i++) {
        let name = randomName.generate(Number(arg.length));
        console.log(name);
        rets.push(name);
      }
      event.reply('random-name', {success: true, data: rets});
    } catch (e) {
      event.reply('random-name', {success: false, message: e.message});
    }
  });

  ipcMain.on('random-skill', async (event, arg) => {
    console.log('random-skill', arg.count);
    try {
      let rets = [];
      for (let i=0; i<arg.count; i++) {
        let name = randomSkill.generate();
        console.log(name);
        rets.push(name);
      }
      event.reply('random-skill', {success: true, data: rets});
    } catch (e) {
      event.reply('random-skill', {success: false, message: e.message});
    }
  });
}
