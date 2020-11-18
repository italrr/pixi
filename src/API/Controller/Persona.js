const PersonaModule = require('../../Module/Persona');

const Module = {
    create: async function(req, res){
        if(!req.user){
            res.status(401).send("Unauthorized");
            return;
        }
        const body = req.body;
        const nick = body.nick;
        // TODO: handle possible image upload with a new persona creation
        PersonaModule.create(user, nick).then((persona) => {
            if(!persona.success){
                res.status(400).send(persona.message);
                return;
            }
            PersonaModule.get({uniqueId: persona.uniqueId}, [], ["_id", "__v"]).then((persona) => {
                const result = persona.success ? persona.first() : persona.message;
                const code = persona.success ? 200 : 400;  
                res.status(code).send(result);
            });
        });
    },
    get: async function(req, res){
        const query = req.query;
        if(!query.uniqueId){
            res.status(400).send("UniqueId was not provided");
            return;            
        }
        const crit = {uniqueId: query.uniqueId};
        PersonaModule.get(crit, [], ["__v", "_id"]).then((persona) => {
            const result = persona.success ? persona.first() : persona.message;
            const code = persona.success ? 200 : 400;  
            res.status(code).send(result);
        });
    }
};

module.exports = Module;