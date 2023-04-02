const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/get/chart/totalRequests").get(getChartTotalRequests);
function getChartTotalRequests(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            var params = [];
            var sql = "";
            sql+=" SELECT * FROM (SELECT ";
            sql+="     COUNT(1) totalRequests, ";
            sql+="     SUBSTRING(DayOfWeeks(pr.dtrequested),1,3) AS daysofweek, ";
            sql+="     DATE(pr.dtrequested) AS dtRequests ";
            sql+=" FROM people_has_requests pr ";
            sql+=" INNER JOIN requests rt ON (rt.idrequests = pr.fk_requests) ";
            //sql+="     -- WHERE pr.fk_people = 6 ";
            sql+="     WHERE pr.dtrequestdone IS NOT NULL ";
            sql+=" GROUP BY DAY(dtrequested) ";
            sql+=" ORDER BY dtRequests DESC LIMIT 6) AS totalRequestsPerday ";
            sql+=" ORDER BY dtRequests ASC; ";

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

routes.route("/get/chart/longerRequestToBeDone").get(getChartReqToBeDone);
function getChartReqToBeDone(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            var params = [];
            var sql = "";
            sql+=" SELECT * FROM (SELECT ";
                sql+="     pr.people_has_requests, ";
                sql+="     DayOfWeeks(pr.dtrequested) AS dayweek, ";
                sql+="     pr.dtrequested, ";
                sql+="     pr.dtrequestdone, ";
                sql+="     rt.resquestdescription, ";
                sql+="     ROUND(((sum(TIMESTAMPDIFF(MINUTE,pr.dtrequested,pr.dtrequestdone)))/COUNT(1)),0) minuteDiff ";
                sql+=" FROM people_has_requests pr ";
                sql+=" INNER JOIN requests rt ON (rt.idrequests = pr.fk_requests) ";
                sql+="     WHERE pr.dtrequestdone IS NOT NULL ";
                sql+="     GROUP BY rt.idrequests ";
                sql+="     ORDER BY minuteDiff DESC LIMIT 5 ";
                sql+="     ) AS teste ";
                sql+="     ORDER BY minuteDiff ASC; ";

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

routes.route("/get/chart/perfPorter").get(getChartPerfPorter);
function getChartPerfPorter(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            var params = [];
            var sql = "";
            sql += " SELECT "; 
            sql += " TRUNCATE(ROUND(((positiveAmount/totalRequests)*100),0),0) AS positivePercentagem, ";
            sql += " monthRequests, "; 
            sql += " dtRequests, ";
            sql += "      SUBSTRING(NAME,1,2) abvName, ";
            sql += "      SUBSTRING(NAME,1,LOCATE(' ',name)) firstName ";
            sql += " FROM  ";
            sql += " (SELECT ";
                sql += "       p.name, "; 
                sql += " COUNT(1) totalRequests, ";  
                sql += " SUM(IF(TIMESTAMPDIFF(MINUTE,pr.dtrequested,pr.dtrequestdone) <= (MINUTE(rt.slatime)),1,0)) AS positiveAmount, "; 
                sql += " CONCAT(SUBSTRING(DATE_FORMAT(pr.dtrequested,'%M'),1,3),'-',DATE_FORMAT(pr.dtrequested,'%y')) AS monthRequests, "; 
                sql += " DATE(pr.dtrequested) AS dtRequests "; 
                sql += " FROM people_has_requests pr "; 
                sql += " INNER JOIN requests rt ON (rt.idrequests = pr.fk_requests) ";
                sql += " INNER JOIN people p ON (p.idpeople = pr.fk_people) "; 
                sql += " WHERE pr.dtrequestdone IS NOT NULL "; 
                sql += " GROUP BY pr.fk_people ";
                sql += " ORDER BY dtRequests DESC LIMIT 3) AS perfPorterLinenChart "; 
                sql += " ORDER BY positivePercentagem ASC; "; 

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