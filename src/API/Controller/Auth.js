const Tools = require('../../Tools/Tools');
const UserModule = require('../../Module/User');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Pixi = require('../../Pixi');

const Module = {
    login: async function(req, res){
        const body = req.body; 
        const email = body.email;
        const password = body.password;
        if(!email){
            res.status(500).send('Email is missing');
            return;            
        }        
        if(!password){
            res.status(500).send('Password is missing');
            return;            
        }
        const user = await UserModule.get({email});
        if(!user.success){
            res.status(500).send(user.message);
            return;
        }
        bcrypt.compare(password, user.first().password, function(err, succ) {
            if(!succ){
                res.status(500).send("Invalid password or email.");
                return;
            }
            const payload = {
                uniqueId: user.first().uniqueId,
                email: user.first().email
            };
            // TODO: Manage tokens by storing them in the db
            const token = jwt.sign(payload, Pixi.CORE.AUTH_SECRET, {
                expiresIn: '24h'
            });
            res.status(200).send({
                token: token,
                date: new Date(),
                email: user.first().email,
                uniqueId: user.first().uniqueId
            });
        });
    },
    register: async function(req, res){
        const email = req.body.email;
        const password = req.body.password;
        const user = await UserModule.create(email, password);
        const result = user.success ? user.first() : user.message;
        const code = user.success ? 200 : 500;
        res.status(code).send(result);
    },
    renew: async function(req, res){
        if(!req.user){
            res.status(401).send("Unauthorized");
            return;
        }
        const user = req.user;
        const payload = {
            uniqueId: user.uniqueId,
            email: user.email
        };

        // TODO: Manage tokens by storing them in the db
        const token = jwt.sign(payload, Pixi.CORE.AUTH_SECRET, {
            expiresIn: '24h'
        });

        res.status(200).send({
            token: token,
            date: new Date(),
            uniqueId: user.uniqueId
        });
    },
    logout: async function(req, res){
        if(!req.user){
            res.status(401).send("Unauthorized");
            return;
        }        
        // TODO remove verified tokens from db 
        res.status(200).send("OK");
    }    
};

module.exports = Module;