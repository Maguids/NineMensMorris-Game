const { getRanking } = require('../utils/dataHandler');

exports.ranking = (req, res) => {
    const { group, size } = req.body;

    // Validação dos argumentos
    if (!group || !size) {
        return res.status(400).json({ error: 'Argumentos em falta.' });
    }

    if (group != 12) {
        return res.status(400).json({ error: 'Group inválido. Deve ser 12.' });
    }

    const rankingData = getRanking();

    // Verifica se existe ranking para o size pedido
    const sizeRanking = rankingData[size] || [];
    
    // Ordenar por vitórias e depois alfabeticamente por nick
    const topPlayers = sizeRanking
        .sort((a, b) => {
            if (b.victories === a.victories) {
                return a.nick.localeCompare(b.nick);
            }
            return b.victories - a.victories;
        })
        .slice(0, 10);

    return res.status(200).json({ ranking: topPlayers });
};
