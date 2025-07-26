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

/**
 * 服务状态响应 DTO
 */
export interface ServiceStatusDto {
  status: string
  message: string
  timestamp: string
}

/**
 * 基础测试请求 DTO
 */
export class TestRequestDto {
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
export class UserInfoDto {
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
 * 镜像搜索请求 DTO（为未来功能预备）
 */
export class ImageSearchDto {
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
export class ComplexDataDto {
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

/**
 * 测试响应 DTO
 */
export interface TestResponseDto {
  success: boolean
  data: unknown
  processedAt: string
}

/**
 * 验证结果 DTO
 */
export interface ValidationResultDto {
  valid: boolean
  errors: string[]
  data?: unknown
}

/**
 * Ping 响应 DTO
 */
export interface PingResponseDto {
  message: string
  timestamp: string
  serverTime: number
}

/**
 * 通用错误响应 DTO
 */
export interface ErrorResponseDto {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
    timestamp: string
  }
}

/**
 * IPC 通道名称常量
 */
export const IPC_CHANNELS = {
  REGISTRY: {
    STATUS: 'registry/status',
    TEST: 'registry/test',
    PING: 'registry/ping',
    VALIDATE_USER: 'registry/validate-user',
    SEARCH_IMAGES: 'registry/search-images',
    COMPLEX_DATA: 'registry/complex-data',
    THROW_ERROR: 'registry/throw-error',
    ASYNC_OPERATION: 'registry/async-operation'
  }
} as const

/**
 * IPC 通道类型映射
 * 用于类型安全的 IPC 通信
 */
export interface IpcChannelMap {
  'registry/status': () => Promise<ServiceStatusDto>
  'registry/test': (data: TestRequestDto) => Promise<TestResponseDto>
  'registry/ping': () => Promise<PingResponseDto>
  'registry/validate-user': (userData: UserInfoDto) => Promise<ValidationResultDto>
  'registry/search-images': (searchData: ImageSearchDto) => Promise<TestResponseDto>
  'registry/complex-data': (complexData: ComplexDataDto) => Promise<TestResponseDto>
  'registry/throw-error': (errorType: string) => Promise<never>
  'registry/async-operation': (delay: number) => Promise<TestResponseDto>
}
