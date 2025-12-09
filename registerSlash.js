const { REST, Routes } = require('discord.js');
const { readdirSync } = require('node:fs');

// npm run register

//===============> Pegando todos os comandos das pastas <===============//
const applications = [];

// Interaction: 
const commandFolders = readdirSync('./src/Commands');
for (const folder of commandFolders) {
    const commandFiles = readdirSync(`./src/Commands/${folder}`).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = new (require(`./src/Commands/${folder}/${file}`))(this);

        if (command.config.registerSlash) {
            applications.push(command);
        }
    }
}

//===============> Atualizações dos comandos de barra <===============//

const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

(async () => {
    try {
        console.clear();
        console.log(`Atualizando ${applications.length} comando(s) de aplicação (/).`);

        const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: applications });

        console.log(`Atualizado com sucesso ${data.length} comando(s) de aplicação (/)!`);
    } catch (error) {
        console.error(error);
    }
})();