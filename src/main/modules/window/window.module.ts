import { Module } from '@nestjs/common'
import { WindowService } from '../../services/window.service'

/**
 * 窗口管理模块
 */
@Module({
  providers: [WindowService],
  exports: [WindowService]
})
export class WindowModule {}
