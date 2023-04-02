const mysql = require("mysql");
require("dotenv").config();

const config = {
    db: {
        connectionLimit: 100,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    },
    listPerPage: process.env.LIST_PER_PAGE,
    token_key: process.env.API_KEY,
}

let query = (sql = "select * from people limit ?,? ", params = [0, 10]) => {
    return new Promise((resolve, reject) => {
        try {
            const db = mysql.createPool(config.db);
            db.getConnection((err, connection) => {
                if (err) {
                    console.log(err);
                    resolve(err);
                } else {
                    const search_query = mysql.format(sql, params);
                    //console.log(search_query);
                    connection.query(search_query, (err, rows) => {
                        if (err) {
                            console.log(err);
                            connection.destroy();
                            resolve(err);
                        } else {
                            connection.destroy();  
                            resolve(rows);
                        }
                        connection.destroy();
                    });
                }
            });
        } catch (error) {
            console.log(error);
            return reject(error.message);
        }
    });
}

module.exports = {
    query,
    config
}