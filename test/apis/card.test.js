// FILEPATH: /Users/molin/workspace/temp/longwu-desktop/test/apis/card.test.js
import { Application } from 'spectron'
import path from 'path'
import { initCardApi } from '../../main/apis/card'

let app

const os = require('os');

beforeEach(async () => {
  const tempDir = os.tmpdir(); // Get the temporary directory path
  app = new Application({
    path: path.join(__dirname, '../../node_modules/.bin/electron'),
    args: [path.join(__dirname, '../../main.js')]
  })
  await app.start()
  initCardApi(tempDir) // Use the temporary directory path
}, 15000)

afterEach(async () => {
  if (app && app.isRunning()) {
    await app.stop()
  }
})

test('add-card', async () => {
  const result = await app.electron.ipcRenderer.send('add-card', {bookTitle: 'testBook', cardClass: 'testClass', content: {}})
  expect(result.success).toBe(true)
})

test('list-cards', async () => {
  const result = await app.electron.ipcRenderer.send('list-cards', {bookTitle: 'testBook', cardClass: 'testClass'})
  expect(result.success).toBe(true)
})

test('update-card', async () => {
  const result = await app.electron.ipcRenderer.send('update-card', {bookTitle: 'testBook', cardClass: 'testClass', cardNumber: 1, content: {}})
  expect(result.success).toBe(true)
})

test('remove-card', async () => {
  const result = await app.electron.ipcRenderer.send('remove-card', {bookTitle: 'testBook', cardClass: 'testClass', cardNumber: 1})
  expect(result.success).toBe(true)
})
