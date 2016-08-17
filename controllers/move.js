"use strict";

const Move = require("../models/Move");

const ValidationError = require("../config/errors").ValidationError;

const ChessLogic = require("../services/ChessLogic");

var currentMove = 1;

module.exports.findAll = (req, res) => {
  Move
  .findAll({
    order: [["position", "ASC"]]
  })
  .then(moves => {
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

function progressMove() {
  var result = currentMove;
  currentMove++;
  return result;
}

module.exports.saveOne = (req, res) => {
  Promise.resolve()
  .then(() => {
    if (ChessLogic.validateMove(req.body)) {
      return Move.saveOne({
        "start": req.body.start,
        "end": req.body.end,
        "position": progressMove()
      });
    }
  })
  .then(move => {
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

