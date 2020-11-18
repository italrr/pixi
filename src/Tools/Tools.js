const Hashids = require('hashids');
const hashids = new Hashids();
const Log = require('./Log');
const DB = require('./DB');
const mongoose = require("mongoose");

// Note: Pixi uses uniqueIds for all its models. mongo's default _id is there, too.
// but for every operation one must use uniqueIds to identify documents
let _uniqueIdAdder = 0;

const Tools = {
    STATUS: {
        UNDEFINED: 'UNDEFINED',
        SUCCESS: 'SUCCESS',
        FAILURE: 'FAILURE',
        TIMEOUT: 'TIMEOUT'
    },
    random: function(max){
        return Math.floor(Math.random() * Math.floor(max));
    },
    copy: function(from, to){
        for(let i in from) to[i] = from[i];
    },
    getUniqueId: function(){
        // Note: This should be enough to make certainly `unique` uniqueIds. 
        // epoch in msecs will always increase by 1 unit for each execution of this
        // method
        return hashids.encode((new Date()).getTime() + _uniqueIdAdder++);
    },
    log: function(msg){
        Log.log(msg);
    },
    report: function(msg = '', stopExecution = false){
        // TODO: proper error logging (use Morgan perhaps?)
        Log.log('EXCEPTION '+msg);
        if(stopExecution){
            process.exit(1);
        }
    },
    result: function(payload = null, status = this.STATUS.UNDEFINED, msg = ''){
        return {
            payload,
            status,
            message: msg,
            success: status == this.STATUS.SUCCESS,
            first: function(){
                return this.payload && this.payload.length > 0 ? this.payload[0] : this.payload;
            },
            second: function(){
                return this.payload && this.payload.length > 1 ? this.payload[1] : this.payload;
            },
            third: function(){
                return this.payload && this.payload.length > 2 ? this.payload[2] : this.payload;
            }
        };
    },
    strip: function(obj, fields = []){
        const stripFields = function(toStrip){
            for(let x = 0; x < fields.length; ++x){
                toStrip.set(fields[x], undefined);
            }
        };
        if(obj.isMongooseArray){            
            for(let i = 0; i < obj.length; ++i){
                stripFields(obj[i]);
            }            
        }else{
            stripFields(obj);
        }
        return obj;
    },
    criteria: function(input){
        let criteria = {}
        if(!input){
            return null;
        }
        if(input.all){
           return {
           } 
        }
        if(input.range){

        }
        if(input.email){
            criteria['email'] = input.email
        }
        if(input.uniqueId){
            criteria['uniqueId'] = input.uniqueId
        }   
        if(input.name){
            criteria['name'] = input.name
        }             
        return criteria;
    },
    populate: function(...fields){
        let populates = [];
        for(let i = 0; i < fields.length; ++i){
            let p = {};
            if(typeof fields[i] === 'string'){
                p["path"] = fields[i];
            }else{
                p["path"] = fields[i]["p"];
                if(fields[i]["s"]){
                    const sel = fields[i]["s"];
                    let selects = "";
                    for(let i = 0; i < sel.length; ++i){
                        selects += "-"+sel[i];
                        if(i < sel.length - 1){
                            selects += " ";
                        }
                    }
                    p["select"] = selects;
                }
            }
            populates.push(p);
        }
        return populates;
    },
    select: function(...fields){
        let selects = "";
        for(let i = 0; i < fields.length; ++i){
            selects += "-"+fields[i];
            if(i < fields.length - 1){
                selects += " ";
            }
        }
        return selects;
    },    
    isEmailValid: function(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },    
    // WARNING: THIS *DOES* DROP THE DB. DO NOT USE IT UNLESS YOU KNOW WHAT YOU'RE DOING
    dropDatabase: async function(){
        Log.log('About to drop Db...');
        await DB.dropDatabase();
    },
    hasPersona: function(uniqueId, user){
        for(let i = 0; i < user.personas.length; ++i){
            const persona = user.personas[i];
            if(persona.uniqueId == uniqueId){
                return true;
            }
        }
        return false;
    },    
    // To create a new model
    model: function(basic, _opts = {gUID: true}){
        const me = this;
        const Model = DB.MongooseDB.model(basic.name, basic.schema, basic.collection);
        return {
            Model,
            build: function(json = {}){
                const built = new Model();
				me.copy(json, built);
				if(_opts.gUID){
					built.uniqueId = me.getUniqueId();        
				}
                built.date = new Date();
                return built; 
            }   
        };
    }    
};

module.exports = Tools;