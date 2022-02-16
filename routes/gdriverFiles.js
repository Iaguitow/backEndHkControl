const express = require("express");
const routes = express.Router();
const gdriver = require("../services/gdriver");
const db = require("../services/db.js");
const { JSON } = require("mysql/lib/protocol/constants/types");

routes.use(function (req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

routes.route("/gdrive").post((req, res) => {
    new Promise((resolve, reject) => {
        try {

            var sql = " SELECT gdf.fileid FROM gdriverfiles gdf ";
                sql += " INNER JOIN gdriverfolders gd ON (gd.idgdriverfolders = gdf.fk_idgdriverfolder) ";
                sql += " WHERE gd.folderid = ? AND gdf.filetype = ? ";
            params = [req.body.folderid, req.body.filetypename];

            db.query(sql, params).then((result) => {

                var fileid = null;
                if(result[0] !== undefined){fileid = result[0].fileid}

                gdriver.uploadFile(req.body.img, req.body.folderid, req.body.filetypename, fileid).then(function (response){
                    if(fileid === null){
                        sql = " INSERT INTO gdriverfiles (filetype,fileid,fk_idgdriverfolder) ";
                        sql += " (SELECT ?,?,gd.idgdriverfolders FROM gdriverfolders gd where gd.folderid = ?); ";
                        params = [req.body.filetypename, response.data.id, req.body.folderid ];
                        db.query(sql, params).then((result) => {

                        }).catch((error) =>{
                            reject(res.send(error.message));
                        });
                    }
                    resolve(res.send(response.statusText));
                }).catch(function (err) {
                    reject(res.send(err.message));
                });
            }).catch((error) =>{
                reject(res.send(error.message));
            });

        } catch (err) {
            reject(res.send(err.message));
        }
    });
});

module.exports = routes;