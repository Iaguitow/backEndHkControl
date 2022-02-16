const express = require("express");
const cors = require('cors');
const app = express();

const people = require("./routes/people.js");
const login = require("./routes/login.js");
const gdrive = require("./routes/gdriverFiles.js");

app.use(express.json({limit:"1mb"}));
app.use(cors());

app.use("/routes/", people);
app.use("/routes/", login);
app.use("/routes/", gdrive);

app.get("/",(req, res) => {
 //USED TO TESTE THE ROOT REQUEST.   
});

app.listen(3000, () => (console.log("Server started sucessfully in Port:"+3000)));