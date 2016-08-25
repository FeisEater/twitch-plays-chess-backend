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
    this.castling = {
      black: {kingSide: true, queenSide: true},
      white: {kingSide: true, queenSide: true}
    };
    this.enPassant = {
      black: -1,
      white: -1
    };
    this.movesToDraw = 0;
    //this.visualizeBoard();
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
    console.log(this.colorOfTurn());
    console.log(this.movesToDraw);
  }
  
  rebuildBoard(moves) {
    this.initializeBoard();
    moves.sort(function(a,b){return a.position - b.position;});    
    for (var i = 0; i < moves.length; i++) {
      this.makeMove(moves[i], false);
    }
  }
  
  validateMove(move) {
    //this.visualizeBoard();
    this.correctFormat(move);
    this.actualMovement(move);
    this.playerCanMoveFigure(move.start);
    this.playerNotCapturingOwnFigure(move.end);
    this.figureMovesAccordingToRules(move);
    this.kingNotInCheckNextTurn(move);
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
    var validMoves = figure.rule(this, startCoord.x, startCoord.y);
    if (figure.rule == this.king) {
      validMoves = this.castlingMove(validMoves, "kingSide");
      validMoves = this.castlingMove(validMoves, "queenSide");
    }
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
  
  pawn(t, x, y) {
    var color = t.colorOfTurn();
    var result = [];
    var newY = (color == "black") ? (y + 1) : (y - 1);
    if (newY < 0 || newY >= 8) {
      return result;
    }
    if (!t.board[x][newY]) {
      result.push({x: x, y: newY});
      var startPawnRow = (color == "black") ? 1 : 6;
      if (y == startPawnRow) {
        var doubleMoveY = (color == "black") ? (newY + 1) : (newY - 1);
        if (!t.board[x][doubleMoveY]) {
          result.push({x: x, y: doubleMoveY});
        }
      }
    }
    var enPassantX = t.enPassant[t.invertColor()];
    var enPassantY = (color == "black") ? 4 : 3;
    if (enPassantX > -1 &&
        Math.abs(x - enPassantX) == 1 &&
        y == enPassantY) {
      enPassantY = (enPassantY == 4) ? 5 : 2;
      result.push({x: enPassantX, y: enPassantY});
    }
    if (t.checkPosition(x - 1, newY) == "occupied by opponent") {
      result.push({x: x - 1, y: newY});
    }
    if (t.checkPosition(x + 1, newY) == "occupied by opponent") {
      result.push({x: x + 1, y: newY});
    }
    return result;
  }
  
  linearMoveCheck(array, x, y, dx, dy, debug = false) {
    for (var i = 0; i < 8; i++) {
      x += dx;
      y += dy;
      var positionStatus = this.checkPosition(x, y);
      if (debug) {
        //console.log(x + " " + y + ":");
        //if (this.board[x][y])
        //  console.log(this.board[x][y].color.charAt(0) + this.board[x][y].rule.name.substring(0,2));
      }
      if (positionStatus == "occupied by own" || positionStatus == "out of bounds") {
        return array;
      }
      array.push({x: x, y: y});
      if (positionStatus == "occupied by opponent") {
        return array;
      }
    }
  }
  
  rook(t, x, y) {
    var result = [];
    result = t.linearMoveCheck(result, x, y, 1, 0);
    result = t.linearMoveCheck(result, x, y, -1, 0);
    result = t.linearMoveCheck(result, x, y, 0, 1);
    result = t.linearMoveCheck(result, x, y, 0, -1);
    return result;
  }
  
  positionCanBeOccupied(array, x, y) {
    var positionStatus = this.checkPosition(x, y);
    if (positionStatus == "vacant" || positionStatus == "occupied by opponent") {
      array.push({x: x, y: y});
    }
    return array;
  }
  
  knight(t, x, y) {
    var result = [];
    result = t.positionCanBeOccupied(result, x + 2, y + 1);
    result = t.positionCanBeOccupied(result, x + 1, y + 2);
    result = t.positionCanBeOccupied(result, x - 2, y + 1);
    result = t.positionCanBeOccupied(result, x - 1, y + 2);
    result = t.positionCanBeOccupied(result, x + 2, y - 1);
    result = t.positionCanBeOccupied(result, x + 1, y - 2);
    result = t.positionCanBeOccupied(result, x - 2, y - 1);
    result = t.positionCanBeOccupied(result, x - 1, y - 2);
    return result;
  }
  
  bishop(t, x, y) {
    var result = [];
    result = t.linearMoveCheck(result, x, y, 1, 1);
    result = t.linearMoveCheck(result, x, y, -1, 1);
    result = t.linearMoveCheck(result, x, y, 1, -1);
    result = t.linearMoveCheck(result, x, y, -1, -1);
    return result;
  }
  
  queen(t, x, y) {
    var result = [];
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        if (dx == 0 && dy == 0) {
          continue;
        }
        result = t.linearMoveCheck(result, x, y, dx, dy);
      }
    }
    return result;
  }
    
  king(t, x, y) {
    var result = [];
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        if (dx == 0 && dy == 0) {
          continue;
        }
        result = t.positionCanBeOccupied(result, x + dx, y + dy);
      }
    }
    return result;
  }
  
  invertColor() {
    return (this.colorOfTurn() == "black") ? "white" : "black";
  }
  
  kingNotInCheckNextTurn(move) {
    if (this.moveExposesKing(move)) {
      throw new ValidationError("Move puts king in check");
    }
  }
  
  copyGameState(move) {
    var oldBoard = new Array(8);
    for (var i = 0; i < 8; i++) {
      oldBoard[i] = new Array(8);
    }
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        oldBoard[x][y] = "";
        if (this.board[x][y]) {
          oldBoard[x][y] = {
            rule: this.board[x][y].rule,
            color: this.board[x][y].color
          };
        }
      }
    }
    var oldMoveNum = this.moveNum;
    var oldMovesToDraw = this.movesToDraw;
    var oldCastling = {
      black: {kingSide: this.castling.black.kingSide, queenSide: this.castling.black.queenSide},
      white: {kingSide: this.castling.white.kingSide, queenSide: this.castling.white.queenSide}
    };
    var oldEnPassant = {
      black: this.enPassant.black,
      white: this.enPassant.white
    };
    var oldMove = {
      start: move.start,
      end: move.end,
      position: move.position,
      other: move.other
    };
    return {
      board: oldBoard,
      moveNum: oldMoveNum,
      movesToDraw: oldMovesToDraw,
      castling: oldCastling,
      enPassant: oldEnPassant,
      move: oldMove
    };    
  }
  
  restoreGameState(oldGame) {
    this.board = oldGame.board;
    this.moveNum = oldGame.moveNum;
    this.movesToDraw = oldGame.movesToDraw;
    this.castling = oldGame.castling;
    this.enPassant = oldGame.enPassant;
    return oldGame.move;
  }
  
  moveExposesKing(move) {
    var oldGame = this.copyGameState(move);
    try {
      this.makeMove(move, false);
      var availableMoves = this.calculateAvailableMoves();
      for (var i = 0; i < availableMoves.length; i++) {
        for (var j = 0; j < availableMoves[i].end.length; j++) {
          var coord = this.toArrayCoordinates(availableMoves[i].end[j]);
          if (this.board[coord.x][coord.y].rule == this.king && 
              this.board[coord.x][coord.y].color != this.colorOfTurn()) {
            move = this.restoreGameState(oldGame);
            return true;
          }
        }
      }
      move = this.restoreGameState(oldGame);
      return false;
    }
    catch (err) {
      move = this.restoreGameState(oldGame);
      throw err;
    }
  }
  
  squareUnderAttack(x, y) {
    var oldMoveNum = this.moveNum;
    this.moveNum++;
    try {
      var availableMoves = this.calculateAvailableMoves(false);
      for (var i = 0; i < availableMoves.length; i++) {
        for (var j = 0; j < availableMoves[i].end.length; j++) {
          var coord = this.toArrayCoordinates(availableMoves[i].end[j]);
          if (coord.x == x && coord.y == y) {
            this.moveNum--;
            return true;
          }
        }
      }
      this.moveNum--;
      return false;
    }
    catch (err) {
      this.moveNum = oldMoveNum;
      throw err;
    }
  }

  castlingLogic(move, figure) {
    if (figure.rule == this.king) {
      this.castling[this.colorOfTurn()] = {kingSide: false, queenSide: false};
    }
    if (figure.rule == this.rook) {
      var side = (move.start == "a8" || move.start == "a1") ? "queenSide" : "kingSide";
      this.castling[this.colorOfTurn()][side] = false;
    }
    if (move.start == "e8" && move.end == "c8" && figure.rule == this.king) {
      this.board[3][0] = this.board[0][0];
      this.board[0][0] = "";
    }
    if (move.start == "e8" && move.end == "g8" && figure.rule == this.king) {
      this.board[5][0] = this.board[7][0];
      this.board[7][0] = "";
    }
    if (move.start == "e1" && move.end == "c1" && figure.rule == this.king) {
      this.board[3][7] = this.board[0][7];
      this.board[0][7] = "";
    }
    if (move.start == "e1" && move.end == "g1" && figure.rule == this.king) {
      this.board[3][7] = this.board[0][7];
      this.board[0][7] = "";
    }
    if (move.other == "castling" && move.start == "a8" && move.end == "d8" && figure.rule == this.rook) {
      this.board[2][0] = this.board[4][0];
      this.board[4][0] = "";
    }
    if (move.other == "castling" && move.start == "h8" && move.end == "f8" && figure.rule == this.rook) {
      this.board[6][0] = this.board[4][0];
      this.board[4][0] = "";
    }
    if (move.other == "castling" && move.start == "a1" && move.end == "d1" && figure.rule == this.rook) {
      this.board[2][7] = this.board[4][7];
      this.board[4][7] = "";
    }
    if (move.other == "castling" && move.start == "h1" && move.end == "f1" && figure.rule == this.rook) {
      this.board[6][7] = this.board[4][7];
      this.board[4][7] = "";
    }
  }
  
  enPassantLogic(move, figure) {
    if (figure.rule != this.pawn) {
      this.enPassant[figure.color] = -1;
      return;
    }
    var coordStart = this.toArrayCoordinates(move.start);
    var coordEnd = this.toArrayCoordinates(move.end);
    if (this.enPassant.black > -1 && figure.color == "white") {
      if (Math.abs(coordStart.x - this.enPassant.black) == 1 && coordStart.y == 3 &&
          coordEnd.x == this.enPassant.black && coordEnd.y == 2) {
        this.board[this.enPassant.black][3] = "";
      }
    }
    if (this.enPassant.white > -1 && figure.color == "black") {
      if (Math.abs(coordStart.x - this.enPassant.white) == 1 && coordStart.y == 4 &&
          coordEnd.x == this.enPassant.white && coordEnd.y == 5) {
        this.board[this.enPassant.white][4] = "";
      }
    }
    
    this.enPassant[figure.color] = -1;
    if (coordStart.y - coordEnd.y == 2) {
      this.enPassant.white = coordStart.x;
    }
    if (coordEnd.y - coordStart.y == 2) {
      this.enPassant.black = coordStart.x;
    }
  }
  
  promotionLogic(move, figure, debug) {
    if (figure.rule != this.pawn) {
      return;
    }
    var coordStart = this.toArrayCoordinates(move.start);
    var coordEnd = this.toArrayCoordinates(move.end);
    if ((coordEnd.y == 7 && figure.color == "black") ||
        (coordEnd.y == 0 && figure.color == "white")) {
      if (move.other != "knight" && move.other != "rook" && move.other != "bishop") {
        move.other = "queen";
      }
      figure.rule = this[move.other];
    }
  }
  
  gameIsOver() {
    if (this.moveToDraw >= 50) {
      return "Draw. 50 consequtive moves without captures and pawn moves";
    }
    
    var pieces = {
      black: {pawn: 0, rook: 0, knight: 0, bishop: 0, queen: 0, king: ""},
      white: {pawn: 0, rook: 0, knight: 0, bishop: 0, queen: 0, king: ""}
    };

    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        if (!this.board[x][y]) {
          continue;
        }
        if (this.board[x][y].rule == this.king) {
          pieces[this.board[x][y].color].king = {x: x, y: y};
        } else {
          pieces[this.board[x][y].color][this.board[x][y].rule.name]++;
        }
      }
    }

    if (!pieces.black.king || !pieces.white.king) {
      throw new ValidationError("King does not exit. This shouldn't have happened, sorry");
    }
    if (this.getAvailableMoves().length <= 0) {
      var color = this.colorOfTurn();
      if (this.squareUnderAttack(pieces[color].king.x, pieces[color].king.y)) {
        return "Checkmate, " + this.invertColor() + " wins";
      } else {
        return "Stalemate, " + color + " has no valid moves.";
      }
    }

    var drawMessage = "Draw. Insufficient resources to checkmate";
    if (pieces.black.pawn <= 0 && pieces.white.pawn <= 0 &&
        pieces.black.queen <= 0 && pieces.white.queen <= 0 &&
        pieces.black.rook <= 0 && pieces.white.rook <= 0) {
      if (pieces.black.knight <= 0 && pieces.black.bishop <= 0) {
        if (pieces.white.knight <= 0 && pieces.white.bishop <= 0) {
          return drawMessage;
        }
        if (pieces.white.knight == 1 && pieces.white.bishop <= 0) {
          return drawMessage;
        }
        if (pieces.white.knight <= 0 && pieces.white.bishop == 1) {
          return drawMessage;
        }
      }
      if (pieces.white.knight <= 0 && pieces.white.bishop <= 0) {
        if (pieces.black.knight <= 0 && pieces.black.bishop <= 0) {
          return drawMessage;
        }
        if (pieces.black.knight == 1 && pieces.black.bishop <= 0) {
          return drawMessage;
        }
        if (pieces.black.knight <= 0 && pieces.black.bishop == 1) {
          return drawMessage;
        }
      }
    }
    return "";
  }
  
  makeMove(move, visualize = true) {
    var coordStart = this.toArrayCoordinates(move.start);
    var coordEnd = this.toArrayCoordinates(move.end);
    var figure = this.board[coordStart.x][coordStart.y];
    if (this.board[coordEnd.x][coordEnd.y] || figure.rule == this.pawn) {
      this.movesToDraw = 0;
    } else {
      this.movesToDraw++;
    }
    this.board[coordStart.x][coordStart.y] = "";
    this.board[coordEnd.x][coordEnd.y] = figure;
    this.castlingLogic(move, figure);
    this.enPassantLogic(move, figure);
    this.promotionLogic(move, figure);
    this.moveNum++;
    if (visualize)  this.visualizeBoard();
  }

  getAvailableMoves() {
    var availableMoves = this.calculateAvailableMoves();
    for (var i = availableMoves.length - 1; i >= 0; i--) {
      for (var j = availableMoves[i].end.length - 1; j >= 0; j--) {
        if (this.moveExposesKing({
          start: availableMoves[i].start,
          end: availableMoves[i].end[j]
        })) {
          availableMoves[i].end.splice(j, 1);
        }
      }
      if (availableMoves[i].end.length <= 0) {
        availableMoves.splice(i, 1);
      }
    }
    return availableMoves;
  }
  
  coordinatesToChessNotation(x, y) {
    var letters = "abcdefgh";
    var numbers = "87654321";
    return letters.charAt(x) + numbers.charAt(y);
  }
  
  castlingMove(array, side) {
    if (side != "kingSide" && side != "queenSide") {
      throw new ValidationError("incorrect side in castling");
    }
    
    var color = this.colorOfTurn();
    var y = (color == "black") ? 0 : 7;
    var dir = (side == "kingSide") ? 1 : -1;
    if (this.castling[color][side] &&
        !this.squareUnderAttack(4, y) &&
        !this.squareUnderAttack(4 + dir, y)) {
      var rookMoves = [];
      rookMoves = this.linearMoveCheck(rookMoves, (side == "kingSide") ? 7 : 0, y, -dir, 0, true);
      var rookCanCastle = false;
      for (var i = 0; i < rookMoves.length; i++) {
        if (rookMoves[i].x == 4 + dir && rookMoves[i].y == y) {
          rookCanCastle = true;
          break;
        }
      }
      if (rookCanCastle) {
        array.push({x: 4 + (2 * dir), y: y});
      }
    }
    return array;
  }

  calculateAvailableMoves(calculateCastling = true) {
    var result = [];
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        if (this.board[x][y] && this.board[x][y].color == this.colorOfTurn()) {
          var moves = this.board[x][y].rule(this, x, y);
          if (this.board[x][y].rule == this.king && calculateCastling) {
            moves = this.castlingMove(moves, "kingSide");
            moves = this.castlingMove(moves, "queenSide");
          }
          for (var i = 0; i < moves.length; i++) {
            moves[i] = this.coordinatesToChessNotation(moves[i].x, moves[i].y);
          }
          result.push({
            start: this.coordinatesToChessNotation(x, y),
            end: moves
          });
        }
      }
    }
    return result;  
  }
}

module.exports = new ChessLogic();
module.exports.class = ChessLogic;
