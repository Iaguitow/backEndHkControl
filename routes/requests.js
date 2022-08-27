const db = require("../services/db.js");
const helper = require("../helper");

const express = require("express");
const routes = express.Router();

routes.use(function (req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/requestType").get(getRequestYpe);

function getRequestYpe(req, res, next) {
    new Promise((resolve, reject) => {
        try {
            var params = [req.body.idrequests];
            var sql = " SELECT t.idrequests, t.resquestdescription FROM requests t ";
            sql += " ORDER BY t.resquestdescription ASC, ";
            sql += " SUBSTRING(t.resquestdescription,LOCATE('|',t.resquestdescription)+2,LENGTH(t.resquestdescription)) ASC; ";

            db.query(sql, params).then(requestType => {
                resolve(res.send(requestType));

            }).catch(error => {
                reject(res.send(error));
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error => {
        reject(error);
    });
}

routes.route("/requests").get(getResquests);
function getResquests(req, res, next) {
    
    new Promise((resolve, reject) => {
        try {
            const joblevel = req.query.joblevel == null ?req.body.joblevel:req.query.joblevel;

            if ((joblevel !== undefined)) {

                var params = [true,true];
                
                if (joblevel.toString().includes("PS", "M", "CO")) {
                    
                    var sql = " SELECT ";
                    sql += " pr.people_has_requests AS idresquests, ";
                    sql += " (SELECT CONCAT(SUBSTRING(pp.NAME,1,4),'.') FROM people pp WHERE pp.idpeople = pr.who_requested) AS whoresquested, ";
                    sql += " TIME_FORMAT(pr.dtrequested,'%H:%i') AS timeRequested, ";
                    sql += " pr.howmanyitem, ";
                    sql += " pr.finaldescription AS requestdsc, ";

                    sql += " IF(Length(Concat(Substring(pr.finaldescription, ";
                    sql += "     Locate('-', pr.finaldescription) + 2, 15), '...')) < 15, Rpad( ";
                    sql += "            Concat(Substring(pr.finaldescription, ";
                    sql += " Locate('-', pr.finaldescription) + 2, 15), '...'), 15, '.'), ";
                    sql += " Concat(Substring(pr.finaldescription, ";
                    sql += " Locate('-', pr.finaldescription) + 2, 15), '...')) AS ";
                    sql += "  requestPreviewDsc, ";

                    sql += " pr.roomnumber, ";
                    sql += " TIME_FORMAT(pr.dtrequestdone,'%H:%i') AS timeRequestDone, ";
                    sql += " p.name AS responsible, ";
                    sql += " if(pr.priority='c','CRITICAL','NORMAL') AS priority, ";
                    sql += " DATE_FORMAT(pr.dtrequested,'%d/%m/%Y') AS dtrequested, ";
                    sql += " DATE_FORMAT(pr.dtrequestdone,'%d/%m/%Y') AS dtrequestdone, ";
                    sql += " WEEK(pr.dtrequested,1) AS requestWeek, ";

                    sql += " (SELECT 	CONCAT(DATE_FORMAT(MIN(DATE(phr.dtrequested)),'%d/%m/%Y'),' - ',DATE_FORMAT(MAX(DATE(phr.dtrequested)),'%d/%m/%Y')) FROM people_has_requests phr ";
                    sql += " WHERE week(phr.dtrequested,1) = week(pr.dtrequested,1) GROUP BY WEEK(phr.dtrequested,1)) AS dtrequestWeek, ";

                    sql += " IFNULL((SELECT 	COUNT(1) FROM people_has_requests phr ";
                    sql += " WHERE week(phr.dtrequested,1) = week(pr.dtrequested,1) GROUP BY WEEK(phr.dtrequested,1)),0) AS requestsPerWeek, ";

                    sql += " IFNULL((SELECT 	COUNT(*) FROM people_has_requests phr ";
                    sql += " WHERE DATE(phr.dtrequested) = DATE(pr.dtrequested) AND phr.dtrequestdone IS NULL GROUP BY DATE(phr.dtrequested)),0) AS requestsPerDayOpens, ";

                    sql += " IFNULL((SELECT 	COUNT(*) FROM people_has_requests phr ";
                    sql += " WHERE DATE(phr.dtrequested) = DATE(pr.dtrequested) AND phr.dtrequestdone IS NOT NULL GROUP BY DATE(phr.dtrequested)),0) AS requestsPerDayConcluded,";

                    sql += " TRUNCATE(( ";
                    sql += " ((IFNULL((SELECT 	COUNT(*) FROM people_has_requests phr ";
                    sql += " WHERE DATE(phr.dtrequested) = DATE(pr.dtrequested) AND phr.dtrequestdone IS NOT NULL GROUP BY DATE(phr.dtrequested)),0))/ ";
                    sql += " IFNULL((SELECT 	COUNT(*) FROM people_has_requests phr ";
                    sql += " WHERE DATE(phr.dtrequested) = DATE(pr.dtrequested) GROUP BY DATE(phr.dtrequested)), ( Ifnull((SELECT COUNT(*) ";
                    sql += " FROM   people_has_requests phr ";
                    sql += " WHERE  DATE(phr.dtrequested) = DATE(pr.dtrequested) ";
                    sql += "        AND phr.dtrequestdone IS NOT NULL ";
                    sql += " GROUP  BY DATE(phr.dtrequested)), 0)))) ";
                    sql += " )*100,0) AS percentagemConcluded, ";

                    sql += " Ifnull((SELECT COUNT(*) ";
                    sql += " FROM   people_has_requests phr ";
                    sql += " WHERE  DATE(phr.dtrequested) = DATE(pr.dtrequested) ";
                    sql += " AND	 phr.fk_people = pr.fk_people ";
                    sql += "        AND phr.dtrequestdone IS NOT NULL ";
                    sql += " GROUP  BY DATE(phr.dtrequested),phr.fk_people), 0) ";
                    sql += " AS requestsPerDayPorterConcluded, ";

                    sql += " Ifnull((SELECT COUNT(*) ";
                    sql += " FROM   people_has_requests phr ";
                    sql += " WHERE  DATE(phr.dtrequested) = DATE(pr.dtrequested) ";
                    sql += " AND	 phr.fk_people = pr.fk_people ";
                    sql += "        AND phr.dtrequestdone IS NULL ";
                    sql += " GROUP  BY DATE(phr.dtrequested),phr.fk_people), 0) ";
                    sql += " AS requestsPerDayPorterOpens ";

                    sql += " FROM people p ";
                    sql += " INNER JOIN people_has_requests pr ";
                    sql += " ON (p.idpeople = pr.fk_people) ";
                    sql += " LEFT JOIN requests r ";
                    sql += " ON (pr.fk_requests = r.idrequests) ";
                    sql += " WHERE ((month(pr.dtrequested) >= month(CURDATE())-1) OR (WEEK(pr.dtrequestdone,1) >= WEEK(CURDATE(),1)-1)) ";
                    sql += " and ? = ? ";
                    sql += " ORDER BY WEEK(pr.dtrequested,1) DESC, DATE(pr.dtrequested) DESC, p.name ASC, pr.dtrequestdone ASC, pr.priority ASC; ";

                    db.query(sql, params).then(requests => {
                        resolve(res.send(requests));
                    }).catch(error => {
                        reject(res.send(error));
                    });

                    return;
                }else{

                    var params = [req.query.idpeople == null ? req.body.idpeople : req.query.idpeople];
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
                    sql += " ORDER BY pr.dtrequestdone ASC, pr.priority ASC, pr.dtrequested ASC; ";
        
                    db.query(sql, params).then(requests => {
                        resolve(res.send(requests));
        
                    }).catch(error => {
                        reject(res.send(error));

                    });
                }
            }

        } catch (error) {
            reject(res.send(error));
        }

    }).catch(error => {
        res.send(error.message);
    });
}

routes.route("/update/requests").post((req, res, next) => {
    new Promise((resolve, reject) => {
        try {
            var params = [req.body.idrequests];
            var sql = "UPDATE people_has_requests ";
            if (req.body.requestdone == null) {
                sql += "SET dtrequestdone = null ";
            }
            else {
                sql += "SET dtrequestdone = NOW() ";
            };
            sql += " WHERE people_has_requests = ? ";

            db.query(sql, params).then(requests => {
                if (requests.affectedRows > 0) {
                    helper.getPeopleTokenWhoRequested(req.body.idrequests);
                    next();
                }

            }).catch(error => {
                reject(res.send(error));
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error => {
        reject(error);
    });
}, getResquests);


routes.route("/insert/new_request").post((req, res, next) => {
    new Promise((resolve, reject) => {
        try {
            var requestObject = req.body.requestObj;
            var profession = requestObject.profession;
            var roomNumber = requestObject.roomnumber;

            if ((profession == "HOUSE STEWARD" || profession == "PUBLIC AREA")) {
                var params = [requestObject.responsible, requestObject.idrequest, requestObject.who_requested, requestObject.roomnumber, requestObject.amount, requestObject.priority, requestObject.finaldescription];
                var sql = " INSERT INTO people_has_requests (fk_people,fk_requests,dtrequested,who_requested,roomnumber,howmanyitem,priority,finaldescription) ";
                sql += " VALUES(?,?,NOW(),?,?,?,?,?); ";

            } else if (roomNumber == 0) {
                var params = [requestObject.idrequest, requestObject.who_requested, requestObject.roomnumber, requestObject.amount, requestObject.priority, requestObject.finaldescription, requestObject.roomnumber];
                var sql = " INSERT INTO people_has_requests (fk_people,fk_requests,dtrequested,who_requested,roomnumber,howmanyitem,priority,finaldescription) ";
                sql += " (SELECT p.idpeople,?,NOW(),?,?,?,?,? FROM people p ";
                sql += " INNER JOIN floors f ON (p.idpeople = f.fk_porter_floor) ";
                sql += " INNER JOIN rooms r ON (f.idfloors = r.fk_floor) ";
                sql += " WHERE TRUE = TRUE ";
                sql += " GROUP BY p.idpeople); ";

            } else {
                var params = [requestObject.idrequest, requestObject.who_requested, requestObject.roomnumber, requestObject.amount, requestObject.priority, requestObject.finaldescription, requestObject.roomnumber];
                var sql = " INSERT INTO people_has_requests (fk_people,fk_requests,dtrequested,who_requested,roomnumber,howmanyitem,priority,finaldescription) ";
                sql += " (SELECT p.idpeople,?,NOW(),?,?,?,?,? FROM people p ";
                sql += " INNER JOIN floors f ON (p.idpeople = f.fk_porter_floor) ";
                sql += " INNER JOIN rooms r ON (f.idfloors = r.fk_floor) ";
                sql += " WHERE r.roomnumber = ?); ";
            }

            db.query(sql, params).then(requests => {
                if (requests.affectedRows > 0) {
                    helper.getPeopleTokenRequestResponsible(requests.insertId);
                    next();
                    return;
                }
                resolve(res.send(false));

            }).catch(error => {
                reject(res.send(error));
            });

        } catch (error) {
            reject(console.log(error));
        }

    }).catch(error => {
        console.log(error);
    });
}, getResquests);

module.exports = routes;