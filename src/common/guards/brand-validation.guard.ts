import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { BrandService } from '../../modules/brand/brand.service';

/**
 * BrandValidationGuard
 *
 * Purpose: Validate that the brandCode in the URL path exists and is valid
 *
 * How it works:
 * 1. Extracts brandCode from request.params (e.g., /isuzu/stock -> 'isuzu')
 * 2. Validates the brand exists using BrandService
 * 3. Injects the full brand object into request.brand for downstream use
 * 4. Throws NotFoundException if brand doesn't exist
 *
 * Usage:
 * @UseGuards(BrandValidationGuard)
 * @Controller(':brandCode/staff')
 * export class BrandStaffController {
 *   // request.brand is now available in all methods
 * }
 */
@Injectable()
export class BrandValidationGuard implements CanActivate {
  constructor(private readonly brandService: BrandService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const brandCode = request.params.brandCode;

    // If no brandCode in URL params, this guard is misused - let it pass
    // (This should only happen during development/testing)
    if (!brandCode) {
      return true;
    }

    try {
      // Validate brand exists and get full brand object
      const brand = await this.brandService.findByCode(brandCode);

      // Inject brand object into request for use in controllers/services
      request.brand = brand;

      return true;
    } catch (error) {
      // If brand not found, BrandService will throw NotFoundException
      // Re-throw to send proper error response to client
      if (error instanceof NotFoundException) {
        throw error;
      }

      // For other errors, throw a generic NotFoundException
      throw new NotFoundException(
        `Invalid brand code: ${brandCode}. Please use 'isuzu' or 'byd'.`,
      );
    }
  }
}
