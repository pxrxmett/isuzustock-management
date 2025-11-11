import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BrandService } from './brand.service';

@ApiTags('brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active brands' })
  @ApiResponse({ status: 200, description: 'Return all active brands' })
  async findAll() {
    console.log('📍 GET /api/brands');
    const brands = await this.brandService.findAll();
    console.log(`✅ Found ${brands.length} brands`);
    return brands;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  @ApiResponse({ status: 200, description: 'Return brand details' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    console.log('📍 GET /api/brands/:id');
    console.log('🔍 Brand ID:', id);
    return this.brandService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get brand by code (ISUZU, BYD)' })
  @ApiParam({ name: 'code', description: 'Brand code (ISUZU, BYD)' })
  @ApiResponse({ status: 200, description: 'Return brand details' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findByCode(@Param('code') code: string) {
    console.log('📍 GET /api/brands/code/:code');
    console.log('🔍 Brand code:', code);
    return this.brandService.findByCode(code);
  }
}
