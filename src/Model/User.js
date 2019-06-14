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
        email: {
            type: String,
            required: true,
            unique: true
		},
		emailConfirmed: {
            type: Boolean,
            required: true
        }, 
        password: {
            type: String,
            required: true
        },
        level: {
            type: Number,
            required: true
        },
        banned: Boolean,
        date: {
            type: Date,
            required: true
        },
        tokens: [{
            type: Object,
            date: {
                type: Date,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }],    
        personas: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona'
        }]
    };
};

module.exports = Tools.model({
    schema: mongoose.Schema(build()),
    name: 'User',
    collection: 'users'
});