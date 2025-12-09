/*
 @name = Nome do Background
 @price = Preço do Background
 @image = Imagem Completa do Background
 @raw = Imagem que será definida no perfil (No formato)
*/
const store = {
    backgrounds: [ 
        // BANNER BRANCO   
        { name: 'Whispering Wings (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Eukj5Eb.png', raw: 'https://i.imgur.com/U0luQz1.png' },
        { name: 'Enchanted Sprite (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/2MIYyok.png',raw: 'https://i.imgur.com/C9OnqDh.png' },
        { name: 'Velvet Kiss (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/MFlS7uN.png', raw: 'https://i.imgur.com/fHMwFs5.png' },
        { name: 'Snuggle Buddy (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/rRm5ff2.png', raw: 'https://i.imgur.com/YWEXUuV.png' },
        { name: 'Eternal Bloom (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Bwn4bHE.png', raw: 'https://i.imgur.com/VtfmxtV.png' },
        { name: 'Ribbon Charm (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/9DSBEUa.png', raw: 'https://i.imgur.com/I34s2oX.png' },
        { name: 'Starry Dreams (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/gxkJU90.png', raw: 'https://i.imgur.com/xMeqQdX.png' },
        { name: 'Playful Paws (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/ISmJu7R.png', raw: 'https://i.imgur.com/CYThGtC.png' },
        { name: 'Mystical Feline (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/QMBxkDD.png',raw: 'https://i.imgur.com/ErELhKS.png' },
        { name: 'Cozy Cuddle (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/rAp1kUp.png', raw: 'https://i.imgur.com/79bC13I.png' },
        { name: 'Rainbow Hugs (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/2wRJlR7.png', raw: 'https://i.imgur.com/m1QDfWQ.png' },
        { name: 'Heart (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/dCIL2Am.png', raw: 'https://i.imgur.com/o898Vv9.png' },
        { name: 'Cherry (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/JA79vyA.png', raw: 'https://i.imgur.com/AF1Epgk.png' },
        { name: 'Hello kitty (White)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Mwf2ZIV.png', raw: 'https://i.imgur.com/4wYWMe9.png' },
        { name: 'Full white (White)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/6tkdKxY.png', raw: 'https://i.imgur.com/6tkdKxY.png' },

        // BANNER PRETO

        { name: 'Whispering Wings (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/wyLmvdd.png', raw: 'https://i.imgur.com/zAW5MGT.png' },
        { name: 'Enchanted Sprite (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/JA4Q563.png',raw: 'https://i.imgur.com/Ss41kUm.png' },
        { name: 'Velvet Kiss (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/WuygGFC.png', raw: 'https://i.imgur.com/TkyEZpz.png' },
        { name: 'Snuggle Buddy (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Mv5GLEv.png', raw: 'https://i.imgur.com/CfYItJv.png' },
        { name: 'Eternal Bloom (Black)',  price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/gG6Uu5h.png', raw: 'https://i.imgur.com/iTAkZtQ.png' },
        { name: 'Ribbon Charm (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/POJeTTD.png', raw: 'https://i.imgur.com/Crf5k3g.png' },
        { name: 'Starry Dreams (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/JHWkJgY.png', raw: 'https://i.imgur.com/UNP4w9d.png' },
        { name: 'Playful Paws (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/VU4zuz5.png', raw: 'https://i.imgur.com/1FulNiv.png' },
        { name: 'Mystical Feline (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/scOQoAW.png',raw: 'https://i.imgur.com/ubPXlO3.png' },
        { name: 'Cozy Cuddle (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/I0icb1g.png', raw: 'https://i.imgur.com/HVH2GJf.png' },
        { name: 'Rainbow Hugs (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/SKjyzHw.png', raw: 'https://i.imgur.com/DINRNZE.png' },
        { name: 'Heart (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/kv7mBLz.png', raw: 'https://i.imgur.com/2aWg8BS.png' },
        { name: 'Cherry (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/bAHIWhl.png', raw: 'https://i.imgur.com/pmWZXkg.png' },
        { name: 'Hello kitty (Black)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/O66rFiM.png', raw: 'https://i.imgur.com/ve2sZ9G.png' },
        { name: 'Full black (Black)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/sTTBRBm.png', raw: 'https://i.imgur.com/sTTBRBm.png' },

        // BANNER ROSA

        { name: 'Whispering Wings (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/UTO9EuH.png', raw: 'https://i.imgur.com/yrxaMl5.png' },
        { name: 'Enchanted Sprite (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/fK9FW2H.png',raw: 'https://i.imgur.com/wl6MKEh.png' },
        { name: 'Velvet Kiss (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/37LwwMn.png', raw: 'https://i.imgur.com/JENs8De.png' },
        { name: 'Snuggle Buddy (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Vc8XyWg.png', raw: 'https://i.imgur.com/UhjOsfj.png' },
        { name: 'Eternal Bloom (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/UjJ1SOJ.png', raw: 'https://i.imgur.com/dpowVBe.png' },
        { name: 'Ribbon Charm (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/zAtnVN3.png', raw: 'https://i.imgur.com/SJ2kr0X.png' },
        { name: 'Starry Dreams (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/awlr35b.png', raw: 'https://i.imgur.com/heNqWpU.png' },
        { name: 'Playful Paws (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/AYcxTPE.png', raw: 'https://i.imgur.com/d9KzPfr.png' },
        { name: 'Mystical Feline (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/sBVw70Q.png',raw: 'https://i.imgur.com/mCNpTq4.png' },
        { name: 'Cozy Cuddle (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/QUeirwj.png', raw: 'https://i.imgur.com/0KCQ0ef.png' },
        { name: 'Rainbow Hugs (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/FaBD4NT.png', raw: 'https://i.imgur.com/Hkcb9CV.png' },
        { name: 'Heart (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/rsGXs3L.png', raw: 'https://i.imgur.com/ygm6Jmy.png' },
        { name: 'Cherry (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/nL4yoV9.png', raw: 'https://i.imgur.com/eWFEL9a.png' },
        { name: 'Hello kitty (Rose)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/vNk1Tzf.png', raw: 'https://i.imgur.com/FUSGLsn.png' },
        { name: 'Full rosa (Rose)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/N8hKiij.png', raw: 'https://i.imgur.com/N8hKiij.png' },

        // BANNER CIANO

        { name: 'Whispering Wings (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/HRWxQrR.png', raw: 'https://i.imgur.com/Q0QHT3W.png' },
        { name: 'Enchanted Sprite (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/L1gjjjO.png',raw: 'https://i.imgur.com/PhwbVlA.png' },
        { name: 'Velvet Kiss (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/eZ7lHaY.png', raw: 'https://i.imgur.com/JamJdqB.png' },
        { name: 'Snuggle Buddy (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/cEET4Lx.png', raw: 'https://i.imgur.com/t9XbiMl.png' },
        { name: 'Eternal Bloom (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/5YhQ3dp.png', raw: 'https://i.imgur.com/oRH3Owe.png' },
        { name: 'Ribbon Charm (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/4x15NDH.png', raw: 'https://i.imgur.com/zK37Dc5.png' },
        { name: 'Starry Dreams (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Q0Iy0XR.png', raw: 'https://i.imgur.com/g4t0iQp.png' },
        { name: 'Playful Paws (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/vYh1n9R.png', raw: 'https://i.imgur.com/Yjppwua.png' },
        { name: 'Mystical Feline (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/TlJjOIn.png', raw:'https://i.imgur.com/7TcunK6.png' },
        { name: 'Cozy Cuddle (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/lg7M2eL.png', raw: 'https://i.imgur.com/Q36modr.png' },
        { name: 'Rainbow Hugs (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/9v2tkU9.png', raw: 'https://i.imgur.com/6ji1IG1.png' },
        { name: 'Heart (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/dO2BNIn.png', raw: 'https://i.imgur.com/6vcOMuy.png' },
        { name: 'Cherry (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/KGwDmn2.png', raw: 'https://i.imgur.com/dtALUat.png' },
        { name: 'Hello kitty (Cyan)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/NWRopPn.png', raw: 'https://i.imgur.com/YDSPydz.png' },
        { name: 'Full ciano (Cyan)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/1qhYdCv.png', raw: 'https://i.imgur.com/1qhYdCv.png' },

        // BANNER ROXO

        { name: 'Whispering Wings (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/RKUap3x.png', raw: 'https://i.imgur.com/Wp1BWi1.png' },
        { name: 'Enchanted Sprite (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/GmJ7FNv.png',raw: 'https://i.imgur.com/qHOjbJk.png' },
        { name: 'Velvet Kiss (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/FxpPks6.png', raw: 'https://i.imgur.com/6dc9DIi.png' },
        { name: 'Snuggle Buddy (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/T43upBK.png', raw: 'https://i.imgur.com/8ix113G.png' },
        { name: 'Eternal Bloom (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Hrnpgdy.png', raw: 'https://i.imgur.com/4OSzKGn.png' },
        { name: 'Ribbon Charm (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Fgy2l9I.png', raw: 'https://i.imgur.com/aBlQGK8.png' },
        { name: 'Starry Dreams (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/u0NCRSM.png', raw: 'https://i.imgur.com/yy4caxG.png' },
        { name: 'Playful Paws (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/jpQuG2p.png', raw: 'https://i.imgur.com/cJS5EMi.png' },
        { name: 'Mystical Feline (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/ID1RW5L.png', raw:'https://i.imgur.com/FO9dGC2.png' },
        { name: 'Cozy Cuddle (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/03OJzz6.png', raw: 'https://i.imgur.com/KvCEhUn.png' },
        { name: 'Rainbow Hugs (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/REOHV6L.png', raw: 'https://i.imgur.com/oXoz0ZY.png' },
        { name: 'Heart (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/IwGhFDY.png', raw: 'https://i.imgur.com/BpFHKYA.png' },
        { name: 'Cherry (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/chkHRMM.png', raw: 'https://i.imgur.com/U1vqGL7.png' },
        { name: 'Hello kitty (Purple)', price: 500000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/raxaAhV.png', raw: 'https://i.imgur.com/iU8AW1o.png' },
        { name: 'Full roxo (Purple)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/gEWFOqF.png', raw: 'https://i.imgur.com/gEWFOqF.png' },


        // BANNER BLUE RIVER

        { name: 'Heart (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/52F9Xdm.png', raw: 'https://i.imgur.com/Ce35KEI.png' },
        { name: 'Cherry (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/pMPGj0Q.png', raw: 'https://i.imgur.com/X04pw4O.png' },
        { name: 'Hello kitty (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/oO9U4za.png', raw: 'https://i.imgur.com/7IOYRGx.png' },
        { name: 'Gato (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/IHGXvVV.png', raw: 'https://i.imgur.com/3MtJKUv.png' },
        { name: 'Laço (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/q4HEckA.png', raw: 'https://i.imgur.com/kZO9fVZ.png' },
        { name: 'Butterfly (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Lx7ctsN.png', raw: 'https://i.imgur.com/xopqPwl.png' },
        { name: 'Cute bear (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/jRpleSK.png', raw: 'https://i.imgur.com/5ByqRtn.png' },
        { name: 'Bear (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Z1GLqpu.png', raw: 'https://i.imgur.com/3DaKnkw.png' },
        { name: 'Cute (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/FqbHvQZ.png', raw: 'https://i.imgur.com/jQb0ou0.png' },
        { name: 'Pink Cat (Blue River)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/U8OTozS.png', raw: 'https://i.imgur.com/Re1o7kq.png' },
        { name: 'Full azul rio (Blue River)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Zg5x8ct.png', raw: 'https://i.imgur.com/Zg5x8ct.png' },
        

        // BANNER RED

        { name: 'Heart (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/jQ8ZynX.png', raw: 'https://i.imgur.com/iLRfXCs.png' },
        { name: 'Cherry (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/dFgpI8U.png', raw: 'https://i.imgur.com/g8bASOv.png' },
        { name: 'Hello kitty (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/aKpNqVX.png', raw: 'https://i.imgur.com/ktZnT1H.png' },
        { name: 'Gato (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/5z7fWE0.png', raw: 'https://i.imgur.com/pBGjFvB.png' },
        { name: 'Laço (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/lN5eS3Z.png', raw: 'https://i.imgur.com/41aY727.png' },
        { name: 'Butterfly (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/BzraGY6.png', raw: 'https://i.imgur.com/jGJFhgJ.png' },
        { name: 'Cute bear (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/HX7PLw4.png', raw: 'https://i.imgur.com/PaD753H.png' },
        { name: 'Bear (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/wFyr9BM.png', raw: 'https://i.imgur.com/4KERmHb.png' },
        { name: 'Cute (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/bvgPcDu.png', raw: 'https://i.imgur.com/lNv4udf.png' },
        { name: 'Pink Cat (Red)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/PQ8uyZi.png', raw: 'https://i.imgur.com/OjkHP1c.png' },
        { name: 'Full vermelho (Red)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/p83842v.png', raw: 'https://i.imgur.com/p83842v.png' },

        // BANNER YELLOW

        { name: 'Heart (Yellow)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/nxLt6Ln.png', raw: 'https://i.imgur.com/bNbD47f.png ' },
        { name: 'Cherry (Amerelo)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Bbc6bca.png', raw: 'https://i.imgur.com/CCM7qTD.png' },
        { name: 'Hello kitty (Yellow)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/RcYAbAt.png', raw: 'https://i.imgur.com/AkjXZQC.png' },
        { name: 'Gato (Yellow)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/5yFHNtU.png', raw: 'https://i.imgur.com/0Y73CF1.png' },
        { name: 'Laço (Yellow)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/wkJGRPJ.png', raw: 'https://i.imgur.com/kuZPRcC.png' },
        { name: 'Butterfly (Yellow)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/czLI9VI.png', raw: 'https://i.imgur.com/bwYiEMb.png' },
        { name: 'Cute bear (Yellow)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/nonpUP0.png', raw: 'https://i.imgur.com/CgoSkEV.png' },
        { name: 'Bear (Yellow)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/H2LBzcn.png', raw: 'https://i.imgur.com/abYHMfY.png' },
        { name: 'Cute (Yellow)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/wQ3io8V.png', raw: 'https://i.imgur.com/lsZ8W9z.png' },
        { name: 'Pink Cat (Yellow)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/isHwDCm.png', raw: 'https://i.imgur.com/gx9lIgS.png' },
        { name: 'Full amarelo (Yellow)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/B5yXKvr.png', raw: 'https://i.imgur.com/B5yXKvr.png' },

        // SWAMP GREEN

        { name: 'Heart (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/BG1cNrV.png ', raw: 'https://i.imgur.com/NxZ1oPd.png' },
        { name: 'Cherry (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/u0Dg1kl.png', raw: 'https://i.imgur.com/vB9km0l.png' },
        { name: 'Hello kitty (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/DcHmDJ2.png', raw: 'https://i.imgur.com/ujk6hFN.png' },
        { name: 'Gato (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/pLKIbBK.png', raw: 'https://i.imgur.com/Le1leGm.png' },
        { name: 'Laço (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/ZrOboJQ.png', raw: 'https://i.imgur.com/Xe8hrD5.png' },
        { name: 'Butterfly (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/o5M9Hil.png', raw: 'https://i.imgur.com/YfdJJKw.png' },
        { name: 'Cute bear (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/BIcpe5S.png', raw: 'https://i.imgur.com/07BFXiT.png' },
        { name: 'Bear (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/PKx0g00.png', raw: 'https://i.imgur.com/OlLsIrv.png' },
        { name: 'Cute (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/24GOLgu.png', raw: 'https://i.imgur.com/xfEOedo.png' },
        { name: 'Pink Cat (Swamp Green)', price: 800000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/jUKDIYH.png', raw: 'https://i.imgur.com/cZj3CK6.png' },
        { name: 'Full verde pantano (Swamp Green)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/FRlOGo8.png', raw: 'https://i.imgur.com/FRlOGo8.png' },

        // ROSA BARBIE

        { name: 'Cherry (Pink)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/CZwvRFs.png', raw: 'https://i.imgur.com/mk8nsOW.png' },
        { name: 'Hello kitty (Pink)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/pMW2yTX.png', raw: 'https://i.imgur.com/OoptbpD.png' },
        { name: 'Gato (Pink)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/egp90H6.png', raw: 'https://i.imgur.com/MOvznG4.png' },
        { name: 'Laço (Pink)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/4PBdbKD.png', raw: 'https://i.imgur.com/jNqIXHO.png' },
        { name: 'Butterfly (Pink)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Ea2bknO.png', raw: 'https://i.imgur.com/2vE1Y4s.png' },
        { name: 'Cute bear (Pink)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/IH31AsU.png', raw: 'https://i.imgur.com/g8E6XqL.png' },
        { name: 'Bear (Pink)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/z8gjMCD.png', raw: 'https://i.imgur.com/A4kC9hw.png' },
        { name: 'Cute (Pink)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/E02dWjp.png', raw: 'https://i.imgur.com/Z6Lcz8m.png' },
        { name: 'Pink Cat (Pink)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/EqQLA9c.png', raw: 'https://i.imgur.com/cmwI4SM.png' },
        { name: 'Full rosa choque (Pink)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/8bEW3hm.png', raw: 'https://i.imgur.com/8bEW3hm.png' },

        // BANNER DARK RED

        { name: 'Cherry (Dark Red)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/gmemeMe.png', raw: 'https://i.imgur.com/DIZcYY3.png' },
        { name: 'Hello kitty (Dark Red)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/s8nDtqf.png', raw: 'https://i.imgur.com/MnpbBxS.png' },
        { name: 'Gato (Dark Red)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/5l5KrCw.png', raw: 'https://i.imgur.com/GoGNedN.png' },
        { name: 'Laço (Dark Red)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Eez8laP.png', raw: 'https://i.imgur.com/4Wi5dXK.png' },
        { name: 'Butterfly (Dark Red)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/w03nXTx.png', raw: 'https://i.imgur.com/qkXlvLj.png' },
        { name: 'Cute bear(Dark Red)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/6H68U8f.png', raw: 'https://i.imgur.com/m3TXsVW.png' },
        { name: 'Bear (Dark Red)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/gA1fVAW.png', raw: 'https://i.imgur.com/sG71x0Y.png' },
        { name: 'Cute (Dark Red)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/vTxHiZN.png', raw: 'https://i.imgur.com/psL35kh.png' },
        { name: 'Pink Cat (Dark Red)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/wQsCQ0o.png', raw: 'https://i.imgur.com/jc2EaJC.png' },
        { name: 'Full vermelho escuro (Dark Red)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/G0cRcDn.png', raw: 'https://i.imgur.com/G0cRcDn.png' },

        // BANNER FOREST GREEN

        { name: 'Cherry (Forest Green)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/uXzunNn.png', raw: 'https://i.imgur.com/e5fT9pa.png' },
        { name: 'Hello kitty (Forest Green)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/FyDHzIa.png', raw: 'https://i.imgur.com/bAZoEqd.png' },
        { name: 'Gato (Forest Green)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/SHFvLQQ.png', raw: 'https://i.imgur.com/w2u2Clz.png' },
        { name: 'Laço (Forest Green)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/vt39AUg.png', raw: 'https://i.imgur.com/J5M2LTX.png' },
        { name: 'Butterfly (Forest Green)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/1hECnN0.png', raw: 'https://i.imgur.com/RjIxHYB.png' },
        { name: 'Cute bear (Forest Green)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/zNatETc.png', raw: 'https://i.imgur.com/SEuxqnE.png' },
        { name: 'Bear (Forest Green)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/ODQX3e9.png', raw: 'https://i.imgur.com/k8LFtre.png' },
        { name: 'Cute (Forest Green)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/hgtXu13.png', raw: 'https://i.imgur.com/fkOY2r3.png' },
        { name: 'Pink Cat (Forest Green)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/RDvNY07.png', raw: 'https://i.imgur.com/jGTNxzC.png' },
        { name: 'Full verde floresta (Forest Green)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/kw1pzPe.png', raw: 'https://i.imgur.com/kw1pzPe.png' },

        // BANNER BLUE OCEAN

        { name: 'Heart (Blue Ocean)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/QZYjbAc.png', raw: 'https://i.imgur.com/bPjsivs.png' },
        { name: 'Cherry (Azul oceno)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/ZLaBx2g.png', raw: 'https://i.imgur.com/t79pWPq.png' },
        { name: 'Hello kitty (Blue Ocean)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/TYZ2Spx.png', raw: 'https://i.imgur.com/OLPzDKP.png' },
        { name: 'Gato (Blue Ocean)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/i9Qr16k.png', raw: 'https://i.imgur.com/Bqc7f52.png' },
        { name: 'Laço (Blue Ocean)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/j2ORe0p.png', raw: 'https://i.imgur.com/5VE3Ot0.png' },
        { name: 'Butterfly (Blue Ocean)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/WNKXvS4.png', raw: 'https://i.imgur.com/iEFYmDf.png' },
        { name: 'Cute bear (Blue Ocean)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/tIWHR7o.png', raw: 'https://i.imgur.com/YDmHBPl.png' },
        { name: 'Bear (Blue Ocean)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/e8kMBXH.png', raw: 'https://i.imgur.com/GfABKen.png' },
        { name: 'Cute (Blue Ocean)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/ylg0B4a.png', raw: 'https://i.imgur.com/8V2ikx2.png' },
        { name: 'Pink Cat (Blue Ocean)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/UMSfcTj.png', raw: 'https://i.imgur.com/2lmPpDl.png' },
        { name: 'Full azul oceano (Blue Ocean)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/JTbZb0D.png', raw: 'https://i.imgur.com/JTbZb0D.png' },

        // BANNER GREY

        { name: 'Heart (Grey)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/go371CG.png', raw: 'https://i.imgur.com/tqp67hB.png' },
        { name: 'Cherry (Grey)', price: 10000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/QUPjGof.png', raw: 'https://i.imgur.com/o4Mm2gb.png' },
        { name: 'Hello kitty (Grey)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/qBPXO0V.png', raw: 'https://i.imgur.com/mTB93bK.png' },
        { name: 'Gato (Grey)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/Sv8QMpS.png', raw: 'https://i.imgur.com/ei1HYwZ.png' },
        { name: 'Laço (Grey)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/5plrNbJ.png', raw: 'https://i.imgur.com/HxaDxlL.png' },
        { name: 'Butterfly (Grey)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/nZxgGBV.png', raw: 'https://i.imgur.com/fMYmMKp.png' },
        { name: 'Cute bear (Grey)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/YGw5ZZD.png', raw: 'https://i.imgur.com/hjyLm7M.png' },
        { name: 'Bear (Gray)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/G9Yiz9y.png', raw: 'https://i.imgur.com/mTfh3JE.png' },
        { name: 'Cute (Gray)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/5rKlBbu.png', raw: 'https://i.imgur.com/77TCYiu.png' },
        { name: 'Pink Cat (Gray)', price: 1000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/E9afKOK.png', raw: 'https://i.imgur.com/C4Tq6b1.png' },
        { name: 'Full Cinza (Grey)', price: 50000000, desc: 'Uma escolha linda e elegante!', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/e1teDG6.png', raw: 'https://i.imgur.com/e1teDG6.png' }

    ],
    molduras: [
        { name: 'Default', price: 0, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://cdn.discordapp.com/attachments/1109146359975657542/1109146442330800148/KOl9E7Q.png', raw: 'null' },
        { name: 'Red Tint', price: 25000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/57B0JFI.png', raw: './src/Assets/img/default/molduras/redtint.png' },
        { name: 'Two Stars', price: 25000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/2CDjwie.png', raw: './src/Assets/img/default/molduras/star.png' },
        { name: 'Flowers', price: 40000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/4hvALCG.png', raw: './src/Assets/img/default/molduras/flowers.png' },
        { name: 'Cute Cat', price: 40000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/nv6EjT8.png', raw: './src/Assets/img/default/molduras/cutecat.png' },
        { name: 'Blue Lightning', price: 60000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/8Q8DlL8.png', raw: './src/Assets/img/default/molduras/bluelightning.png' },
        { name: 'Rose Lightning', price: 60000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/lNwAyzi.png', raw: './src/Assets/img/default/molduras/roselightning.png' },
        { name: 'White Lightning', price: 60000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/JaQMlZz.png', raw: './src/Assets/img/default/molduras/whitelightning.png' },
        { name: 'Water Katana', price: 120000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/XDvz1eq.png', raw: './src/Assets/img/default/molduras/whitekatana.png' },
        { name: 'Star Pink', price: 120000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/Mnrle1U.png', raw: './src/Assets/img/default/molduras/StarPink.png' }, // FEITO
        { name: 'Cruel Sun', price: 80000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/l72NONb.png', raw: './src/Assets/img/default/molduras/Sun.png' }, // FEITO
        { name: 'Infinity Dark', price: 300000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/vgCG44X.png', raw: './src/Assets/img/default/molduras/InfinityDark.png' }, // FEITO
        { name: 'Infinity Rose', price: 300000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/LNTr6qB.png', raw: './src/Assets/img/default/molduras/InfinityRose.png' }, // FEITO
        { name: 'Infinity Blue', price: 300000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/QNtAx71.png', raw: './src/Assets/img/default/molduras/InfinityBlue.png' }, // FEITO
        { name: 'Neon Line', price: 150000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/RHbB9j5.png', raw: './src/Assets/img/default/molduras/Neon.png' }, // FEITO
        { name: 'Constellations', price: 150000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/q3G5tIH.png', raw: './src/Assets/img/default/molduras/Constellations.png' }, // FEITO
        { name: 'Fire Lightning', price: 200000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/wIkNLpY.png', raw: './src/Assets/img/default/molduras/FireLightning.png' }, // FEITO
        { name: 'Stars Spiral', price: 300000000, desc: 'Uma escolha linda e elegante!',rarity: '<:common:1373321022312415344> Comum',image: 'https://i.imgur.com/3oq5zdd.png', raw: './src/Assets/img/default/molduras/StarsSpiral.png' },
        { name: 'Sakura Glow', price: 900000000, desc: 'Flores de cerejeira e leveza em cada detalhe.', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/YkzeXUw.png', raw: 'https://i.imgur.com/76oc9Qy.png' },
        { name: 'Cyber Crown', price: 900000000, desc: 'Brilho rosa e poder tecnológico.', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/6gci4Md.png', raw: 'https://i.imgur.com/FapDwus.png' },
        { name: 'Rose Garden', price: 900000000, desc: 'Rosas suaves e toque romântico.', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/98FdKXY.png', raw: 'https://i.imgur.com/UAkpOPu.png' },
        { name: 'Heart Glow', price: 900000000, desc: 'Corações e energia amorosa.', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/b7HQP3c.png', raw: 'https://i.imgur.com/Hlul57x.png' },
        { name: 'Luna Bloom', price: 900000000, desc: 'Flores e borboletas em perfeita harmonia.', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/O3Vww2g.png', raw: 'https://i.imgur.com/WwN8FXI.png' },
        { name: 'Butterfly Kiss', price: 900000000, desc: 'Magia e frescor da primavera.', rarity: '<:common:1373321022312415344> Comum', image: 'https://i.imgur.com/nrZBcHn.png', raw: 'https://i.imgur.com/XCcXR5a.png' }
            ],
    layouts: [
        {
            name: 'White Style',
            cod: 'white',
            price: 0,
            rarity: '<:common:1373321022312415344> Comum',
            desc: 'O Layout inicial da Kosame, bonito e fofinho 🥰',
            textcolor: '#000000',
            embedcolor: '#FFFFFF',
            image: 'https://i.imgur.com/cxlSsBk.png',
            raw: './src/Assets/img/default/profiles/jTD2ju8.png'
        },
        {
            name: 'Cyan Style',
            cod: 'cyan',
            price: 100000000,
            rarity: '<:common:1373321022312415344> Raridade: Comum',
            desc: 'Um tom mais clarinho e estiloso 😍',
            textcolor: '#013030',
            embedcolor: '#0fffff',
            image: 'https://i.imgur.com/9aEW88P.png',
            raw: './src/Assets/img/default/profiles/6i5o6zA.png'
        },
        {
            name: 'Rose Style',
            cod: 'rose',
            price: 100000000,
            rarity: '<:common:1373321022312415344> Raridade: Comum',
            desc: 'Um rosa suave e agradável para você se destacar entre todos ✨',
            textcolor: '#1a0e14',
            embedcolor: '#fba3cf',
            image: 'https://i.imgur.com/uJfk0wG.png',
            raw: './src/Assets/img/default/profiles/og9bGML.png'
        },
        {
            name: 'Purple Style',
            cod: 'purple',
            price: 100000000,
            rarity: '<:common:1373321022312415344> Raridade: Comum',
            desc: 'Um roxo cuidadosamente desenhado para você 🫡',
            textcolor: '#FFFFFF',
            embedcolor: '#8c08c3',
            image: 'https://i.imgur.com/exZz9aZ.png',
            raw: './src/Assets/img/default/profiles/VUhKEqm.png'
        },
        {
            name: 'Blue River Style',
            cod: 'blueriver',
            price: 500000000,
            rarity: '<:uncommon:1373320980600193064> Raridade: Incomum',
            desc: 'Porque não diferenciar? se destaque entre todos com o River Style 😏',
            textcolor: '#FFFFFF',
            embedcolor: '#44adc2',
            image: 'https://i.imgur.com/K9S7jJ7.png',
            raw: 'https://i.imgur.com/LTL96HX.png'
        },
        {
            name: 'Red Style',
            cod: 'red',
            price: 500000000,
            rarity: '<:uncommon:1373320980600193064> Raridade: Incomum',
            desc: 'O vermelho é amplo, a criatividade depende de você! 🤭',
            textcolor: '#FFFFFF',
            embedcolor: '#921919',
            image: 'https://i.imgur.com/y8Iu8Ul.png',
            raw: 'https://i.imgur.com/lpM6Hu4.png'
        },
        {
            name: 'Yellow',
            cod: 'yellow',
            price: 500000000,
            rarity: '<:uncommon:1373320980600193064> Raridade: Incomum',
            desc: 'Amarelo é sua cor preferida? Se for, desenhei esse pra você! Um tom vibrante que ilumina tudo! 😍☀️',
            textcolor: '#FFFFFF',
            embedcolor: '#ffd062',
            image: 'https://i.imgur.com/8ksIVen.png',
            raw: 'https://i.imgur.com/7zsMqP9.png'
        },
        {
            name: 'Swamp Green Style',
            cod: 'swampgreen',
            price: 500000000,
            rarity: '<:uncommon:1373320980600193064> Raridade: Incomum',
            desc: 'Verde pantanoso? Mais como um abraço da natureza! Perfeito pra quem ama um toque misterioso e fresquinho como uma floresta encantada!',
            textcolor: '#FFFFFF',
            embedcolor: '#2d6525',
            image: 'https://i.imgur.com/vvzXneZ.png',
            raw: 'https://i.imgur.com/r2tpNWu.png'
        },
        {
            name: 'Pink Style',
            cod: 'pink',
            price: 800000000,
            rarity: '<:rare:1373320842418716744> Raridade: Raro',
            desc: 'Rosa é puro amor! Essa cor é como um docinho açucarado, feita pra quem quer espalhar fofura por aí!',
            textcolor: '#FFFFFF',
            embedcolor: '#ff1493',
            image: 'https://i.imgur.com/TolmNZs.png',
            raw: 'https://i.imgur.com/O5aar5R.png'
        },
        {
            name: 'Dark Red Style',
            cod: 'darkred',
            price: 800000000,
            rarity: '<:rare:1373320842418716744> Raridade: Raro',
            desc: 'Vermelho escuro é paixão e mistério! Ideal pra quem quer um visual elegante com um toque de charme intenso!',
            textcolor: '#FFFFFF',
            embedcolor: '#4f0000',
            image: 'https://i.imgur.com/xI1Pbbs.png',
            raw: 'https://i.imgur.com/OppAFnT.png'
        },
        {
            name: 'Forest Green Style',
            cod: 'forestgreen',
            price: 800000000,
            rarity: '<:rare:1373320842418716744> Raridade: Raro',
            desc: 'Verde floresta é como um passeio entre árvores mágicas! Traz calma e um pedacinho da natureza pra você!',
            textcolor: '#FFFFFF',
            embedcolor: '#0c5a3f',
            image: 'https://i.imgur.com/zVP8Zju.png',
            raw: 'https://i.imgur.com/M17cCeb.png'
        },
        {
            name: 'Blue Ocean Style',
            cod: 'blueocean',
            price: 800000000,
            rarity: '<:rare:1373320842418716744> Raridade: Raro',
            desc: 'Azul oceano é um mergulho refrescante! Feito pra quem sonha com ondas suaves e aventuras no mar! 🌊🩵',
            textcolor: '#FFFFFF',
            embedcolor: '#3c55c0',
            image: 'https://i.imgur.com/ih43YDL.png',
            raw: 'https://i.imgur.com/TsGXUKc.png'
        },
        {
            name: 'Black Style',
            cod: 'black',
            price: 800000000,
            rarity: '<:rare:1373320842418716744> Raridade: Raro',
            desc: 'Um tom mais escuro do layout original, perfeito para você! 😉',
            textcolor: '#FFFFFF',
            embedcolor: '#000000',
            image: 'https://i.imgur.com/zo0WULW.png',
            raw: './src/Assets/img/default/profiles/HVl8I5E.png'
        },
        {
            name: 'Gray Style',
            cod: 'gray',
            price: 800000000,
            rarity: '<:rare:1373320842418716744> Raridade: Raro',
            desc: 'Você gosta de um meio termo? então essa é a escolha perfeita para você!🫡',
            textcolor: '#FFFFFF',
            embedcolor: '#6a6e76',
            image: 'https://i.imgur.com/gHv7O3H.png',
            raw: 'https://i.imgur.com/DygtMhW.png'
        },
        {
            name: 'Black AMOLED',
            cod: 'amoled',
            price: 1000000000,
            rarity: '<:epic:1373320840900251668> Raridade: Épico',
            desc: 'Um tom ainda mais escuro, o Black Amoled é a escolha perfeita para personalização!🤩🤩',
            textcolor: '#FFFFFF',
            embedcolor: '#000000',
            image: 'https://i.imgur.com/7Mrvfdm.png',
            raw: './src/Assets/img/default/profiles/4M0L3D.png'
        },
        {
            name: 'White AMOLED',
            cod: 'wamoled',
            price: 1000000000,
            rarity: '<:epic:1373320840900251668> Raridade: Épico',
            desc: 'Uma remasterização do layout inicial, um pouco mais moderno e bem mais estiloso!✨',
            textcolor: '#000000',
            embedcolor: '#FFFFFF',
            image: 'https://i.imgur.com/B6as4hU.png',
            raw: './src/Assets/img/default/profiles/4M0L3D-WHITE-o.png'
        },
        {
            name: 'Gray AMOLED',
            cod: 'gamoled',
            price: 1000000000,
            rarity: '<:epic:1373320840900251668> Raridade: Épico',
            desc: 'Um cinza mais estiloso, diferenciado e agradável aos olhos!😄',
            textcolor: '#000000',
            embedcolor: '#6a6e76',
            image: 'https://i.imgur.com/ftInqUR.png',
            raw: 'https://i.imgur.com/AH1tdOk.png'
        }
    ]
};

module.exports = { store };
