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
		target: {
			type: String,
			required: true
		},
        persona: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona'
        },
        type: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    };
};

module.exports = pixi.model({
    schema: mongoose.Schema(build()),
    name: 'Vote',
    collection: 'votes'
});