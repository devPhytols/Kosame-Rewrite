const { GatewayIntentBits, Partials, Sweepers } = require('discord.js');

new (require('../src/KosameClient'))({
    restTimeOffset: 0,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ],
    allowedMentions: {
        parse: ['users'],
        repliedUser: true
    },
    cacheWithLimits: {
        MessageManager: {
            sweepInterval: 300,
            sweepFilter: Sweepers.filterByLifetime({
                lifetime: 60,
                getComparisonTimestamp: (m) => m.editedTimestamp ?? m.createdTimestamp
            })
        }
    }
}).initialize();