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
        const persona = PersonaModule.create(user, nick);
        const result = persona.success ? persona.first() : persona.message;
        const code = persona.success ? 200 : 400;  
        res.status(code).send(result);
    },
    get: async function(req, res){
        const query = req.query;
        if(!query.id && !query.uniqueId){
            res.status(400).send("UniqueId was not provided");
            return;            
        }
        const criteria = {};
        if(query.id){
            criteria["uniqueId"] = query.id;
        }else{
            criteria["uniqueId"] = query.uniqueId;
        }

        const persona = await PersonaModule.get(criteria, [], ["__v"]);
        const result = persona.success ? persona.first() : persona.message;
        const code = persona.success ? 200 : 400;  
        res.status(code).send(result);
    }
};

module.exports = Module;