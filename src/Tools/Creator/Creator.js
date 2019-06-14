const Tools = require('../Tools')
const UserModule = require('../../Module/User');
const PersonaModule = require('../../Module/Persona');
const fs = require("fs");

//
// Creator is used to setup pixi with default data for testing
//


const start = async function(){
    
    Tools.log("Setting up pixi with default data...");
    const users = [];

    // Clear DB
    Tools.dropDatabase();

    const createUserAndPersona = async function(name){
        const user = await UserModule.create(name+'@pixi.com', '1234', UserModule.USERLEVEL.USER);
        const persona = await PersonaModule.create(user, name);
        users.push({
            user,
            persona
        });
    };

    // Create users
    const contents = JSON.parse(fs.readFileSync("src/Tools/Creator/names.json"));
    for(let i = 0; i < 500; ++i){
        const name = contents[Math.round(contents.length * Math.random())].toLowerCase();
        createUserAndPersona(name);
    }
};

const main = async function(){
    const channel = await ChannelModule.get({name: 'misc'}); 
    const persona =  await PersonaModule.get({nick: 'pepper'}); 
    const source = await SourceModule.get({uniqueId:'3QzNokOpA'});

    const content = await ContentModule.create(channel.first(), persona.first(), source.first(), 'Test', true);
    console.log(content);
};

const createUser = async function(){
    const user = await UserModule.create('', '', UserModule.USERLEVEL.ADMIN);
    console.log(user);
};

const createPersona = async function(){
    const user = await UserModule.get({email:''});
    const persona = await PersonaModule.create(user.first(), 'pepper');
    console.log(persona);
};

const createChannel = async function(){
    const persona = await PersonaModule.get({nick:'Anonymous'});
    const channel = await ChannelModule.create(persona.first(), 'misc', 'For miscellaneous content');
    console.log(channel);
};

const createSource = async function(){
    await fs.readFile('./img.png', function(err, result){
        const source = SourceModule.create(result);
        console.log(source)
    });    
}

// // createSource()
// createUser();
// // createPersona()
// // createChannel();
// // main()

module.exports = {
    start
};

const createUser = async function(){
    const user = await UserModule.create('italrr@gmail.com', '', UserModule.USERLEVEL.ADMIN);
    console.log(user);
};

const createPersona = async function(){
    const user = await UserModule.get({email:'italrr@gmail.com'});
    const persona = await PersonaModule.create(user.first(), 'pepper');
    console.log(persona);
};

const createChannel = async function(){
    const persona = await PersonaModule.get({nick:'Anonymous'});
    const channel = await ChannelModule.create(persona.first(), 'misc', 'For miscellaneous content');
    console.log(channel);
};
