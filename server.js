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

mongoose.connect(
  dbURI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err, db) => {
    if (err) console.log("Database Error: " + err);
    const scoresModel = mongoose.model(
      "tictacscores",
      new mongoose.Schema({
        mode: String,
        ranking: []
      })
    );
    function checkCollection(mode) {
      try {
        scoresModel.findOne({ mode }, (err, doc) => {
          if (err) throw err;
          if (!doc) {
            const newDoc = new scoresModel({
              mode,
              ranking: []
            });

            newDoc.save((er, saved) => {
              if (er) throw er;
              if (saved) console.log(`"mode: ${mode} saved to DB"`);
            });
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
    //check collection in database, create one if none found
    checkCollection("shared");
    checkCollection("remote");

    //start listening to client emits
    serverEmits(scoresModel, io);

    app.get("/", (req, res) => {
      res.render(__dirname + "/dist/index.pug");
    });

    app.get("/ranking/:mode", (req, res) => {
      const mode = req.params.mode;
      scoresModel.findOne({ mode }, (err, data) => {
        if (err) return res.send("db error");
        if (data) {
          const html = `
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ranking</title>
          <ol>${data.ranking
            .map(x => {
              return `<li>${x.name}: ${x.score}</li>`;
            })
            .join("")}</ol>`;
          res.send(html);
        } else {
          res.send("No such game mode");
        }
      });
    });

    const port = process.env.PORT || 8080;
    http.listen(port, () => {
      console.log("Listening to port: " + port);
    });
  }
);
