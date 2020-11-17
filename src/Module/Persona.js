const Tools = require('../Tools/Tools');
const PersonaModel = require('../Model/Persona');

const Module = {
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
            PersonaModel.Model.find(_crit).populate(Tools.populate(...populate)).select(Tools.select(...select)).exec(function(err, result){
                if (err){
                    resolve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to find persona: "+err));
                    return;
                }
                if(!result || result.length == 0){
                    resolve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to find any persona with criteria "+JSON.stringify(_crit)));
                    return;
                }
                resolve(Tools.result(result, Tools.STATUS.SUCCESS));
            });            
        });
    },
    remove: async function(criteria){
        return new Promise(function(resolve){
            if(!criteria){
                resolve(Tools.result(null, Tools.STATUS.FAILURE, "No criteria was provided."));
                return;
            }
            const _crit = Tools.criteria(criteria);
            PersonaModel.Model.remove(_crit).exec(function(err, result){
                if (err){
                    resolve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to delete persona: "+err));
                    return;
                }
                if(!result || result.ok != 1){
                    resolve(Tools.result(result, Tools.STATUS.FAILURE, "Failed to delete any persona with criteria "+JSON.stringify(_crit)));
                    return;
                }
                resolve(Tools.result(result, Tools.STATUS.SUCCESS));
            });            
        });
    },    
    create: async function(user, nick){
        return new Promise(function(approve){
            if(!user || !user.personas){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "User was not provided"));
                return;
            }
            if(!nick || nick.length < 2){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Nick must be at least 2 characters long"));
                return;            
            }
            const persona = new PersonaModel.build({
                nick,
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
                        approve(Tools.result(persona, Tools.STATUS.SUCCESS)); 
                    }
                );
            }); 
        });
    }
};

module.exports = Module;