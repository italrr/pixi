const ChannelModule = require('../../Module/Channel');
const PersonaModule = require('../../Module/Persona');
const Tools = require('../../Tools/Tools');

const Module = {
    create: async function(req, res){
        if(!req.user){
            res.status(401).send("Unauthorized.");
            return;
        }
        const user = req.user;
        const name = req.body.name;
        const topic = req.body.topic;
        const uniqueId = req.body.persona;
        const private = !!req.body.private;
        const sfw = !!req.body.sfw;
        if(!uniqueId){
            res.status(500).send("Persona is missing");
            return;
        }
        if(!Tools.hasPersona(uniqueId, user)){
            res.status(403).send("Persona '"+uniqueId+"' does not belong this user");
            return
        }
        const persona = await PersonaModule.get({uniqueId});
        if(!persona.success){
            res.status(500).send(persona.message);
            return
        }
        const channel = await ChannelModule.create(persona.first(), name, topic, sfw, private);
        const result = channel.success ? channel.first() : channel.message;
        const code = channel.success ? 200 : 500;  
        res.status(code).send(result);
    },
    get: async function(req, res){
        const query = req.query;
        const user = req.user;

        const name = query.name;
        const uniqueId = query.uniqueId;
        let criteria = {};
        if(!name && !uniqueId){
            res.status(500).send("No valid criteria was provided");
            return;
        }
        if(name){
            criteria["name"] = name;
        }else
        if(uniqueId){
            criteria["uniqueId"] = uniqueId;
        }
        const channel = await ChannelModule.get(criteria, [], ["permissions", "mods", "contents", "lastOrderId", "__v"]);
        const result = channel.success ? channel.first() : channel.message;
        const code = channel.success ? 200 : 500;          
        res.status(code).send(result);
    }
};

module.exports = Module;