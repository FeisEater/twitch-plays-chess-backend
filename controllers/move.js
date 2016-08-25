"use strict";

const Move = require("../models/Move");
const VotedMove = require("../models/VotedMove");
const Game = require("../models/Game");

const ValidationError = require("../config/errors").ValidationError;

const ChessLogic = require("../services/ChessLogic");
const VoteCounter = require("../services/VoteCounter");

var timer = 0;
var voteTimeOut = false;
init();

function init() {
  Promise.resolve()
  .then(() => {
    return Game.findOne({ over: false });
  })
  .then(foundGame => {
    voteTimeOut = false;
    timer = foundGame.timeToVote;
    setTimeout(voteTimer, 1000);
  })
  .catch(err => {
    console.log(err);
  });
}

module.exports.findAll = (req, res) => {
  var gameMoves = {};
  var currentGame = {};
  Promise.resolve()
  .then(() => {
    return Game.findOne({ over: false });
  })
  .then(foundGame => {
    currentGame = foundGame;
    return Move.findAll({ game: foundGame._id});
  })
  .then(moves => {
    ChessLogic.rebuildBoard(moves);
    gameMoves = moves;
    return VotedMove.findAll({ game: currentGame._id});
  })
  .then(votes => {
    res.status(200).send({
      moves: gameMoves,
      availableMoves: ChessLogic.getAvailableMoves(),
      votes: VoteCounter.generateVoteTable(votes),
      timer: timer
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).send({
      location: "Move findAll .catch other",
      message: "Getting all Moves caused an internal server error.",
      error: err,
    });
  });
};

function resetGame() {
  Promise.resolve()
  .then(() => {
    return Game.findOne({ over: false });
  })
  .then(game => {
    game.over = true;
    return Game.update(game, game._id);
  })
  .then(game => {
    var newGame = {
      over: false,
      timeToVote: game.timeToVote
    };
    return Game.saveOne(newGame);
  })
  .catch(err => {
    console.log(err);
    timer = 15;
    setTimeout(resetGame, 1000);
  });
}

function makeMove() {
  var currentGame = {};
  Promise.resolve()
  .then(() => {
    return Game.findOne({ over: false });
  })
  .then(foundGame => {
    currentGame = foundGame;
    return VotedMove.findAll({ game: foundGame._id});
  })
  .then(moves => {
    if (moves.length <= 0) {
      voteTimeOut = true;
      throw new ValidationError("No votes submitted. Moving with the first vote submitted.");
    }
    var appointedMove = VoteCounter.countVotes(moves);
    ChessLogic.validateMove(appointedMove);
    appointedMove.game = currentGame;
    appointedMove.position = ChessLogic.moveNum;
    return Move.saveOne(appointedMove);
  })
  .then(move => {
    ChessLogic.makeMove(move);
    var gameOver = ChessLogic.gameIsOver();
    if (gameOver) {
      console.log(gameOver);
      timer = 15;
      setTimeout(gameResetTimer, 1000);
    } else {
      timer = currentGame.timeToVote;
      setTimeout(voteTimer, 1000);
    }
    return Game.update({lastPlayed: Date.now()}, currentGame._id);
  })
  .then(game => {
    return VotedMove.delete({ game: currentGame._id});
  })
  .then(votes => {})
  .catch(err => {
    //console.log(err);
  });
}

function gameResetTimer() {
  if (timer > 0) {
    timer--;
    setTimeout(gameResetTimer, 1000);
    return;
  }
  resetGame();
}

function voteTimer() {
  if (timer > 0) {
    timer--;
    setTimeout(voteTimer, 1000);
    return;
  }
  makeMove();
}

module.exports.saveOne = (req, res) => {
  Promise.resolve()
  .then(() => {
    return Game.findOne({ over: false });
  })
  .then(game => {
    if (ChessLogic.validateMove(req.body)) {
      var votedMove = req.body;
      votedMove.game = game;
      return VotedMove.saveOne(votedMove);
    }
  })
  .then(move => {
    if (voteTimeOut) {
      voteTimeOut = false;
      makeMove();
    }
    res.status(200).send(move);
  })
  .catch(err => {
    if (err.name === "ValidationError") {
      res.status(400).send({
        location: "User saveOne .catch ValidationError",
        message: err.message,
        error: err,
      });
    } else {
      console.log(err);
      res.status(500).send({
        location: "Move saveOne .catch other",
        message: "Saving Move caused an internal server error.",
        error: err,
      });
    }
  });
};

