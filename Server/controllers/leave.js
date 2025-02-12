const { getPlayers, savePlayers, getGames, saveGames, updateRanking } = require('../utils/dataHandler');
const { generateHash } = require('../utils/hash');
const { sendUpdateToClients } = require('./update'); // Importar a função SSE

exports.leave = (req, res) => {
    const { nick, password, game } = req.body;

    // Validação dos argumentos
    if (!nick || !password || !game) {
        return res.status(400).json({ error: 'Argumentos em falta.' });
    }

    // Leitura dos jogadores e validação de autenticação
    const players = getPlayers();
    if (!players[nick] || players[nick].password !== generateHash(password)) {
        return res.status(401).json({ error: 'Autenticação falhada.' });
    }

    const games = getGames();

    // Verifica se o jogo existe
    if (!games[game]) {
        return res.status(403).json({ error: 'Jogo inválido.' });
    }

    const currentGame = games[game];

    // Verifica se o jogador está no jogo
    if (!currentGame.players[nick]) {
        return res.status(403).json({ error: 'Jogador não faz parte deste jogo.' });
    }

    // Caso 1: Jogador está em espera (sala de espera)
    if (Object.keys(currentGame.players).length === 1) {
        // Remove o jogo da lista de espera
        delete games[game];
        players[nick].status = 'offline';

        saveGames(games);
        savePlayers(players);

        return res.status(200).json({ message: 'Jogador removido da sala de espera.' });
    }

    // Caso 2: Jogador está num jogo em curso
    if (Object.keys(currentGame.players).length === 2) {
        // Determina o adversário
        const opponentNick = Object.keys(currentGame.players).find(player => player !== nick);

        // Atualiza o ranking: adversário ganha, jogador perde
        updateRanking(opponentNick, currentGame.size, true); // Vitória para o adversário
        updateRanking(nick, currentGame.size, false);        // Derrota para o jogador

        // Enviar atualização SSE para os clientes conectados
        sendUpdateToClients(game, {
            board: currentGame.board,
            turn: null,
            phase: currentGame.phase,
            winner: currentGame.winner,
            message: `Jogador ${nick} abandonou o jogo. ${opponentNick} venceu!`,
        });

        // Remove o jogo e atualiza os estados dos jogadores
        delete games[game];
        players[nick].status = 'offline';
        players[opponentNick].status = 'offline';

        saveGames(games);
        savePlayers(players);

        return res.status(200).json({ message: 'Jogador desistiu do jogo. O adversário venceu.' });
    }

    return res.status(403).json({ error: 'Ação não permitida.' });
};
