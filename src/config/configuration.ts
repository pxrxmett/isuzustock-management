export default () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'stock1234',
    database: process.env.DB_DATABASE || 'stock_management',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d',
  },
});
