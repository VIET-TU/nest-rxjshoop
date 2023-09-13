import { CreateGrapqlInput } from './create-grapql.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateGrapqlInput extends PartialType(CreateGrapqlInput) {
  id: number;
}
