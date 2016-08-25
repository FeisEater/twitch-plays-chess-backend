"use strict";

const BaseModel = require("./BaseModel");

class VotedMove extends BaseModel {
  constructor() {
    super("VotedMove");
  }
}

module.exports = new VotedMove();
