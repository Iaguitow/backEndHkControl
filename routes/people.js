const db = require("../services/db.js");
const gdrive = require("../services/gdriver");
const express = require("express");
const routes = express.Router();

routes.use(function (req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

//////////////////////////////////GET PEOPLE//////////////////////////////////
routes.route("/getPeople").get(getPeople);
function getPeople(req, res, next) {
    new Promise((resolve, reject) => {
        try {
            var sql = "";
            var params = [];
            var peopleList = req.query.peopleList == null ? req.body.peopleList : req.query.peopleList;

            if(peopleList){
                params = [true];
                sql += " SELECT ";
                sql += "  p.name AS name, ";
                sql += "  p.email, ";
                sql += "  p.idpeople as id, ";
                sql += "  p.phonenumber as phonenumber, ";
                sql += "  p.active, ";
                sql += "  p.dtactive, ";
                sql += "  p.dtdeactive, ";
                sql += "  gfiles.fileid as profileImg,";
                sql += "  jc.categoryname as profession, ";
                sql += "  p.pushexpotoken ";
                sql += " FROM people p ";
                sql += " INNER JOIN jobcategory jc ON (p.fk_idjobcategory = jc.idjobcategory) ";
                sql += " LEFT JOIN gdriverfolders gf ON (gf.people_idpeople = p.idpeople) ";
                sql += " LEFT JOIN gdriverfiles gfiles ON (gfiles.fk_idgdriverfolder = gf.idgdriverfolders AND gfiles.filetype = CONCAT(p.idpeople,'imgprofile')); ";
            }else{
                params = [req.body.idpeople];
                sql += "SELECT ";
                    sql += " p.name AS name, ";
                    sql += "  p.idpeople as id, ";
                    sql += "  p.phonenumber as phonenumber, ";
                    sql += "  p.email, ";
                    sql += "  p.active, ";
                    sql += "  p.dtactive, ";
                    sql += "  p.dtdeactive, ";
                    sql += "  gfiles.fileid as profileImg,"
                    sql += "  jc.categoryname as profession, ";
                    sql += " p.pushexpotoken "; 
                sql += " FROM people p ";
                sql += " INNER JOIN jobcategory jc ON (p.fk_idjobcategory = jc.idjobcategory)";
                sql += " LEFT JOIN gdriverfolders gf ON (gf.people_idpeople = p.idpeople) ";
                sql += " LEFT JOIN gdriverfiles gfiles ON (gfiles.fk_idgdriverfolder = gf.idgdriverfolders AND gfiles.filetype = CONCAT(p.idpeople,'imgprofile'))"
                sql += " WHERE p.idpeople = ?; ";
            }
            db.query(sql).then((result) => {

                const fileID = [];

                for(var i =0,ii = result.length; i< ii; i++ ){
                    fileID.push(result[i].profileImg);
                }

                gdrive.getFile(fileID).then(allFilesData => {
                    for(var i =0,ii=allFilesData.length;i<ii;i++){
                        if(allFilesData[i].fileLink != undefined){
                            result[i].profileImg = allFilesData[i].fileLink.replace("s220","s1000");
                        }
                        
                    }

                }).catch(error => { 
                    console.log(error);
                    
                }).finally(endPoint =>{
                    resolve(res.send(result));
                    
                });
                
                
            });
        } catch (err) {
            console.log(err.message);
            reject(res.send(err.message));
        }
    })
};

routes.route("/update/people").post((req,res,next)=>{
    new Promise((resolve,reject)=>{
        try {
            var params = [req.body.pushExpoToken,req.body.idpeople];
            var sql = "UPDATE people ";
            sql += "set pushexpotoken = ?"
            sql += " WHERE idpeople = ? ";

            db.query(sql, params).then(people =>{
                if(people.affectedRows > 0){
                    next();
                    return;
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
}, getPeople);

module.exports = routes;

/*routes.route("/getpeople").get(getPeople);
function getPeople(req, res, next) {
    new Promise((resolve, reject) => {
        try {
            var params = [req.body.idpeople];
            var sql = "SELECT ";
                    sql += " p.name, ";
                    sql += " p.phonenumber, ";
                    sql += " p.email, ";
                    sql += " p.active, ";
                    sql += " p.dtactive, ";
                    sql += " p.dtdeactive, ";
                    sql += " p.dateofbirth, ";
                    sql += " p.pushexpotoken "; 
                sql += " FROM people p ";
                sql += " WHERE p.idpeople = ?; ";

            db.query(sql, params).then(people => {
                resolve(res.send(people));

            }).catch(error => {
                reject(res.send(error));
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error => {
        console.log(error);
    });
}*/