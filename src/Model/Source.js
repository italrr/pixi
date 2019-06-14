const mongoose = require("mongoose");
const Tools = require('../Tools/Tools');

const build = function(){
    return {
		hash: { type: String, required: true },
		date: { type: Date, required: true },
        uniqueId: {
            type: String,
            required: true,
            unique: true, 
            trim: true
        }, 
		filename: { type: String, required: true },
		size: { type: Number, required: true },
		type: { type: String, required: true },
		mime: { type: String, required: true }
    };
};

module.exports = Tools.model({
    schema: mongoose.Schema(build()),
    name: 'Source',
    collection: 'sources'
}, {gUID: false});