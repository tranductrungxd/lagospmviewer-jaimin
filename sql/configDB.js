const sql = require("mssql");

const configWeb = {
  user: process.env.DATABSE_USER,
  password: process.env.DATABSE_PASSWORD,
  server: process.env.SERVERIP,
  database: process.env.DATABASE_PUNCHLIST,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

sql.close();
const pools = {};

pools["poolWeb"] = new sql.ConnectionPool(configWeb);
pools["poolWebConnect"] = pools.poolWeb.connect();

module.exports = {
  configWeb,
  pools,
  serverIp: process.env.SERVERIP,
};
