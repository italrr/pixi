const mongoose = require("mongoose");
const Log = require('./Log');

let MongooseDB = mongoose.createConnection('mongodb://127.0.0.1:27017/pixi', { useNewUrlParser: true });

const init = async function(){
    mongoose.set('debug', true);
    mongoose.set('useCreateIndex', true)
    mongoose.set('useFindAndModify', false);
    mongoose.Promise = global.Promise;
    MongooseDB.on("error", function(error){
        Log.log("DB Error: "+error);
    });
    MongooseDB.once("open", function() {
        Log.log("Connected to DB");
    });
}

const dropDatabase = async function(){
    await MongooseDB.dropDatabase();
}

module.exports = {
    init,
    dropDatabase,
    MongooseDB
};