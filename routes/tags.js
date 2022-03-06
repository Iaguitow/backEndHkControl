const db = require("../services/db.js");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/tags").get((req,res)=>{
    new Promise((resolve,reject)=>{
        try {
            var params = [req.query.idpeople];
            var sql = "SELECT ";
                    sql += "tg.tagname, ";
                    sql += "pht.people_idpeople, ";
                    sql += "pht.tags_idtags ";
                    sql += "FROM people_has_tags pht ";
                sql += "INNER JOIN tags tg ON (tg.idtags = pht.tags_idtags) ";
                sql += "WHERE pht.people_idpeople = ?; ";

            db.query(sql, params).then(tags =>{
                resolve(res.send(tags));

            }).catch(error => {
                reject(res.send(error));
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error =>{
        reject(error);
    });

});

module.exports = routes;