import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsEmail,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsArray,
  IsBoolean
} from 'class-validator'
import { Type } from 'class-transformer'
import type { TestRequest, UserInfo, ImageSearchRequest, ComplexData } from '@shared/types/base'

/**
 * ====================================
 * Registry 模块 DTO 类定义
 * ====================================
 *
 * 这些类继承基础接口并添加验证装饰器
 * 只在主进程中使用，其他进程使用基础接口
 */

/**
 * 基础测试请求 DTO
 */
export class TestRequestDto implements TestRequest {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  message?: string

  @IsOptional()
  data?: unknown

  @IsOptional()
  @IsString()
  timestamp?: string
}

/**
 * 用户信息验证 DTO
 */
export class UserInfoDto implements UserInfo {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string

  @IsEmail()
  email!: string

  @IsNumber()
  @Min(1)
  @Max(120)
  age!: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[]
}

/**
 * 镜像搜索请求 DTO
 */
export class ImageSearchDto implements ImageSearchRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  keyword!: string

  @IsOptional()
  @IsString()
  registry?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number
}

/**
 * 复杂数据结构 DTO
 */
export class ComplexDataDto implements ComplexData {
  @IsString()
  title!: string

  @IsNumber()
  count!: number

  @IsBoolean()
  enabled!: boolean

  @IsObject()
  metadata!: Record<string, unknown>

  @IsArray()
  @Type(() => String)
  tags!: string[]
}

// 从共享类型导出接口类型
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
