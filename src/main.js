const React = require("react");
const ReactDOM = require("react-dom");
const socket = io();
const clientEmitsListener = require("./client-emitslistener");
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //visibility toggles
      showSharedInterface: false,
      showRemoteMatch: false,
      showGameOn: false,
      //text inputs
      textPlayer1: "",
      textPlayer2: "",
      //updates
      connectedClients: 0,
      canvasSize: {
        width: 270,
        height: 270
      },
      players: [],
      timers: [0, 0],
      styles: []
    };
    this.setStateCallback = this.setStateCallback.bind(this);
  }
  componentDidMount() {
    clientEmitsListener(this.state.canvasSize, this.setStateCallback, socket);
  }
  //abstract callback
  setStateCallback(state) {
    return new Promise((resolve, reject) => {
      this.setState(state, resolve());
    });
  }
  //emitter
  emitter(emitName, data) {
    socket.emit(emitName, data);
  }
  render() {
    return (
      <div>
        <h1>ticTacToe!</h1>
        <p>Online clients: {this.state.connectedClients}</p>

        {/* Welcome component */}
        {!this.state.showRemoteMatch &&
          !this.state.showSharedInterface &&
          !this.state.showGameOn && (
            <Welcome setState={this.setStateCallback} />
          )}

        {/* SharedInterface component */}
        {this.state.showSharedInterface && (
          <SharedInterface
            setState={this.setStateCallback}
            textPlayer1={this.state.textPlayer1}
            textPlayer2={this.state.textPlayer2}
            emitter={this.emitter}
          />
        )}

        {/* GameOn component */}
        {this.state.showGameOn && (
          <GameOn
            canvasSize={this.state.canvasSize}
            players={this.state.players}
            styles={this.state.styles}
            timers={this.state.timers}
          />
        )}
      </div>
    );
  }
}

function Welcome(props) {
  return (
    <div className="popup-background">
      <div className="popup-foreground">
        <h4>Game Mode</h4>
        <button
          onClick={() => {
            props.setState({ showSharedInterface: true });
          }}
        >
          Shared Interface Match
        </button>
        <button>
          Remote Match
          <br />
          <span style={{ fontSize: "12px", fontWeight: "300" }}>
            (separate browsers or desktops)
            <br />
            (will implement upon request)
          </span>
        </button>
      </div>
    </div>
  );
}

function SharedInterface(props) {
  //verify if user input is valid
  function checkInput(e) {
    const val = e.target.value;
    const regex = /^(\w?)+$/;
    regex.test(val) && props.setState({ [e.target.id]: val });
  }
  function startGame() {
    const textPlayer1 = props.textPlayer1,
      textPlayer2 = props.textPlayer2;

    if (
      textPlayer1.length >= 4 &&
      textPlayer2.length >= 4 &&
      textPlayer1.length <= 14 &&
      textPlayer2.length <= 14 &&
      textPlayer1 != textPlayer2
    ) {
      props.emitter("game init", {
        mode: "shared",
        players: [textPlayer1, textPlayer2]
      });
    } else {
      alert(
        "Player names must contain at least \n4 alphanumeric characters. \nAnd must not be the same."
      );
    }
  }

  return (
    <div className="popup-background">
      <div className="popup-foreground">
        <h4>Player Names</h4>
        <div>
          4-14 letters and/or numbers,
          <br />
          <u>no spaces no special chr.</u>
        </div>
        <input
          type="text"
          placeholder="Player 1"
          maxLength="14"
          id="textPlayer1"
          onChange={checkInput}
          value={props.textPlayer1}
          autoComplete="off"
        />
        <input
          type="text"
          placeholder="Player 2"
          maxLength="14"
          id="textPlayer2"
          onChange={checkInput}
          value={props.textPlayer2}
          autoComplete="off"
        />
        <button onClick={startGame}>Start Game!</button>
        <button
          onClick={() => {
            props.setState({ showSharedInterface: false });
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

function GameOn(props) {
  const width = props.canvasSize.width,
    height = props.canvasSize.height;
  const cellWidth = width / 3,
    cellHeight = height / 3;

  function handleClick(e) {
    //get user click position
    const left = e.nativeEvent.offsetX,
      top = e.nativeEvent.offsetY;
    console.log("is integer? " + (top % cellHeight) + " " + (left % cellWidth));
    console.log("top: " + top + " left: " + left);
    //i dont know why clicking on the edge of the canvas returns -1 instead of 0
    //we need to handle that to prevent bugs
    if (top != -1 && left != -1) {
      const x = Math.floor(left / cellWidth) - (left % cellWidth == 0 ? 1 : 0);
      const y = Math.floor(top / cellHeight) - (top % cellHeight == 0 ? 1 : 0);

      const cell = x + y * 3;
      socket.emit("turn", cell);
      console.log(cell);
    }
  }

  return (
    <div id="GameOn">
      <div id="playerNames">
        {/* referencing id number as index, we use 0 and 1 */}
        <p id="player0" style={props.styles[0]}>
          {props.players[0] + " [" + props.timers[0] + "]"}
        </p>
        <p id="player1" style={props.styles[1]}>
          {props.players[1] + " [" + props.timers[1] + "]"}
        </p>
      </div>

      <canvas width={width} height={height} onClick={handleClick}></canvas>

      {/* <button>Leave</button> */}
    </div>
  );
}

const root = document.querySelector("#root");
ReactDOM.render(<App />, root);
