const bcrypt = require('bcrypt');
const db = require("./services/db");
const jwt = require('jsonwebtoken');


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
        res.send("Acess Denied.");
    }
};

module.exports = {
    getOffset,
    emptyOrRows,
    hashPassword,
    checkUser,
    generateResetCode,
    checkApiToken
}