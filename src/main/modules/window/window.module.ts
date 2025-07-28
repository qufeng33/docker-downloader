import { Module, Global } from '@nestjs/common'
import { WindowService } from './window.service'
import { WindowController } from './window.controller'

/**
 * 窗口管理模块
 */
@Global()
@Module({
  providers: [WindowService],
  controllers: [WindowController],
  exports: [WindowService]
})
export class WindowModule {}
