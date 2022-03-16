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
            sql += "    CONCAT(ifnull(bg.title,''), ' | ' ,ifnull(bg.institute,'')) AS schoolTitle,";
            sql += "    CONCAT(ifnull(pp.city,''),', ',ifnull(pp.country,'')) AS lives,";
            sql += "    pp.email,";
            sql += "    pp.phonenumber,";
            sql += "    pf.profession,";
            sql += "    pf.aboutyou,";
            sql += "    pf.goal";
            sql += " FROM people pp";
            sql += "    LEFT JOIN profile pf ON (pf.people_idpeople = pp.idpeople)";
            sql += "    LEFT JOIN bgschool bg ON (bg.people_idpeople = pp.idpeople)";
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