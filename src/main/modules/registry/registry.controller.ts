import { Controller } from '@nestjs/common'
import { IpcHandle } from '@doubleshot/nest-electron'
import { Payload } from '@nestjs/microservices'
import { RegistryService } from './registry.service'
import { ElectronLoggerService } from '../../common/logger/electron-logger.service'

/**
 * 仓库管理控制器
 * 处理渲染进程发送的仓库相关 IPC 请求
 */
@Controller('registry')
export class RegistryController {
  private readonly logger = new ElectronLoggerService().createScopedLogger('RegistryController')

  constructor(private readonly registryService: RegistryService) {
    this.logger.info('RegistryController 初始化完成')
  }

  /**
   * 获取仓库服务状态
   * IPC 通道: registry/status
   */
  @IpcHandle('status')
  async getStatus(): Promise<{
    status: string
    message: string
    timestamp: string
  }> {
    this.logger.debug('处理获取状态请求')

    try {
      const result = this.registryService.getServiceStatus()
      this.logger.debug('状态获取成功:', result)
      return result
    } catch (error) {
      this.logger.error('获取状态失败:', error)
      throw error
    }
  }

  /**
   * 测试数据处理
   * IPC 通道: registry/test
   */
  @IpcHandle('test')
  async testProcess(@Payload() data: unknown): Promise<{
    success: boolean
    data: unknown
    processedAt: string
  }> {
    this.logger.debug('处理测试请求，数据:', data)

    try {
      const result = this.registryService.processTestData(data)
      this.logger.debug('测试处理成功:', result)
      return result
    } catch (error) {
      this.logger.error('测试处理失败:', error)
      throw error
    }
  }

  /**
   * Ping 测试方法
   * IPC 通道: registry/ping
   */
  @IpcHandle('ping')
  async ping(): Promise<{
    message: string
    timestamp: string
    serverTime: number
  }> {
    this.logger.debug('处理 ping 请求')

    return {
      message: 'pong from RegistryController',
      timestamp: new Date().toISOString(),
      serverTime: Date.now()
    }
  }
}
