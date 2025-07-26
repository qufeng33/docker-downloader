/**
 * ====================================
 * Registry 模块 DTO 导出
 * ====================================
 *
 * 重新导出共享类型中的 DTO 类，保持现有导入路径兼容性
 */

// 从主进程类型导入 DTO 类
export { TestRequestDto, UserInfoDto, ImageSearchDto, ComplexDataDto } from '../../types/dto'

// 从共享类型导入接口类型
export type {
  ServiceStatus as ServiceStatusDto,
  TestResponse as TestResponseDto,
  ValidationResult as ValidationResultDto,
  PingResponse as PingResponseDto,
  ErrorResponse as ErrorResponseDto,
  AsyncOperation as AsyncOperationDto,
  ImageSearchResponse as ImageSearchResponseDto,
  IpcChannelMap,
  IpcChannelNames,
  IpcChannelParams,
  IpcChannelReturn
} from '@shared/types'

// 保持向后兼容的常量导出
export { IPC_CHANNELS } from '@shared/types/ipc'
