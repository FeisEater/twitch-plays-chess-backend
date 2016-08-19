"use strict";

const BaseModel = require("./BaseModel");

class Game extends BaseModel {
  constructor() {
    super("Game");
  }
}

module.exports = new Game();
