import path from 'path'
import { ipcMain } from 'electron'
import { writeCardJson, readCardJson, listSubdirectories, ensureDirectoryExists, removeDirectory } from '../helpers'

export function initCardApi(bookRoot) {
  // add new card sequencely in cards directory  
  // arg: {bookTitle: '', cardClass: '', content: {}}
  ipcMain.on('add-card', async (event, arg) => {
    try {
      console.log('add-card', arg);
      let bookPath = path.join(bookRoot, arg.bookTitle);
      let cardsPath = path.join(bookPath, 'cards', arg.cardClass);

      let cards = await listSubdirectories(cardsPath);
      // get number array of cards
      let cardNameNumbers = [];
      for (let i=0; i<cards.length; i++) {
        let cardName = path.basename(cards[i]);
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
  // arg: {bookTitle: '', cardClass: ''}
  ipcMain.on('list-cards', async (event, arg) => {
    try {
      console.log('list-cards', arg);
      let bookPath = path.join(bookRoot, arg.bookTitle);
      let cardsPath = path.join(bookPath, 'cards', arg.cardClass);

      let cards = await listSubdirectories(cardsPath);
      // get number array of cards
      let cardNameNumbers = [];
      for (let i=0; i<cards.length; i++) {
        let cardName = path.basename(cards[i]);
        let cardNumber = Number(cardName);
        cardNameNumbers.push(cardNumber);
      }
      // sort number array
      cardNameNumbers.sort((a, b) => a - b);

      let cardJsons = {};
      for (let i=0; i<cardNameNumbers.length; i++) {
        let cardNumber = cardNameNumbers[i];
        let cardPath = path.join(cardsPath, cardNumber.toString());
        let cardJson = await readCardJson(cardPath);
        cardJsons[cardNumber] = cardJson;
      }
      event.reply('list-cards', {success: true, data: cardJsons});
    } catch (error) {
      console.log(error);
      event.reply('list-cards', {success: false, reason: '获取失败'});
    }
  });

  // update card json
  // arg: {bookTitle: '', cardClass: '', cardNumber: 123, content: {}}
  ipcMain.on('update-card', async (event, arg) => {
    try {
      console.log('update-card', arg);
      let bookPath = path.join(bookRoot, arg.bookTitle);
      let cardsPath = path.join(bookPath, 'cards', arg.cardClass);
      let cardPath = path.join(cardsPath, arg.cardNumber.toString());
      await writeCardJson(cardPath, arg.content);
      event.reply('update-card', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('update-card', {success: false, reason: '更新失败'});
    }
  });

  // remove card json 
  // arg: {bookTitle: '', cardClass: '', cardNumber: 123}
  ipcMain.on('remove-card', async (event, arg) => {
    try {
      console.log('remove-card', arg);
      let bookPath = path.join(bookRoot, arg.bookTitle);
      let cardsPath = path.join(bookPath, 'cards', arg.cardClass);
      let cardPath = path.join(cardsPath, arg.cardNumber.toString());
      await removeFile(cardPath);
      event.reply('remove-card', {success: true});
    } catch (error) {
      console.log(error);
      event.reply('remove-card', {success: false, reason: '删除失败'});
    }
  });

}

