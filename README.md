# Twitch plays chess, backend [![Build Status](https://travis-ci.org/FeisEater/twitch-plays-chess-backend.svg?branch=master)](https://travis-ci.org/FeisEater/twitch-plays-chess-backend) [![Coverage Status](https://coveralls.io/repos/github/FeisEater/twitch-plays-chess-backend/badge.svg?branch=master)](https://coveralls.io/github/FeisEater/twitch-plays-chess-backend?branch=master)
Backend module of the referendum based public chess app. Implemented in Node.js

[App deployed here](http://twitch-plays-chess.herokuapp.com)

# Hour log

## 15.8

**2h** Setting up development environment, installing vm, cloning repository, refamiliarating with framework etc.

## 16.8

**1h** Forking repositories

## 17.8

**0,5h** Setting up and testing mlab database with backend

**2h** Implementing chess move model and controller with format validation

## 18.8

**3,5h** Experimenting with deployment to DigitalOcean

## 19.8

**1h** Finished deployment to DigitalOcean, set up Travis

**2,5h** Added Game model to contain Move instances

## 20.8

**2,5h** Implemented turn-based movements and captures

## 21.8

**2,5h** Implemented most of chess movement rules

## 22.8

**2h** Backend sends next valid moves

## 23.8

**3,5h** Can't move into check

## 24.8

**4h** Implementing castling

**2,5h** Implemented everything chess related, including endgame. Resets game.

## 25.8

**2,5h** Implemented voting

## 26.8

**1h** Vote results sent to frontend are now deterministic. Different ways to perform castling are recognized as the same vote
