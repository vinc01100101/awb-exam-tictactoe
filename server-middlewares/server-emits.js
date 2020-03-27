module.exports = (scoresModel, io) => {
  let users = {};

  io.on("connection", socket => {
    const id = socket.id;

    users[id] = {
      room: null,
      players: [],
      timers: [0, 0],
      cellState: [null, null, null, null, null, null, null, null, null],
      turns: 0,
      winner: null
    };
    const user = users[id];
    let turnTimer;
    console.log("User has connected: " + id);
    //broadcast new user count
    io.emit("new user", Object.keys(users).length);

    //requested game intialization
    socket.on("game init", data => {
      console.log("game initialized!");
      switch (data.mode) {
        case "shared":
          user.players = data.players;
          socket.emit("render", user);

          turnTimer = setInterval(() => {
            user.timers[0]++;
            socket.emit("timers", user.timers);
          }, 1000);

          break;
        case "remote":
          break;
      }
    });

    socket.on("turn", data => {
      //if remote match
      if (user.room) {
        //remote match logic
      } else {
        //else if shared interface
        //update cell with user token -> if(cell is null && no winner yet)
        if (
          user.cellState[data] == null &&
          user.winner == null &&
          user.turns < 9
        ) {
          clearInterval(turnTimer);
          //mark the cell
          user.cellState[data] = user.turns % 2;
          const winStroke = checkWinner();
          //if found a winner, make a promise to handle that!!
          handleWinner(winStroke).then(data => {
            console.log("DATA FROM PROMISE: " + data);
            console.log("Increasing turns..");
            /* increasing turns without a Promise in database call
            will change the user.turns before we even get the result from DB,
            and db result is associated with user.turns,
            which makes it crucial so we made a Promise */
            user.turns++;
            socket.emit("render", user);

            turnTimer =
              !winStroke &&
              user.turns < 9 &&
              setInterval(() => {
                user.timers[user.turns % 2]++;
                socket.emit("timers", user.timers);
              }, 1000);
          });
        }
      }
    });
    function checkWinner() {
      return user.cellState.reduce((x, y, i) => {
        return (
          // if cell has token
          (y != null &&
            //horizontal
            ((i % 3 == 0 &&
              user.cellState[i] == user.cellState[i + 1] &&
              user.cellState[i + 1] == user.cellState[i + 2] && {
                style: "Horizontal",
                stroke: [i, i + 1, i + 2]
              }) ||
              //vertical
              (i <= 2 &&
                user.cellState[i] == user.cellState[i + 3] &&
                user.cellState[i + 3] == user.cellState[i + 6] && {
                  style: "Vertical",
                  stroke: [i, i + 3, i + 6]
                }) ||
              //diagonal (\) backslash
              (i == 0 &&
                user.cellState[i] == user.cellState[i + 4] &&
                user.cellState[i + 4] == user.cellState[i + 8] && {
                  style: "Back Diagonal",
                  stroke: [i, i + 4, i + 8]
                }) ||
              //diagonal (/) forward slash
              (i == 2 &&
                user.cellState[i] == user.cellState[i + 2] &&
                user.cellState[i + 2] == user.cellState[i + 4] && {
                  style: "Front Diagonal",
                  stroke: [i, i + 2, i + 4]
                }))) ||
          x //return x or current value if none of the above is true
        );
      }, null);
    }

    function handleWinner(winStroke) {
      /* made a promise because we will be calling
      the database which is ASYNC by nature,
      and the next steps to the then() are dependent to the
      result */
      return new Promise((resolve, reject) => {
        if (winStroke) {
          //set winner data
          user.winner = [user.turns % 2, winStroke];
          //calculate score
          const score =
            (10 - Math.ceil(user.turns / 2)) /
            (user.timers[user.turns % 2] || 1);
          //search in database
          scoresModel.findOne({ mode: "shared" }, (err, doc) => {
            if (err) {
              console.log(err);
              return reject(err);
            } else if (doc.ranking.length < 50) {
              //if top 50 ranking is not yet full
              doc.ranking.push({
                name: user.players[user.turns % 2],
                score
              });

              doc.ranking.sort((a, b) => b.score - a.score);

              doc.markModified("ranking");
              doc.save((er, saved) => {
                if (er) {
                  console.log("Error saving");
                  return reject(er);
                } else {
                  console.log("Done saving ranking: " + saved);
                  return resolve(saved);
                }
              });
            } else {
              //else if top 50 is full
              console.log("ranking full");
              console.log("user.players = " + user.players);
              console.log("user.turns = " + user.turns);
              //search for winners ranking position
              const index = (() => {
                for (let i = 0; i < 50; i++) {
                  if (score >= doc.ranking[i].score) return i;
                }
                return null;
              })();
              console.log("INDEX: " + index);
              //if found a position
              if (index != null) {
                //get lower ranks
                const spliced = doc.ranking.splice(index);
                //push winner's score
                doc.ranking.push({
                  name: user.players[user.turns % 2],
                  score
                });
                //concat the lower ranks
                doc.ranking = doc.ranking.concat(spliced);
                //remove top 51 ++
                doc.ranking.splice(50);
                //sort ranking based on score
                doc.ranking.sort((a, b) => b.score - a.score);
                //mark modify
                doc.markModified("ranking");
                //save
                doc.save((er, saved) => {
                  if (er) {
                    console.log("Error saving");
                    return reject(er);
                  } else {
                    // console.log("Done saving ranking: " + saved);
                    return resolve(saved);
                  }
                });
              } else {
                return resolve("Not in the ranking");
              }
            }
          });
        } else {
          return resolve("No Winner");
        }
      });
    }

    socket.on("disconnect", () => {
      clearInterval(turnTimer);
      console.log("User has disconnected: " + id);
      delete users[id];
      io.emit("new user", Object.keys(users).length);
    });
  });
};
