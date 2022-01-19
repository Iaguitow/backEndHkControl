const db = require("../services/db.js");
const helper = require("../helper.js");
const jwt = require('jsonwebtoken');

const express = require("express");
const routes = express.Router();

/*routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
  });*/
  
//////////////////////////////////POST LOGIN//////////////////////////////////
routes.route("/login").post((req,res) => {
    new Promise((resolve,reject) => {
        try{
            var sql = " SELECT ";
                    sql += " p.idpeople, ";
                    sql += " p.name, "; 
                    sql += " p.email, "; 
                    sql += " p.phonenumber, "; 
                    sql += " p.password, "; 
                    sql += " p.likes, "; 
                    sql += " p.visualizations, ";
                    sql += " p.tokenapi ";  
            sql += " FROM people p ";
            sql += " WHERE p.email=?";
            var params = [req.query.email];
            db.query(sql,params).then((result) => {
                if(result[0] === undefined){
                    resolve(res.send("User Not Found"));
                    return;
                }
                helper.checkUser(req.query.password, result[0].password).then(response =>{
                    if(response){
                        jwt.sign({userid: result[0].idpeople, userEmail: result[0].email},db.config.token_key,(err,token)=>{
                            if(!err){
                                result[0].tokenapi = token;
                                resolve(res.send(result));
                            }else{
                                console.log(err);
                                resolve(res.send(err));
                            }
                        });
                    }else{
                        resolve(res.send("User Not Found"));
                    }
                }).catch(err => {
                    console.log(err);
                    resolve(res.send(err.message+" file: login.js"));
                });
            }).catch(err => {
                console.log(err);
                resolve(res.send(err));
            });
        }catch (err){
            console.log(err.message);
            reject(res.send(err.message));
        }
    });
//////////////////////////////////GET LOGIN//////////////////////////////////
}).get((req, res) => {
    res.send("hi, this is /routes/people/insert");
});

module.exports = routes;