const mongoose = require("mongoose");
const Tools = require('../Tools/Tools');

const build = function(){
    return {
        uniqueId: {
            type: String,
            required: true,
            unique: true, 
            trim: true
        },
        nick: {
            type: String,
            required: true
        },
        source: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Source'
		}, // profile pic URL
        date: {
            type: Date,
            required: true
		},
		verified: {
			type: Boolean,
			required: true
		},
		private: {
			type: Boolean,
			required: true
		},
		disabled: {
			type: Boolean,
			required: true
		},
		popularity: Number,
    };
};

module.exports = Tools.model({
    schema: mongoose.Schema(build()),
    name: 'Persona',
    collection: 'personas'
});