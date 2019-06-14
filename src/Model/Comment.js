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
        text: String, 
        date: {
            type: Date,
            required: true
        },
        points: Number,
        orderId: Number,
        source: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Source'
		}],
        persona: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona',
            required: true
        }
    };
};

module.exports = Tools.model({
    schema: mongoose.Schema(build()),
    name: 'Comment',
    collection: 'comments'
});