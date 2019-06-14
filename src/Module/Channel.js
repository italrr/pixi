const Tools = require('../Tools/Tools');
const ChannelModel = require('../Model/Channel');

const Module = {
    get: async function(criteria, populate = [], select = []){
        return new Promise(function(approve){
            if(!criteria){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "No criteria was provided."));
                return;
            }
            const _crit = Tools.criteria(criteria);
            ChannelModel.Model.find(_crit).populate(Tools.populate(...populate)).select(Tools.select(...select)).exec(function(err, result){
                if (err){
                    approve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to find channel: "+err));
                    return;
                }
                if(!result || result.length == 0){
                    approve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to find any channel with criteria "+JSON.stringify(_crit)));
                    return;
                }
                approve(Tools.result(result, Tools.STATUS.SUCCESS));
            });            
        });
    }, 
    create: async function(persona, name, topic, sfw = true, private = false){
        const me = this;
        const result = await me.get({name});

        return new Promise(function(approve){
            if(!persona){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Persona was not provided"));
                return;
            }
            if(!name || name.length < 2){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Channel's name must be at least 2 characters long"));
                return;            
            }
            if(!name || name.length > 40){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Channel's name cannot be longer than 40 characters"));
                return;            
            }      
            if(!topic || topic.length < 2){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Channel's topic must be at least 2 characters long"));
                return;            
            }     
            if(!topic || topic.length > 120){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Channel's topic cannot longer than 120 characters long"));
                return;            
            }
            if(result.status != Tools.STATUS.FAILURE){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Channel '"+name+"' already exists"));
                return;
            }            
            const channel = new ChannelModel.build({
                name: name.toLowerCase(),
                topic,
                sfw,
                private,
                lastOrderId: 0,
                mods: [
                    persona
                ]
            });
            channel.save(function(err, channel){
                if(err){
                    approve(Tools.result(null, Tools.STATUS.FAILURE, err));
                    return
                }                   
                approve(Tools.result(channel, Tools.STATUS.SUCCESS)); 
            }); 
        });
    }
};

module.exports = Module;