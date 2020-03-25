const express = require("express");
const app = express();

app.use(express.static(__dirname + "/dist", { index: false }));
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render(__dirname + "/dist/index.pug");
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Listening to port: " + port);
});
