// index.js (db)
const { connection, connect, set } = require('mongoose');

module.exports = class dbConnection {
    constructor(client) {
        this.client = client;
    }

    initialize() {
        try {
            set('strictQuery', false);

            connect(process.env.DATABASE_CONNECT, {
                keepAlive: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                keepAliveInitialDelay: 300000
            });

            connection.on('error', (err) => {
                this.client.logger.error(err.stack, 'Database');
            });

            connection.once('open', () => {
                this.client.logger.info('Database loaded successfully.', 'Database');
            });

        } catch (err) {
            this.client.logger.error(err.message, dbConnection.name);
            return this.client.logger.warn(err.stack, dbConnection.name);
        }
    }
};