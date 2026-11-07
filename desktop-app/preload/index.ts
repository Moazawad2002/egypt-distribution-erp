import { contextBridge, ipcRenderer } from 'electron';

// Expose strictly whitelisted, sandboxed IPC bridge
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('system:get-info'),
  openFileDialog: () => ipcRenderer.invoke('dialog:open-file')
});
