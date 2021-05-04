const secret = require('./secret')

module.exports = {
    app_id: 'moauth',
    app_secret: secret.app_secret,
    HASHSALT: secret.HASHSALT,
    SESSION_SECRET: secret.SESSION_SECRET,
    basic: secret.basic
}