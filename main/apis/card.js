import path from 'path'
import { ipcMain } from 'electron'
import { writeCardJson, readCardJson, listSubdirectories, ensureDirectoryExists, removeDirectory, listAllFiles, removeFile } from '../helpers'

export function initCardApi(bookRoot) {
  // add new card sequencely in cards directory  
  // arg: {bookTitle: '', content: {}}
  ipcMain.on('add-card', async (event, arg) => {
    try {
      console.log('add-card', arg);
      let bookPath = path.join(bookRoot, arg.bookTitle);
      let cardsPath = path.join(bookPath, 'cards');
      await ensureDirectoryExists(cardsPath);

      let cards = await listAllFiles(cardsPath);
      console.log('cards', cards);
      // get number array of cards
      let cardNameNumbers = [];
      for (let i=0; i<cards.length; i++) {
        let cardName = path.basename(cards[i]);
        cardName = cardName.split('.')[0];
        console.log('cardName', cardName);
        let cardNumber = Number(cardName);
        cardNameNumbers.push(cardNumber);
      }
      // sort number array
      cardNameNumbers.sort((a, b) => a - b);
      // get new card number
      let newCardNumber = 1;
      if (cardNameNumbers.length > 0) {
        newCardNumber = cardNameNumbers[cardNameNumbers.length - 1] + 1;
      }
      // create card directory
      let cardPath = path.join(cardsPath, newCardNumber.toString());
      await writeCardJson(cardPath, arg.content);

      event.reply('add-card', {success: true, data: {cardNumber: newCardNumber}});
    } catch (error) {
      console.log(error);
      event.reply('add-card', {success: false, reason: '添加失败'});
    }
  });

  // get all cards in cardClass directory 
  // arg: {bookTitle: ''}
  ipcMain.on('list-cards', async (event, arg) => {
    try {
      console.log('list-cards', arg);
      let bookPath = path.join(bookRoot, arg.bookTitle);
      let cardsPath = path.join(bookPath, 'cards');

      let cards = await listAllFiles(cardsPath);
      console.log('cards', cards);
      // get number array of cards
      let cardJsons = {};
      for (let i=0; i<cards.length; i++) {
        let cardName = path.basename(cards[i]);
        cardName = cardName.split('.')[0];
        let cardJson = await readCardJson(cards[i]);
        cardJsons[cardName] = cardJson;
      }
      event.reply('list-cards', {success: true, data: cardJsons});
    } catch (error) {
      console.log(error);
      event.reply('list-cards', {success: false, reason: '获取失败'});
    }
  });

  // update card json
  // arg: {bookTitle: '', cardNumber: 123, content: {}}
  ipcMain.on('update-card', async (event, arg) => {
    try {
      console.log('update-card', arg);
      let bookPath = path.join(bookRoot, arg.bookTitle);
      let cardsPath = path.join(bookPath, 'cards');
      let cardPath = path.join(cardsPath, arg.cardNumber.toString());
      await writeCardJson(cardPath, arg.content);
      event.reply('update-card', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('update-card', {success: false, reason: '更新失败'});
    }
  });

  // remove card json 
  // arg: {bookTitle: '', cardNumber: 123}
  ipcMain.on('remove-card', async (event, arg) => {
    try {
      console.log('remove-card', arg);
      let bookPath = path.join(bookRoot, arg.bookTitle);
      let cardsPath = path.join(bookPath, 'cards');
      let cardPath = path.join(cardsPath, arg.cardNumber.toString());
      await removeFile(cardPath + '.json');
      event.reply('remove-card', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('remove-card', {success: false, reason: '删除失败'});
    }
  });

}

