const express = require("express");
const cors = require('cors');
const app = express();
const helper = require("./helper.js");

const people = require("./routes/people.js");
const login = require("./routes/login.js");

app.use(express.json());
app.use(cors());

app.use("/routes/", people);
app.use("/routes/", login);

app.get("/",(req, res) => {
    helper.hashPassword("12345").then(response =>{
        console.log(response);
        res.json({"message": response});
    });

    
})

app.listen(3000, () => (console.log("Server started sucessfully in Port:"+3000)));