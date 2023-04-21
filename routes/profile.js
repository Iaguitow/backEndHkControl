const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/get/profiles").get(getProfile);
function getProfile(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            var params = [req.query.idpeople == null ? req.body.idpeople : req.query.idpeople];
            var sql = "";
            sql += " SELECT";  
            sql += "    pp.name,";
            sql += "    pp.email,";
            sql += "    pp.phonenumber,";
            sql += "    jc.categoryname as profession, ";
            sql += "    pp.idpeople, ";
            sql += "    pp.breaktime, ";
            sql += "    active, ";
            sql += "    DATE_FORMAT(dtactive,'%d/%m/%Y') AS dtactive, ";
            sql += "    DATE_FORMAT(dtdeactive,'%d/%m/%Y') AS dtdeactive, ";
            sql += "    (SELECT MAX(b.indatetime) FROM breaktimedetails b WHERE b.fk_people = pp.idpeople AND pp.breaktime = 'Y') AS datetimeBreakIn ";
            sql += " FROM people pp";
            sql += " INNER JOIN jobcategory jc ON (jc.idjobcategory = pP.fk_idjobcategory) ";
            sql += " WHERE pp.idpeople = ?;";

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

routes.route("/update/profiles").post((req,res,next)=>{
    new Promise((resolve,reject)=>{
        try {
            var params = [req.body.idpeople];
            var profileObjec = req.body.profileObjec;
            var sql = "";

            if(!!req.body.breakType){
                sql = " UPDATE people ";
                sql += " set breaktime = '"+req.body.breakType+"' ";
                sql += " WHERE idpeople = ?; ";
            }else{
                sql = " UPDATE people AS p";
                sql += " INNER JOIN people AS pp ON (p.idpeople = pp.idpeople) "
                sql += " set p.name = '"+profileObjec.username+"',";
                sql += " p.email = '"+profileObjec.useremail +"',";
                sql += " p.phonenumber = '"+profileObjec.userphone +"',";
                sql += " p.fk_idjobcategory = "+profileObjec.userIDjobcategory +",";
                sql += " p.active = '"+profileObjec.useractive+"', ";
                sql += " p.dtactive = (IF('"+profileObjec.useractive+"' = pp.active, p.dtactive, IF('"+profileObjec.useractive+"' != 'N',CURDATE(),p.dtactive))), ";
                sql += " p.dtdeactive = (IF('"+profileObjec.useractive+"' = pp.active, p.dtdeactive, IF('"+profileObjec.useractive+"' != 'S',CURDATE(),p.dtdeactive))) ";
                sql += " WHERE p.idpeople = ?; ";
            }

            /*BEGIN
                IF(NEW.active != OLD.active) THEN
                    IF(NEW.active = "S") THEN
                        UPDATE people
                            SET dtactive = CURDATE()
                        WHERE idpeople = NEW.idpeople;
                        
                    ELSEIF(NEW.active = "N") THEN
                        UPDATE people
                            SET dtdeactive = CURDATE()
                        WHERE idpeople = NEW.idpeople;
                    END IF;
                END IF;
            END*/

            db.query(sql, params).then(profile =>{
                if(profile.affectedRows > 0){
                    next();
                    return;
                }

            }).catch(error => {
                reject(res.send(error));
            });

        } catch (error) {
            reject(res.send(error));
        }

    }).catch(error =>{
        reject(res.send(error));
    });
}, getProfile);

routes.route("/get/profiles/chart").get(getProfileChart);
function getProfileChart(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            var params = [req.query.idpeople == null ? req.body.idpeople : req.query.idpeople];
            var joblevel = [req.query.joblevel == null ? req.body.joblevel : req.query.joblevel];

            var sql = "";
            sql += " SELECT "; 
                sql += " TRUNCATE(ROUND(((positiveAmount/totalRequests)*100),0),0) AS positivePercentagem, ";
                sql += " TRUNCATE(ROUND(((negativeAmount/totalRequests)*100),0),0) AS negativePercentagem, ";
                sql += " monthRequests, ";
                sql += " dtRequests ";
            sql += " FROM ";
            sql += " (SELECT ";
                sql += " COUNT(1) totalRequests, "; 
                sql += " SUM(IF(TIMESTAMPDIFF(MINUTE,pr.dtrequested,pr.dtrequestdone) <= (MINUTE(rt.slatime)),1,0)) AS positiveAmount, ";
                sql += " SUM(IF(TIMESTAMPDIFF(MINUTE,pr.dtrequested,pr.dtrequestdone) > (MINUTE(rt.slatime)),1,0)) AS negativeAmount, ";
                sql += " CONCAT(SUBSTRING(DATE_FORMAT(MAX(pr.dtrequested),'%M'),1,3),'-',DATE_FORMAT(MAX(pr.dtrequested),'%y')) AS monthRequests, ";
                sql += " DATE(MAX(pr.dtrequested)) AS dtRequests ";
            sql += " FROM people_has_requests pr ";
            sql += " INNER JOIN requests rt ON (rt.idrequests = pr.fk_requests) ";
            sql += " WHERE pr.dtrequestdone IS NOT NULL ";
            if(joblevel.toString().includes("HS,PA")){
                sql += " AND  pr.fk_people = ? ";
            }
            sql += " GROUP BY MONTH(dtrequested) ";
            sql += " ORDER BY dtRequests DESC LIMIT 6) AS perfPorterLinenChart ";
            sql += " ORDER BY dtRequests ASC ";

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

module.exports = routes;