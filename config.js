const config = {
  db: {
    host: "192.168.0.155",
    port: 3306,
    user: "ssipl_serveradmin",
    password: "Sporada@2014",
    database: "sporadabilling",
    connectionLimit: 5000,
    multipleStatements: true,
  },
  db1: {
    host: "192.168.0.158",
    port: 3306,
    user: "ssipl_serveradmin",
    password: "Sporada@2014",
    database: "ssipl_clouddb1",
    connectionLimit: 5000,
    multipleStatements: true,
  },
  whatsappip: "http://192.168.0.165:4444",
  filestorage: "\\\\192.168.0.156\\Backup_ganesh",
  serverurl: "http://192.168.0.200:8081",
};

module.exports = config;
