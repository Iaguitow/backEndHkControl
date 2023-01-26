const bcrypt = require('bcrypt');
const db = require("./services/db");
const jwt = require('jsonwebtoken');
const pushNotification = require("./services/exponotification");

function getPeopleTokenRequestResponsible(idRequest) {
    new Promise((resolve, reject) => {
        try {
            var params = [idRequest];
            var sql = " SELECT p.pushexpotoken, pr.finaldescription FROM people p ";
            sql += " INNER JOIN people_has_requests pr ON (pr.fk_people = p.idpeople) ";  
            sql += " WHERE pr.people_has_requests = ? and pr.fk_people != pr.who_requested; "; 

            db.query(sql, params).then(peopleToken => {
                resolve(pushNotification.sendPushNotification(peopleToken[0].pushexpotoken, peopleToken[0].finaldescription, title= "YOU HAVE A NEW REQUEST!"));

            }).catch(error => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error => {
        console.log(error);
    });
}

function getPeopleTokenWhoRequested(idRequest) {
    new Promise((resolve, reject) => {
        try {
            var params = [idRequest];
            var sql = " SELECT p.pushexpotoken, pr.finaldescription FROM people p ";
            sql += " INNER JOIN people_has_requests pr ON (pr.who_requested = p.idpeople) ";  
            sql += " WHERE pr.people_has_requests = ? and pr.who_requested != pr.fk_people "; 

            db.query(sql, params).then(peopleToken => {
                resolve(pushNotification.sendPushNotification(peopleToken[0].pushexpotoken, peopleToken[0].finaldescription, title= "YOUR REQUEST HAS BEEN UPDATED!"));

            }).catch(error => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error => {
        console.log(error);
    });
}

function getPeopleTokenWhoRequestedANDresponsible(idRequest, fk_whocancelled) {
    new Promise((resolve, reject) => {
        try {

            var params = [idRequest];

            var sql = " SELECT  ";
                sql += " pr.finaldescription, ";
                sql += " (SELECT pushexpotoken FROM people p1 WHERE (p1.idpeople = pr.who_requested)) pushtokenWhoRequested, "; 
                sql += " (SELECT pushexpotoken FROM people p2 WHERE (p2.idpeople = pr.fk_people)) pushtokenResponsible "; 
            sql += " FROM people p ";
            sql += " INNER JOIN people_has_requests pr ON (pr.who_requested = p.idpeople and pr.who_requested != "+ fk_whocancelled +") ";
            sql += " WHERE pr.people_has_requests = ?"; 

            db.query(sql, params).then(peopleToken => {
                var tokens = [peopleToken[0].pushtokenWhoRequested,peopleToken[0].pushtokenResponsible]
                resolve(pushNotification.sendPushNotification(tokens, peopleToken[0].finaldescription, title= "YOUR REQUEST HAS BEEN CANCELED!"));

            }).catch(error => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }

    }).catch(error => {
        console.log(error);
    });
}


function getOffset(currentpage = 1, listPerPage){
    return (currentpage-1)*[listPerPage];
}

function emptyOrRows(rows){
    if(!rows){
        return false;
    }
    return true;
}

function generateResetCode(length = 5){
    const codePossibilities = "0123456789";
    let code = "";
    for(let i =0;i<=length;i++){
        let letterAt = Math.floor(Math.random()*(codePossibilities.length));
        code += codePossibilities.charAt(letterAt);
    }
    return code;
}

async function checkUser(password,dbPassword){
    const match = await bcrypt.compare(password, dbPassword);
    if(match) {
        return true;
    }
    return false;
}

 async function hashPassword(password){
    const passwordHashed = await bcrypt.hash(password, 10);
    return passwordHashed;
}

const checkApiToken = (req, res, next) => {   
    let TOKEN_API = req.headers.authorization;
    if(TOKEN_API){
        TOKEN_API = TOKEN_API.slice(7);
        jwt.verify(TOKEN_API, db.config.token_key, (err, decode) =>{
            if(err){
                res.send(err);
            }else{
                next();
            }
        });
    }else{
        res.send("Access Denied.");
    }
};

module.exports = {
    getOffset,
    emptyOrRows,
    hashPassword,
    checkUser,
    generateResetCode,
    checkApiToken,
    getPeopleTokenRequestResponsible,
    getPeopleTokenWhoRequested,
    getPeopleTokenWhoRequestedANDresponsible
}