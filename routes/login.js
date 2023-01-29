const db = require("../services/db.js");
const helper = require("../helper.js");
const jwt = require('jsonwebtoken');
const gmail = require("../services/gmail.js");
const gdriver = require("../services/gdriver");

const express = require("express");
const routes = express.Router();

routes.use(function(req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});
  
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
                    sql += " p.tokenapi, ";
                    sql += " jc.categoryname as profession, ";
                    sql += " jc.categorylevel as joblevel,";
                    sql += " dp.departmentkey as departmentlevel, ";
                    sql += " idgdriverfolders, ";
                    sql += " gd.folderid, ";
                    sql += " (SELECT gdf.fileid FROM gdriverfiles gdf WHERE gdf.fk_idgdriverfolder = gd.idgdriverfolders AND gdf.filetype = CONCAT(p.idpeople,'imgprofile')) AS fileidimgprofile, ";
                    sql += " (SELECT gdf.fileid FROM gdriverfiles gdf WHERE gdf.fk_idgdriverfolder = gd.idgdriverfolders AND gdf.filetype = CONCAT(p.idpeople,'imgbackprofile')) AS fileidimgbackprofile "; 
            sql += " FROM people p ";
            sql += " INNER JOIN jobcategory jc ON (jc.idjobcategory = p.fk_idjobcategory) ";
            sql += " INNER JOIN departments dp ON (dp.iddepartments = jc.iddepartment) ";
            sql += " LEFT JOIN gdriverfolders gd ON (p.idpeople = gd.people_idpeople) ";
            sql += " WHERE p.email=? ";
            var params = [req.body.email];
            db.query(sql,params).then((result) => {
                if(result[0] === undefined){
                    resolve(res.send("User Not Found"));
                    return;
                }
                helper.checkUser(req.body.password, result[0].password).then(response =>{
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
                    reject(res.send(err.message+" file: login.js"));
                });
            }).catch(err => {
                console.log(err);
                reject(res.send(err));
            });
        }catch (err){
            console.log(err.message);
            reject(res.send(err.message));
        }
    });
});

//////////////////////////////////POST LOGIN RECOVERY//////////////////////////////////
routes.route("/login/recoverycode").put((req,res) => {
    new Promise((resolve,reject)=>{
        try {
            var sql = " SELECT ";
            sql += " p.idpeople, ";
            sql += " p.name, "; 
            sql += " p.email, "; 
            sql += " p.phonenumber, "; 
            sql += " p.password, "; 
            sql += " p.tokenapi ";  
            sql += " FROM people p ";
            sql += " WHERE p.email=?";
            var params = [req.query.to];

            db.query(sql,params).then((result) => {
                if(result[0] === undefined){
                    resolve(res.send("User Not Found"));
                    return;
                }

                let text = req.query.text;
                let code = helper.generateResetCode(4);
                text = text+code;
                
                gmail.sendEmail(req.query.to, req.query.subject, text).then(result => {
                    var sql = "UPDATE people set loginrecoverycode = ? where email = ?";
                    var params = [code,req.query.to];
                    db.query(sql,params).then(result => {
                        resolve(res.send(result));
                    }).catch(error => {
                        reject(res.send(error.message));
                    });

                }).catch(err =>{
                    console.log(err.message);
                    reject(res.send(err.message));

                });
            }).catch(err => {
                reject(res.send(err.message));
            });
        } catch (error) {   
            reject(res.send(error.message));
        }
    });
});

//////////////////////////////////POST PASSWORD RESET//////////////////////////////////
routes.route("/login/resetpassword").post((req,res) => {
    new Promise((resolve,reject)=>{
        try {
            helper.hashPassword(req.body.password).then(password =>{
                var sql = " UPDATE people set password = ?, loginrecoverycode = null ";
                sql += " WHERE email=? and loginrecoverycode = ?";
                var params = [password, req.body.email, req.body.code];
    
                db.query(sql,params).then((result) => {
                    if(result.affectedRows === 0){
                        resolve(res.send("Code Not Found"));
                        return;
                    }
                    resolve(res.send(result));
    
                }).catch(err => {
                    reject(res.send(err.message));
                });

            }).catch(err =>{
                reject(res.send(err.message));
            });

        } catch (error) {  
            reject(res.send(error.message));
        }
    });
});

//////////////////////////////////POST REGISTER USER//////////////////////////////////
routes.route("/login/register").post((req, res) => {
    new Promise((resolve, reject) => {
        try {
            const hashedPassword = req.body.password;
            
            helper.hashPassword(hashedPassword).then((password) => {
                var sql = " INSERT INTO people (NAME,email,phonenumber, PASSWORD,dateofbirth,dtactive,active,idgoogle) ";
                sql += " (SELECT ?,?,?,?,?,?,?,? FROM people p ";
                sql += " WHERE (SELECT COUNT(email) FROM people pp WHERE pp.email ='" + req.body.email + "') = 0 ";
                sql += " LIMIT 1); ";
                var params = [req.body.name, req.body.email, req.body.phone, password, req.body.dateofbirth, req.body.dtactive, "S",req.body.googleId];
                db.query(sql, params).then((result) => {   
                    if (result.affectedRows === 0) {
                        resolve(res.send("User Already Exists"));
                        return;
                    }
                    const text = "Here is your login information - Login: "+req.body.email+" Password: "+req.body.password;
                    gmail.sendEmail(req.body.email, "LOGIN INFORMATION", text).then(result => {
                        gdriver.createFolder(req.body.name).then(response =>{
                            const folderid = response;
                            sql = " INSERT INTO gdriverfolders (people_idpeople,folderid)";
                            sql += " (SELECT p.idpeople,? FROM people p where p.email ='"+req.body.email+"');";
                            params = [folderid];

                            db.query(sql, params).then((result) => {
                                resolve(res.send("Sucessfully Registered"));

                            }).catch(err=>{
                                reject(res.send(err.message));
                            });
                            
                        }).catch(error=>{
                            console.log(err.message);
                            reject(res.send(error.message));
                        })
                        
                    }).catch(err =>{
                        console.log(err.message);
                        reject(res.send(err.message));
                    });
                }).catch(err => {
                    console.log(err);
                    resolve(res.send(err));
                });
            });
        } catch (err) {
            console.log(err.message);
            reject(res.send(err.message));
        }
    });
});

module.exports = routes;