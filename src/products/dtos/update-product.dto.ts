import { Transform, TransformFnParams } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator'
import { PRODUCT_TYPE_ENUM } from '../entities/product.entity'
import { UserEntity } from 'src/user/entities/user.entity'
import { IsNull } from 'typeorm'
import { CreateProductDto } from './create-product.dto'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateProducttDto extends PartialType(CreateProductDto) {}
