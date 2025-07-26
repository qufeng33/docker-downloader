import { ElectronAPI } from '@electron-toolkit/preload'
import type { ExposedApi } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ExposedApi
  }
}
