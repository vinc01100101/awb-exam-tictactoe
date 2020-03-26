module.exports = io => {
  let users = {};
  io.on("connection", socket => {
    const id = socket.id;

    users[id] = {
      room: null,
      players: [],
      timers: [],
      cellState: [],
      turns: 0,
      done: true
    };
    const user = users[id];

    console.log("User has connected: " + id);
    //broadcast new user count
    io.emit("new user", Object.keys(users).length);

    //requested game intialization
    socket.on("game init", data => {
      console.log("game initialized!");
      switch (data.mode) {
        case "single":
          user.cellState = [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ];
          user.players = data.players;
          user.done = false;
          socket.emit("render", user);
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
        //update cell with user token if null
        if (user.cellState[data] == null) {
          user.cellState[data] = user.turns % 2;
          user.turns++; //increase turns
          socket.emit("render", user);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User has disconnected: " + id);
      delete users[id];
      io.emit("new user", Object.keys(users).length);
    });
  });
};
