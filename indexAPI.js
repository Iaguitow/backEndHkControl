const express = require("express");
const cors = require('cors');
const app = express();

const helper = require("./helper");

const people = require("./routes/people.js");
const login = require("./routes/login.js");
const gdrive = require("./routes/gdriverFiles.js");
const requests = require("./routes/requests.js");
const profiles = require("./routes/profile.js");
const tasks = require("./routes/Tasks.js")

app.use(express.json({limit:"1mb"}));
app.use(cors());

app.use("/routes/", login);
app.use("/routes/", helper.checkApiToken, people);
app.use("/routes/", helper.checkApiToken, gdrive);
app.use("/routes/", helper.checkApiToken, requests);
app.use("/routes/", helper.checkApiToken, profiles);
app.use("/routes/", helper.checkApiToken, tasks);

app.get("/",(req, res) => {
 //USED TO TEST THE ROOT REQUEST.
 const test = {nome:"nomes"};
 res.send(test);   
});

app.listen(3000, () => (console.log("Server started sucessfully in Port:"+3000)));