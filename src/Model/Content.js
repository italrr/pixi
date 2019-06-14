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
        title: String,
        sources: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Source'
		}],
        type: String,
        orderId: Number,
        points: Number,
        date: Date,
		sfw: Boolean,
		channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Channel'
		},
        persona: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona'
        },
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }]
    };
};

module.exports = Tools.model({		
    schema:  mongoose.Schema(build()),
    name: 'Content',
    collection: 'contents'	
});