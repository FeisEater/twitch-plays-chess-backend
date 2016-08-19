"use strict";

const models = require("./schemas");

module.exports.destroyTables = () => {
  return Promise.all(Object.keys(models).map(key => {
    if ({}.hasOwnProperty.call(models, key)) {
      return models[key].remove();
    }
  }));
};

// module.exports.createTables = () => {
//   return tables.syncForce();
//   // return tables.sync();
// };

module.exports.dropTables = () => {
  return Promise.all(Object.keys(models).map(key => {
    if ({}.hasOwnProperty.call(models, key)) {
      let mongoose = require("./db_connection");
      // duh doesn't work :/
      return mongoose.connection.db.dropDatabase();
      // return mongoose.connection.collections["items"].drop();
    }
  }))
};

module.exports.addTestData = () => Promise.all([
  models.Item.create({
    content: "Something something",
  }),
  models.Item.create({
    content: "I'm a virus, press alt + f4 to stop me",
  }),
  models.User.create({
    firstname: "Admin",
    lastname: "Jokunen",
    email: "admin@asdf.asdf",
    passwordHash: "$2a$10$Fs0N7KD/xUH4NAfW2s1MoOh/yH3G7mAtGycMY5tMUvCGqiWWdaSue",
    role: "admin",
  }),
  models.User.create({
    firstname: "Matti",
    lastname: "Menninkäinen",
    email: "user@asdf.asdf",
    passwordHash: "$2a$10$Fs0N7KD/xUH4NAfW2s1MoOh/yH3G7mAtGycMY5tMUvCGqiWWdaSue",
    role: "user",
  }),
  models.Game.create({}),
])

module.exports.dump = () => {
  return Promise.all(Object.keys(models).map(key => {
    if ({}.hasOwnProperty.call(models, key)) {
      return models[key].find({});
    }
  }));
};

// module.exports.dropAndCreateTables = () => {
//   return module.exports.createTables()
//   .then(() => module.exports.addTestData())
//   .then(() => {
//     console.log("Dropped and created models with test data succesfully!");
//   })
//   .catch((err) => {
//     console.log("dropAndCreateTables produced an error!");
//     console.log(err);
//   });
// };

module.exports.resetTestData = () => {
  return module.exports.destroyTables()
  .then(() => module.exports.addTestData())
};
