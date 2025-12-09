/**
 * @param {Guild} guild
 * @param {User} userId
 */

async function checkAndCorrectBalance(client, userId, expectedBalance) {
    try {
        const uSrc = await client.database.users.findOne({ idU: userId });
        if (!uSrc) {
            client.logger.error(`Usuário com ID ${userId} não encontrado no banco de dados.`, 'CheckBank');
            return;
        }
        if (uSrc.bank !== expectedBalance) {
            const diff = expectedBalance - uSrc.bank; // <-- linha adicionada
            client.logger.warn(`Saldo incorreto para o usuário ${userId}. Corrigindo de ${uSrc.bank} para ${expectedBalance}.`, 'CheckBank');
            await client.database.users.updateOne(
                { idU: userId },
                { $inc: { bank: diff } } // <-- linha editada: trocado de $set para $inc com a diferença
            );
            console.log(`Saldo do usuário ${userId} corrigido para ${expectedBalance}.`);
        } else {
            return;
            //console.log(`Saldo do usuário ${userId} está correto.`);
        }
    } catch (error) {
        console.error('Erro ao verificar e corrigir saldo:', error);
    }
}

module.exports = { checkAndCorrectBalance };
