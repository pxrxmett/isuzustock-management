import { Injectable, Logger } from '@nestjs/common';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

// ✅ Use CommonJS require() for pdfmake (fixes ES module issue in production)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PdfMake = require('pdfmake/build/pdfmake');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PdfFonts = require('pdfmake/build/vfs_fonts');

// Configure pdfmake with fonts (vfs_fonts exports fonts object directly)
PdfMake.addVirtualFileSystem(PdfFonts);

/**
 * Interface สำหรับข้อมูลเอกสารการทดลองขับ
 */
export interface TestDriveDocumentData {
  // ข้อมูลพนักงานขาย
  salesSpecialist?: string;
  salesTel?: string;

  // ข้อมูลลูกค้า
  customerName?: string;
  customerIdNumber?: string;
  customerTel?: string;
  customerHouseNo?: string;
  customerVillage?: string;
  customerDistrict?: string;
  customerProvince?: string;

  // ข้อมูลรถ
  purpose?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType?: string;
  vehicleColor?: string;
  vinNumber?: string;
  startMileage?: string;
  endMileage?: string;
  startDate?: string;
  endDate?: string;

  // ไฟล์และรูปภาพ (local file paths)
  licenseImagePath?: string;
  customerSignaturePath?: string;
  salesSignaturePath?: string;
  managerSignaturePath?: string;
}

/**
 * PDFGeneratorService
 *
 * สร้าง PDF สำหรับเอกสารการทดลองขับ
 * ใช้ pdfmake library พร้อมรองรับ Thai fonts
 *
 * Features:
 * - สร้าง PDF จากข้อมูลเอกสาร
 * - รองรับภาษาไทย (ใช้ Roboto font ชั่วคราว)
 * - รองรับรูปภาพ (ใบขับขี่, ลายเซ็น)
 * - Layout ตามฟอร์มการทดลองขับมาตรฐาน
 *
 * NOTE: ใช้ CommonJS require() เพื่อแก้ปัญหา ES module ใน production
 */
@Injectable()
export class PDFGeneratorService {
  private readonly logger = new Logger(PDFGeneratorService.name);

