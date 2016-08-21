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
    return Move.findAll({ game: foundGame});
  })
  .then(moves => {
    ChessLogic.rebuildBoard(moves);
    res.status(200).send(moves);
  })
  .catch(err => {
    res.status(500).send({
      location: "Move findAll .catch other",
      message: "Getting all Moves caused an internal server error.",
      error: err,
    });
  });
};

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
      var newMove = {};
      newMove.start = req.body.start;
      newMove.end = req.body.end;
      newMove.position = ChessLogic.moveNum;
      newMove.game = currentGame;
      return Move.saveOne(newMove);
    }
  })
  .then(move => {
    ChessLogic.makeMove(move);
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

