const { checkAndCorrectBalance } = require('../../Modules/Extra/checkBalance');
const { ClientEmbed } = require('../../Structures/ClientEmbed.js');
const { ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { Hangman } = require('discord-gamecord');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class HangmanCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'hangman';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Jogue no jogo da forca e tente obter coins.';
        this.aliases = ['forca'];
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

        const uSrc = await this.client.database.users.findOne({ idU: message.author.id });
        const money = await Util.notAbbrev(args[0]);
        const oldBank = uSrc.bank;

        // Cooldown
        let cooldown = 60000;
        let pay = uSrc.forca;
        let time = cooldown - (Date.now() - pay);

        const EMBED1 = new ClientEmbed()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, Aguarde **${moment.duration(time).format('h [Horas] m [minuto] e s [segundo(s)]').replace("minsuto", "minutos")}** para jogar novamente!`);

        if (pay !== null && cooldown - (Date.now() - pay) > 0) {
            return message.reply({ embeds: [EMBED1] })
        }

        if (!args[0]) {
            return message.reply({ content: `${message.author}, você pode jogar de 1000 até 2M Coins. *k!forca 100k*` });
        } else if (String(money) === 'NaN'){
            return message.reply({ content: `${message.author}, o valor fornecido é inválido.` });
        } else if (money < 100000) {
            return message.reply({ content: `${message.author}, desculpe, não aceito menos que 100000 (100K) Coins.` });
        } else if (money > 5000000) {
            return message.reply({ content: `${message.author}, o dinheiro não pode ser maior que 5M Coins.` });
        } else if (money > uSrc.bank) {
            return message.reply({ content: `${message.author}, você não possui essa quantia de coins!` });
        } else if (uSrc.blockpay) {
            return message.reply('Você está com uma transação em andamento! Finalize...')
        } else if (uSrc.blockbet) {
            return message.reply('Você está com uma transação em andamento! Finalize...')
        }

        uSrc.set({
            blockpay: true,
            blockbet: true
        });
        uSrc.save();          
        
        // const words = [
        //     // Palavras com 5 letras
        //     'Praia', 'Amigo', 'Feira', 'Fruta', 'Cesto', 'Colar', 'Vento', 'Tocha', 'Roupa', 
        //     'Velho', 'Cobra', 'Tigre', 'Trem', 'Saude', 'Poema', 'Grama', 'Vinho', 'Salto', 
        //     'Troca', 'Amora', 'Pista', 'Folha', 'Torno', 'Solto', 'Facho', 'Gesso', 'Brisa',
        
        //     // Palavras com 4 letras
        //     'Lata', 'Ovo', 'Rede', 'Vela', 'Luva', 'Rato', 'Fogo', 'Gelo', 'Sapo', 'Lobo', 
        //     'Lua', 'Faca', 'Rio', 'Voz', 'Copo', 'Rosa', 'Seda', 'Mato', 'Mina', 'Vaso', 
        //     'Pino', 'Coro', 'Zelo', 'Solo', 'Selo', 'Bico', 'Roda', 'Vela', 'Cura', 'Tapa',
        
        //     // Palavras com 6 a 8 letras
        //     'Panela', 'Pirata', 'Frango', 'Canudo', 'Cenoura', 'Abobora', 'Folhagem', 'Mochila', 
        //     'Abacaxi', 'Cachorro', 'Manteiga', 'Farinha', 'Jardins', 'Chaveiro', 'Telhado', 'Carinho', 
        //     'Pentear', 'Abafar', 'Cansado', 'Tecido', 'Cacador', 'Floresta', 'Batidas', 'Cimento', 
        //     'Pincel', 'Cadeira', 'Lanterna', 'Vidraceiro', 'Sapateiro', 'Ferramenta', 'Geladeira', 
        //     'Parafuso', 'Algodao', 'Batalhao', 'Treinador', 'Colherada', 'Travesseiro', 'Cabideiro',
        
        //     // Novas palavras adicionadas
        //     'Sorvete', 'Papelada', 'Camiseta', 'Lixeiro', 'Penteado', 'Marceneiro', 'Empanado', 
        //     'Castelo', 'Palestra', 'Caderno', 'Gelado', 'Estrela', 'Atirador', 'Campanha', 'Estofado', 
        //     'Empurrar', 'Foguete', 'Jardineiro', 'Brincadeira', 'Aviador', 'Capacete', 'Palhaco', 
        //     'Bicicleta', 'Fechadura', 'Rabanete', 'Vassoura', 'Churrasco', 'Caixote', 'Aventura',
        
        //     // Mais 40 palavras adicionadas
        //     'Caipira', 'Botanica', 'Caminhao', 'Sombreiro', 'Capoeira', 'Desenho', 'Cantinho', 'Comedias', 
        //     'Moeda', 'Folguedo', 'Tesoura', 'Velejador', 'Monumento', 'Quadriciclo', 'Portugues', 'Madrugada', 
        //     'Piscinao', 'Sinaleiro', 'Guerreiro', 'Arquiteto', 'Engenheiro', 'Fotografia', 'Acordeao', 'Apontador', 
        //     'Batedeira', 'Calendario', 'Geleira', 'Helicoptero', 'Jacare', 'Lanterninha', 'Massagista', 'Navegador', 
        //     'Orquestra', 'Passarela', 'Quadrado', 'Raquete', 'Sabonete', 'Temperado', 'Ventanias', 'Zoologico'
        // ];            

        const words = [
            // 4 letras
            'Amor', 'Vida', 'Flor', 'Copo', 'Rosa', 'Fogo', 'Luz', 'Paz', 'Ceu', 'Rio', 
            'Mesa', 'Gato', 'Port', 'Bela', 'Lago', 'Fada', 'Gota', 'Chao', 'Bico', 'Lado', 
            'Vaso', 'Lima', 'Coro', 'Casa', 'Leme', 'Ramo', 'Dado', 'Vela', 'Foco', 'Pulo', 
            // 5 letras
            'Livro', 'Praia', 'Chave', 'Festa', 'Sonho', 'Vento', 'Forca', 'Melao', 'Tempo', 
            'Canto', 'Nuvem', 'Mente', 'Trigo', 'Cerca', 'Salto', 'Forte', 'Saude', 'Calor', 
            'Fluir', 'Frase', 'Rosto', 'Pluma', 'Neve', 'Piano', 'Sorte', 'Mundo', 'Pente', 
            'Cores', 'Lapis', 'Vozes', 'Lanca', 
            // 6 letras
            'Janela', 'Fruta', 'Chuva', 'Alegria', 'Jardim', 'Saudade', 'Sorriso', 'Cantar', 
            'Amavel', 'Brilho', 'Beleza', 'Silencio', 'Lapis', 'Ternura', 'Espelho', 
            'Jornal', 'Manhas', 'Familia', 'Floral', 'Branca', 'Verdes', 'Atender', 'Caminho', 
            'Amores', 'Fronte', 'Branca', 'Ceus', 'Fachos', 'Estilo', 'Reflexo', 
            // 9 letras
            'Esperanca', 'Natureza', 'Gratidao', 'Memoria', 'Felicidade', 'Confianca', 
            'Pureza', 'Encanto', 'Horizonte', 'Respeito', 'Cortesia', 'Estrelas', 
            'Serenidade', 'Valentia', 'Simplicidade', 'Harmonia', 'Energia', 'Historias', 
            'Carinho', 'Liberdade', 'Realidade', 'Coragem', 'Lealdade', 'Juventude', 
            'Companheiro', 'Solidariedade', 'Fascinante', 'Autenticidade', 'Generosidade', 
            'Compreensao'
        ];               
        
        const randomWords = Math.floor(Math.random() * words.length);

        //console.log(words[randomWords]);

        const Game = new Hangman({
            message: message,
            isSlashGame: false,
            embed: {
                title: 'Jogo da Forca',
                color: '#2E3035'
            },
            hangman: { hat: '🎩', head: '😟', shirt: '👕', pants: '🩳', boots: '👞👞' },
            customWord: words[randomWords],
            timeoutTime: 40000,
            theme: 'winter',
            winMessage: 'Eita, você ganhou! A palavra é **{word}**.',
            loseMessage: 'Poxa, você perdeu! A palavra estava incorreta!',
            playerOnlyMessage: 'Eiii, Apenas {player} pode jogar!'
        });

        Game.startGame();
        Game.on('gameOver', async (result) => {
            const ganho = result.result === 'win' ? money : -money;
            const valorFinal = oldBank + ganho;

            await this.client.database.users.updateOne(
                { idU: message.author.id },
                {
                    $inc: { bank: ganho },
                    $set: {
                        forca: Date.now(),
                        blockpay: false,
                        blockbet: false
                    }
                }
            );
        });
    }
};
