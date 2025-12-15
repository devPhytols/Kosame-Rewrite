const { Client, Collection } = require('discord.js');
const { readdirSync } = require('node:fs');
const { setTimeout } = require('timers/promises');
const { Logger, Util } = require('./Utils/Util.js');
const { clientModel, commandModel, guildModel, userModel } = require('./Database/Schemas/index.js');

module.exports = class Kosame extends Client {
    constructor(options) {
        super(options);
        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.developers = ['429679606946201600', '236651138747727872'];
        this.team = ['848662735357083698', '1003080753384542248', '1215657370538086440', '1348133269522350110'];
        this.logger = new Logger();
        this.util = new Util();
        this.gwCache = [];
        this.database = {
            client: clientModel,
            guilds: guildModel,
            users: userModel,
            command: commandModel
        };
    }

    initialize() {
        this.initDB();
        this.loadEvents();
        this.loadCommands();
        setTimeout(1000 * 3);
        super.login(process.env.CLIENT_TOKEN);

        process.on('uncaughtException', err => this.logger.error(err.stack, 'uncaughtException'));
        process.on('unhandledRejection', err => {
            // Ignora "Unknown Interaction"
            if (err?.code === 10062) return;
            // Ignora "Unknown Message"
            if (err?.code === 10008) return;
            // Ignora erro de permissão
            if (err?.code === 50013) return;
            this.logger.error(err.stack || err, 'unhandledRejection');
        });
    }

    loadEvents() {
        const eventFiles = readdirSync('./src/Events').filter((file) => file.endsWith('.js'));

        eventFiles.forEach((file) => {
            const event = new (require(`./Events/${file}`))(this);

            if (event.once) {
                this.once(event.name, (...args) => event.execute(...args));
            } else {
                this.on(event.name, (...args) => event.execute(...args));
            }
        });

        this.logger.info('Events loaded successfully.', 'Events');
    }

    loadCommands() {
        const commandFolders = readdirSync('./src/Commands');

        commandFolders.forEach((folder) => {
            const commandFiles = readdirSync(`./src/Commands/${folder}`).filter((file) => file.endsWith('.js'));
            commandFiles.forEach((file) => {
                const command = new (require(`./Commands/${folder}/${file}`))(this);

                if (!command.interactionOnly) {
                    this.commands.set(command.name, command);
                }
            });
        });

        this.logger.info('Commands loaded successfully.', 'Commands');
    }

    initDB() {
        new (require('./Database/index.js'))(this).initialize();
    }

    /**
     *
     * @param {Snowflake} id
     * @param {string} type
     * @returns
     */
    async getData(id, type) {
        switch (type) {
            case 'user': {
                let data = await this.database.users.findOne({ idU: id });

                if (!data) {
                    data = await this.database.users.create({ idU: id });
                }

                return data;
            }
            case 'guild': {
                let data = await this.database.guilds.findOne({ idS: id });

                if (!data) {
                    data = await this.database.guilds.create({ idS: id });
                }

                return data;
            }
            case 'client': {
                let data = await this.database.client.findOne({ _id: id });

                if (!data) {
                    data = await this.database.client.create({ _id: id });
                }

                return data;
            }
            case 'command': {
                let data = await this.database?.command?.findOne({ _id: id });

                if (!data) {
                    data = await this.database?.command?.create({ _id: id });
                    console.log(`O comando: (${data._id}) teve a sua documentação criada com sucesso!`);
                }

                return data;
            }
            default: {
                throw new Error(`Tipo de dado incorreto: ${type}`);
            }
        }
    }
};
