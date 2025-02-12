const { getPlayers, savePlayers } = require('../utils/dataHandler');
const crypto = require('crypto');

exports.register = (req, res) => {
    const { nick, password } = req.body;

    // Validação dos argumentos
    if (!nick || !password) {
        return res.status(400).json({ error: 'Nick e password são obrigatórios.' });
    }

    // Leitura dos jogadores
    const players = getPlayers();

    // Cifrar a password
    const hashPass = crypto.createHash('md5').update(password).digest('hex');

    if (players[nick]) {
        // Jogador existente -> Login
        if (players[nick].password !== hashPass) {
            return res.status(401).json({ error: 'Password inválida.' });
        }

        // Atualiza o estado para online
        players[nick].status = 'online';
        savePlayers(players);

        return res.status(200).json({ message: 'Login bem-sucedido.', nick });
    } else {
        // Novo registo
        players[nick] = {
            password: hashPass,
            status: 'online',
        };

        savePlayers(players);

        return res.status(200).json({ message: 'Registo bem-sucedido.', nick });
    }
};
