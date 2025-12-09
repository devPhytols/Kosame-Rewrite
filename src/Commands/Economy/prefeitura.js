const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Util } = require('../../Utils/Util');

module.exports = class PrefectureCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'prefeitura';
        this.description = 'Compre itens ou pague suas dívidas com a prefeitura.';
        this.aliases = ['prefecture'];
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message }) {

        const user = await this.client.database.users.findOne({ idU: message.author.id });

        if (user.blockpay)
            return message.reply('Aguarde para utilizar este comando novamente...');

        if (user.blockbet)
            return message.reply('Aguarde para utilizar este comando novamente...');

        const valorPorte = 300000; //300k
        const valorColete = 150000; // 150k 1M 500k
        const valorFaca = 30000; // 30k
        const valorFuzil = 250000; // 250k
        const valorPistola = 80000; // 80k
        const valorMulta = user.crime.valorMultas; // Valor das Multas
        const totalMultas = valorMulta;

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Selecione um Item')
                    .addOptions([{
                        label: 'Pagar Multas',
                        emoji: '<:cash:844363122860359680>',
                        description: 'Pague todas as suas multas por crimes!',
                        value: 'pagaMultas'
                    },
                    {
                        label: 'Porte de Armas',
                        emoji: '<:portearmas:1010934212720852992>',
                        description: 'Compre o porte de armas para realizar roubos!',
                        value: 'porteArmas'
                    },
                    {
                        label: 'Comprar Colete',
                        emoji: '<:coletek:1010977514304323605>',
                        description: 'Compre seu colete e aumente suas chances!',
                        value: 'compraColete'
                    },
                    {
                        label: 'Comprar Armas',
                        emoji: '<:pistola:1010973290128474112>',
                        description: 'Compre uma arma para realizar suas ações!',
                        value: 'compraArmas'
                    }
                    ])
            );

        const rowMultas = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Confirme o seu Pagamento')
                    .addOptions([{
                        label: 'Desejo pagar as Multas',
                        emoji: '<:kosame_Correct:1010978511839842385>',
                        value: 'confirmmultas'
                    },
                    {
                        label: 'Cancelar o Pagamento',
                        emoji: '<:kosame_wrong:1010978512825495613>',
                        value: 'cancelmultas'
                    },
                    {
                        label: 'Voltar ao Menu',
                        emoji: '<:ksvoltar:1025467373634998273>',
                        value: 'voltamenu'
                    }
                    ])
            );

        const rowPorte = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Confirme o seu Pagamento')
                    .addOptions([{
                        label: 'Desejo comprar o Porte',
                        emoji: '<:kosame_Correct:1010978511839842385>',
                        value: 'confirmporte'
                    },
                    {
                        label: 'Cancelar o Pagamento',
                        emoji: '<:kosame_wrong:1010978512825495613>',
                        value: 'cancelporte'
                    },
                    {
                        label: 'Voltar ao Menu',
                        emoji: '<:ksvoltar:1025467373634998273>',
                        value: 'voltamenu'
                    }
                    ])
            );

        const rowColete = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Confirme o seu Pagamento')
                    .addOptions([{
                        label: 'Desejo comprar o Colete',
                        emoji: '<:kosame_Correct:1010978511839842385>',
                        value: 'confirmcolete'
                    },
                    {
                        label: 'Cancelar o Pagamento',
                        emoji: '<:kosame_wrong:1010978512825495613>',
                        value: 'cancelcolete'
                    },
                    {
                        label: 'Voltar ao Menu',
                        emoji: '<:ksvoltar:1025467373634998273>',
                        value: 'voltamenu'
                    }
                    ])
            );

        const rowArmas = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Confirme a sua Arma')
                    .addOptions([{
                        label: 'Comprar Faca',
                        emoji: '<:faca:1010973285493776456>',
                        value: 'comprafaca'
                    },
                    {
                        label: 'Comprar Pistola',
                        emoji: '<:pistola:1010973290128474112>',
                        value: 'comprapistola'
                    },
                    {
                        label: 'Comprar Fuzil',
                        emoji: '<:fuzil:1010973288278806558>',
                        value: 'comprafuzil'
                    },
                    {
                        label: 'Cancelar a compra',
                        emoji: '<:kosame_wrong:1010978512825495613>',
                        value: 'cancelbuyarm'
                    },
                    {
                        label: 'Voltar ao Menu',
                        emoji: '<:ksvoltar:1025467373634998273>',
                        value: 'voltamenu'
                    }
                    ])
            );

        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({ name: 'Prefeitura da Kosame', iconURL: this.client.user.displayAvatarURL({ size: 2048 })})
            .setThumbnail('https://cdn.discordapp.com/attachments/1015096472599011418/1015098918998118421/prefeitura1.png')
            .setDescription('Seja bem vindo(a) a prefeitura da Kosame, aqui você poderá comprar todos os itens necessários para se tornar um de nossos cidadões, abaixo você poderá conferir os produtos disponíveis no momento para compra, basta selecionar e encontrará os valores do produto.\n\n<:correct:904079393645822003> Selecione o item desejado abaixo!');

        const embedPorte = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({ name: 'Comprar Porte de Armas', iconURL: this.client.user.displayAvatarURL({ size: 2048 }) })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015096472599011418/1015098919195267122/prefeitura2.png')
            .setDescription(`Olá ${message.author}, vejo que você deseja comprar o seu porte de armas, confira abaixo o valor para o pagamento de seu porte de armas.\n\n<:arrow_k:894641838550552676> O porte de armas te dá direito a roubar outros usuários que contenham dinheiro em mãos. Sem o porte de armas, não é possível roubar outros usuários.\n<:arrow_k:894641838550552676> Vale lembrar que caso acumule muitas multas o seu porte será bloqueado!\n\n<:arrow_k:894641838550552676>Valor do Porte: **${Util.toAbbrev(valorPorte)}** \n\n<:correct:904079393645822003> *Compre o seu porte confirmando no menu abaixo!*`);

        const embedMultas = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({ name: 'Pagamento de Multas', iconURL: this.client.user.displayAvatarURL({ size: 2048 }) })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015096472599011418/1015098919409156117/prefeitura3.png')
            .setDescription(`Olá ${message.author}, vejo que você deseja pagar as suas dívidas com a Prefeitura, confira abaixo o valor para o pagamento de suas multas.\n\n<:arrow_k:894641838550552676> Você deve **${Util.toAbbrev(valorMulta)} Coins** para a prefeitura!\n\n<:correct:904079393645822003> *Pague suas multas confirmando no menu abaixo!*`);

        const embedColete = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({ name: 'Compra de Colete', iconURL: this.client.user.displayAvatarURL({ size: 2048 }) })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015096472599011418/1015098919618875392/prefeitura4.png')
            .setDescription(`Olá ${message.author}, vejo que você deseja adquirir um colete para realizar ações, confira abaixo o valor para adquirir um colete a prova de balas.\n\n<:arrow_k:894641838550552676> Na compra do colete, você aumenta a chance de sucesso no roubo e crime.\n\n<:arrow_k:894641838550552676>Valor do Colete: **${Util.toAbbrev(valorColete)}**\n\n<:correct:904079393645822003> *Compre o seu colete confirmando no menu abaixo!*`);

        const embedLojaArmas = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({ name: 'Compre sua Arma', iconURL: this.client.user.displayAvatarURL({ size: 2048 }) })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015096472599011418/1015098919878938685/prefeitura5.png')
            .setDescription(`Olá ${message.author}, vejo que você deseja adquirir uma arma para realizar ações, porém você precisa comprar o **porte de armas** primeiro, caso tenha comprado, só seguir adiante. Confira abaixo o valor para adquirir uma arma de sua preferência.\n\n<:arrow_k:894641838550552676> Na compra de armas, você aumenta a chance de sucesso no roubo e crime.\n<:arrow_k:894641838550552676> Na compra da faca, você aumenta a chance de sucesso no roubo e crime.\n\n<:fuzil:1010973288278806558> Fuzil - ***250K Coins***\n\n<:pistola:1010973290128474112> Pistola - ***80K Coins***\n\n<:faca:1010973285493776456> Faca - ***30K Coins***\n\n<:correct:904079393645822003> *Compre a sua arma selecionando no menu abaixo!*`);

        const msg = await message.reply({ embeds: [embed], components: [row], fetchReply: true });
        const doc = await this.client.database.users.findOne({ idU: message.author.id });
        const filter = (i) => {
            return i.isStringSelectMenu() && i.message.id === msg.id;
        };
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('end', async() => {
			doc.blockpay = false;
			doc.blockbet = false;
            doc.save();
				
            msg.delete();
        });

        collector.on('collect', async (collected) => {
            const value = collected.values[0];
			
			if (collected.user.id !== message.author.id) {
                return collected.reply({ content: `Eiii ${collected.user}, essa compra não pertence a você!. 👀`, ephemeral: true });
            }

            if (user.blockpay) {
                return collected.reply({ content: `Eiii ${collected.user}, você está com uma transação em andamento!. 👀`, ephemeral: true });
            }

            if (user.blockbet) {
                return collected.reply({ content: `Eiii ${collected.user}, você está com uma transação em andamento!. 👀`, ephemeral: true });
            }

            if (value === 'porteArmas') {
                collected.update({ 
                    embeds: [embedPorte], 
                    components: [rowPorte] 
                });
            } else if (value === 'pagaMultas') {
                collected.update({
                    embeds: [embedMultas], 
                    components: [rowMultas] 
                });
            } else if (value === 'compraColete') {
                collected.update({ 
                    embeds: [embedColete], 
                    components: [rowColete] 
                });
            } else if (value === 'compraArmas') {
                collected.update({ 
                    embeds: [embedLojaArmas], 
                    components: [rowArmas] 
                });
            } else if (value === 'confirmcolete') {   
                if (user.arsenal.hasColete) {
                    collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você já possui um colete a prova de balas!', 
                        embeds: [], 
                        components: [] 
                    });
					
					await this.client.database.users.findOneAndUpdate({
						idU: message.author.id
						}, {
						$set: {
							blockpay: false,
							blockbet: false
						}
					});
                } else if (user.bank < 150000) {
                    collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você não possui dinheiro suficiente para comprar o colete a prova de balas!', 
                        embeds: [], 
                        components: [] 
                    });
					
					await this.client.database.users.findOneAndUpdate({
						idU: message.author.id
						}, {
						$set: {
							blockpay: false,
							blockbet: false
						}
					});
                } else {
                    collected.update({ 
                        content: '<:kosame_Correct:1010978511839842385> Você concluiu a compra de seu colete, use **k!inventario** para conferir o que você tem.', 
                        embeds: [], 
                        components: [] 
                    });

					doc.blockpay = false;
					doc.blockbet = false;
                    doc.arsenal.hasColete = true;
                    doc.bank = doc.bank - valorColete;
                    doc.save();
                }
            } else if (value === 'cancelcolete') {
                collected.update({ 
                    content: '<:kosame_wrong:1010978512825495613> Você cancelou a compra do colete a prova de balas!', 
                    embeds: [], 
                    components: [] 
                });
				
				doc.blockpay = false;
				doc.blockbet = false;
                doc.save();
				
            } else if (value === 'confirmporte') {
				
				await this.client.database.users.findOneAndUpdate({
					idU: message.author.id
					}, {
					$set: {
						blockpay: false,
						blockbet: false
					}
				});
				
                if (user.portearmas)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você já possui um porte de armas!', 
                        embeds: [], 
                        components: [] 
                    });
                    
                if (user.bank < valorPorte)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você não possui dinheiro suficiente para comprar o porte de armas!', 
                        embeds: [], 
                        components: [] 
                    });

                doc.bank = doc.bank - valorPorte;
                doc.save();

                collected.update({ 
                    content: '<:kosame_Correct:1010978511839842385> Parabéns, você adquiriu o seu porte de armas!', 
                    embeds: [], 
                    components: [] 
                });

                await this.client.database.users.findOneAndUpdate({
                    idU: message.author.id
                }, {
                    $set: {
                        portearmas: true
                    }
                });
            } else if (value === 'cancelporte') { 
                collected.update({ 
                    content: '<:kosame_wrong:1010978512825495613> Você cancelou o pagamento do porte!', 
                    embeds: [], 
                    components: [] 
                });
				
				doc.blockpay = false;
				doc.blockbet = false;
                doc.save();
				
            } else if (value === 'confirmmultas') {
                const userm = await this.client.database.users.findOne({ idU: message.author.id });
                const banco = userm.bank;

				await this.client.database.users.findOneAndUpdate({
					idU: message.author.id
					}, {
					$set: {
						blockpay: false,
						blockbet: false
					}
				});
				
                if (banco < totalMultas)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você não possui dinheiro suficiente para pagar a multa!', 
                        embeds: [], 
                        components: [] 
                    });
                    
                if (userm.multas <= 0)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você não possui multas para pagar!', 
                        embeds: [], 
                        components: [] 
                    });

                collected.update({ 
                    content: '<:kosame_Correct:1010978511839842385> Parabéns, você pagou todas as suas multas!', 
                    embeds: [], 
                    components: [] 
                });

                userm.bank = banco - valorMulta;
                userm.crime.valorMultas = 0;
                userm.multas = 0;
                userm.save();
				
            } else if (value === 'cancelmultas') {
                collected.update({ 
                    content: '<:kosame_wrong:1010978512825495613> Você cancelou o pagamento das multas!', 
                    embeds: [], 
                    components: [] 
                });
				
				doc.blockpay = false;
				doc.blockbet = false;
                doc.save();
				
            } else if (value === 'comprafaca') {
                const userF = await this.client.database.users.findOne({ idU: message.author.id });
                const bancoF = userF.bank;

				await this.client.database.users.findOneAndUpdate({
					idU: message.author.id
					}, {
					$set: {
						blockpay: false,
						blockbet: false
					}
				});
				
                if (userF.arsenal.hasFaca)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você já possui uma faca!', 
                        embeds: [], 
                        components: []
                    });

                if (bancoF < valorFaca)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você não possui dinheiro suficiente para comprar uma faca!', 
                        embeds: [], 
                        components: [] 
                    });

                collected.update({ 
                    content: '<:kosame_Correct:1010978511839842385> Você concluiu a compra de sua faca, use **k!inventario** para conferir o que você tem.', 
                    embeds: [], 
                    components: [] 
                });

                userF.arsenal.hasFaca = true;
                userF.bank = userF.bank - valorFaca;
                userF.save();

            } else if (value === 'comprapistola') {
                const userP = await this.client.database.users.findOne({ idU: message.author.id });
                const bancoP = userP.bank;
				
				await this.client.database.users.findOneAndUpdate({
					idU: message.author.id
					}, {
					$set: {
						blockpay: false,
						blockbet: false
					}
				});
                    
                if (!userP.portearmas)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você precisa do porte de armas!', 
                        embeds: [], 
                        components: [] 
                    });

                if (userP.arsenal.hasPistola)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você já possui uma pistola!', 
                        embeds: [], 
                        components: [] 
                    });

                if (bancoP < valorPistola)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você não possui dinheiro suficiente para comprar uma pistola!', 
                        embeds: [], 
                        components: [] 
                    });

                collected.update({ 
                    content: '<:kosame_Correct:1010978511839842385> Você concluiu a compra de sua pistola, use **k!inventario** para conferir o que você tem.', 
                    embeds: [], 
                    components: [] 
                });

                userP.arsenal.hasPistola = true;
                userP.bank = userP.bank - valorPistola;
                userP.save();
				
            } else if (value === 'comprafuzil') {
                const userFz = await this.client.database.users.findOne({ idU: message.author.id });
                const bancoFz = userFz.bank;
				
				await this.client.database.users.findOneAndUpdate({
					idU: message.author.id
					}, {
					$set: {
						blockpay: false,
						blockbet: false
					}
				});

                if (!userFz.portearmas)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você precisa do porte de armas!', 
                        embeds: [], 
                        components: [] 
                    });
                    
                if (userFz.arsenal.hasFuzil)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você já possui um fuzil!', 
                        embeds: [], 
                        components: [] 
                    });

                if (bancoFz < valorFuzil)
                    return collected.update({ 
                        content: '<:kosame_wrong:1010978512825495613> Você não possui dinheiro suficiente para comprar um fuzil!', 
                        embeds: [], 
                        components: [] 
                    });


                collected.update({ 
                    content: '<:kosame_Correct:1010978511839842385> Você concluiu a compra de seu fuzil, use **k!inventario** para conferir o que você tem.', 
                    embeds: [], 
                    components: [] 
                });

                userFz.arsenal.hasFuzil = true;
                userFz.bank = userFz.bank - valorFuzil;
                userFz.save();

            } else if (value === 'cancelbuyarm') {
                collected.update({ 
                    content: '<:kosame_wrong:1010978512825495613> Você cancelou a sua compra de armas.', 
                    embeds: [], 
                    components: [] 
                });
				
				doc.blockpay = false;
				doc.blockbet = false;
                doc.save();
            } else if (value === 'voltamenu') {
                collected.update({ 
                    embeds: [embed], 
                    components: [row] 
                });
            }
        });
    }
};