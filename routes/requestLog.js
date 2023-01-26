const db = require("../services/db.js");
const helper = require("../helper");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/requestLog").get(getResquests_Log);
function getResquests_Log(req, res, next) {
    new Promise((resolve,reject)=>{
        try {
            var param = [req.query.idpeople];
            var sql = "CALL PROC_TMP_REQUEST_LOG(?);";
            db.query(sql,param).then(result =>{
                resolve(res.send(result[0]));
            }).catch(error =>{
                reject(res.send(error));
            });
        } catch (error) {
            reject(res.send(error.message));
        }
    });
};


routes.route("/insert/new_requestLog").post((req,res,next)=>{
    new Promise((resolve,reject)=>{
        try {
            var extractParams = req.body.requestCancellationObj;
            var params = [extractParams.reason,extractParams.fk_request,extractParams.fk_whocancelled];

            var sql = "	INSERT INTO requestreasoncancellation (reason,dtcancellation,fk_request,fk_whocancelled) ";
            sql += "	VALUES (?,NOW(),?,?); ";

            db.query(sql,params).then(result =>{
                helper.getPeopleTokenWhoRequestedANDresponsible(extractParams.fk_request, extractParams.fk_whocancelled);
                next();

            }).catch(error =>{
                reject(res.send(error));
                
            });
        } catch (error) {
            reject(console.log(error.message));
            reject(res.send(error.message));
        }
    });
},getResquests_Log);

module.exports = routes;