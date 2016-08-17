"use strict";

const ValidationError = require("../config/errors").ValidationError;

class ChessLogic {
  validateMove(move) {
    var letters = "abcdefgh";
    var numbers = "12345678";
    var letter1 = move.start.charAt(0);
    var number1 = move.start.charAt(1);
    var letter2 = move.end.charAt(0);
    var number2 = move.end.charAt(1);
    
    if (letters.includes(letter1) && letters.includes(letter2) &&
      numbers.includes(number1) && numbers.includes(number2)) {
      return true;
    }
    
    throw new ValidationError("Move has wrong format.");
  }
}

module.exports = new ChessLogic();
module.exports.class = ChessLogic;
