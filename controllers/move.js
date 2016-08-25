"use strict";

const Move = require("../models/Move");
const Game = require("../models/Game");

const ValidationError = require("../config/errors").ValidationError;

const ChessLogic = require("../services/ChessLogic");

module.exports.findAll = (req, res) => {
  Promise.resolve()
  .then(() => {
    return Game.findOne({ over: false });
  })
  .then(foundGame => {
    return Move.findAll({ game: foundGame._id});
  })
  .then(moves => {
    ChessLogic.rebuildBoard(moves);
    res.status(200).send({
      moves: moves,
      availableMoves: ChessLogic.getAvailableMoves()
    });
  })
  .catch(err => {
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
      over: false
    };
    return Game.saveOne(newGame);
  })
  .catch(err => {
    console.log(err);
    setTimeout(resetGame, 15000);
  });
}

module.exports.saveOne = (req, res) => {
  var currentGame = {};
  var savedMove = {};
  Promise.resolve()
  .then(() => {
    return Game.findOne({ over: false });
  })
  .then(game => {
    if (ChessLogic.validateMove(req.body)) {
      currentGame = game;
      var newMove = req.body;
      newMove.position = ChessLogic.moveNum;
      newMove.game = currentGame;
      return Move.saveOne(newMove);
    }
  })
  .then(move => {
    ChessLogic.makeMove(move);
    var gameOver = ChessLogic.gameIsOver();
    if (gameOver) {
      console.log(gameOver);
      setTimeout(resetGame, 15000);
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
      res.status(500).send({
        location: "Move saveOne .catch other",
        message: "Saving Move caused an internal server error.",
        error: err,
      });
    }
  });
};

