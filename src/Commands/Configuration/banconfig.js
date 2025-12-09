const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class BanconfigCommand extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = 'banconfig';
    this.type = ApplicationCommandType.ChatInput;
    this.description = 'Configure o seu estilo de banimentos.';
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
  async commandExecute({ message, args }) {

    const user = await this.client.database.users.findOne({ idU: message.author.id });

    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select')
          .setPlaceholder('Selecione uma Opção')
          .addOptions([{
            label: 'Configurar Imagem',
            emoji: '<:image:1095055893202210846>',
            description: 'Defina uma imagem a ser exibida no banimento!',
            value: 'banImg'
          },
          {
            label: 'Restaurar Configurações',
            emoji: '<:reset:1095056436163268629>',
            description: 'Redefina suas configurações de banimentos!',
            value: 'banConfig'
          }
          ])
      );

    let INFO = new EmbedBuilder()
      .setColor('#ffffff')
      .setDescription(`<:kosame_msg:1095054421106368562> Bem-vindo(a) ao sistema de configurações de banimentos da Kosame, para configurar basta seguir o exemplo abaixo e aplicar conforme suas necessidades!\n\n<:kosame_settings:1095054662580850738> **Configurando a Imagem**\n> Se você optar por não definir uma imagem para seus banimentos, será utilizada a imagem padrão, porém, se optar por utilizar uma imagem personalizada, seleciona uma opção abaixo!`)
      .setFooter({ text: `Comando requisitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
      .setThumbnail(message.author.displayAvatarURL(() => ({ dynamic: true })))

    const modal = new ModalBuilder()
      .setCustomId('modalBan')
      .setTitle('Configuração de Banimento')
      .addComponents([
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('imgBan')
            .setLabel("Informe a Imagem [JPG, PNG, GIF]")
            .setMinLength(20)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      ])

    const menuMessage = await message.reply({ embeds: [INFO], components: [row], fetchReply: true });

    // Filtro para coleta da interação
    const filter = (i) => {
      return i.isStringSelectMenu() && i.message.id === menuMessage.id;
    };

    // Definindo o filtro no coletor
    const collector = menuMessage.createMessageComponentCollector({ filter, time: 10000 });

    collector.on('end', async () => {
      menuMessage.delete()
    });

    // Iniciando o coletor
    collector.on('collect', async (i) => {
      // Verifica se a interação é feita pelo autor do comando
      if (i.user.id !== message.author.id) {
        return i.reply({ content: `Eiii ${i.user}, essa interação não é sua! 👀`, ephemeral: true });
      }
      // Verifica se os valores de 'canais-menu' estão incluídos
      const value = i.values[0];

      if (value === 'banConfig') {
        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          { $set: { "bans.imagembg": '' } }
        );
        return await i.update({ content: `${i.user} as configurações de banimentos foram restauradas!`, embeds: [], components: [] });
      } else if (value === 'banImg') {
        return i.showModal(modal);
      }
    });


  }
};