const Tools = require('../Tools/Tools');
const UserModel = require('../Model/User');
const PersonaModel = require('../Model/Persona');
const bcrypt = require("bcrypt");

const getToken = function(user, tokenLiteral){
    for(let i = 0; i < user.tokens.length; ++i){
        const token = user.tokens[i];
        if(token.token === tokenLiteral){
            return {
                index: i,
                token: token.token
            }
        }
    }
    return null;
};

const Module = {
    USERLEVEL: {
        ADMIN: 0,
        MOD: 1,
        JANITOR: 2,
        USER: 3,
        name: function(status){
            const me = this;
            switch(status){
                case me.ADMIN:
                    return 'ADMIN';
                case me.MOD:
                    return 'MOD';
                case me.JANITOR:
                    return 'JANITOR';
                case me.USER:
                    return 'USER';  
                default:
                    return 'UNDEFINED';
            }
        }        
    },
    get: async function(criteria, populate = [], select = []){
        return new Promise(function(resolve){
            if(!criteria){
                resolve(Tools.result(null, Tools.STATUS.FAILURE, "No criteria was provided."));
                return;
            }
            const _crit = Tools.criteria(criteria);
            if(Object.keys(_crit).length == 0){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "No criteria was provided."));
                return;                
            }            
            UserModel.Model.find(_crit).populate(Tools.populate(...populate)).select(Tools.select(...select)).exec(function(err, result){
                if (err){
                    resolve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to find User: "+err));
                    return;
                }
                if(!result || result.length == 0){
                    resolve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to find any user with criteria "+JSON.stringify(_crit)));
                    return;
                }
                resolve(Tools.result(result, Tools.STATUS.SUCCESS));
            });            
        });
    },
    create: async function(email, password, userlevel = this.USERLEVEL.USER){
        const me = this;       
        return new Promise(async function(approve){
            if(!email){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "No email was provided"));               
                return;
            }
            if(!Tools.isEmailValid(email)){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Email is invalid"));
                return;
            }
            if(!password || password.length < 4){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Password must be at least 4 characters long"));                     
                return;
            }
            const result = await me.get({email});
            const hpass = await bcrypt.hash(password, 10);
            if(result.status != Tools.STATUS.FAILURE){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "User '"+email+"' already exists"));
                return;
            }
            const user = new UserModel.build({
                email: email.toLowerCase(),
                password: hpass,
                level: userlevel,
                banned: false,
                emailConfirmed: true
            });
            // 'Anonymous' is the default Persona for a new user
            const persona = new PersonaModel.build({
                nick: 'Anonymous',
				verified: false,
				private: false,
				disabled: false	
            });
            persona.save(function(err, persona){
                if(err){
                    approve(Tools.result(null, Tools.STATUS.FAILURE, err));
                    return
                }        
                user.update(
                    { _id: user._id }, 
                    { $push: { personas: persona } },
                    function(err){
                        if(err){
                            approve(Tools.result(null, Tools.STATUS.FAILURE, err));
                            return
                        }                               
                        approve(Tools.result(user, Tools.STATUS.SUCCESS)); 
                    }
                ); 
            })
        });
    },
    assignToken: async function(user, token){ // expects complete token object {token: string, date: Date}
        return new Promise(function(approve){
            if(!user || !user.tokens){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "User was not provided"));
                return;
            }
            const objToken = getToken(user, token.token);
            if(objToken){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Token is already assigned to this user"));
                return;                
            }
            user.tokens.push(token);
            user.save(function(err, user){
                if(err){
                    approve(Tools.result(null, Tools.STATUS.FAILURE, err));
                    return
                }
                approve(Tools.result(Object.assign([], user.tokens), Tools.STATUS.SUCCESS));
            });                
        });
    },
    verifyToken: async function(user, token){ // expects literal token
        return new Promise(function(approve){
            if(!user || !user.tokens){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "User was not provided"));
                return;
            }
            const objToken = getToken(user, token);
            const msg = objToken ? "" : "Invalid token";
            const status = objToken ? Tools.STATUS.SUCCESS : Tools.STATUS.FAILURE;
            approve(Tools.result(objToken, status, msg));
        });
    },
    expireToken: async function(user, token){ // expects literal token
        return new Promise(function(approve){
            if(!user || !user.tokens){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "User was not provided"));
                return;
            }
            const objToken = getToken(user, token);
            if(!objToken){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Invalid token"));
                return;
            }
            const tokens = Object.assign([], user.tokens).splice(objToken.index, 1);
            user.tokens = tokens;
            user.save(function(err, user){
                if(err){
                    approve(Tools.result(null, Tools.STATUS.FAILURE, err));
                    return
                }                
                approve(Tools.result(Object.assign([], user.tokens), Tools.STATUS.SUCCESS));
            });          
        });
    }
};

module.exports = Module;