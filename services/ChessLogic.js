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
    this.board[0][row] = this.board[7][row] = {rule: this.rook, color: color};
    this.board[1][row] = this.board[6][row] = {rule: this.knight, color: color};
    this.board[2][row] = this.board[5][row] = {rule: this.bishop, color: color};
    this.board[3][row] = {rule: this.queen, color: color};
    this.board[4][row] = {rule: this.king, color: color};
    
    row = (color == "black" ? 1 : 6);
    for (var i = 0; i < 8; i++) {
      this.board[i][row] = {rule: this.pawn, color: color};
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
        output += this.board[x][y].color.charAt(0) + this.board[x][y].rule.name.substring(0,2) + " ";
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
    this.figureMovesAccordingToRules(move);
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
  
  figureMovesAccordingToRules(move) {
    var startCoord = this.toArrayCoordinates(move.start);
    var endCoord = this.toArrayCoordinates(move.end);
    var figure = this.board[startCoord.x][startCoord.y];
    var validMoves = figure.rule(startCoord.x, startCoord.y);
    for (var i = 0; i < validMoves.length; i++) {
      if (validMoves[i].x == endCoord.x && validMoves[i].y == endCoord.y) {
        return;
      }
    }
    throw new ValidationError("Move is not according to rules.");
  }
    
  checkPosition(x, y) {
    if (x < 0 || x >= 8 || y < 0 || y >= 8) {
      return "out of bounds";
    }
    if (!this.board[x][y]) {
      return "vacant";
    }
    var color = this.colorOfTurn();
    if (this.board[x][y].color == color) {
      return "occupied by own";
    } else {
      return "occupied by opponent";
    }
  }
  
  pawn(x, y) {
    var color = this.colorOfTurn();
    var result = [];
    var newY = (color == "black") ? (y + 1) : (y - 1);
    if (newY < 0 || newY >= 8) {
      return result;
    }
    if (!this.board[x][newY]) {
      result.push({x: x, y: newY});
      var startPawnRow = (color == "black") ? 1 : 6;
      if (y == startPawnRow) {
        var doubleMoveY = (color == "black") ? (newY + 1) : (newY - 1);
        result.push({x: x, y: doubleMoveY});
      }
    }
    if (this.checkPosition(x - 1, newY) == "occupied by opponent") {
      result.push({x: x - 1, y: newY});
    }
    if (this.checkPosition(x + 1, newY) == "occupied by opponent") {
      result.push({x: x + 1, y: newY});
    }
    return result;
  }
  
  linearMoveCheck(array, x, y, dx, dy) {
    for (var i = 0; i < 8; i++) {
      x += dx;
      y += dy;
      var positionStatus = this.checkPosition(x, y);
      if (positionStatus == "occupied by own" || positionStatus == "out of bounds") {
        return array;
      }
      array.push({x: x, y: y});
      if (positionStatus == "occupied by opponent") {
        return array;
      }
    }
  }
  
  rook(x, y) {
    var result = [];
    result = this.linearMoveCheck(result, x, y, 1, 0);
    result = this.linearMoveCheck(result, x, y, -1, 0);
    result = this.linearMoveCheck(result, x, y, 0, 1);
    result = this.linearMoveCheck(result, x, y, 0, -1);
    return result;
  }
  
  positionCanBeOccupied(array, x, y) {
    var positionStatus = this.checkPosition(x, y);
    if (positionStatus == "vacant" || positionStatus == "occupied by opponent") {
      array.push({x: x, y: y});
    }
    return array;
  }
  
  knight(x, y) {
    var result = [];
    result = this.positionCanBeOccupied(result, x + 2, y + 1);
    result = this.positionCanBeOccupied(result, x + 1, y + 2);
    result = this.positionCanBeOccupied(result, x - 2, y + 1);
    result = this.positionCanBeOccupied(result, x - 1, y + 2);
    result = this.positionCanBeOccupied(result, x + 2, y - 1);
    result = this.positionCanBeOccupied(result, x + 1, y - 2);
    result = this.positionCanBeOccupied(result, x - 2, y - 1);
    result = this.positionCanBeOccupied(result, x - 1, y - 2);
    return result;
  }
  
  bishop(x, y) {
    var result = [];
    result = this.linearMoveCheck(result, x, y, 1, 1);
    result = this.linearMoveCheck(result, x, y, -1, 1);
    result = this.linearMoveCheck(result, x, y, -1, 1);
    result = this.linearMoveCheck(result, x, y, 1, -1);
    return result;
  }
  
  queen(x, y) {
    var result = [];
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        if (dx == 0 && dy == 0) {
          continue;
        }
        result = this.linearMoveCheck(result, x, y, dx, dy);
      }
    }
    return result;
  }
  
  king(x, y) {
    var result = [];
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        if (dx == 0 && dy == 0) {
          continue;
        }
        result = this.positionCanBeOccupied(result, x + dx, y + dy);
      }
    }
    return result;
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