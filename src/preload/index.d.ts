import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      registry: {
        ping: () => Promise<{
          message: string
          timestamp: string
          serverTime: number
        }>
        getStatus: () => Promise<{
          status: string
          message: string
          timestamp: string
        }>
        test: (data: unknown) => Promise<{
          success: boolean
          data: unknown
          processedAt: string
        }>
      }
    }
  }
}
