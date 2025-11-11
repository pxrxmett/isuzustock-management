import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  async findAll(): Promise<Brand[]> {
    return this.brandRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return brand;
  }

  async findByCode(code: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!brand) {
      throw new NotFoundException(`Brand with code ${code} not found`);
    }

    return brand;
  }

  async getIdByCode(code: string): Promise<number> {
    const brand = await this.findByCode(code);
    return brand.id;
  }
}
