import { Controller, Logger } from '@nestjs/common'
import { IpcHandle } from '@doubleshot/nest-electron'
import { Payload } from '@nestjs/microservices'
import { RegistryService } from './registry.service'
import { IpcSecurityService } from '../security/ipc-security.service'
import { ImageSearchDto, ComplexDataDto, UserInfoDto } from './registry.dto'

@Controller('registry')
export class RegistryController {
  private readonly logger = new Logger(RegistryController.name)

  constructor(
    private readonly registryService: RegistryService,
    private readonly ipcSecurityService: IpcSecurityService
  ) {
    this.logger.log('RegistryController 初始化完成')
  }

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

  @IpcHandle('test')
  async testProcess(@Payload() data: unknown): Promise<{
    success: boolean
    data: unknown
    processedAt: string
  }> {
    this.logger.debug('处理测试请求，数据:', data)
    try {
      const result = this.registryService.processTestData(data as Record<string, unknown>)
      this.logger.debug('测试处理成功:', result)
      return result
    } catch (error) {
      this.logger.error('测试处理失败:', error)
      throw error
    }
  }

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

  @IpcHandle('validate-user')
  async validateUser(@Payload() userData: UserInfoDto): Promise<{
    valid: boolean
    errors: string[]
    data?: unknown
  }> {
    this.logger.debug('处理用户验证请求:', userData)

    try {
      // 安全验证：检查频率限制
      if (!this.ipcSecurityService.checkRateLimit('registry/validate-user')) {
        throw new Error('请求频率过高，请稍后再试')
      }

      // 安全验证：数据清理
      const sanitizedData = this.ipcSecurityService.sanitizeData(userData) as UserInfoDto

      const result = this.registryService.validateUserInfo(sanitizedData)
      this.logger.debug('用户验证成功:', result)
      return result
    } catch (error) {
      this.logger.error('用户验证失败:', error)

      // 记录安全事件
      this.ipcSecurityService.logSecurityEvent('用户验证失败', {
        error: error instanceof Error ? error.message : '未知错误',
        userData: userData
      })

      throw error
    }
  }

  @IpcHandle('search-images')
  async searchImages(@Payload() searchData: ImageSearchDto): Promise<{
    success: boolean
    data: {
      keyword: string
      registry?: string
      results: Array<{
        name: string
        description?: string
        stars?: number
        pulls?: number
      }>
      total: number
    }
    processedAt: string
  }> {
    this.logger.debug('处理镜像搜索请求:', searchData)
    try {
      const result = this.registryService.searchImages(searchData)
      this.logger.debug('镜像搜索成功:', result)
      return result
    } catch (error) {
      this.logger.error('镜像搜索失败:', error)
      throw error
    }
  }

  @IpcHandle('complex-data')
  async processComplexData(@Payload() complexData: ComplexDataDto): Promise<{
    success: boolean
    data: unknown
    processedAt: string
  }> {
    this.logger.debug('处理复杂数据请求:', complexData)
    try {
      const result = this.registryService.processComplexData(complexData)
      this.logger.debug('复杂数据处理成功:', result)
      return result
    } catch (error) {
      this.logger.error('复杂数据处理失败:', error)
      throw error
    }
  }

  @IpcHandle('throw-error')
  async throwError(@Payload() errorType: string): Promise<never> {
    this.logger.debug('处理错误测试请求:', errorType)
    switch (errorType) {
      case 'validation':
        throw new Error('这是一个验证错误测试')
      case 'business':
        throw new Error('这是一个业务逻辑错误测试')
      case 'timeout':
        throw new Error('这是一个超时错误测试')
      default:
        throw new Error('这是一个通用错误测试')
    }
  }

  @IpcHandle('async-operation')
  async asyncOperation(@Payload() delay: number): Promise<{
    success: boolean
    data: {
      delay: number
      startTime: string
      endTime: string
      duration: number
    }
    processedAt: string
  }> {
    this.logger.debug('处理异步操作请求，延迟:', delay)
    if (typeof delay !== 'number' || delay < 0 || delay > 10000) {
      throw new Error('延迟时间必须在 0-10000ms 之间')
    }
    try {
      const result = await this.registryService.performAsyncOperation(delay)
      this.logger.debug('异步操作完成:', result)
      return result
    } catch (error) {
      this.logger.error('异步操作失败:', error)
      throw error
    }
  }
}
