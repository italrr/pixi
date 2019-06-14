
const baseUrl = '/api/v1';

const Endpoints = {
    User: {
        create: `${baseUrl}/user/create`,
        get: `${baseUrl}/user/get`,
    }, 
    Channel: {
        create: `${baseUrl}/channel/create`,
        get: `${baseUrl}/channel/get`,
    },
    Persona: {
        create: `${baseUrl}/persona/create`,
        get: `${baseUrl}/persona/get`,
    },
    Content: {
        create: `${baseUrl}/content/create`,
        get: `${baseUrl}/content/get`,
    },    
    Source: {
        create: `${baseUrl}/source/create`,
        get: `${baseUrl}/source/get`,
        img: `${baseUrl}/img/:id`,
        thumb: `${baseUrl}/thumb/:id`,
        i: `${baseUrl}/i/:id`,
        t: `${baseUrl}/t/:id`
    },
    Auth: {
        login: `${baseUrl}/auth/login`,
        logout: `${baseUrl}/auth/logout`,
        register: `${baseUrl}/auth/register`,
        renew: `${baseUrl}/auth/renew`,
    }               
};

module.exports = Endpoints;