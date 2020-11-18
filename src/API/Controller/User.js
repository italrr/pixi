const UserModule = require('../../Module/User');

const Module = {
    create: async function(req, res){
        if(!req.user || req.user.level != UserModule.USERLEVEL.ADMIN){
            res.status(401).send("Unauthorized");
            return;
        }
        const email = req.body.email;
        const password = req.body.password;
        UserModule.create(email, password).then((user) => {
            if(!user.success){
                res.status(400).send(user.message);  
                return;
            }
            const crit = { uniqueId: user.uniqueId };
            UserModule.get(crit, [], ["_id", "password", "__v", "tokens"]).then((user) => {
                const result = user.success ? user.first() : user.message;
                const code = user.success ? 200 : 400;  
                res.status(code).send(result);                
            });
        });       
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
        const pop = [ { p:"personas", s: ["__v", "_id"] } ];
        const sel = ["__v", "tokens", "password"];
        UserModule.get(criteria, pop, sel).then((user) => {
            const result = user.success ? user.first() : user.message;
            const code = user.success ? 200 : 400;  
            res.status(code).send(result);
        });
    }    
};

module.exports = Module;