  /**
   * สร้าง PDF เอกสารการทดลองขับ
   *
   * @param data - ข้อมูลเอกสาร
   * @returns Buffer ของไฟล์ PDF
   */
  async generateTestDriveDocument(
    data: TestDriveDocumentData,
  ): Promise<Buffer> {
    try {
      this.logger.log('🔧 Generating test drive document PDF...');

      // กำหนด document definition
      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        defaultStyle: {
          font: 'Roboto', // ใช้ Roboto (built-in font)
          fontSize: 12,
        },
        content: [
          // Header
          {
            text: 'แบบฟอร์มทดลองขับ (Test Drive Form)',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },

          // วันที่และเวลา
          {
            columns: [
              {
                text: `วันที่: ${data.startDate || '-'}`,
                width: '50%',
              },
              {
                text: `เวลา: ${new Date().toLocaleTimeString('th-TH')}`,
                width: '50%',
                alignment: 'right',
              },
            ],
            margin: [0, 0, 0, 15],
          },

          // ข้อมูลพนักงานขาย
          {
            text: 'ข้อมูลพนักงานขาย',
            style: 'subheader',
            margin: [0, 0, 0, 10],
          },
          {
            columns: [
              {
                text: `ที่ปรึกษาการขาย: ${data.salesSpecialist || '-'}`,
                width: '60%',
              },
              {
                text: `โทร: ${data.salesTel || '-'}`,
                width: '40%',
              },
            ],
            margin: [0, 0, 0, 15],
          },

          // ข้อมูลลูกค้า
          {
            text: 'รายละเอียดผู้ทดลองขับ/ลูกค้า',
            style: 'subheader',
            margin: [0, 0, 0, 10],
          },
          {
            text: `ชื่อ-นามสกุล: ${data.customerName || '-'}`,
            margin: [0, 0, 0, 5],
          },
          {
            text: `เลขบัตรประชาชน: ${data.customerIdNumber || '-'}`,
            margin: [0, 0, 0, 5],
          },
          {
            text: `โทร: ${data.customerTel || '-'}`,
            margin: [0, 0, 0, 5],
          },
          {
            text: `ที่อยู่: ${data.customerHouseNo || ''} ${data.customerVillage ? 'หมู่ ' + data.customerVillage : ''} ${data.customerDistrict || ''} ${data.customerProvince || ''}`,
            margin: [0, 0, 0, 15],
          },

          // ข้อมูลรถ
          {
            text: `รถยนต์ ${data.vehicleBrand || ''}`,
            style: 'subheader',
            margin: [0, 0, 0, 10],
          },
          {
            text: `รุ่น: ${data.vehicleModel || '-'}   ประเภท: ${data.vehicleType || '-'}   สี: ${data.vehicleColor || '-'}`,
            margin: [0, 0, 0, 5],
          },
          {
            text: `หมายเลขตัวถัง: ${data.vinNumber || '-'}`,
            margin: [0, 0, 0, 5],
          },
          {
            columns: [
              {
                text: `เลขไมล์เริ่มต้น: ${data.startMileage || '-'}`,
                width: '50%',
              },
              {
                text: `เลขไมล์สิ้นสุด: ${data.endMileage || '-'}`,
                width: '50%',
              },
            ],
            margin: [0, 0, 0, 5],
          },
          {
            columns: [
              {
                text: `วันที่เริ่ม: ${data.startDate || '-'}`,
                width: '50%',
              },
              {
                text: `วันที่สิ้นสุด: ${data.endDate || '-'}`,
                width: '50%',
              },
            ],
            margin: [0, 0, 0, 15],
          },

          // รูปใบขับขี่
          ...(data.licenseImagePath
            ? ([
                {
                  text: 'ใบขับขี่',
                  style: 'subheader',
                  margin: [0, 0, 0, 10] as [number, number, number, number],
                },
                {
                  image: data.licenseImagePath,
                  width: 200,
                  alignment: 'center',
                  margin: [0, 0, 0, 15] as [number, number, number, number],
                },
              ] as Content[])
            : []),

          // ลายเซ็น
          {
            text: 'ลายเซ็น',
            style: 'subheader',
            margin: [0, 10, 0, 10] as [number, number, number, number],
            pageBreak: data.licenseImagePath ? ('before' as any) : undefined,
          },
          {
            columns: [
              {
                stack: [
                  { text: 'ลูกค้า:', margin: [0, 0, 0, 5] as [number, number, number, number] },
                  data.customerSignaturePath
                    ? {
                        image: data.customerSignaturePath,
                        width: 100,
                        height: 50,
                      }
                    : { text: '_________________', alignment: 'center' as any },
                  {
                    text: '(                         )',
                    alignment: 'center' as any,
                    margin: [0, 5, 0, 0] as [number, number, number, number],
                  },
                ],
                width: '33%',
              },
              {
                stack: [
                  { text: 'พนักงานขาย:', margin: [0, 0, 0, 5] as [number, number, number, number] },
                  data.salesSignaturePath
                    ? {
                        image: data.salesSignaturePath,
                        width: 100,
                        height: 50,
                      }
                    : { text: '_________________', alignment: 'center' as any },
                  {
                    text: '(                         )',
                    alignment: 'center' as any,
                    margin: [0, 5, 0, 0] as [number, number, number, number],
                  },
                ],
                width: '33%',
              },
              {
                stack: [
                  { text: 'ผู้จัดการ:', margin: [0, 0, 0, 5] as [number, number, number, number] },
                  data.managerSignaturePath
                    ? {
                        image: data.managerSignaturePath,
                        width: 100,
                        height: 50,
                      }
                    : { text: '_________________', alignment: 'center' as any },
                  {
                    text: '(                         )',
                    alignment: 'center' as any,
                    margin: [0, 5, 0, 0] as [number, number, number, number],
                  },
                ],
                width: '33%',
              },
            ],
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
          },
          subheader: {
            fontSize: 14,
            bold: true,
          },
        },
      };

      // ✅ สร้าง PDF ด้วย pdfMake.createPdf() (ไม่ใช่ new PdfPrinter)
      const pdfDocGenerator = PdfMake.createPdf(docDefinition);

      // แปลง PDF เป็น buffer
      return new Promise<Buffer>((resolve, reject) => {
        pdfDocGenerator.getBuffer((buffer: Buffer) => {
          this.logger.log(
            `✅ PDF generated successfully (${buffer.length} bytes)`,
          );
          resolve(buffer);
        }, (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error(`❌ Failed to generate PDF:`, error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }
}
