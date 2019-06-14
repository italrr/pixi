const imageType = require('image-type'); 
const sha1 = require('node-sha1');
const Tools = require('../Tools/Tools');
const SourceModel = require('../Model/Source');
const fs = require('fs');
const Jimp = require('jimp');

const Module = {
    get: async function(criteria, populate = [], select = []){
        return new Promise(function(resolve){
            if(!criteria){
                resolve(Tools.result(null, Tools.STATUS.FAILURE, "No criteria was provided."));
                return;
            }
            const _crit = Tools.criteria(criteria);
            SourceModel.Model.find(_crit).populate(Tools.populate(...populate)).select(Tools.select(...select)).exec(function(err, result){
                if (err){
                    resolve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to find source: "+err));
                    return;
                }
                if(!result || result.length == 0){
                    resolve(Tools.result(null, Tools.STATUS.FAILURE, "Failed to find any source with criteria "+JSON.stringify(_crit)));
                    return;
                }
                resolve(Tools.result(result, Tools.STATUS.SUCCESS));
            });            
        });
    }, 
    // TODO: add support for videos
    create: async function(data){
        const uniqueId = Tools.getUniqueId();
        return new Promise(function(approve){
            if(!data){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Data was not provided"));
                return
            }
            const buffer = new Buffer(data);
            const info = imageType(buffer)
            if(!info){
                approve(Tools.result(null, Tools.STATUS.FAILURE, "Invalid image/video file"));
                return
            }            
            const filename = uniqueId+'.'+info.ext;
            const source = new SourceModel.build({
                hash: sha1(buffer),
                date: new Date(),
                uniqueId,
                filename,
                size: buffer.byteLength,
                type: info.ext,
                mime: info.mime
            });	
            // TODO: Setup prop variable to indicate image path
            const savingImgPath = './img/'+filename;
            const savingThumbnailPath = './thumb/'+uniqueId+'.jpg';
            fs.writeFile(savingImgPath, buffer, 'binary', function(){
                // Try to save thumbnail parallel to mongo's save
                Jimp.read(buffer, (err, image) => {
                    if(err){
                        // TODO: proper error handling for Jimp
                        throw err;
                    }   
                    image.quality(60).write(savingThumbnailPath);
                });
                source.save(function(err, source){
                    if(err){
                        approve(Tools.result(null, Tools.STATUS.FAILURE, err));
                        return
                    }                    
                    approve(Tools.result(source, Tools.STATUS.SUCCESS)); 
                });
            });
        })
    },
    // img: ;
};

module.exports = Module;