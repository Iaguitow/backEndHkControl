const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/rooms").get((req,res)=>{
    new Promise((resolve,reject)=>{
        try {
            var sql = " SELECT p.idpeople, r.roomnumber FROM people p ";
            sql += " INNER JOIN floors f ON (p.idpeople = f.fk_porter_floor) ";
            sql += " INNER JOIN rooms r ON (f.idfloors = r.fk_floor); ";

            db.query(sql).then(result =>{
                resolve(res.send(result));
            }).catch(error =>{
                reject(res.send(error));
            });
        } catch (error) {
            reject(res.send(error.message));
        }
    });
});

module.exports = routes;