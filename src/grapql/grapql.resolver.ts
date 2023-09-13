import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GrapqlService } from './grapql.service';
import { CreateGrapqlInput } from './dto/create-grapql.input';
import { UpdateGrapqlInput } from './dto/update-grapql.input';

@Resolver('Grapql')
export class GrapqlResolver {
  constructor(private readonly grapqlService: GrapqlService) {}

  @Mutation('createGrapql')
  create(@Args('createGrapqlInput') createGrapqlInput: CreateGrapqlInput) {
    return this.grapqlService.create(createGrapqlInput);
  }

  @Query('grapql')
  findAll() {
    return this.grapqlService.findAll();
  }

  @Query('grapql')
  findOne(@Args('id') id: number) {
    return this.grapqlService.findOne(id);
  }

  @Mutation('updateGrapql')
  update(@Args('updateGrapqlInput') updateGrapqlInput: UpdateGrapqlInput) {
    return this.grapqlService.update(updateGrapqlInput.id, updateGrapqlInput);
  }

  @Mutation('removeGrapql')
  remove(@Args('id') id: number) {
    return this.grapqlService.remove(id);
  }
}
