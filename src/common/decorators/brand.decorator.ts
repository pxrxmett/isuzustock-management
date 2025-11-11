import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Brand } from '../../modules/brand/entities/brand.entity';

/**
 * @Brand() Decorator
 *
 * Purpose: Extract the brand object from the request
 *
 * This decorator should be used with BrandValidationGuard.
 * The guard validates the brandCode and injects the brand object into request.brand.
 *
 * Usage:
 * @UseGuards(BrandValidationGuard)
 * @Controller(':brandCode/staff')
 * export class BrandStaffController {
 *   @Post()
 *   async create(@Brand() brand: Brand, @Body() dto: CreateStaffDto) {
 *     // brand object is available here
 *     return this.staffService.create(dto, brand.id);
 *   }
 * }
 */
export const BrandDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Brand => {
    const request = ctx.switchToHttp().getRequest();
    return request.brand;
  },
);

// Export with a shorter alias
export { BrandDecorator as Brand };
