const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const mongoose = require("mongoose");
const colors = require("colors");
require("dotenv").config();

const connEvents = require("./server-middlewares/connection-listeners");
const serverEmits = require("./server-middlewares/server-emits");
const ROUTES_requestLogger = require("./server-middlewares/logger");

connEvents(mongoose, colors); //just db connection listeners

//middlewares

app.use(express.static(__dirname + "/dist", { index: false }));
app.use("/", ROUTES_requestLogger);
app.set("view engine", "pug");

const dbURI = process.env.DB;

try {
  mongoose.connect(
    dbURI,
    { useUnifiedTopology: true, useNewUrlParser: true },
    (err, db) => {
      if (err) throw "Database Error";

      //start listening to client emits
      serverEmits(io);

      app.get("/", (req, res) => {
        res.render(__dirname + "/dist/index.pug");
      });

      const port = process.env.PORT || 8080;
      http.listen(port, () => {
        console.log("Listening to port: " + port);
      });
    }
  );
} catch (e) {
  console.log(e);
}
