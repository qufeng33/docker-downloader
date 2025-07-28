import { Controller } from '@nestjs/common'
import { IpcHandle } from '@doubleshot/nest-electron'
import { WindowService } from './window.service'

/**
 * 窗口控制 IPC 控制器
 * 处理来自渲染进程的窗口控制请求
 */
@Controller('window')
export class WindowController {
  constructor(private readonly windowService: WindowService) {}

  /**
   * 最小化窗口
   */
  @IpcHandle('minimize')
  async minimizeWindow(): Promise<void> {
    this.windowService.minimizeWindow()
  }

  /**
   * 最大化/恢复窗口
   */
  @IpcHandle('toggle-maximize')
  async toggleMaximizeWindow(): Promise<void> {
    this.windowService.toggleMaximizeWindow()
  }

  /**
   * 关闭窗口
   */
  @IpcHandle('close')
  async closeWindow(): Promise<void> {
    this.windowService.closeWindow()
  }

  /**
   * 获取窗口最大化状态
   */
  @IpcHandle('is-maximized')
  async isMaximized(): Promise<boolean> {
    return this.windowService.isMaximized()
  }
}
