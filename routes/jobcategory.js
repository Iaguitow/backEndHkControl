const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/get/jobcategories").get(getCategories);
function getCategories(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            var params = [req.query.idpeople == null ? req.body.idpeople : req.query.idpeople];
            var sql = " SELECT * FROM jobcategory;";

            db.query(sql,params).then(result =>{
                resolve(res.send(result));
            }).catch(error =>{
                reject(res.send(error));
            });
        } catch (error) {
            reject(res.send(error.message));
        }
    });
};

routes.route("/update/categories").post((req,res,next)=>{
    new Promise((resolve,reject)=>{
        try {
            var params = [req.body.breakType,req.body.idpeople];
            /*var sql = "UPDATE people ";
            sql += "set breaktime = ? "
            sql += " WHERE idpeople = ? ";*/
            db.query(sql, params).then(profile =>{
                /*if(profile.affectedRows > 0){
                    next();
                    return;
                }*/

            }).catch(error => {
                reject(res.send(error));
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error =>{
        reject(error);
    });
}, getCategories);

module.exports = routes;