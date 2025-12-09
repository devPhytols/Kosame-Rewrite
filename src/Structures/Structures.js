class Command {
    constructor(client) {
        this.client = client;

        this.name = '';
        this.type = 1;
        this.description = '';
        this.cooldown = null;
        this.category = 'jaskasdas';
        this.usage = '';
        this.aliases = [];

        this.config = {
            registerSlash: false,
            giveXp : false
        };
    }
}

class Event {
    constructor(client) {
        this.client = client;

        this.name = '';
        this.once = false;
    }

    execute(...args) {
        return { args };
    }
}

module.exports = { Command, Event };
