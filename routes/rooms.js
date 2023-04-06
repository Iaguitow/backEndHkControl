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

routes.route("/floors").get(getFloors);
function getFloors(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            var sql = "SELECT ";
            sql += " idfloors, ";  
            sql += " floorname, "; 
            sql += " fk_supervisor_floor, "; 
            sql += " fk_porter_floor "; 
            sql += " FROM floors; ";

            db.query(sql).then(result =>{
                resolve(res.send(result));
            }).catch(error =>{
                reject(res.send(error));
            });
        } catch (error) {
            reject(res.send(error.message));
        }
    })
}

routes.route("/floors/update/floor").post((req,res,next)=>{
    new Promise((resolve,reject)=>{
        try {
            var params = [];
            var floorObj = req.body.floorObj;

            var sql = " UPDATE floors AS f ";
            sql += " SET f.fk_supervisor_floor = "+floorObj.fk_supervisor_floor+", ";
            sql += " f.fk_porter_floor = "+floorObj.fk_porter_floor+"  ";
            sql += " WHERE f.idfloors = "+floorObj.idfloors+"; ";

            db.query(sql, params).then(floor =>{
                if(floor.affectedRows > 0){
                    next();
                    return;
                }
            }).catch(error => {
                reject(res.send(error));
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error =>{
        reject(error);
    });
}, getFloors);

module.exports = routes;