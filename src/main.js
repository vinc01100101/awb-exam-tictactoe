const React = require("react");
const ReactDOM = require("react-dom");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //visibility toggles
      showSingleInterface: false,
      showRemoteMatch: false,
      //text inputs
      textPlayer1: "",
      textPlayer2: ""
    };
    this.setStateCallback = this.setStateCallback.bind(this);
  }

  //abstract callback
  setStateCallback(prop, val) {
    this.setState({
      [prop]: val
    });
  }
  render() {
    return (
      <div>
        <h1>ticTacToe!</h1>
        {!this.state.showRemoteMatch && !this.state.showSingleInterface && (
          <Welcome setState={this.setStateCallback} />
        )}

        {this.state.showSingleInterface && (
          <SingleInterface
            setState={this.setStateCallback}
            textPlayer1={this.state.textPlayer1}
            textPlayer2={this.state.textPlayer2}
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
            props.setState("showSingleInterface", true);
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
    regex.test(val) && props.setState(e.target.id, val);
  }
  return (
    <div className="popup-background">
      <div className="popup-foreground">
        <h4>Player Names</h4>
        <div>
          4-16 letters and/or numbers,
          <br />
          no spaces no special chr.
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
        <button>Start Game!</button>
        <button
          onClick={() => {
            props.setState("showSingleInterface", false);
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

const root = document.querySelector("#root");
ReactDOM.render(<App />, root);
