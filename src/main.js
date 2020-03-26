const React = require("react");
const ReactDOM = require("react-dom");
const socket = io();
const clientEmitsListener = require("./client-emitslistener");
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //visibility toggles
      showSingleInterface: false,
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
      }
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
          !this.state.showSingleInterface &&
          !this.state.showGameOn && (
            <Welcome setState={this.setStateCallback} />
          )}

        {/* SingleInterface component */}
        {this.state.showSingleInterface && (
          <SingleInterface
            setState={this.setStateCallback}
            textPlayer1={this.state.textPlayer1}
            textPlayer2={this.state.textPlayer2}
            emitter={this.emitter}
          />
        )}

        {/* GameOn component */}
        {this.state.showGameOn && <GameOn canvasSize={this.state.canvasSize} />}
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
            props.setState({ showSingleInterface: true });
          }}
        >
          Single Interface Match
        </button>
        <button>
          Remote Match
          <br />
          <span style={{ fontSize: "12px", fontWeight: "300" }}>
            (separate browsers or desktops)
          </span>
        </button>
      </div>
    </div>
  );
}

function SingleInterface(props) {
  //verify if user input is valid
  function checkInput(e) {
    const val = e.target.value;
    const regex = /^(\w?)+$/;
    regex.test(val) && props.setState({ [e.target.id]: val });
  }
  function startGame() {
    const textPlayer1 = props.textPlayer1,
      textPlayer2 = props.textPlayer2;

    if (textPlayer1.length >= 4 && textPlayer2.length >= 4) {
      props.emitter("game init", {
        mode: "single",
        players: [textPlayer1, textPlayer2]
      });
    } else {
      alert("Player names must contain at least 4 characters.");
    }
  }

  return (
    <div className="popup-background">
      <div className="popup-foreground">
        <h4>Player Names</h4>
        <div>
          4-16 letters and/or numbers,
          <br />
          <u>no spaces no special chr.</u>
        </div>
        <input
          type="text"
          placeholder="Player 1"
          maxLength="16"
          id="textPlayer1"
          onChange={checkInput}
          value={props.textPlayer1}
          required
        />
        <input
          type="text"
          placeholder="Player 2"
          maxLength="16"
          id="textPlayer2"
          onChange={checkInput}
          value={props.textPlayer2}
          required
        />
        <button onClick={startGame}>Start Game!</button>
        <button
          onClick={() => {
            props.setState({ showSingleInterface: false });
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

function GameOn(props) {
  return (
    <div>
      <canvas
        width={props.canvasSize.width}
        height={props.canvasSize.height}
      ></canvas>
      <button>Leave</button>
    </div>
  );
}

const root = document.querySelector("#root");
ReactDOM.render(<App />, root);
