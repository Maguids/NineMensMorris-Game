const { getGames, saveGames, getPlayers, savePlayers, updateRanking } = require('../utils/dataHandler');

// Lista global para manter conexões SSE
const sseConnections = [];

exports.update = (req, res) => {
    const { nick, game } = req.query;

    // Validação dos argumentos
    if (!nick || !game) {
        return res.status(400).json({ error: 'Argumentos em falta.' });
    }

    // Leitura dos jogos e jogadores
    const games = getGames();
    const players = getPlayers();

    // Verificar se o jogo existe
    if (!games[game]) {
        return res.status(403).json({ error: 'Jogo não encontrado.' });
    }

    const currentGame = games[game];

    // Verificar se o jogador faz parte do jogo
    if (!currentGame.players || !currentGame.players[nick]) {
        return res.status(403).json({ error: 'Jogador não faz parte deste jogo.' });
    }

    // SSE: Se o pedido vier com um cabeçalho específico
    if (req.headers.accept && req.headers.accept === 'text/event-stream') {
        // Configurar cabeçalhos SSE
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Adicionar a conexão SSE à lista global
        sseConnections.push({ nick, game, res });
        console.log(`Conexão SSE iniciada para ${nick} no jogo ${game}`);

        // Enviar uma mensagem inicial
        res.write(`data: ${JSON.stringify({ message: 'Conexão SSE estabelecida.' })}\n\n`);

        // Remover a conexão ao fechar
        req.on('close', () => {
            const index = sseConnections.findIndex(conn => conn.res === res);
            if (index !== -1) {
                sseConnections.splice(index, 1);
                console.log(`Conexão SSE encerrada para ${nick} no jogo ${game}`);
            }
        });

        return; // Manter a conexão aberta
    }

    // Se o jogo ainda não começou (apenas um jogador presente)
    if (Object.keys(currentGame.players).length === 1) {
        return res.status(200).json({});
    }

    // Preparar os dados do jogo
    const response = {
        board: currentGame.board || [],
        cell: currentGame.cell || null,
        phase: currentGame.phase || 'drop',
        step: currentGame.step || 'from',
        players: currentGame.players,
        turn: currentGame.turn,
        winner: currentGame.winner
    };

    // Enviar os dados do jogo através de SSE para os clientes conectados
    sendUpdateToClients(game, {
        board: currentGame.board,
        turn: currentGame.turn,
        phase: currentGame.phase,
        step: currentGame.step,
        winner: currentGame.winner || null,
        message: `Atualização do jogo solicitada pelo jogador ${nick}.`,
    });

    console.log(`Estado do jogo enviado diretamente para ${nick}.`);

    // Devolver o estado do jogo no pedido HTTP
    return res.status(200).json(response);
};

// Função para enviar atualizações SSE aos clientes conectados
function sendUpdateToClients(game, updateData) {
    sseConnections.forEach(({ game: clientGame, res }) => {
        if (clientGame === game) {
            res.write(`data: ${JSON.stringify(updateData)}\n\n`);
        }
    });
    console.log(`Enviada atualização SSE para o jogo ${game}`);
}

exports.sendUpdateToClients = sendUpdateToClients;
