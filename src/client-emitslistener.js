module.exports = (state, setState, socket) => {
  console.log("mounting client emits listener");

  socket.on("new user", connectedClients => {
    setState({ connectedClients });
  });

  socket.on("render", data => {
    setState({
      showGameOn: true,
      showRemoteMatch: false,
      showSingleInterface: false
    }).then(() => {
      renderTikitakitoe(data);
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
      if (x) {
        ctx.lineWidth = 10; //token line width
        if (x == "x") {
          ctx.beginPath();
          ctx.moveTo(left + margin, top + margin);
          ctx.lineTo(left + cellWidth - margin, top + cellHeight - margin);
          ctx.moveTo(left + cellWidth - margin, top + margin);
          ctx.lineTo(left + margin, top + cellHeight - margin);
          ctx.strokeStyle = "white";
          ctx.stroke();
        }
        if (x == "o") {
          ctx.beginPath();
          ctx.arc(
            left + cellWidth / 2,
            top + cellHeight / 2,
            cellWidth / 2 - margin,
            0,
            2 * Math.PI
          );
          ctx.strokeStyle = "white";
          ctx.stroke();
        }
      }
    });
  }
};
