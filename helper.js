const db = require("./services/db.js");
const bcrypt = require('bcrypt');

function getOffset(currentpage = 1, listPerPage){
    return (currentpage-1)*[listPerPage];
}

function emptyOrRows(rows){
    if(!rows){
        return false;
    }
    return true;
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

module.exports = {
    getOffset,
    emptyOrRows,
    hashPassword,
    checkUser
}