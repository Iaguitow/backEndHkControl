const express = require("express");
const cors = require('cors');
const app = express();

const helper = require("./helper");

const people = require("./routes/people.js");
const login = require("./routes/login.js");
const gdrive = require("./routes/gdriverFiles.js");
const requests = require("./routes/requests.js");
const profiles = require("./routes/profile.js");
const tasks = require("./routes/tasks.js");
const checklist = require("./routes/checklist.js");
const rooms = require("./routes/rooms.js");

app.use(express.json({limit:"1mb"}));
app.use(cors());

app.use("/routes/login/", login);
app.use("/routes/people/", helper.checkApiToken, people);
app.use("/routes/gdrive/", helper.checkApiToken, gdrive);
app.use("/routes/requests/", helper.checkApiToken, requests);
app.use("/routes/profiles/", helper.checkApiToken, profiles);
app.use("/routes/tasks/", helper.checkApiToken, tasks);
app.use("/routes/checklist/", helper.checkApiToken, checklist);
app.use("/routes/rooms/", helper.checkApiToken, rooms);

app.get("/routes/",(req, res) => {
 //USED TO TEST THE ROOT REQUEST.
 const test = {nome:"nomes"};
 res.send(test);   
});

app.listen(3000, () => (console.log("Server started sucessfully in Port:"+3000)));