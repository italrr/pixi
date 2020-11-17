const UserModule = require('../../Module/User');

const Module = {
    create: async function(req, res){
        if(!req.user || req.user.level != UserModule.USERLEVEL.ADMIN){
            res.status(401).send("Unauthorized");
            return;
        }
        const email = req.body.email;
        const password = req.body.password;
        const user = await UserModule.create(email, password);
        const result = user.success ? user.first() : user.message;
        const code = user.success ? 200 : 400;
        res.status(code).send(result);        
    },
    get: async function(req, res){
        if(!req.user || req.user.level != UserModule.USERLEVEL.ADMIN){
            res.status(401).send("Unauthorized");
            return;
        }
        const query = req.query;
        const email = query.email; 
        const uniqueId = query.uniqueId; 
        const criteria = {};
        if(!email && !uniqueId){
            res.status(400).send("No criteria was provided");
            return;
        }
        if(email){
            criteria["email"] = email;
        }else
        if(uniqueId){
            criteria["uniqueId"] = uniqueId;
        }
        const user = await UserModule.get(criteria, ["personas"], ["__v", "tokens"]);
        const result = user.success ? user.first() : user.message;
        const code = user.success ? 200 : 400;  
        res.status(code).send(result);
    }    
};

module.exports = Module;