const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'metas_user',
    password: '23!Bestdavidx',
    database: 'sistema_metas'
});

module.exports = pool.promise();
