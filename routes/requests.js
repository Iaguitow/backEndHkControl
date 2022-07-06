const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/requests").get(getResquests);

function getResquests(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            var params = [req.query.idpeople==null?req.body.idpeople:req.query.idpeople];
            var sql = "SELECT pr.people_has_requests AS idresquests,"; 
            sql += " (SELECT CONCAT(SUBSTRING(pp.NAME,1,4),'.') FROM people pp WHERE pp.idpeople = pr.who_requested) AS whoresquested, ";
            sql += " TIME_FORMAT(pr.dtrequested,'%H:%i') AS dtrequested, ";
            sql += " pr.howmanyitem, "; 
            sql += " pr.finaldescription AS requestdsc, ";
            sql += " pr.roomnumber, "; 
            sql += " TIME_FORMAT(pr.dtrequestdone,'%H:%i') AS dtrequestdone, "; 
            sql += " p.name AS responsible, ";
            sql += " if(pr.priority='c','CRITICAL','NORMAL') AS priority ";
            sql += " FROM people p ";
            sql += " INNER JOIN people_has_requests pr ON (p.idpeople = pr.fk_people) ";
            sql += " INNER JOIN requests r ON (pr.fk_requests = r.idrequests) ";
            sql += " WHERE ((date(pr.dtrequested) = CURDATE()) OR (pr.dtrequestdone IS NULL)) ";
            sql += " AND pr.fk_people = ? ";
            sql += " ORDER BY pr.priority ASC, pr.dtrequested ASC; ";

            db.query(sql, params).then(requests =>{
                resolve(res.send(requests));

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

routes.route("/update/requests").post((req,res,next)=>{
    new Promise((resolve,reject)=>{
        try {
            var params = [req.body.idrequests];
            var sql = "UPDATE people_has_requests ";
            if(req.body.requestdone == null){
                sql += "SET dtrequestdone = null ";
            }
            else{
                sql += "SET dtrequestdone = NOW() ";
            };
            sql += " WHERE people_has_requests = ? ";

            db.query(sql, params).then(requests =>{
                if(requests.affectedRows > 0){
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
},getResquests);

module.exports = routes;