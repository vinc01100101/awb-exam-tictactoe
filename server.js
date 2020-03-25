const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connEvents = require("./connection-listeners");
const colors = require("colors");
require("dotenv").config();

connEvents(mongoose, colors); //just db connection listeners

//middlewares

app.use(express.static(__dirname + "/dist", { index: false }));
app.set("view engine", "pug");

const dbURI = process.env.db;

try {
  mongoose.connect(
    dbURI,
    { useUnifiedTopology: true, useNewUrlParser: true },
    (err, db) => {
      if (err) throw "Database Error";

      app.get("/", (req, res) => {
        res.render(__dirname + "/dist/index.pug");
      });

      const port = process.env.PORT || 8080;
      app.listen(port, () => {
        console.log("Listening to port: " + port);
      });
    }
  );
} catch (e) {
  console.log(e);
}
