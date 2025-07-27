import { Module } from '@nestjs/common'
import { RegistryService } from './registry.service'
import { RegistryController } from './registry.controller'

/**
 * 仓库管理模块
 * 负责 Docker 仓库的连接、认证和镜像信息获取
 */
@Module({
  imports: [],
  controllers: [RegistryController],
  providers: [RegistryService],
  exports: [RegistryService]
})
export class RegistryModule {}
