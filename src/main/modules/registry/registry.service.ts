import { Injectable } from '@nestjs/common'
import { ElectronLoggerService } from '../../common/logger/electron-logger.service'

/**
 * 仓库管理服务
 * 提供 Docker 仓库相关的业务逻辑
 */
@Injectable()
export class RegistryService {
  private readonly logger = new ElectronLoggerService().createScopedLogger('RegistryService')

  constructor() {
    this.logger.info('RegistryService 初始化完成')
  }

  /**
   * 测试方法：获取服务状态
   * @returns 服务状态信息
   */
  getServiceStatus(): { status: string; message: string; timestamp: string } {
    this.logger.debug('获取服务状态')

    return {
      status: 'active',
      message: 'RegistryService 运行正常',
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 测试方法：验证依赖注入
   * @param testData 测试数据
   * @returns 处理结果
   */
  processTestData(testData: unknown): { success: boolean; data: unknown; processedAt: string } {
    this.logger.debug('处理测试数据:', testData)

    return {
      success: true,
      data: {
        original: testData,
        processed: `已处理: ${JSON.stringify(testData)}`
      },
      processedAt: new Date().toISOString()
    }
  }
}
