"use strict";

const ValidationError = require("../config/errors").ValidationError;

class VoteCounter {
  sortFunction(a, b) {
    if (b.count - a.count == 0) {
      if (b.start > a.start) {
        return 1;
      }
      if (b.start < a.start) {
        return -1;
      }
      return Math.random() - 0.5;
    }
    return b.count - a.count;
  }
  
  generateVoteTable(moves) {
    var votes = [];
    for (var i = 0; i < moves.length; i++) {
      var foundVote = false;
      for (var j = 0; j < votes.length; j++) {
        if (votes[j].start == moves[i].start &&
            votes[j].end == moves[i].end &&
            votes[j].other == moves[i].other) {
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
    votes.sort(this.sortFunction); 
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
