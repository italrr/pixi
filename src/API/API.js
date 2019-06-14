

const express = require('express');
const bodyParser = require("body-parser");
const Endpoints = require('./Endpoints');
const Tools = require('../Tools/Tools');
const morgan = require("morgan");
const AuthController = require('./Controller/Auth');
const UserController = require('./Controller/User');
const ChannelController = require('./Controller/Channel');
const ContentController = require('./Controller/Content');
const PersonaController = require('./Controller/Persona');
const SourceController = require('./Controller/Source');
const UserModule = require('../Module/User');
const Pixi = require('../Pixi');
const jwt = require('jsonwebtoken');


const app = express();
const API_VERSION = 'v1';
const API_PORT = 8080;
let server = null
const endpoints = [];

const METHOD_TYPE = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
};

const register = function(url, method, methodref){
    const getEndpoint = function(){
        switch(method){
            case METHOD_TYPE.GET:
                return app.get(url, methodref);
            case METHOD_TYPE.POST:
                return app.post(url, methodref);         
            case METHOD_TYPE.PUT:
                return app.put(url, methodref);
            case METHOD_TYPE.DELETE:
                return app.delete(url, methodref)                                
            default:
                Tools.print('Failed to register method '+method);
                return null;
        }
    };
    endpoints.push({
        ref: getEndpoint(),
        url,
        method
    })
};

const registerEndpoints = async function(){
    // AUTH
    register(Endpoints.Auth.login, 'POST', AuthController.login);
    register(Endpoints.Auth.logout, 'POST', AuthController.logout);
    register(Endpoints.Auth.register, 'POST', AuthController.register);
    register(Endpoints.Auth.renew, 'POST', AuthController.renew);
    // USER
    register(Endpoints.User.create, 'POST', UserController.create);
    register(Endpoints.User.get, 'GET', UserController.get);
    // PERSONA
    register(Endpoints.Persona.create, 'POST', PersonaController.create);
    register(Endpoints.Persona.get, 'GET', PersonaController.get);
    // CHANNEL
    register(Endpoints.Channel.create, 'POST', ChannelController.create);
    register(Endpoints.Channel.get, 'GET', ChannelController.get);        
    // CONTENT
    register(Endpoints.Content.create, 'POST', ContentController.create);
    register(Endpoints.Content.get, 'GET', ContentController.get); 
    // SOURCE
    register(Endpoints.Source.img, 'GET', SourceController.img);
    register(Endpoints.Source.thumb, 'GET', SourceController.thumb);
    register(Endpoints.Source.i, 'GET', SourceController.img);
    register(Endpoints.Source.t, 'GET', SourceController.thumb);    
    Tools.log('API: registered '+endpoints.length+' endpoints');
}

const auth = function(req, res, next){
	const token = req.body.token || req.query.token || req.headers["x-access-token"];
 	if(!token){
		next();
		return;
	}	
	jwt.verify(token, Pixi.CORE.AUTH_SECRET, function(err, decoded) {
		if (err) {
			next();	
			return;
		} 
        const uniqueId = decoded.uniqueId;	
        UserModule.get({uniqueId}, ["personas"]).then(function(user){
            if(user.status == Tools.STATUS.FAILURE){
                res.status(401).send('Expired token');
                return;
            }
            req['user'] = user.first();
            next();
        });
	});
};

const setup = async function(){
    app.use(bodyParser.json({limit: '12mb'}));
    app.use(bodyParser.urlencoded({limit: '12mb', extended: false}));
    app.use(auth);
    // app.use(express.static(path.resolve(process.cwd() + "/" + pixi.core.uipath)));
    app.use(morgan("dev"));
};

const init = async function(){
    Tools.log('API version '+API_VERSION);
    await setup();
    await registerEndpoints();
    server = await app.listen(API_PORT, function () {
        Tools.log('Listening at PORT '+API_PORT);
    });
};

module.exports = {
    METHOD_TYPE,
    init
};

