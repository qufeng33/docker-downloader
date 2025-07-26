import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { ValidationException } from '../exceptions'

/**
 * 自定义验证管道
 * 使用 class-validator 进行 DTO 验证
 */
@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    // 如果没有元类型或者是基础类型，直接返回
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }

    // 转换为类实例
    const object = plainToClass(metatype, value)

    // 执行验证
    const errors = await validate(object)

    if (errors.length > 0) {
      // 提取错误信息
      const errorMessages = errors.flatMap((error) => Object.values(error.constraints || {}))

      throw new ValidationException('输入数据验证失败', errorMessages, 'VALIDATION_ERROR')
    }

    return object
  }

  private toValidate(metatype: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype as never)
  }
}
