/**
 * Configuração das peças da Árvore de Natal
 * Cada peça é uma parte do quebra-cabeça
 */

const ArvorePecas = {
    // Peças 1-8: Custo entre 5 e 10 meias
    1: { id: 1, nome: 'Peça 1', preco: 5, imagePath: './src/Assets/img/default/evento/Modelo01/1.png' },
    2: { id: 2, nome: 'Peça 2', preco: 6, imagePath: './src/Assets/img/default/evento/Modelo01/2.png' },
    3: { id: 3, nome: 'Peça 3', preco: 6, imagePath: './src/Assets/img/default/evento/Modelo01/3.png' },
    4: { id: 4, nome: 'Peça 4', preco: 7, imagePath: './src/Assets/img/default/evento/Modelo01/4.png' },
    5: { id: 5, nome: 'Peça 5', preco: 8, imagePath: './src/Assets/img/default/evento/Modelo01/5.png' },
    6: { id: 6, nome: 'Peça 6', preco: 8, imagePath: './src/Assets/img/default/evento/Modelo01/6.png' },
    7: { id: 7, nome: 'Peça 7', preco: 9, imagePath: './src/Assets/img/default/evento/Modelo01/7.png' },
    8: { id: 8, nome: 'Peça 8', preco: 10, imagePath: './src/Assets/img/default/evento/Modelo01/8.png' },

    // Peças 9-17: Custo entre 12 e 20 meias
    9: { id: 9, nome: 'Peça 9', preco: 12, imagePath: './src/Assets/img/default/evento/Modelo01/9.png' },
    10: { id: 10, nome: 'Peça 10', preco: 13, imagePath: './src/Assets/img/default/evento/Modelo01/10.png' },
    11: { id: 11, nome: 'Peça 11', preco: 14, imagePath: './src/Assets/img/default/evento/Modelo01/11.png' },
    12: { id: 12, nome: 'Peça 12', preco: 15, imagePath: './src/Assets/img/default/evento/Modelo01/12.png' },
    13: { id: 13, nome: 'Peça 13', preco: 16, imagePath: './src/Assets/img/default/evento/Modelo01/13.png' },
    14: { id: 14, nome: 'Peça 14', preco: 17, imagePath: './src/Assets/img/default/evento/Modelo01/14.png' },
    15: { id: 15, nome: 'Peça 15', preco: 18, imagePath: './src/Assets/img/default/evento/Modelo01/15.png' },
    16: { id: 16, nome: 'Peça 16', preco: 19, imagePath: './src/Assets/img/default/evento/Modelo01/16.png' },
    17: { id: 17, nome: 'Peça 17', preco: 20, imagePath: './src/Assets/img/default/evento/Modelo01/17.png' }
};

// Imagem base da árvore (sem peças)
const ArvoreBase = './src/Assets/img/default/evento/base_arvore.png';

// Total de peças disponíveis
const TotalPecas = 17;

module.exports = { ArvorePecas, ArvoreBase, TotalPecas };
