module.exports = (state, setState, socket) => {
  console.log("mounting client emits listener");

  socket.on("new user", connectedClients => {
    setState({ connectedClients });
  });

  socket.on("render", data => {
    const styles = [{}, {}],
      index = data.turns % 2;
    //active
    styles[data.winner != null ? data.winner[0] : index] = {
      fontSize: "50px",
      color: "rgb(29, 202, 23)",
      zIndex: 1
    };
    //waiting
    styles[data.winner != null ? 1 - data.winner[0] : 1 - index] = {
      fontSize: "20px",
      color: "rgba(255, 255, 255, 0.4)",
      zIndex: 0
    };

    //setState
    setState({
      showGameOn: true,
      showRemoteMatch: false,
      showSharedInterface: false,
      players: data.players,
      styles
    }).then(() => {
      renderTikitakitoe(data);
      //check for winner
      if (data.winner != null) {
        document.querySelector(
          "#player" + data.winner[0]
        ).innerHTML = `<span style="color: rgb(58, 240, 231)">${
          data.players[data.winner[0]]
        } wins!<br>${data.winner[1].style}<br>style!!</span>`;
      } else if (data.turns >= 9) {
        document.querySelector("#player" + (data.turns % 2)).innerHTML += `
        <br><br><span style="color: rgb(58, 240, 231)">Draw</span>`;
      }
    });
  });

  //render function
  //my syntax reference: https://www.w3schools.com/tags/ref_canvas.asp
  function renderTikitakitoe(data) {
    console.log("Rendering..");
    const canvas = document.querySelector("canvas");
    var ctx = canvas.getContext("2d");

    //clear canvas first
    ctx.clearRect(0, 0, state.width, state.height);

    //get cell size
    const cellWidth = state.width / 3,
      cellHeight = state.height / 3;

    //draw 9 cells
    data.cellState.map((x, i) => {
      //set position logic
      const scaletop = Math.floor(i / 3);
      const scaleleft = i - scaletop * 3;
      const left = scaleleft * cellWidth;
      const top = scaletop * cellHeight;
      const margin = 10;
      //draw each cell
      ctx.beginPath();
      ctx.strokeStyle = "purple";
      ctx.rect(left, top, state.width, state.height);
      ctx.lineWidth = 5; //cell line width
      ctx.stroke(); // Draw it

      //if cell has token
      if (x != null) {
        ctx.lineWidth = 10; //token line width
        //if token is "X"
        if (x == 0) {
          ctx.beginPath();
          ctx.moveTo(left + margin, top + margin);
          ctx.lineTo(left + cellWidth - margin, top + cellHeight - margin);
          ctx.moveTo(left + cellWidth - margin, top + margin);
          ctx.lineTo(left + margin, top + cellHeight - margin);
          ctx.strokeStyle =
            data.winner && data.winner[1].stroke.indexOf(i) != -1
              ? "green"
              : "white";
          ctx.stroke();
        }
        //if token is "O"
        if (x == 1) {
          ctx.beginPath();
          ctx.arc(
            left + cellWidth / 2,
            top + cellHeight / 2,
            cellWidth / 2 - margin,
            0,
            2 * Math.PI
          );
          ctx.strokeStyle =
            data.winner && data.winner[1].stroke.indexOf(i) != -1
              ? "green"
              : "white";
          ctx.stroke();
        }
      }
    });
  }

  socket.on("timers", timers => {
    setState({
      timers
    });
  });
};
