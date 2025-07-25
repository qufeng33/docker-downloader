import { Module } from '@nestjs/common'
import { RegistryService } from './registry.service'
import { RegistryController } from './registry.controller'
import { ElectronLoggerService } from '../../common/logger/electron-logger.service'

/**
 * 仓库管理模块
 * 负责 Docker 仓库的连接、认证和镜像信息获取
 */
@Module({
  controllers: [RegistryController],
  providers: [RegistryService],
  exports: [RegistryService]
})
export class RegistryModule {
  private readonly logger = new ElectronLoggerService().createScopedLogger('RegistryModule')

  constructor() {
    this.logger.info('RegistryModule 初始化完成')
  }
}
