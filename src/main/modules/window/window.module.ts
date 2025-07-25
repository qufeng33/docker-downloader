import { Module, Global } from '@nestjs/common'
import { WindowService } from '../../services/window.service'

/**
 * 窗口管理模块
 */
@Global()
@Module({
  providers: [WindowService],
  exports: [WindowService]
})
export class WindowModule {}
