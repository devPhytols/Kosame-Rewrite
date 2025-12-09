const { ClientEmbed } = require('../Structures/ClientEmbed');
const { WebhookClient } = require('discord.js');
const {type} = require('../Utils/Objects/vipTypes.js');

module.exports = class vipModule {
    constructor(client) {
        this.client = client;
    }

    execute() {
        try {
            //this.VipChecker();
            //this.VipUpgradeChecker(); // Módulo que verifica a se o usuário possúi mais de 3 meses de VIP.
        } catch (err) {
            this.client.logger.error(err.message, vipModule.name);
            return this.client.logger.warn(err.stack, vipModule.name);
        }
    }


    VipChecker() {
        setInterval(async () => {
            const listVips = await require('mongoose').connection.collection('users').find({ 'vip.date': { $gt: 1 } }).toArray();
            const filterVips = Object.entries(listVips).filter(([, x]) => x.vip.date <= Date.now());
            const VIPS = filterVips.map(([, x]) => x.idU);

            await this.VipVerify(VIPS);
        }, 1000 * 60 * 10); // 10 minutos;
    }

    /*
    VipUpgradeChecker() {
        setInterval(async () => {
            const cooldown = 1000 * 60 * 60 * 24 * 30 * 3; // Cooldown de 3 meses;
            const list = await this.client.database.users.find({ 'vip.date': { $gt: 1 } }); // Procura usuários que sejam VIPS no banco de dados;

            switch (true) {
                case (Object.entries(list).filter(([, x]) => ((cooldown * 2) - (Date.now() - x.vip.cooldown)) < 0 && x.vip.upgrade === 2).length > 0): { // 6 meses (3.0):
                    const filterArray = Object.entries(list).filter(([, x]) => ((cooldown * 2) - (Date.now() - x.vip.cooldown)) < 0); // Filtra por usuários que tenham mais de 6 meses de VIP;
                    const vipsArray = filterArray.map(([, x]) => x.idU); // Mapeia a array de usuários vips exibindo o ID;

                    await this.VipUpgrade(vipsArray); // Carrega a função vipUpgrade cujo parâmetro é a array de usuários VIP;
                } break;
                case (Object.entries(list).filter(([, x]) => ((cooldown) - (Date.now() - x.vip.cooldown)) < 0 && x.vip.upgrade === 1).length > 0): { // 3 meses (2.0):
                    const filterArray = Object.entries(list).filter(([, x]) => ((cooldown) - (Date.now() - x.vip.cooldown)) < 0); // Filtra por usuários que tenham mais de 3 meses de VIP;
                    const vipsArray = filterArray.map(([, x]) => x.idU); // Mapeia a array de usuários vips exibindo o ID;

                    await this.VipUpgrade(vipsArray); // Carrega a função vipUpgrade cujo parâmetro é a array de usuários VIP;
                } break;
            }
        }, 1000 * 60 * 1); // 10 minutos (Mesmo intervalo do módulo que retira o VIP);
    }

    VipUpgrade(vips) {
        let vipSize = vips.length; // Quantos usuários VIP contém na array;
        let i = 0; // Operador sufixo para incremento;

        const interval = setInterval(async () => {
            if (vipSize <= 0) {
                clearInterval(interval); // Para o setInterval caso a array esteja vazia;
            } else {
                const id = vips[i++]; // Pega um ID da array;
                const user = await this.client.users.fetch(id).catch(() => { }); // Procura o usuário que o ID foi pego da array;

                if (user) {
                    const doc = await this.client.database.users.findOne({ idU: user.id }); // Procura o usuário no banco de dados;

                    if (doc.vip.upgrade === 2) {
                        doc.set({
                            'vip.cooldown': Date.now(),
                            'vip.upgrade': 3 // Adiciona o upgrade ao usuário:
                        }).save();

                        clearInterval(interval);
                        this.client.logger.info(`Atualizado VIP de ${user.tag} para ${doc.vip.upgrade}`, 'VIP');
                    }

                    if (doc.vip.upgrade === 1) {
                        doc.set({
                            'vip.cooldown': Date.now(),
                            'vip.upgrade': 2 // Adiciona o upgrade ao usuário:
                        }).save();

                        clearInterval(interval);
                        this.client.logger.info(`Atualizado VIP de ${user.tag} para ${doc.vip.upgrade}`, 'VIP');
                    }
                    //===========> Webhook:

                    const webhook = new WebhookClient({ url: 'https://ptb.discord.com/api/webhooks/1113147148247240836/ZOtLKA25LrjR4HlEtrOvlLr15WV5nr5c5X_p05NRyhf5BRchLYFsoiDd02cZ7yxffH1o' });

                    const wbEmbed = new ClientEmbed()
                        .setThumbnail(user.displayAvatarURL({ extension: 'png', size: 4096 }))
                        .setAuthor({ name: 'Atualização de VIP!', iconURL: user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(`O usuário \`${user.tag}\` \`(${user.id})\` teve o seu VIP atualizado para o \`${type[doc.vip.upgrade].name}\`.`);

                    return webhook.send({ embeds: [wbEmbed] }); // Envia um webhook informativo para o canal especificado informando que usuário teve o seu VIP atualizado.
                }
            }
            vipSize--;
        }, 1000 * 20); // Intervalo de 20 segundos (Aqui a instância pode ser pequena pois vai só atualizar os usuários da array);
    }
    */

    VipVerify(vips) {
        let vipSize = vips.length;
        let i = 0;

        const interval = setInterval(async () => {
            if (vipSize <= 0) {
                clearInterval(interval);
            } else {
                const memberVip = vips[i++];
                const user = await this.client.users.fetch(memberVip);
                const doc = await this.client.database.users.findOne({ idU: user.id });

                doc.set({
                    'vip.hasVip': false,
                    'vip.date': 0,
                    'vip.cooldown': 0,
                    'vip.upgrade': 1
                }).save();

                this.client.logger.info(`Removido VIP de ${user.tag}`, 'VIP');
                /*
                const webhook = new WebhookClient({ url: 'https://ptb.discord.com/api/webhooks/1050594182059802655/C0G1zoJJHcZFmx94nnfMqlNBTY4S8UP_yO5GwEquaUvmKQSNIh-NkKx5xPCVoj2EEBm3 ' });

                const rmEmbed = new ClientEmbed()
                    .setDescription(`(Vencimento) Removido VIP de ${user.tag}.`);

                return webhook.send({ embeds: [rmEmbed] }); // Envia um webhook informativo para o canal especificado informando que usuário teve o seu VIP removido.
                */
            }
            vipSize--;
        }, 1000 * 60 * 5); // 5 minutos;
    }
};
