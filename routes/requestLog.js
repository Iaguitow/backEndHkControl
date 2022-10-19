const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/requestLog").get((req,res)=>{
    new Promise((resolve,reject)=>{
        try {
            var param = [req.query.idpeople];
            var sql = "CALL PROC_TMP_REQUEST_LOG(?);";
            db.query(sql,param).then(result =>{
                resolve(res.send(result[0]));
            }).catch(error =>{
                reject(res.send(error));
            });
        } catch (error) {
            reject(res.send(error.message));
        }
    });
});

module.exports = routes;