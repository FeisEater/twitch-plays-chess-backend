"use strict";

const ValidationError = require("../config/errors").ValidationError;

class VoteCounter {
  sortFunction(a, b, rand) {
    if (b.count - a.count != 0) {
      return b.count - a.count;
    }
    if (b.start > a.start) {
      return 1;
    }
    if (b.start < a.start) {
      return -1;
    }
    if (rand) {
      return Math.random() - 0.5;
    }
    if (b.end > a.end) {
      return 1;
    }
    if (b.end < a.end) {
      return -1;
    }
    if (b.other > a.other) {
      return 1;
    }
    if (b.other < a.other) {
      return -1;
    }
    return 0;      
  }
  
  voteDecisionSort(a, b) {
    this.sortFunction(a, b, true);
  }
  
  deterministicSort(a, b) {
    this.sortFunction(a, b, false);
  }
  
  equal(a, b) {
    if (a.start == b.start &&
        a.end == b.end &&
        a.other == b.other) {
      return true;
    }
    if (a.start == "e8" && a.end == "c8" && b.start == "a8" && b.end == "d8" && b.other == "castling") {
      return true;
    }
    if (b.start == "e8" && b.end == "c8" && a.start == "a8" && a.end == "d8" && a.other == "castling") {
      return true;
    }
    if (a.start == "e8" && a.end == "g8" && b.start == "h8" && b.end == "f8" && b.other == "castling") {
      return true;
    }
    if (b.start == "e8" && b.end == "g8" && a.start == "h8" && a.end == "f8" && a.other == "castling") {
      return true;
    }
    if (a.start == "e1" && a.end == "c1" && b.start == "a1" && b.end == "d1" && b.other == "castling") {
      return true;
    }
    if (b.start == "e1" && b.end == "c1" && a.start == "a1" && a.end == "d1" && a.other == "castling") {
      return true;
    }
    if (a.start == "e1" && a.end == "g1" && b.start == "h1" && b.end == "f1" && b.other == "castling") {
      return true;
    }
    if (b.start == "e1" && b.end == "g1" && a.start == "h1" && a.end == "f1" && a.other == "castling") {
      return true;
    }
  }
  
  generateVoteTable(moves, deterministic) {
    var votes = [];
    for (var i = 0; i < moves.length; i++) {
      var foundVote = false;
      for (var j = 0; j < votes.length; j++) {
        if (this.equal(votes[j], moves[i])) {
          votes[j].count++;
          foundVote = true;
          break;
        }
      }
      if (foundVote) {
        continue;
      }
      votes.push({
        start: moves[i].start,
        end: moves[i].end,
        other: moves[i].other,
        count: 1
      });
    }
    var func = deterministic ? this.deterministicSort : this.voteDecisionSort;
    votes.sort(func); 
    return votes;
  }
  
  countVotes(moves) {
    var votes = this.generateVoteTable(moves);
    console.log(votes);
    return {start: votes[0].start, end: votes[0].end, other: votes[0].other};
  }
}

module.exports = new VoteCounter();
module.exports.class = VoteCounter;
