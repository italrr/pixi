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
        name: {
            type: String,
            unique: true, 
            required: true
        },
        topic: String,
		sfw: Boolean,
		private: Boolean,
		mods: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona'			
		}],
		permissions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona'			
		}],		
		source: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Source'
		},
        lastOrderId: Number,
        date: {
            type: Date,
            required: true
        },
        contents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content'
        }]
    };
};

module.exports = Tools.model({
    schema: mongoose.Schema(build()),
    name: 'Channel',
    collection: 'channels'
});