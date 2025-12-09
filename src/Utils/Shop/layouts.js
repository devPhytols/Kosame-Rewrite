const layouts = [
    {
        label: 'White Style',
        value: 'whitestyle',
        coins: 0,
        rarity: '<:common:1373321022312415344> Comum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#000000',
        embedcolor: '#FFFFFF',
        preview: 'https://i.imgur.com/cxlSsBk.png',
        layout: './src/Assets/img/default/profiles/jTD2ju8.png'
    },
    {
        label: 'Cyan Style',
        value: 'cyanstyle',
        coins: 100000000,
        rarity: '<:common:1373321022312415344> Raridade: Comum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#013030',
        embedcolor: '#0fffff',
        preview: 'https://i.imgur.com/9aEW88P.png',
        layout: './src/Assets/img/default/profiles/6i5o6zA.png'
    },
    {
        label: 'Rose Style',
        value: 'rosestyle',
        coins: 100000000,
        rarity: '<:common:1373321022312415344> Raridade: Comum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#1a0e14',
        embedcolor: '#fba3cf',
        preview: 'https://i.imgur.com/uJfk0wG.png',
        layout: './src/Assets/img/default/profiles/og9bGML.png'
    },
    {
        label: 'Purple Style',
        value: 'purplestyle',
        coins: 100000000,
        rarity: '<:common:1373321022312415344> Raridade: Comum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#8c08c3',
        preview: 'https://i.imgur.com/exZz9aZ.png',
        layout: './src/Assets/img/default/profiles/VUhKEqm.png'
    },
    {
        label: 'Blue River Style',
        value: 'blueriverstyle',
        coins: 500000000,
        rarity: '<:uncommon:1373320980600193064> Raridade: Incomum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#44adc2',
        preview: 'https://i.imgur.com/K9S7jJ7.png',
        layout: 'https://i.imgur.com/LTL96HX.png'
    },
    {
        label: 'Red Style',
        value: 'redstyle',
        coins: 500000000,
        rarity: '<:uncommon:1373320980600193064> Raridade: Incomum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#921919',
        preview: 'https://i.imgur.com/y8Iu8Ul.png',
        layout: 'https://i.imgur.com/lpM6Hu4.png'
    },
    {
        label: 'Yellow',
        value: 'yellowstyle',
        coins: 500000000,
        rarity: '<:uncommon:1373320980600193064> Raridade: Incomum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#ffd062',
        preview: 'https://i.imgur.com/8ksIVen.png',
        layout: 'https://i.imgur.com/7zsMqP9.png'
    },
    {
        label: 'Swamp Green Style',
        value: 'swampgreenstyle',
        coins: 500000000,
        rarity: '<:uncommon:1373320980600193064> Raridade: Incomum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#2d6525',
        preview: 'https://i.imgur.com/vvzXneZ.png',
        layout: 'https://i.imgur.com/r2tpNWu.png'
    },
    {
        label: 'Pink Style',
        value: 'pinkstyle',
        coins: 800000000,
        rarity: '<:rare:1373320842418716744> Raridade: Raro',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#ff1493',
        preview: 'https://i.imgur.com/TolmNZs.png',
        layout: 'https://i.imgur.com/O5aar5R.png'
    },
    {
        label: 'Dark Red Style',
        value: 'darkredstyle',
        coins: 800000000,
        rarity: '<:rare:1373320842418716744> Raridade: Raro',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#4f0000',
        preview: 'https://i.imgur.com/xI1Pbbs.png',
        layout: 'https://i.imgur.com/OppAFnT.png'
    },
    {
        label: 'Forest Green Style',
        value: 'forestgreenstyle',
        coins: 800000000,
        rarity: '<:rare:1373320842418716744> Raridade: Raro',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#0c5a3f',
        preview: 'https://i.imgur.com/zVP8Zju.png',
        layout: 'https://i.imgur.com/M17cCeb.png'
    },
    {
        label: 'Blue Ocean Style',
        value: 'blueoceanstyle',
        coins: 800000000,
        rarity: '<:rare:1373320842418716744> Raridade: Raro',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#3c55c0',
        preview: 'https://i.imgur.com/ih43YDL.png',
        layout: 'https://i.imgur.com/TsGXUKc.png'
    },
    {
        label: 'Black Style',
        value: 'blackstyle',
        coins: 800000000,
        rarity: '<:rare:1373320842418716744> Raridade: Raro',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#000000',
        preview: 'https://i.imgur.com/zo0WULW.png',
        layout: './src/Assets/img/default/profiles/HVl8I5E.png'
    },
    {
        label: 'Gray Style',
        value: 'graystyle',
        coins: 800000000,
        rarity: '<:rare:1373320842418716744> Raridade: Raro',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#6a6e76',
        preview: 'https://i.imgur.com/gHv7O3H.png',
        layout: 'https://i.imgur.com/DygtMhW.png'
    },
    {
        label: 'Black AMOLED',
        value: 'amoledstyle',
        coins: 1000000000,
        rarity: '<:epic:1373320840900251668> Raridade: Épico',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#FFFFFF',
        embedcolor: '#000000',
        preview: 'https://i.imgur.com/7Mrvfdm.png',
        layout: './src/Assets/img/default/profiles/4M0L3D.png'
    },
    {
        label: 'White AMOLED',
        value: 'wamoledstyle',
        coins: 1000000000,
        rarity: '<:epic:1373320840900251668> Raridade: Épico',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#000000',
        embedcolor: '#FFFFFF',
        preview: 'https://i.imgur.com/B6as4hU.png',
        layout: './src/Assets/img/default/profiles/4M0L3D-WHITE-o.png'
    },
    {
        label: 'Gray AMOLED',
        value: 'gamoledstyle',
        coins: 1000000000,
        rarity: '<:epic:1373320840900251668> Raridade: Épico',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc facilisis est et ante ultrices. ',
        textcolor: '#000000',
        embedcolor: '#6a6e76',
        preview: 'https://i.imgur.com/ftInqUR.png',
        layout: 'https://i.imgur.com/AH1tdOk.png'
    },
    {
        label: 'Voltar',
        value: 'voltarmenu'
    }
];

module.exports = { layouts };
