import { Injectable, Logger } from '@nestjs/common'
import {
  UserInfoDto,
  ImageSearchDto,
  ComplexDataDto,
  ValidationResultDto,
  TestResponseDto
} from './registry.dto'
import { BusinessException } from '../../common/exceptions'

/**
 * 仓库管理服务
 * 提供 Docker 仓库相关的业务逻辑
 */
@Injectable()
export class RegistryService {
  private readonly logger = new Logger(RegistryService.name)

  constructor() {
    this.logger.log('RegistryService 初始化完成')
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

    const data = testData as Record<string, unknown>

    return {
      success: true,
      data: {
        original: testData,
        processed: `已处理: ${JSON.stringify(testData)}`,
        validatedFields: Object.keys(data).length
      },
      processedAt: new Date().toISOString()
    }
  }

  /**
   * 用户信息验证
   * @param userData 用户数据
   * @returns 验证结果
   */
  validateUserInfo(userData: UserInfoDto): ValidationResultDto {
    this.logger.debug('验证用户信息:', userData)

    const errors: string[] = []

    // 自定义业务逻辑验证
    if (userData.age < 18) {
      errors.push('用户年龄必须大于等于18岁')
    }

    if (userData.email.includes('temp') || userData.email.includes('test')) {
      errors.push('不允许使用临时邮箱')
    }

    const isValid = errors.length === 0

    return {
      valid: isValid,
      errors,
      data: isValid
        ? {
            ...userData,
            validated: true,
            validatedAt: new Date().toISOString()
          }
        : undefined
    }
  }

  /**
   * 镜像搜索模拟
   * @param searchData 搜索数据
   * @returns 搜索结果
   */
  searchImages(searchData: ImageSearchDto): TestResponseDto {
    this.logger.debug('搜索镜像:', searchData)

    // 模拟业务逻辑
    if (searchData.keyword === 'error') {
      throw new BusinessException('搜索关键词不被允许', 'INVALID_KEYWORD', {
        keyword: searchData.keyword
      })
    }

    const mockResults = Array.from({ length: searchData.limit || 10 }, (_, i) => ({
      name: `${searchData.keyword}-image-${i + 1}`,
      registry: searchData.registry || 'docker.io',
      tags: ['latest', 'v1.0', 'stable'],
      description: `模拟的 ${searchData.keyword} 镜像描述`
    }))

    return {
      success: true,
      data: {
        query: searchData,
        results: mockResults,
        total: mockResults.length,
        hasMore: (searchData.offset || 0) + mockResults.length < 100
      },
      processedAt: new Date().toISOString()
    }
  }

  /**
   * 复杂数据处理
   * @param complexData 复杂数据
   * @returns 处理结果
   */
  processComplexData(complexData: ComplexDataDto): TestResponseDto {
    this.logger.debug('处理复杂数据:', complexData)

    // 模拟复杂处理逻辑
    const processedData = {
      ...complexData,
      processed: {
        titleUpperCase: complexData.title.toUpperCase(),
        doubleCount: complexData.count * 2,
        invertedEnabled: !complexData.enabled,
        metadataKeys: Object.keys(complexData.metadata),
        tagCount: complexData.tags.length,
        summary: `处理了包含 ${complexData.tags.length} 个标签的 ${complexData.title}`
      },
      statistics: {
        processedAt: new Date().toISOString(),
        processingTimeMs: Math.floor(Math.random() * 100) + 10,
        dataSize: JSON.stringify(complexData).length
      }
    }

    return {
      success: true,
      data: processedData,
      processedAt: new Date().toISOString()
    }
  }

  /**
   * 异步操作模拟
   * @param delay 延迟时间（毫秒）
   * @returns 异步操作结果
   */
  async performAsyncOperation(delay: number): Promise<TestResponseDto> {
    this.logger.debug(`开始异步操作，延迟 ${delay}ms`)

    const startTime = Date.now()

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, delay))

    const endTime = Date.now()
    const actualDelay = endTime - startTime

    this.logger.debug(`异步操作完成，实际耗时 ${actualDelay}ms`)

    return {
      success: true,
      data: {
        requestedDelay: delay,
        actualDelay,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        operation: 'async-test-operation'
      },
      processedAt: new Date().toISOString()
    }
  }
}
