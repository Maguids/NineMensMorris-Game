const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const cors = require('cors'); // Adiciona a importação do cors

const app = express();

// Middleware para CORS (adicional)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Permite qualquer origem
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(cors()); // Ativa o CORS
app.use(bodyParser.json());

const PORT = process.env.PORT || 8112;

// Rotas principais
app.use('/', routes);

// Middleware: Métodos inválidos para rotas conhecidas
app.all('/*', (req, res, next) => {
    if (!['POST', 'GET'].includes(req.method)) {
        res.setHeader('Allow', 'POST, GET');
        return res.status(400).json({ error: 'Método inválido para este endpoint.' });
    }
    next();
});

// Middleware: Rotas desconhecidas
app.use((req, res) => {
    return res.status(404).json({ error: 'Pedido desconhecido.' });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});
