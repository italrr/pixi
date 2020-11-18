const ChannelModule = require('../../Module/Channel');
const PersonaModule = require('../../Module/Persona');
const Tools = require('../../Tools/Tools');

const Module = {
    create: async function(req, res){
        if(!req.user){
            res.status(401).send("Unauthorized");
            return;
        }
        const user = req.user;
        const name = req.body.name;
        const topic = req.body.topic;
        const uniqueId = req.body.persona;
        const private = !!req.body.private;
        const sfw = !!req.body.sfw;
        if(!uniqueId){
            res.status(400).send("Persona is missing");
            return;
        }
        if(!Tools.hasPersona(uniqueId, user)){
            res.status(403).send("Persona '"+uniqueId+"' does not belong this user");
            return
        }
        const persona = await PersonaModule.get({uniqueId});
        if(!persona.success){
            res.status(400).send(persona.message);
            return
        }
        ChannelModule.create(persona.first(), name, topic, sfw, private).then((channel) => {
            if(!channel.success){
                res.status(400).send(channel.message);
                return;
            }
            const sel = ["_id", "__v", "mods", "contents", "permissions"];
            ChannelModule.get({uniqueId: channel.uniqueId}, [], sel).then((channel) => {
                const result = channel.success ? channel.first() : channel.message;
                const code = channel.success ? 200 : 400;  
                res.status(code).send(result);
            });
        });
    },
    get: async function(req, res){
        const query = req.query;
        const user = req.user;
        const name = query.name;
        const uniqueId = query.uniqueId;
        let crit = {};
        if(!name && !uniqueId){
            res.status(400).send("No valid criteria was provided");
            return;
        }
        if(name){
            crit["name"] = name;
        }else
        if(uniqueId){
            crit["uniqueId"] = uniqueId;
        }
        const sel = ["permissions", "mods", "contents", "__v", "_id"];
        ChannelModule.get(crit, [], sel).then((channel) => { // TODO: if the request comes from an admi/mod, add back permissions and mods
            const result = channel.success ? channel.first() : channel.message;
            const code = channel.success ? 200 : 400;          
            res.status(code).send(result);
        });                                                                                                 
    }
};

module.exports = Module;