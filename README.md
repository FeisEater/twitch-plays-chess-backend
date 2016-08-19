# Hour log

15.8

2h Setting up development environment, installing vm, cloning repository, refamiliarating with framework etc.

16.8

1h Forking repositories

17.8

0,5h Setting up and testing mlab database with backend

2h Implementing chess move model and controller with format validation

3,5h Experimenting with deployment to DigitalOcean

# simple node bootstrap [![Build Status](https://travis-ci.org/TeemuKoivisto/simple-node-bootstrap.svg?branch=master)](https://travis-ci.org/TeemuKoivisto/simple-node-bootstrap) [![Coverage Status](https://coveralls.io/repos/github/TeemuKoivisto/simple-node-bootstrap/badge.svg?branch=master)](https://coveralls.io/github/TeemuKoivisto/simple-node-bootstrap?branch=master)
Simple Node.js bootstrap with Express and ES6 / ES2015. [Heroku deployment](https://simple-node-bootstrap.herokuapp.com)

# General
This is the backend version of the Angular bootstrap that I made. Something to guide you out when creating your backend and not sure how to do it. It's simple as the title says and it's mostly a recollection of things that I've learned and seen to be useful.

# How to install
1. Install Node.js and nvm if you don't have them by now. Newest versions suit very well. 4.-something if you want the production-stable version. Basically it should work if you write ```curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh | bash``` to your terminal. Then ```nvm install 6.3.1``` and maybe ```nvm use 6.3.1```.
2. Clone this repository and go to the root and enter ```npm i``` or ```npm install```.
3. This app uses dotenv for storing environment variables, rename the ```.dev-env``` file in the root of this folder to ```.env``` and anytime you want to use Travis or Heroku remember to add your variables to their config. Or for your own server create your own production ```.env```.
4. This app uses MongoDB as database so you need to either install MongoDB locally or use [mlab](https://mlab.com). I recommend mlab for its easy of use.
5. For better development experience it's recommended to use Postman for generating requests to your app. [Here's a link to Chrome. plugin](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop) For making requests you should set your content-type to application/json and if you have authentication enabled remember to add X-Access-Token -header with valid token.
6. Now you're all set, enter ```npm start``` to run the development server.
7. Go to localhost:3332 if you want to see the backend running. Not much to look at though.

# Commands to remember
1. ```npm i <library> --save``` or ```npm i <library> --save-dev```
2. ```npm test```
3. ```npm run lint``` or ```npm run lint:fix```
4. ```npm run db reset``` for resetting database, other usable commands ```db add, db destroy, db dump```

# Structure
This app uses basic MVC with services as global helpers. Feel free to make changes and create better solutions. I was going to add option to use postgres but eh mayber later. Also sorry about the very sad test suite.

Also I've made bit leaky error reporting to end-user (sends stack traces to everyone), but it shouldn't matter unless you want to use it in production.

To disable authentication you can comment out ```router.use("", auth.authenticate);``` in config/routes.js and probably ```router.use("", auth.onlyAdmin);``` if you want to use those routes too.
