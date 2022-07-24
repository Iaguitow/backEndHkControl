const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/requestType").get(getRequestYpe);

function getRequestYpe (req,res,next){
    new Promise((resolve,reject)=>{
        try {
            var params = [req.body.idrequests];
            var sql =  " SELECT t.idrequests, t.resquestdescription FROM requests t ";
                sql += " ORDER BY t.resquestdescription ASC, "; 
                sql += " SUBSTRING(t.resquestdescription,LOCATE('|',t.resquestdescription)+2,LENGTH(t.resquestdescription)) ASC; ";

            db.query(sql, params).then(requestType =>{
                resolve(res.send(requestType));

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
            sql += " LEFT JOIN requests r ON (pr.fk_requests = r.idrequests) ";
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

routes.route("/insert/new_request").post((req,res,next)=>{
    new Promise((resolve,reject)=>{
        try {
            var requestObject = req.body.requestObj;
            var profession = requestObject.profession;
            if(profession == "HOUSE STEWARD" || profession == "PUBLIC AREA"){
                var params = [requestObject.responsible,requestObject.idrequest,requestObject.who_requested,requestObject.roomnumber, requestObject.amount, requestObject.priority, requestObject.finaldescription];
                var sql = " INSERT INTO people_has_requests (fk_people,fk_requests,dtrequested,who_requested,roomnumber,howmanyitem,priority,finaldescription) ";
                    sql += " VALUES(?,?,NOW(),?,?,?,?,?); "; 
            }else{
                var params = [requestObject.idrequest,requestObject.who_requested,requestObject.roomnumber, requestObject.amount, requestObject.priority, requestObject.finaldescription, requestObject.roomnumber];
                var sql = " INSERT INTO people_has_requests (fk_people,fk_requests,dtrequested,who_requested,roomnumber,howmanyitem,priority,finaldescription) ";
                    sql += " (SELECT p.idpeople,?,NOW(),?,?,?,?,? FROM people p ";
                    sql += " INNER JOIN floors f ON (p.idpeople = f.fk_porter_floor) ";
                    sql += " INNER JOIN rooms r ON (f.idfloors = r.fk_floor) ";
                    sql += " WHERE r.roomnumber = ?); ";
            }

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