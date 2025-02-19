// stock.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import * as ExcelJS from 'exceljs';
import { Express } from 'express';

type ExcelRow = {
  'No': string;
  'Dealer Code': string;
  'Dealer Name': string;
  'Model': string;
  'VIN No.': string;
  'Front Motor no.': string;
  'BATTERY No.': string;
  'COLOR': string;
  'Car Type': string;
  'Allocation Date': string;
  'Price': string;
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

  async getVehicles(filters: any) {
    const queryBuilder = this.vehicleRepository.createQueryBuilder('vehicle');

    if (filters.carCard) {
      queryBuilder.andWhere('vehicle.vehicleCode LIKE :carCard', {
        carCard: `%${filters.carCard}%`
      });
    }

    if (filters.dlrId) {
      queryBuilder.andWhere('vehicle.dealerCode LIKE :dlrId', {
        dlrId: `%${filters.dlrId}%`
      });
    }

    if (filters.mdlCd || filters.modelCode || filters.modelGeneral) {
      queryBuilder.andWhere('vehicle.model LIKE :model', {
        model: `%${filters.mdlCd || filters.modelCode || filters.modelGeneral}%`
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('vehicle.carType LIKE :carType', {
        carType: `%${filters.type}%`
      });
    }

    if (filters.color) {
      queryBuilder.andWhere('vehicle.color LIKE :color', {
        color: `%${filters.color}%`
      });
    }

    if (filters.engineNo) {
      queryBuilder.andWhere('vehicle.frontMotor LIKE :frontMotor', {
        frontMotor: `%${filters.engineNo}%`
      });
    }

    if (filters.chassisNo) {
      queryBuilder.andWhere('vehicle.vinNumber LIKE :vinNumber', {
        vinNumber: `%${filters.chassisNo}%`
      });
    }

    if (filters.status) {
      const statusMap = {
        'พร้อมใช้งาน': 'available',
        'ไม่พร้อมใช้งาน': 'unavailable',
        'อยู่ในระหว่างการทดลองขับ': 'in_use'
      };
      queryBuilder.andWhere('vehicle.status = :status', {
        status: statusMap[filters.status] || filters.status
      });
    }

    const vehicles = await queryBuilder
      .orderBy('vehicle.createdAt', 'DESC')
      .getMany();

    return vehicles.map(vehicle => ({
      id: vehicle.id,
      carCard: vehicle.vehicleCode,
      dlrId: vehicle.dealerCode,
      mdlCd: vehicle.model,
      type: vehicle.carType || 'N/A',
      modelCode: vehicle.model,
      modelGeneral: vehicle.model,
      color: vehicle.color,
      engineNo: vehicle.frontMotor,
      chassisNo: vehicle.vinNumber,
      status: this.mapStatusToThai(vehicle.status)
    }));
  }

  private mapStatusToThai(status: string) {
    const statusMap = {
      'available': 'พร้อมใช้งาน',
      'unavailable': 'ไม่พร้อมใช้งาน',
      'in_use': 'อยู่ในระหว่างการทดลองขับ'
    };
    return statusMap[status] || status;
  }

  async updateVehicleStatus(id: number, newStatus: string) {
    const vehicle = await this.findOne(id);
    
    if (vehicle.status === 'in_use' && newStatus !== 'available') {
      throw new BadRequestException(
        'ไม่สามารถเปลี่ยนสถานะรถที่อยู่ระหว่างการทดลองขับได้'
      );
    }

    const statusMap = {
      'พร้อมใช้งาน': 'available',
      'ไม่พร้อมใช้งาน': 'unavailable',
      'อยู่ในระหว่างการทดลองขับ': 'in_use'
    };

    vehicle.status = statusMap[newStatus] || newStatus;
    return await this.vehicleRepository.save(vehicle);
  }

  async deleteVehicle(id: number) {
    const vehicle = await this.findOne(id);
    
    if (vehicle.status === 'in_use') {
      throw new BadRequestException(
        'ไม่สามารถลบรถที่อยู่ระหว่างการทดลองขับได้'
      );
    }

    return await this.vehicleRepository.remove(vehicle);
  }

  async processExcelFile(file: Express.Multer.File) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new BadRequestException('Excel file does not contain any worksheets');
      }

      const data: ExcelRow[] = [];
      const errors: string[] = [];

      // Get headers from first row
      const firstRow = worksheet.getRow(1);
      const headers = firstRow.values as string[];

      if (!headers || headers.length === 0) {
        throw new BadRequestException('Excel file does not contain headers');
      }

      // Validate required headers
      const requiredHeaders = [
        'Dealer Code',
        'Dealer Name',
        'Model',
        'VIN No.',
        'COLOR'
      ];
      const missingHeaders = requiredHeaders.filter(
        header => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Missing required headers: ${missingHeaders.join(', ')}`
        );
      }

      // Process each row
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rowData = {} as ExcelRow;
        let hasData = false;

        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            const value = cell.value?.toString().trim() || '';
            rowData[header as keyof ExcelRow] = value;
            if (value) hasData = true;
          }
        });

        if (hasData) {
          data.push(rowData);
        }
      });

      const results: Vehicle[] = [];
      for (const row of data) {
        try {
          // Validate required fields
          if (!row['Dealer Code']) {
            throw new Error(`Missing Dealer Code in row ${data.indexOf(row) + 2}`);
          }
          if (!row['Model']) {
            throw new Error(`Missing Model in row ${data.indexOf(row) + 2}`);
          }
          if (!row['VIN No.'] || row['VIN No.'].length !== 17) {
            throw new Error(`Invalid VIN Number in row ${data.indexOf(row) + 2}`);
          }
          // Generate unique vehicleCode
          const lastVehicle = await this.vehicleRepository.findOne({
            where: { dealerCode: row['Dealer Code'] },
            order: { vehicleCode: 'DESC' }
          });

          let vehicleNumber = '001';
          if (lastVehicle) {
            const lastNumber = parseInt(lastVehicle.vehicleCode.split('-')[1]) || 0;
            vehicleNumber = (lastNumber + 1).toString().padStart(3, '0');
          }
          const vehicleCode = `${row['Dealer Code']}-${vehicleNumber}`;

          // Parse date and price safely
          let allocationDate = new Date();
          if (row['Allocation Date']) {
            allocationDate = new Date(row['Allocation Date']);
            if (isNaN(allocationDate.getTime())) {
              throw new Error(`Invalid Allocation Date in row ${data.indexOf(row) + 2}`);
            }
          }

          let price = 0;
          if (row['Price']) {
            const priceString = row['Price'].toString().replace(/[^0-9.]/g, '');
            price = parseFloat(priceString);
            if (isNaN(price)) {
              throw new Error(`Invalid Price in row ${data.indexOf(row) + 2}`);
            }
          }

          const vehicleDto: CreateVehicleDto = {
            vehicleCode,
            dealerCode: row['Dealer Code'].trim(),
            dealerName: row['Dealer Name']?.trim() || '',
            model: row['Model'].trim(),
            vinNumber: row['VIN No.'].trim(),
            color: row['COLOR']?.trim() || '',
            frontMotor: row['Front Motor no.']?.trim() || '',
            batteryNumber: row['BATTERY No.']?.trim() || '',
            carType: row['Car Type']?.trim() || '',
            allocationDate,
            price
          };

          const vehicle = await this.createVehicle(vehicleDto);
          results.push(vehicle);
        } catch (error) {
          errors.push(error.message);
        }
      }

      return {
        totalRecords: data.length,
        processedRecords: results.length,
        success: results.length > 0 && errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to process Excel file: ${error.message}`
      );
    }
  }
}
