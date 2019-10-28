import React from 'react';
import './index.css';
import highSound from './audio/high.mp3'
import dieSound from './audio/die.mp3'

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.intervalFunctionID = undefined;
    this.gameEndedCallback = this.props.gameEnded;
    this.state = {
      speed: this.props.speed,
      snakeCoOrds: [
        { x: 3, y: 11 },
        { x: 2, y: 11 },
        { x: 1, y: 11 }
      ],
      direction: 40,
      changingDirection: false,
      isGamePaused: false,
      score: 0
    };
    this.highSound = new Audio(highSound);
    this.dieSound = new Audio(dieSound);
  }

  componentDidMount() {
    this.intervalFunctionID = setInterval(this.moveSnake.bind(this), 1000 / this.state.speed);
    document.onkeydown = this.changeDirection.bind(this);
    this.createFood();
  }

  componentWillUnmount() {
    clearInterval(this.intervalFunctionID);
    this.intervalFunctionID = undefined;
    document.onkeydown = null;
  }

  changeDirection(event) {
    if (this.state.changingDirection)
      return;
    let newDirection = event.keyCode;
    if ((newDirection === 37 && this.state.direction !== 39) ||
      (newDirection === 38 && this.state.direction !== 40) ||
      (newDirection === 39 && this.state.direction !== 37) ||
      (newDirection === 40 && this.state.direction !== 38)) {
      this.setState({
        direction: event.keyCode,
        changingDirection: true
      });
    } else if (newDirection === 32 && !this.state.isGamePaused) {
      this.pauseGame();
      this.setState({ isGamePaused: true });
    } else if (newDirection === 32 && this.state.isGamePaused) {
      this.resumeGame();
      this.setState({ isGamePaused: false });
    }
  }

  mouseClickCallback(event) {
    if (!this.state.isGamePaused) {
      this.pauseGame();
      this.setState({ isGamePaused: true });
    } else if (this.state.isGamePaused) {
      this.resumeGame();
      this.setState({ isGamePaused: false });
    }
  }

  pauseGame() {
    clearInterval(this.intervalFunctionID);
    this.intervalFunctionID = undefined;
  }

  resumeGame() {
    this.intervalFunctionID = setInterval(this.moveSnake.bind(this), 1000 / this.state.speed);
  }

  createFood(headCoOrd) {
    let foodCoOrd = {
      x: Math.floor(Math.random() * 15) + 1,
      y: Math.floor(Math.random() * 21) + 1
    }

    if (this.isFoodInSnake(foodCoOrd, headCoOrd))
      this.createFood(headCoOrd);
    else
      this.setState(prevState => {
        let points = prevState.speed * 10;
        return {
          foodCoOrd: foodCoOrd,
          points: points
        }
      });
  }

  isFoodInSnake(foodCoOrd, headCoOrd) {
    if (headCoOrd && headCoOrd.x === foodCoOrd.x && headCoOrd.y === foodCoOrd.y)
      return true;
    for (let i = 0; i < this.state.snakeCoOrds.length; i++)
      if (this.state.snakeCoOrds[i].x === foodCoOrd.x && this.state.snakeCoOrds[i].y === foodCoOrd.y)
        return true;
  }

  isGameOver(headCoOrd) {
    if (headCoOrd.x === 0 || headCoOrd.x === 16 || headCoOrd.y === 0 || headCoOrd.y === 22)
      return true;

    for (let i = 3; i < this.state.snakeCoOrds.length; i++)
      if (this.state.snakeCoOrds[i].x === headCoOrd.x && this.state.snakeCoOrds[i].y === headCoOrd.y)
        return true;
  }

  didSnakeConsumeFood(headCoOrd) {
    if (headCoOrd.x === this.state.foodCoOrd.x && headCoOrd.y === this.state.foodCoOrd.y) {
      this.setState(prevState => {
        let newScore = prevState.score + prevState.points;
        return {
          score: newScore
        }
      });
      this.highSound.play();
      this.createFood(headCoOrd);
      return true;
    }
  }

  moveSnake() {
    let headCoOrd;
    if (this.state.direction === 37) {
      headCoOrd = { x: this.state.snakeCoOrds[0].x, y: (this.state.snakeCoOrds[0].y - 1) };
    } else if (this.state.direction === 38) {
      headCoOrd = { x: this.state.snakeCoOrds[0].x - 1, y: (this.state.snakeCoOrds[0].y) };
    } else if (this.state.direction === 39) {
      headCoOrd = { x: this.state.snakeCoOrds[0].x, y: (this.state.snakeCoOrds[0].y + 1) };
    } else if (this.state.direction === 40) {
      headCoOrd = { x: this.state.snakeCoOrds[0].x + 1, y: (this.state.snakeCoOrds[0].y) };
    }

    if (this.isGameOver(headCoOrd)) {
      this.dieSound.play();
      clearInterval(this.intervalFunctionID);
      this.intervalFunctionID = undefined;
      this.gameEndedCallback(this.state.score);
      return;
    }

    let didConsumeFood = this.didSnakeConsumeFood(headCoOrd);

    this.setState(prevState => {
      let newPoints = prevState.points - 5;
      if (newPoints <= 5 && prevState.speed === '6')
        newPoints = 5;
      else if (newPoints <= 19 && prevState.speed === '10')
        newPoints = 10;
      else if (newPoints <= 20 && prevState.speed === '14')
        newPoints = 20;

      prevState.snakeCoOrds.unshift(headCoOrd);
      if (!didConsumeFood)
        prevState.snakeCoOrds.pop();
      return {
        snakeCoOrds: [
          ...prevState.snakeCoOrds
        ],
        changingDirection: false,
        points: newPoints
      }
    });
  }

  render() {
    const cells = [];
    for (let i = 1; i <= 15; i++) {
      for (let j = 1; j <= 21; j++) {
        let currCell = ((i - 1) * 21) + j;
        cells.push(<div className='cell' key={currCell}></div>)
      }
    }

    this.state.snakeCoOrds.forEach(element => {
      let i = element.x, j = element.y;
      let currCell = (((i - 1) * 21) + j);
      if (this.state.isGamePaused)
        cells[currCell - 1] = <div className='cell snake paused' key={currCell}></div>;
      else
        cells[currCell - 1] = <div className='cell snake' key={currCell}></div>;
    });

    if (this.state.foodCoOrd) {
      let foodX = this.state.foodCoOrd.x;
      let foodY = this.state.foodCoOrd.y;
      let currCell = (((foodX - 1) * 21) + foodY);
      if (this.state.isGamePaused)
        cells[currCell - 1] = <div className='cell food paused' key={currCell}></div>;
      else
        cells[currCell - 1] = <div className='cell food' key={currCell}></div>;
    }

    return (
      <div className='padding-div'>
        <div className='container flexbox cursor' onClick={this.mouseClickCallback.bind(this)}>
          {cells}
        </div>
        <div className='score'>
          {this.state.score}
        </div>
      </div>
    )
  }
}

export default Container;