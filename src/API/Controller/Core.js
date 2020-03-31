const CoreModule = require('../../Pixi')

const Module = {
    entry: async function(req, res){
        res.status(200).send("PIXI | API "+CoreModule.CORE.API_VERSION+" | LISTENING ON PORT "+CoreModule.CORE.API_PORT);
    }   
};

module.exports = Module;