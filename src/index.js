const Tools = require('./Tools/Tools');
const API = require('./API/API');
const DB = require('./Tools/DB');

const UserModule = require('./Module/User');
const PersonaModule = require('./Module/Persona');
const ChannelModule = require('./Module/Channel');
const ContentModule = require('./Module/Content');
const fs = require("fs");

const fill = async function(){
    await Tools.dropDatabase();
    const user = await UserModule.create('test@gmail.com', '12345678', UserModule.USERLEVEL.ADMIN);
    const persona = await PersonaModule.create(user.first(), 'lash');
    const channel = await ChannelModule.create(persona.first(), 'test', 'test channel');
    fs.readFile('./img.png', function(err, result){

        for(let i = 0; i < 500; ++i){
            let many = Math.round(10 * Math.random());
            if(many < 1) many = 1;
            const sources = [];
            for(let x = 0; x < many; ++x){
                sources.push(result);
            }
            ContentModule.create(channel.first(), persona.first(), sources, 'Title Test', false);
        }
        
    });   

};


const pixi = async function(){
    Tools.log('Starting PIXI...');
    await API.init();
    await DB.init();
    
    // await fill();
    // DB.dropDatabase();

    // const user = await UserModule.create('test@gmail.com', '12345678', UserModule.USERLEVEL.ADMIN);
    
    // const _user = await UserModule.get({email:'test@gmail.com'}, ["personas"], []);
    // console.log(_user.first());
};

pixi();