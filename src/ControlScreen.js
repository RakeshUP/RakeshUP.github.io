import React from 'react';
import './index.css';
import Container from './Container.js'
import lowSound from './audio/low.mp3'
import highSound from './audio/high.mp3'

class ControlScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      speed: 6,
      gameState: 0,
      score: 0
    }
    this.lowSound = new Audio(lowSound);
    this.highSound = new Audio(highSound);
  }

  selectLevelAndStartCountdown(event) {
    this.setState({
      speed: event.target.getAttribute('speed'),
      gameState: 3,
      countDown: '3'
    });
    setTimeout(this.countDown.bind(this), 500);
    this.lowSound.play();
  }

  countDown() {
    let newCountDownText, gameState = 3;
    switch (this.state.countDown) {
      case '3': newCountDownText = '2';
        this.lowSound.play();
        break;
      case '2': newCountDownText = '1';
        this.lowSound.play();
        break;
      case '1': newCountDownText = 'GO';
        this.highSound.play();
        break;
      default: gameState = 1;
        break;
    }

    if (gameState === 3) {
      setTimeout(this.countDown.bind(this), 500);
    }
    this.setState({
      countDown: newCountDownText,
      gameState: gameState
    })
  }

  gameEnded(score) {
    this.setState({
      gameState: 2,
      score: score
    });
  }

  resetGame() {
    this.setState({
      gameState: 0
    });
  }

  render() {
    if (this.state.gameState === 0) {
      return (
        <div className='padding-div'>
          <div className='container welcome-screen'>
            <h1>snake</h1>
            <div className='choose'>CHOOSE LEVEL: </div>
            <div className='level' speed='6' onClick={this.selectLevelAndStartCountdown.bind(this)}>SLUG</div>
            <div className='level' speed='10' onClick={this.selectLevelAndStartCountdown.bind(this)}>WORM</div>
            <div className='level' speed='14' onClick={this.selectLevelAndStartCountdown.bind(this)}>PYTHON</div>
          </div>
        </div>
      )
    } else if (this.state.gameState === 3) {
      return (
        <div className='padding-div'>
          <div className='container welcome-screen'>
            <div className='countDown'>{this.state.countDown}</div>
          </div>
        </div>
      )
    } else if (this.state.gameState === 1) {
      return (
        <Container speed={this.state.speed} gameEnded={this.gameEnded.bind(this)} />
      )
    } else if (this.state.gameState === 2) {
      return (
        <div className='padding-div' >
          <div className='container welcome-screen cursor' onClick={this.resetGame.bind(this)}>
            <h1>GAME</h1>
            <h1>OVER</h1>
            <div className='finalScore'>YOUR SCORE: {this.state.score}</div>
          </div>
        </div>
      );
    }
  }
}

export default ControlScreen;