const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/tasks").get(getTasks);

function getTasks(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            
            var params = [req.query.idpeople==null?req.body.idpeople:req.query.idpeople];
            var joblevel = [req.query.joblevel==null?req.body.joblevel:req.query.joblevel];

            var sql = "SELECT idpeople_has_tasks as idTask,  IFNULL(f.floorname,'NO FLOOR') AS floorname, p.name AS portername, p.idpeople as porterId,"; 
            sql += "t.taskname, TIME_FORMAT(pt.timechecked,'%H:%i') AS timechecked, pt.checked, pp.name AS supervisorname FROM tasks t ";
            sql += "INNER JOIN people_has_tasks pt ON (pt.fk_tasks = t.idtasks) ";
            sql += "INNER JOIN floors f ON (f.fk_porter_floor = pt.fk_people AND pt.fk_floor = f.idfloors) ";
            sql += "INNER JOIN people p ON (p.idpeople=pt.fk_people) ";
            sql += "LEFT JOIN people pp ON (pp.idpeople=pt.fk_supervisor) ";
            sql += "WHERE pt.taskdate = curdate() ";
            if(joblevel.includes("HS","PA")){
                sql += "AND p.idpeople = ? ";
            }
            sql += "ORDER BY f.idfloors ASC, pt.timechecked ASC";

            db.query(sql, params).then(tasks =>{
                resolve(res.send(tasks));

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

routes.route("/update/tasks").post((req,res,next)=>{
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
},getTasks);

module.exports = routes;