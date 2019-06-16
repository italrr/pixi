const SourceModule = require('../../Module/Source');

// TODO: Implement permisions for images (Images on private channels)
const getSource = async function(req, res, isThumbnail = false){
    const uniqueId = req.params.id;	
    if(!uniqueId){
        res.status(404).send("Image/Video uniqueId was not provided");
        return;
    }
    const source = await SourceModule.get({uniqueId});
    if(!source.success){
        res.status(404).send("Image/Video not found");
        return;
    }
    const data = await SourceModule.img(source, isThumbnail);
    const result = data.success ? data.payload : data.message;
    const code = data.success ? 200 : 500;  
    res.status(code).send(result);
};

const Module = {
    img: async function(req, res){
        getSource(req, res, false);
    },
    thumb: async function(req, res){
        getSource(req, res, true);
    }    
};

module.exports = Module;