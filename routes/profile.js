const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/profiles").post((req,res)=>{
    new Promise((resolve,reject)=>{
        try {
            var params = [req.body.idpeople];
            var sql = "";
            sql += " SELECT";  
            sql += "    pp.name,";
            sql += "    pp.email,";
            sql += "    pp.phonenumber,";
            sql += "    jc.categoryname as profession, ";
            sql += "    pp.idpeople";
            sql += " FROM people pp";
            sql += " INNER JOIN jobcategory jc ON (jc.idjobcategory = pP.fk_idjobcategory) ";
            sql += " WHERE pp.idpeople = ?;";

            db.query(sql,params).then(result =>{
                resolve(res.send(result));
            }).catch(error =>{
                reject(res.send(error));
            });
        } catch (error) {
            reject(res.send(err.message));
        }
    });
});

module.exports = routes;