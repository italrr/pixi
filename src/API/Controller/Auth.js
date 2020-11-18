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
            res.status(400).send('Email is missing');
            return;            
        }        
        if(!password){
            res.status(400).send('Password is missing');
            return;            
        }
        const user = await UserModule.get({email}, ["personas"]);
        if(!user.success){
            res.status(404).send(user.message);
            return;
        }
        bcrypt.compare(password, user.first().password, async function(err, succ) {
            if(!succ){
                res.status(400).send("Invalid password or email.");
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
            const crit = {email};
            const pop = [{p: "personas", s: ["_id", "__v"]}];
            const sel =["_id", "__v", "tokens", "password"];
            UserModule.get(crit, pop, sel).then((usr) => {
                res.status(200).send({
                    token: token,
                    date: new Date(),
                    user: usr.first()
                });
            });
        });
    },
    register: async function(req, res){
        const email = req.body.email;
        const password = req.body.password;
        UserModule.create(email, password).then((usr) => {
            if(!usr.success){
                res.status(400).send(usr.message);
                return;
            }
            const crit = {email}; 
            const pop = [{p: "personas", s: ["_id", "__v"]}];
            const sel = ["_id", "__v", "tokens", "password"];
            UserModule.get(crit, pop, sel).then((usr) => {
                res.status(200).send(usr.first());
            });

        });
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