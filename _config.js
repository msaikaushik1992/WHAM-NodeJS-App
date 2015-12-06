var config = {};

config.mongoURI = {
    development: process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/Wam',
    test: 'mongodb://localhost/node-test'
};


/*config.mongoURI = {
    development: process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/node-test',
};*/

module.exports = config;
