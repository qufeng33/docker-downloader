import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { IpcChannelMap } from '../main/modules/registry/registry.dto'

// 定义类型安全的 IPC API
const api = {
  registry: {
    // 使用 as const 确保通道名称是字面量类型
    status: () => ipcRenderer.invoke('registry/status' as const),
    test: (data: Parameters<IpcChannelMap['registry/test']>[0]) =>
      ipcRenderer.invoke('registry/test' as const, data),
    ping: () => ipcRenderer.invoke('registry/ping' as const),
    validateUser: (userData: Parameters<IpcChannelMap['registry/validate-user']>[0]) =>
      ipcRenderer.invoke('registry/validate-user' as const, userData),
    searchImages: (searchData: Parameters<IpcChannelMap['registry/search-images']>[0]) =>
      ipcRenderer.invoke('registry/search-images' as const, searchData),
    complexData: (complexData: Parameters<IpcChannelMap['registry/complex-data']>[0]) =>
      ipcRenderer.invoke('registry/complex-data' as const, complexData),
    throwError: (errorType: Parameters<IpcChannelMap['registry/throw-error']>[0]) =>
      ipcRenderer.invoke('registry/throw-error' as const, errorType),
    asyncOperation: (delay: Parameters<IpcChannelMap['registry/async-operation']>[0]) =>
      ipcRenderer.invoke('registry/async-operation' as const, delay)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

// 导出 API 类型供渲染器使用
export type ExposedApi = typeof api
