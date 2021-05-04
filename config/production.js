const secret = require('./secret.js')
require('dotenv').config()

module.exports = {
    serveport: process.env.PRODUCTION_PORT,
    mongo_connect: {
        authflg: true,
        ...secret.mongo_connect,
    },
    mongo_dbname: 'moauth'
}