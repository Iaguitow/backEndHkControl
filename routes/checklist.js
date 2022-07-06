const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/checklist").get(getChecklist);

function getChecklist(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            
            var params = [req.query.idpeople==null?req.body.idpeople:req.query.idpeople];
            var sql = "SELECT pc.idpeople_has_checklist idcheck, cl.checkname, f.floorname, p.name as portername FROM people_has_checklist pc ";
            sql += "INNER JOIN checklist cl ON (cl.idchecklist = pc.fk_checklist) ";
            sql += "INNER JOIN floors f ON (pc.fk_floor = f.idfloors) ";
            sql += "INNER JOIN people p ON (p.idpeople = pc.fk_people) ";
            sql += "WHERE p.idpeople = ? ";
            sql += "ORDER BY pc.idpeople_has_checklist, cl.checkname ASC; ";

            db.query(sql, params).then(checklist =>{
                resolve(res.send(checklist));

            }).catch(error => {
                reject(res.send(error));
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error =>{
        reject(error);
    });
}

/*routes.route("/update/checklist").post((req,res,next)=>{
    new Promise((resolve,reject)=>{
        try {
            var params = [req.body.idTask];
            var sql = "UPDATE people_has_tasks ";
            if(req.body.taskdone == null){
                sql += "SET checked = 'N', ";
                sql += "timechecked = null ";
            }
            else{
                sql += "SET checked = 'S', ";
                sql += "timechecked = TIME(NOW()) ";
            };
            sql += " WHERE idpeople_has_tasks = ? ";

            db.query(sql, params).then(tasks =>{
                if(tasks.affectedRows > 0){
                    next();
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
},getTasks);*/

module.exports = routes;