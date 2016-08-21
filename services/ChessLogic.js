"use strict";

const ValidationError = require("../config/errors").ValidationError;

class ChessLogic {
  constructor() {
    this.board = new Array(8);
    for (var i = 0; i < 8; i++) {
      this.board[i] = new Array(8);
    }
    this.initializeBoard();
  }
  
  initializeBoard() {
    this.clearBoard();
    this.placeFigures("black");
    this.placeFigures("white");
    this.moveNum = 1;
    this.visualizeBoard();
  }
  
  clearBoard() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        this.board[x][y] = "";
      }
    }
  }
  
  placeFigures(color) {
    if (color != "black" && color != "white") {
      throw new ValidationError("placeFigures invalid color.");
    }
    
    var row = (color == "black" ? 0 : 7);
    this.board[0][row] = this.board[7][row] = {type: "rook", color: color};
    this.board[1][row] = this.board[6][row] = {type: "knight", color: color};
    this.board[2][row] = this.board[5][row] = {type: "bishop", color: color};
    this.board[3][row] = {type: "queen", color: color};
    this.board[4][row] = {type: "king", color: color};
    
    row = (color == "black" ? 1 : 6);
    for (var i = 0; i < 8; i++) {
      this.board[i][row] = {type: "pawn", color: color};
    }
  }
  
  visualizeBoard() {
    for (var y = 0; y < 8; y++) {
      var output = "";
      for (var x = 0; x < 8; x++) {
        if (!this.board[x][y]) {
          output += "    ";
          continue;
        }
        output += this.board[x][y].color.charAt(0) + this.board[x][y].type.substring(0,2) + " ";
      }
      console.log(output);
    }
  }
  
  rebuildBoard(moves) {
    this.initializeBoard();
    moves.sort(function(a,b){return a.position - b.position;});    
    for (var i = 0; i < moves.length; i++) {
      this.makeMove(moves[i]);
    }
  }
  
  validateMove(move) {
    this.correctFormat(move);
    this.actualMovement(move);
    this.playerCanMoveFigure(move.start);
    this.playerNotCapturingOwnFigure(move.end);
    return true;
  }
  
  correctFormat(move) {
    var letters = "abcdefgh";
    var numbers = "12345678";
    var letter1 = move.start.charAt(0);
    var number1 = move.start.charAt(1);
    var letter2 = move.end.charAt(0);
    var number2 = move.end.charAt(1);
    
    if (!letters.includes(letter1) || !letters.includes(letter2) ||
      !numbers.includes(number1) || !numbers.includes(number2)) {
      throw new ValidationError("Move has wrong format.");
    }
  }
  
  actualMovement(move) {
    if (move.start == move.end) {
      throw new ValidationError("Can't move to same position.");
    }
  }
  
  toArrayCoordinates(chessNotation) {
    var letter = chessNotation.charAt(0);
    var number = chessNotation.charAt(1);
    var letters = "abcdefgh";
    
    var x;
    for (var i = 0; i < 8; i++) {
      if (letters.charAt(i) == letter) {
        x = i;
        break;
      }
    }
    var y = 8 - number;
    return { x: x, y: y};
  }
  
  colorOfTurn() {
    return (this.moveNum % 2 == 0) ? "black" : "white";
  }
  
  playerCanMoveFigure(position) {
    var coord = this.toArrayCoordinates(position);
    if (!this.board[coord.x][coord.y]) {
      throw new ValidationError("No chess pieces at given coordinate.");
    }
    if (this.board[coord.x][coord.y].color != this.colorOfTurn()) {
      throw new ValidationError("Other color's turn to move.");
    }
  }
  
  playerNotCapturingOwnFigure(position) {
    var coord = this.toArrayCoordinates(position);
    var figureToBeCaptured = this.board[coord.x][coord.y];
    if (figureToBeCaptured && figureToBeCaptured.color == this.colorOfTurn()) {
      throw new ValidationError("Can't capture own chess piece.");
    }
  }
  
  makeMove(move) {
    var coordStart = this.toArrayCoordinates(move.start);
    var coordEnd = this.toArrayCoordinates(move.end);
    var figure = this.board[coordStart.x][coordStart.y];
    this.board[coordStart.x][coordStart.y] = "";
    this.board[coordEnd.x][coordEnd.y] = figure;
    this.moveNum++;
    this.visualizeBoard();
  }
}

module.exports = new ChessLogic();
module.exports.class = ChessLogic;
