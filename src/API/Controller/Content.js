
const ChannelModule = require('../../Module/Channel');
const PersonaModule = require('../../Module/Persona');
const SourceModule = require('../../Module/Source');
const Tools = require('../../Tools/Tools');
const ContentModule = require('../../Module/Content');

const Module = {
    create: async function(req, res){
        // if(!req.user){
        //     res.status(401).send("Unauthorized");
        //     return;
        // }        
        const body = req.body;
        const title = body.title;
        const ch = body.channel; // expects the name
        const pUId = body.persona;
        const sfw = !!body.sfw;
        const payload = body.payload;   // it expects an array of base64 encoded images and/or videos
                                        // 10 items top -> 1 image = 1 item, 1 video  = 2 items
        if(!payload || payload.length < 1){
            res.status(400).send("Payload was not provided");
            return;
        }
        if(!ch || ch.length == 0){
            res.status(400).send("Channel was not provided");
            return;            
        }
        const channel = await ChannelModule.get({name: ch});
        if(!channel.success){
            res.status(400).send(channel.message);
            return;
        }
        const persona = await PersonaModule.get({uniqueId: pUId});
        if(!persona.success){
            res.status(400).send(persona.message);
            return;
        }        
        ContentModule.create(channel.first(), persona.first(), payload, title, sfw).then((content) => {
            if(!content.success){
                res.status(400).send(content.message);
            }
            const crit = {uniqueId: content.first().uniqueId};
            const pop = [
                {"p":"sources", "s": ["_id", "__v"]},
                {"p":"persona", "s": ["_id", "__v"]},
                {"p":"channel", "s": ["_id", "__v", "mods", "permissions", "contents"]}
            ]; 
            const sel = ["__v", "_id",];
            ContentModule.get(crit, pop, sel).then((content) => {
                const result = content.success ? content.first() : content.message;
                const code = content.success ? 200 : 400;          
                res.status(code).send(result);
            });
        });
    },
    get: async function(req, res){
        const query = req.query;
        if(!query.uniqueId){
            res.status(400).send("No valid criteria was provided");
            return;
        }        
        const crit = {uniqueId: query.uniqueId};
        const pop = [
            {"p":"sources", "s": ["_id", "__v"]},
            {"p":"persona", "s": ["_id", "__v"]},
            {"p":"channel", "s": ["_id", "__v", "mods", "permissions", "contents"]}
        ];
        const sel = ["__v", "_id"];
        ContentModule.get(crit, pop, sel).then((content) => {
            const result = content.success ? content.first() : content.message;
            const code = content.success ? 200 : 400;          
            res.status(code).send(result);
        });
    },
    getMany: async function(req, res){
        // TODO: identity validation for private channels
        const query = req.query;       
        const user = req.user;
        const crit = {
            from: query.from,
            many: query.many,
            desc: query.desc == 'true',
            sort: query.sort,
        };
        const pop = [
            {"p":"sources", "s": ["_id", "__v"]},
            {"p":"persona", "s": ["_id", "__v"]}
        ];
        const sel = ["__v", "channel", "comments", "_id"];
        if(!query.channel){
            res.status(400).send("Channel was not provided");
            return;
        }
        ChannelModule.get({name: query.channel}).then((channel) => {
            if(!channel.success){
                res.status(404).send("Channel does not exist");
                return;
            }
            ContentModule.getMany(channel.first(), crit, pop, sel).then((contents) => {
                const result = contents.success ? contents.payload : contents.message;
                const code = contents.success ? 200 : 400;    
                res.status(code).send(result);
            });
        });
    }
};

module.exports = Module;