import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createAdminUser() {
  console.log('🔧 Creating admin user...');

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'stock_management',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Admin credentials
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin exists
    const existingAdmin = await dataSource.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists');
      console.log('Username:', existingAdmin[0].username);
      console.log('Email:', existingAdmin[0].email);
      console.log('Role:', existingAdmin[0].role);

      // Update password if needed
      console.log('\n🔄 Updating password...');
      await dataSource.query(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE username = ?',
        [hashedPassword, username]
      );
      console.log('✅ Password updated');
    } else {
      // Create new admin
      console.log('📝 Creating new admin user...');
      await dataSource.query(
        `INSERT INTO users (username, password, email, role, created_at, updated_at)
         VALUES (?, ?, ?, 'admin', NOW(), NOW())`,
        [username, hashedPassword, email]
      );
      console.log('✅ Admin user created');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Email:', email);
    console.log('Role: admin');

    await dataSource.destroy();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
