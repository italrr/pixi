const Tools = require('../Tools/Tools');

const SourceModel = require('../Model/Source');
const ContentModel = require('../Model/Content');
const ChannelModel = require('../Model/Channel');
const PersonaModel = require('../Model/Persona');
const SourceModule = require('../Module/Source');

const Module = {
    SORT_TYPE: {
        PN: 'pn', // Post number
        VN: 'pop', // Vote number
        TR: 'tr', // Trending (TODO: Make this TREND algorithm)
        DATE: 'date', // By Date
        CTRV: 'ctrv' // Controversial (TODO: Make this CONTR algorithm)
    },
    SORT_ORDER: {
        ASC: 'asc',
        DESC: 'desc'
    },
    get: async function(criteria, populate = [], select = []){
        const me = this;
        return new Promise(function(approve){
            if(!criteria){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "No criteria was provided."));
                return;
            }            
            const _crit = Tools.criteria(criteria);
            if(Object.keys(_crit).length == 0){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "No criteria was provided."));
                return;                
            }            
            ContentModel.Model.find(_crit).populate(Tools.populate(...populate)).select(Tools.select(...select)).exec(function(err, result){
                if (err){
                    approve(Tools.result([], Tools.STATUS.FAILURE, "Failed to find content "+err));
                    return;				
                }  
                if(!result || result.length == 0){
                    approve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to find any content with criteria "+JSON.stringify(_crit)));
                    return;
                }                     
                approve(Tools.result(result, Tools.STATUS.SUCCESS));
            });

        });
    },    
    getMany: async function(channel, crit, populate = [], select = []){
        const me = this;
        return new Promise(function(approve){
            if(!channel){
                approve(Tools.result([], Tools.STATUS.FAILURE, "Channel was not provided"));
                return;
            }
            let from = crit.from;
            let many = crit.many;
            const desc = crit.desc; // true = desc
            const sort = crit.sort;
            const criteria = {};
            switch(sort){
                case me.SORT_TYPE.PN: {
                    from = parseInt(crit.from);
                    many = parseInt(crit.many);
                    if(from == -1){
                        from = desc ? 1 : channel.lastOrderId;
                    }
                    criteria["orderId"] = desc ? { $lte: from + many, $gte: from } : { $lte: from, $gte: from - many  };
                    console.log(criteria["orderId"]);
                    break;
                }
                case me.SORT_TYPE.VN:
                    break;
                case me.SORT_TYPE.DATE:
                    break;                 
                case me.SORT_TYPE.TR:
                    // TODO
                    break;
                case me.SORT_TYPE.CTRV:
                    // TODO
                    break;     
                default:
                    approve(Tools.result([], Tools.STATUS.FAILURE, "Undefined sort type '"+criteria.sortType+"'"));
                    return;                                                                                               
            }
            ContentModel.Model.find(criteria).populate(Tools.populate(...populate)).select(Tools.select(...select)).exec(function(err, result){
                if (err){
                    approve(Tools.result([], Tools.STATUS.FAILURE, "Failed to find content "+err));
                    return;				
                }       
                approve(Tools.result(result, Tools.STATUS.SUCCESS));
            });

        });
    },
    create: async function(channel, persona, sources, title, sfw = true){
        return new Promise(async function(approve){
            if(!channel){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Channel was not provided"));
                return;
            }
            if(!persona){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Persona was not provided"));
                return;
            }
            if(!sources){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Source(s) was/were not provided"));
                return;
            } 
            if(!title || title.length < 3){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Title must be at least 3 characters long"));
                return;                
            }
            if(title.length > 40){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Title cannot be longer than 40 characters"));
                return;                
            }
            const sourceList = [];
            //TODO add proper checking for sources
            for(let i = 0; i < sources.length; ++i){
                const src = await SourceModule.create(sources[i]);
                if(!src.success){
                    console.log(src.message)
                    continue;
                }
                sourceList.push(src.first());
            }
            if(sourceList.length == 0){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to process all sources provided"));
                return;
            }
            ChannelModel.Model.findOneAndUpdate({ uniqueId: channel.uniqueId }, {$inc: {lastOrderId: 1}}, {new: true}, function(err, channel){				
                const content = new ContentModel.build({
                    title,
                    channel,
                    persona,
                    sfw,
                    sources: sourceList,
                    orderId: channel.lastOrderId,                    
                    points: 0
                });
                content.save(function(err, content){
                    if(err){
                        approve(Tools.result(null, Tools.STATUS.FAILURE, err));
                        return
                    }                       
                    ChannelModel.Model.updateOne(
                        { _id: channel._id }, 
                        { $push: { contents: content } },
                        function(err, result){
                            if(err){
                                approve(Tools.result(null, Tools.STATUS.FAILURE, err));
                                return
                            }                             
                            approve(Tools.result(content, Tools.STATUS.SUCCESS)); 
                        }
                    );
                });
            });
        });
    }
};

module.exports = Module;