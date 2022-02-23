
const { google } =  require('googleapis');
const stream = require("stream");
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN_GDRIVE;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN, expiry_date:280000000 });

const drive = google.drive({
    version: 'v3',
    auth: oAuth2Client
});

async function uploadFile(img, gdriveidfolder, filename, fileid){
    try {
        const buf = new Buffer.from(img, "base64");
        const bs = new stream.PassThrough();
        bs.end(buf);

        var response = null;
        var folderId = gdriveidfolder;

        var fileMetadata = {
            'name': filename,
            parents: [folderId]
        };
        var media = {
            mimeType:'image/png',
            body:bs
        };
        
        if(fileid !== null){
            response = await drive.files.update({

                media:media,
                fileId: fileid
            }).catch(function (err) {console.log(err)});
        }
        else{
            response = await drive.files.create({
                resource:fileMetadata,
                media:media
            }).catch(function (err) {console.log(err)});
        }
        return response;
    } catch (error) {
        return error.message;
    }
}

async function createFolder(foldername){
    try {
        const response = await drive.files.create({
            requestBody:{
                name:foldername,
                mimeType: 'application/vnd.google-apps.folder'
            },
        });
        
        return response.data.id;
    } catch (error) {
        return error.message;
    }
}

async function getFile(fileIDS){
    try {
        let allFilesData = [];
        let response;

        for(var i = 0; i<fileIDS.length;i++){
            response = await drive.files.get({
                fileId:fileIDS[i],
                fields:"*",
            });

            allFilesData.push({
                fileName:response.data.originalFilename,
                fileLink:response.data.thumbnailLink
            });
        }

        return allFilesData;
    } catch (error) {
        return error.message;
    }
}

module.exports={
    uploadFile,
    createFolder,
    getFile
}
