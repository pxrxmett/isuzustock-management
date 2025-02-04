// src/modules/stock/services/stock.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import * as ExcelJS from 'exceljs';
import { Express } from 'express';

type ExcelRow = {
  'รหัสรถ': string;
  'รุ่น': string;
  'VIN No.'?: string;
  'สี'?: string;
  'Front Motor'?: string;
  'BATTERY No.'?: string;
};

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async createVehicle(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.vehicleRepository.find();
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle #${id} not found`);
    }
    return vehicle;
  }

  async processExcelFile(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Excel file does not contain any worksheets');
    }

    const data: ExcelRow[] = [];
    
    // Get headers from first row
    const firstRow = worksheet.getRow(1);
    const headers = (firstRow.values as string[]) || [];
    
    if (headers.length === 0) {
      throw new BadRequestException('Excel file does not contain headers');
    }
    
    // Process each row
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const rowData = {} as ExcelRow;
      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber] as keyof ExcelRow] = cell.value?.toString() || '';
      });
      data.push(rowData);
    });

    const results: Vehicle[] = [];

    for (const row of data) {
      try {
        const vehicleDto: CreateVehicleDto = {
          vehicleCode: row['รหัสรถ'],
          model: row['รุ่น'],
          vinNumber: row['VIN No.'],
          color: row['สี'],
          frontMotor: row['Front Motor'],
          batteryNumber: row['BATTERY No.'],
        };
        const vehicle = await this.createVehicle(vehicleDto);
        results.push(vehicle);
      } catch (error) {
        console.error('Error processing row:', error);
      }
    }

    return {
      totalRecords: data.length,
      processedRecords: results.length,
      success: results.length === data.length,
    };
  }
}
