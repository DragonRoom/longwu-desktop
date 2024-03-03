import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.removeAllListeners(channel)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  }
}

contextBridge.exposeInMainWorld('ipc', handler)

document.addEventListener('keydown', (event) => {
  if (event.key === 'F8') {
    console.log('F8 pressed');
    // 在这里执行F8按下时的逻辑
    window.dispatchEvent(new CustomEvent('new-volume-keydown'));
  } else if (event.key === 'F9') {
    console.log('F9 pressed');
    // 在这里执行F9按下时的逻辑
    window.dispatchEvent(new CustomEvent('new-chapter-keydown'));
  } else if (event.key === 'F10') {
    console.log('F10 pressed');
    // 在这里执行F10按下时的逻辑
    window.dispatchEvent(new CustomEvent('new-card-keydown'));
  
  }
});

export type IpcHandler = typeof handler
