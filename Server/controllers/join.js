const { getPlayers, savePlayers, getGames, saveGames } = require('../utils/dataHandler');
const { generateGameId } = require('../utils/crypto');
const { generateHash } = require('../utils/hash');
const { sendUpdateToClients } = require('./update'); // Importar função para SSE

exports.join = (req, res) => {
    const { group, nick, password, size } = req.body;

    // Validação dos argumentos
    if (!group || !nick || !password || !size) {
        return res.status(400).json({ error: 'Argumentos em falta.' });
    }

    if (group !== 12) {
        return res.status(400).json({ error: 'Group inválido. Deve ser 12.' });
    }

    // Leitura dos jogadores e validação de autenticação
    const players = getPlayers();
    if (!players[nick] || players[nick].password !== generateHash(password)) {
        return res.status(401).json({ error: 'Autenticação falhada.' });
    }

    if (players[nick].status === 'waiting') {
        return res.status(403).json({ error: 'Jogador já está à espera de um adversário.' });
    }

    if (players[nick].status === 'in-game') {
        return res.status(403).json({ error: 'Jogador já está num jogo em curso.' });
    }

    if (players[nick].status !== 'online') {
        return res.status(403).json({ error: 'Jogador não está online.' });
    }

    // Leitura dos jogos
    const games = getGames();

    // Verificar se existe alguém à espera com o mesmo size
    const waitingGame = Object.entries(games).find(([gameId, game]) =>
        game.size === size && Object.keys(game.players).length === 1
    );

    if (waitingGame) {
        // Segundo jogador junta-se ao jogo existente
        const [gameId, game] = waitingGame;

        // Completar o jogo
        game.players[nick] = 'red';
        game.turn = Object.keys(game.players)[0];
        game.board = Array(size).fill(Array(8).fill('empty'));
        game.cell = null;
        game.phase = 'drop';
        game.step = 'from';
        game.winner = null;
        game.pieces = {
            [Object.keys(game.players)[0]]: size * 3,
            [nick]: size * 3
        };
        game.lastMove = null;

        // Atualizar estados dos jogadores
        players[nick].status = 'in-game';
        players[Object.keys(game.players)[0]].status = 'in-game';

        saveGames(games);
        savePlayers(players);

        res.status(200).json({ game: gameId });

        // Atrasar o envio da atualização SSE em 2 segundos
        setTimeout(() => {
            sendUpdateToClients(gameId, {
                board: game.board,
                turn: game.turn,
                phase: game.phase,
                step: game.step,
                winner: game.winner || null,
                message: `Jogador ${nick} juntou-se ao jogo. O jogo começou!`,
            });
            console.log(`SSE enviada após 2 segundos para o jogo ${gameId}.`);
        }, 2000);
    } else {
        // Primeiro jogador cria uma nova sala de espera
        const newGameId = generateGameId({ nick, size, time: Date.now() });
        games[newGameId] = {
            players: { [nick]: 'blue' },
            size,
        };
        players[nick].status = 'waiting';

        saveGames(games);
        savePlayers(players);

        res.status(200).json({ game: newGameId });
    }
};
