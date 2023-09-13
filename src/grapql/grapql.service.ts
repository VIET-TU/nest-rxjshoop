import { Injectable } from '@nestjs/common';
import { CreateGrapqlInput } from './dto/create-grapql.input';
import { UpdateGrapqlInput } from './dto/update-grapql.input';

@Injectable()
export class GrapqlService {
  create(createGrapqlInput: CreateGrapqlInput) {
    return 'This action adds a new grapql';
  }

  findAll() {
    return `This action returns all grapql`;
  }

  findOne(id: number) {
    return `This action returns a #${id} grapql`;
  }

  update(id: number, updateGrapqlInput: UpdateGrapqlInput) {
    return `This action updates a #${id} grapql`;
  }

  remove(id: number) {
    return `This action removes a #${id} grapql`;
  }
}
