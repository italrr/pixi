const dateFormat = require('dateformat');

const Log = {
    log: function(msg) {
        console.log("["+dateFormat(new Date(), "h:MM:ss TT")+"] " + msg);
    }
};

module.exports = Log;