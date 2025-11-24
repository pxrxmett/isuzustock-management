#!/usr/bin/env node
/**
 * สคริปต์แก้ไขข้อมูล brand_id ของรถที่ถูกอัพเดทเป็น BYD ผิดพลาด
 * เปลี่ยนกลับเป็น Isuzu
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.development' });

async function fixBrandData() {
  console.log('🔧 กำลังเชื่อมต่อ database...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'stockuser',
    password: process.env.DB_PASSWORD || 'stock1234',
    database: process.env.DB_DATABASE || 'stock_management',
  });

  try {
    // 1. แสดง brands ทั้งหมด
    console.log('📋 Brands ทั้งหมดในระบบ:');
    console.log('─'.repeat(60));
    const [brands] = await connection.execute(
      'SELECT id, code, name, name_th FROM brands ORDER BY id'
    );
    console.table(brands);

    // หา ID ของแต่ละ brand
    const isuzuBrand = brands.find(b => b.code.toLowerCase() === 'isuzu');
    const bydBrand = brands.find(b => b.code.toLowerCase() === 'byd');

    if (!isuzuBrand) {
      console.error('❌ ไม่พบ brand "isuzu" ในระบบ');
      return;
    }

    console.log(`\n✅ Isuzu brand_id: ${isuzuBrand.id}`);
    if (bydBrand) {
      console.log(`✅ BYD brand_id: ${bydBrand.id}\n`);
    } else {
      console.log('⚠️  ไม่พบ BYD brand\n');
    }

    // 2. แสดงรถที่มี brand_id ไม่ใช่ Isuzu
    console.log('🚗 รถทั้งหมดที่ brand_id ไม่ใช่ Isuzu:');
    console.log('─'.repeat(60));
    const [wrongBrandVehicles] = await connection.execute(
      `SELECT
        v.id,
        v.vehicleCode,
        v.model,
        v.brand_id,
        b.code as brand_code,
        b.name as brand_name
       FROM vehicle v
       LEFT JOIN brands b ON v.brand_id = b.id
       WHERE v.brand_id != ?
       ORDER BY v.id`,
      [isuzuBrand.id]
    );

    if (wrongBrandVehicles.length === 0) {
      console.log('✅ ไม่มีรถที่ต้องแก้ไข รถทั้งหมดเป็น Isuzu อยู่แล้ว');
      await connection.end();
      return;
    }

    console.table(wrongBrandVehicles);
    console.log(`\n⚠️  พบรถที่ brand_id ผิด: ${wrongBrandVehicles.length} คัน\n`);

    // 3. ถามยืนยันก่อนแก้ไข
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question(
        `คุณต้องการเปลี่ยน brand_id ของรถทั้ง ${wrongBrandVehicles.length} คันเป็น Isuzu (ID: ${isuzuBrand.id}) หรือไม่? (yes/no): `,
        resolve
      );
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ ยกเลิกการแก้ไข');
      await connection.end();
      return;
    }

    // 4. UPDATE brand_id เป็น Isuzu
    console.log('\n🔄 กำลังอัพเดทข้อมูล...');
    const [result] = await connection.execute(
      'UPDATE vehicle SET brand_id = ? WHERE brand_id != ?',
      [isuzuBrand.id, isuzuBrand.id]
    );

    console.log(`✅ อัพเดทสำเร็จ! แก้ไขข้อมูลแล้ว ${result.affectedRows} คัน\n`);

    // 5. แสดงผลลัพธ์หลัง UPDATE
    console.log('📊 ตรวจสอบข้อมูลหลัง UPDATE:');
    console.log('─'.repeat(60));
    const [afterUpdate] = await connection.execute(
      `SELECT
        brand_id,
        b.code as brand_code,
        COUNT(*) as vehicle_count
       FROM vehicle v
       LEFT JOIN brands b ON v.brand_id = b.id
       GROUP BY brand_id, b.code
       ORDER BY brand_id`
    );
    console.table(afterUpdate);

    console.log('\n✅ เสร็จสิ้น! รถทั้งหมดเป็น Isuzu แล้ว');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await connection.end();
  }
}

// รันสคริปต์
fixBrandData().catch(console.error);
