import { Module } from '@nestjs/common'
import { IpcSecurityService } from './ipc-security.service'

@Module({
  providers: [IpcSecurityService],
  exports: [IpcSecurityService]
})
export class SecurityModule {}
