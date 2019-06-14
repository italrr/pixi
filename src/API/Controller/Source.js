const SourceModule = require('../../Module/Source');
const fs = require('fs');

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
    const path = isThumbnail ? './thumb/'+source.first().uniqueId+'.jpg': './img/'+source.first().filename;
    fs.readFile(path, function (err, data) {
        if(err){
            res.status(500).send(err);
            return;
        }
        res.set('Content-Type', source.first().mime);				
        res.status(200).send(data);
    });
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