
const ChannelModule = require('../../Module/Channel');
const PersonaModule = require('../../Module/Persona');
const SourceModule = require('../../Module/Source');
const Tools = require('../../Tools/Tools');
const ContentModule = require('../../Module/Content');

const Module = {
    create: async function(req, res){
        if(!req.user){
            res.status(401).send("Unauthorized.");
            return;
        }        
        const body = req.body;
        const title = body.title;
        const channelName = body.channel; // expects the name
        const personaUniqueId = body.persona;
        const sfw = !!body.sfw;
        const payload = body.payload;   // it expects an array of base64 encoded images and/or videos
                                        // 10 items top -> 1 image = 1 item, 1 video  = 2 items
        
        if(!payload || payload.length < 1){
            res.status(500).send("Payload was not provided");
            return;
        }

        const channel = await ChannelModule.get({name: channelName});
        if(!channel.success){
            res.status(500).send(channel.message);
            return;
        }
        const persona = await PersonaModule.get({uniqueId: personaUniqueId});
        if(!persona.success){
            res.status(500).send(persona.message);
            return;
        }        

        const content = await ContentModule.create(channel, persona, payload, title, sfw);
        const result = content.success ? content.first() : content.message;
        const code = content.success ? 200 : 500;      
        res.status(code).send(result);
    },
    get: async function(req, res){
        const query = req.query;       
        const user = req.user;
        const criteria = {
            from: query.from,
            many: query.many,
            desc: query.desc == 'true',
            sort: query.sort,
        };
        const channelName = query.channel; // expects the name
        if(!channelName){
            res.status(500).send("Channel was not provided");
            return;
        }
        const channel = await ChannelModule.get({name: channelName});
        if(!channel.success){
            res.status(500).send("Channel does not exist");
            return;
        }
        // TODO: identity validation for private channels
        const contents = await ContentModule.get(channel, criteria, ["sources", "persona"], ["__v", "channel", "comments"]);
        const result = contents.success ? contents.payload : contents.message;
        const code = contents.success ? 200 : 500;    
        if(result && code === 200){
            for(let i = 0; i < result.length; ++i){
                Tools.strip(result[i].persona, ["__v"]);
                Tools.strip(result[i].sources, ["__v"]);
            }
        }
        res.status(code).send(result);
    }
};

module.exports = Module;