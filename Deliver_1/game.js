let jogoAtual = null;

// Ao carregar a página
window.onload = function() {
    document.getElementById('instrucoes-img').style.display = 'none';
};

// Função para iniciar o jogo
function startGame() {
    document.getElementById('splashScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';

    // Exibir o pop-up de configurações após fechar o splash screen
    showSettingsPopup();
}

// Função para mostrar o pop-up de configurações
function showSettingsPopup() {
    document.getElementById('settings-popup').classList.remove('hidden');
    document.querySelector('.overlay').style.display = 'block';
}

// Evento para mostrar o pop-up de configurações quando o ícone é clicado
document.getElementById('settings-icon').addEventListener('click', function() {
    var instructionsImg = document.getElementById('instrucoes-img');
    if (instructionsImg.style.display === 'block') {
        instructionsImg.style.display = 'none';
    }
    
    showSettingsPopup();
});

// Fechar o pop-up ao clicar no botão "Fechar"
document.getElementById('close-popup').addEventListener('click', function() {
    closeSettingsPopup();
});


// Fechar o pop-up ao clicar fora dele
document.querySelector('.overlay').addEventListener('click', function() {
    closeSettingsPopup();
});


// Função para fechar o pop-up de configurações
function closeSettingsPopup() {
    document.getElementById('settings-popup').classList.add('hidden');
    document.querySelector('.overlay').style.display = 'none';
}

// Adicionando stopPropagation para o pop-up
document.getElementById('settings-popup').addEventListener('click', function(event) {
    event.stopPropagation();
});


// Lógica para exibir/ocultar configurações de IA
document.getElementById('player-vs-ai').addEventListener('change', function() {
    document.querySelector('.ia-settings').classList.remove('hidden');
});

// Evento para ocultar configurações de IA ao selecionar "Player vs Player"
document.getElementById('player-vs-player').addEventListener('change', function() {
    document.querySelector('.ia-settings').classList.add('hidden');
});


// Lógica para salvar configurações
document.getElementById('save-settings').addEventListener('click', function() {
    // Obter as configurações selecionadas
    const boardSize = document.getElementById('board-size').value;
    const gameMode = document.querySelector('input[name="game-mode"]:checked').value;
    const aiDifficulty = document.getElementById('ai-difficulty').value;
    const firstPlayer = document.getElementById('first-player').value;

    // Exemplo de aplicação das configurações (você pode adaptar isso)
    console.log({
        boardSize,
        gameMode,
        aiDifficulty,
        firstPlayer
    });

    // Fechar o pop-up
    closeSettingsPopup();

    // Reiniciar o tabuleiro (implemente a lógica do reinício conforme necessário)
    restartGame(config);
});


// Lógica para mostrar instruções
document.getElementById('show-instructions').addEventListener('click', function() {
    closeSettingsPopup();
    document.getElementById('instrucoes-container').style.display = 'flex';
    document.querySelector('.overlay').style.display = 'block';
    document.getElementById('instrucoes-img').style.display = 'block';
});


// Fechar instruções ao clicar no overlay
document.querySelector('.overlay').addEventListener('click', function() {
    document.getElementById('instrucoes-container').style.display = 'none';
    this.style.display = 'none';
    document.getElementById('instrucoes-img').style.display = 'none';
});


// Evento para o ícone de reinício do jogo no quadro de comandos
document.getElementById('restart-game').addEventListener('click', function() {
    // Reinicia o jogo com as configurações atuais
    restartGame(config);
});


// Função de reiniciar o jogo (também permite começar o jogo)
function restartGame(config) {
    // Finaliza o jogo anterior, se existir
    if (jogoAtual !== null) {
        jogoAtual.matarJogo();
    }
    config.carregarConfiguracoes();
    jogoAtual = config.aplicarConfiguracoes();

    // Atualiza o jogador inicial com base nas configurações
    atualizarMensagemInterface(config.firstPlayer, 1);
}

function atualizarMensagemInterface(jogador, fase) {
    const message = document.getElementById('mensagem_atual');
    let player = jogador === 'player1' ? 'Jogador 1' : 'Jogador 2';
    if (fase === 1) {
        message.innerHTML  = `É a vez do jogador <b>${player}</b> de <b>colocar</b> uma peça.`;
    } else if (fase === 2) {
        message.innerHTML  = `É a vez do jogador <b>${player}</b> de <b>mover</b> uma peça.`;
    } else if (fase === 3) {
        message.innerHTML  = `Foi feito um moinho. O <b>${player}</b> deve capturar uma peça do adversário.`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gameBoardHeight = document.getElementById('game-board').offsetHeight;
    document.getElementById('pecas-jogador1').style.maxHeight = `${gameBoardHeight}px`;
    document.getElementById('pecas-jogador2').style.maxHeight = `${gameBoardHeight}px`;
    document.getElementById('capturadas-jogador1').style.maxHeight = `${gameBoardHeight}px`;
    document.getElementById('capturadas-jogador2').style.maxHeight = `${gameBoardHeight}px`;
});


// ----------------------------------------------------------------------------------
// -------------------------------------- JOGO --------------------------------------
// ----------------------------------------------------------------------------------

class ConfiguracaoJogo {
    constructor() {
        this.boardSize = 3;
        this.gameMode = 'pvp';
        this.aiDifficulty = 'medium';
        this.firstPlayer = 'player1';
    }

    carregarConfiguracoes() {
        this.boardSize = parseInt(document.getElementById('board-size').value);
        this.gameMode = document.querySelector('input[name="game-mode"]:checked').value;
        this.aiDifficulty = document.getElementById('ai-difficulty').value;
        this.firstPlayer = document.getElementById('first-player').value;
    }

    aplicarConfiguracoes() {
        if (this.firstPlayer === 'random') {
            this.firstPlayer = Math.random() < 0.5 ? 'player1' : 'player2';
        }
        return new Jogo(this.boardSize, this.firstPlayer, this.gameMode, this.aiDifficulty, true);
    }
}

// Esta classe representa os nós, ou seja onde podem ser ou não jogadas peças
class No {
    constructor(id, x, y) {
        this.id = id;   // Identificador fo nó ('Id do quadrado' + 'Id da Peça')
        this.state = null; // Se null, casa está vazia, caso contrário, pertence a player1 ou player2
        this.x = x; // Coordenada X do nó
        this.y = y; // Coordenada Y do nó
        this.conexoes = []; // Lista de nós conectados
        this.moinho = false;    // Indica se o nó faz parte de um moinho
    }
}

// Estrutura do tabuleiro 
class Tabuleiro {
    constructor(numNiveis, jogo, show) {
        this.niveis = []    // Lista com as listas dos nós por niveis
        this.numNiveis = numNiveis;     // Número de quadrados (niveis)
        this.nos = []; // Armazena todos os nós, independentemente do nivel
        this.tamanhoTabuleiro = 500; // Tamanho total do tabuleiro 
        this.centroTabuleiro = this.tamanhoTabuleiro / 2; // Coordenada do centro do tabuleiro
        this.jogo = jogo;
        if (show) {
            this.rend = new Renderizador(this);
        }
        this.moinhosAtivos = jogo.moinhosAtivos; // Referência direta ao estado dos moinhos ativos
        this.criarTabuleiro();
        this.conectarNos();
    }

    // Esta função crias os nós 
    criarTabuleiro() {
        const maxTamanhoQuadrado = this.tamanhoTabuleiro / 2; // O tamanho máximo para o quadrado externo
        const step = maxTamanhoQuadrado / (this.numNiveis); // Diferença de tamanho entre quadrados

        // Criar nós para cada nível
        for (let i = 0; i < this.numNiveis; i++) {
            const nivel = [];
            const baseId = `${this.numNiveis - i}`; // ID do nível atual (começa no quadrado exterior e vai andando para o centro)
            const tamanhoQuadrado = maxTamanhoQuadrado - (i * step); // Tamanho do quadrado atual

            // Definindo posições dos nós em forma de quadrado (centralizado)
            const positions = this.gerarPosicoes(tamanhoQuadrado)

            // Adicionando os nós ao nível
            positions.forEach((pos, index) => {
                const no = new No(
                    `${baseId}${index + 1}`,
                    this.centroTabuleiro + pos.x, // Posição x ajustada ao centro
                    this.centroTabuleiro + pos.y  // Posição y ajustada ao centro
                );
                nivel.push(no);
                this.nos.push(no);
            });
            this.niveis.push(nivel)
        }
    }

    gerarPosicoes(tamanhoQuadrado) {
        return [
            { x: -tamanhoQuadrado, y: -tamanhoQuadrado }, // Superior Esquerdo
            { x: 0, y: -tamanhoQuadrado },               // Superior Centro
            { x: tamanhoQuadrado, y: -tamanhoQuadrado },  // Superior Direito
            { x: -tamanhoQuadrado, y: 0 },               // Esquerda Centro
            { x: tamanhoQuadrado, y: 0 },                // Direita Centro
            { x: -tamanhoQuadrado, y: tamanhoQuadrado }, // Inferior Esquerdo
            { x: 0, y: tamanhoQuadrado },                // Inferior Centro
            { x: tamanhoQuadrado, y: tamanhoQuadrado },   // Inferior Direito
        ];
    }

    conectarNos() {
        // Conectar nós dentro de cada nível
        for (let nivel of this.niveis) {
            nivel[0].conexoes.push(nivel[1], nivel[3]);
            nivel[1].conexoes.push(nivel[0], nivel[2]);
            nivel[2].conexoes.push(nivel[1], nivel[4]);
            nivel[3].conexoes.push(nivel[0], nivel[5]);
            nivel[4].conexoes.push(nivel[2], nivel[7]);
            nivel[5].conexoes.push(nivel[3], nivel[6]);
            nivel[6].conexoes.push(nivel[5], nivel[7]);
            nivel[7].conexoes.push(nivel[4], nivel[6]);
        }

        for (let i = 1; i < this.numNiveis; i++) {
            this.niveis[i][1].conexoes.push(this.niveis[i - 1][1]); // Liga os nós 2
            this.niveis[i][3].conexoes.push(this.niveis[i - 1][3]); // Liga os nós 4
            this.niveis[i][4].conexoes.push(this.niveis[i - 1][4]); // Liga os nós 5
            this.niveis[i][6].conexoes.push(this.niveis[i - 1][6]); // Liga os nós 7

            this.niveis[i - 1][1].conexoes.push(this.niveis[i][1]); 
            this.niveis[i - 1][3].conexoes.push(this.niveis[i][3]);
            this.niveis[i - 1][4].conexoes.push(this.niveis[i][4]);
            this.niveis[i - 1][6].conexoes.push(this.niveis[i][6]);
        }
    }
}

class Renderizador {
    constructor(tabuleiro) {
        this.tabuleiro = tabuleiro;
        this.gameBoard = document.getElementById('game-board');
        this.pecasJogador1Container = document.getElementById('pecas-jogador1');
        this.pecasJogador2Container = document.getElementById('pecas-jogador2');
        this.pecasCapturadas1 = document.getElementById('capturadas-jogador1');
        this.pecasCapturadas2 = document.getElementById('capturadas-jogador2');
    }

    // Renderiza todo o tabuleiro
    renderizar() {
        this.gameBoard.innerHTML = ''; // Limpa o tabuleiro existente
        this.renderizarNos();
    }

    // Renderiza os nós e suas conexões
    renderizarNos() {
        this.tabuleiro.nos.forEach(no => {
            const noDiv = document.createElement('div');
            noDiv.classList.add('no');
            noDiv.style.left = `${no.x}px`;
            noDiv.style.top = `${no.y}px`;
            noDiv.id = no.id;

            if (no.state === 'player1') {
                noDiv.classList.add('player1');
            } else if (no.state === 'player2') {
                noDiv.classList.add('player2');
            }

            noDiv.addEventListener('click', () => this.tabuleiro.jogo.handleClick(no));
            this.gameBoard.appendChild(noDiv);
            no.element = noDiv;

            no.conexoes.forEach(conexao => this.desenharLinha(no, conexao));
        });
    }

    // Desenha a linha entre dois nós
    desenharLinha(no1, no2) {
        if (this.gameBoard.querySelector(`.linha[data-no1="${no1.id}"][data-no2="${no2.id}"]`) ||
            this.gameBoard.querySelector(`.linha[data-no1="${no2.id}"][data-no2="${no1.id}"]`)) {
            return;
        }

        const linha = document.createElement('div');
        linha.classList.add('linha');

        const dx = no2.x - no1.x;
        const dy = no2.y - no1.y;
        const comprimento = Math.sqrt(dx * dx + dy * dy);
        linha.style.width = `${comprimento}px`;
        linha.style.height = '2px';

        const angulo = Math.atan2(dy, dx) * (180 / Math.PI);
        linha.style.transform = `rotate(${angulo}deg)`;
        linha.style.left = `${no1.x}px`;
        linha.style.top = `${no1.y}px`;

        linha.dataset.no1 = no1.id;
        linha.dataset.no2 = no2.id;
        
        this.gameBoard.appendChild(linha);
    }

    // Define o estilo de uma casa ocupada pelo jogador atual
    atualizarCasaJogador(no) {
        no.element.classList.remove('destacar-verde'); // Remove piscar se estiver na fase 1
        no.element.classList.add(no.state);
    }

    // Remove o estilo de uma casa ocupada
    removerCasaJogador(no) {
        no.element.classList.remove('player1', 'player2');
    }

    // Adiciona o efeito de piscar verde a todas as casas livres
    aplicarTodosPiscarVerde() {
        this.tabuleiro.nos.forEach(no => {
            if (no.state === null) { // Verifica se a casa está livre
                no.element.classList.add('destacar-verde');
            }
        });
    }

    // Remove o efeito de piscar verde de todas as casas
    removerTodosPiscarVerde() {
        this.tabuleiro.nos.forEach(no => {
            no.element.classList.remove('destacar-verde');
        });
    }

    // Destaca os nós e as conexões de um moinho
    destacarMoinho(moinho) {
        moinho.forEach((no, index) => {
            // Aplica a classe de destaque nos nós
            no.element.classList.add('destacar-amarelo');
            
            // Destaca as conexões entre os nós do moinho
            if (index < moinho.length - 1) {
                const proximoNo = moinho[index + 1];
                this.destacarConexao(no, proximoNo);
            }
        });
    }

    // Destaca uma conexão como parte de um moinho
    destacarConexao(no1, no2) {
        const linha = Array.from(this.gameBoard.querySelectorAll('.linha')).find(
            l => (l.dataset.no1 === no1.id && l.dataset.no2 === no2.id) ||
                 (l.dataset.no1 === no2.id && l.dataset.no2 === no1.id)
        );
        if (linha) {
            linha.classList.add('linha-destacar-amarelo');
        }
    }
    
    // Remove o destaque do moinho e suas conexões
    removerDestaqueMoinho(moinho) {
        moinho.forEach((no, index) => {
            no.element.classList.remove('destacar-amarelo');
            if (index < moinho.length - 1) {
                const proximoNo = moinho[index + 1];
                this.removerDestaqueConexao(no, proximoNo);
            }
        });
    }

    // Remove o destaque de uma conexão
    removerDestaqueConexao(no1, no2) {
        const linha = Array.from(this.gameBoard.querySelectorAll('.linha')).find(
            l => (l.dataset.no1 === no1.id && l.dataset.no2 === no2.id) ||
                 (l.dataset.no1 === no2.id && l.dataset.no2 === no1.id)
        );
        if (linha) {
            linha.classList.remove('linha-destacar-amarelo');
        }
    }

    faseUm() {
        this.renderizar();
        this.aplicarTodosPiscarVerde();
    }

    // Adiciona a classe `capturavel-vermelho` aos nós especificados na lista
    destacarCapturaveis(listaNosCapturaveis) {
        listaNosCapturaveis.forEach(no => {
            no.element.classList.add('capturavel-vermelho');
        });
    }

    // Remove a classe `capturavel-vermelho` dos nós especificados na lista
    removerDestacarCapturaveis(listaNosCapturaveis) {
        listaNosCapturaveis.forEach(no => {
            no.element.classList.remove('capturavel-vermelho');
        });
    }

    destacarNoSelecionado(no) {
        no.element.classList.add('destacar-selecao-verde')
    }

    removerNoSelecionado(no) {
        no.element.classList.remove('destacar-selecao-verde')
    }

    destacarMovimentosValidos(nos) {
        nos.forEach(no => {
            no.element.classList.add('destacar-verde');
        });
    }

    // Função para remover a classe de piscar verde
    removerMovimentosValidos(nos) {
        nos.forEach(no => {
            no.element.classList.remove('destacar-verde');
        });
    }

    // Renderiza as peças restantes para cada jogador
    renderizarPecasPorColocar(pecasJogador1, pecasJogador2) {
        this.pecasJogador1Container.innerHTML = ''; // Limpa as peças antigas
        this.pecasJogador2Container.innerHTML = '';

        // Renderiza as peças de cada jogador
        for (let i = 0; i < pecasJogador1; i++) {
            const peca = document.createElement('div');
            peca.classList.add('peca', 'player1');
            this.pecasJogador1Container.appendChild(peca);
        }

        for (let i = 0; i < pecasJogador2; i++) {
            const peca = document.createElement('div');
            peca.classList.add('peca', 'player2');
            this.pecasJogador2Container.appendChild(peca);
        }
    }
   
    // Renderiza as peças restantes para cada jogador
    renderizarPecasCapturadas(capturadas1, capturadas2) {
        this.pecasCapturadas1.innerHTML = '';
        this.pecasCapturadas2.innerHTML = '';
        
        for (let i = 0; i < capturadas1; i++) {
            const peca = document.createElement('div');
            peca.classList.add('peca', 'player2');
            this.pecasCapturadas1.appendChild(peca);
        }

        for (let i = 0; i < capturadas2; i++) {
            const peca = document.createElement('div');
            peca.classList.add('peca', 'player1');
            this.pecasCapturadas2.appendChild(peca);
        }
    }
    
}

let pontosJogador1 = 0;
let pontosJogador2 = 0;


class Jogo {
    constructor(numNiveis, firstPlayer, mode, aiDifficulty, show) {
        this.fase = 1;  // fase 1 = drop, fase 2 = move
        this.previous = 1
        this.jogadorAtual = firstPlayer;
        this.numNiveis = numNiveis;
        this.totalPecas =  3 * numNiveis * 2;
        this.porJogador1 = 3 * numNiveis;
        this.porJogador2 = 3 * numNiveis;
        this.pecasJogador1 = 0; // conta o número de peças em jogo do jogador 1
        this.pecasJogador2 = 0; // conta o número de peças em jogo do jogador 2
        this.capturadas1 = 0;
        this.capturadas2 = 0;
        this.moinhosAtivos = []; // Guarda os moinhos ativos
        this.noSelecionado = null;  //Armazena a peça selecionada para mover (fase 2)
        this.movimentosValidos = []; // Guarda os movimentos válidos da fase 2
        this.contadorEmpate = 0;
        this.game_mode = mode;
        this.tabuleiro = new Tabuleiro(numNiveis, this, show);
        if (show) {
            this.tabuleiro.rend.faseUm();
            this.tabuleiro.rend.renderizarPecasPorColocar(this.porJogador1, this.porJogador2);
            this.tabuleiro.rend.renderizarPecasCapturadas(this.capturadas1, this.capturadas2);
            console.log(`Game mode ${this.game_mode}`);
            console.log("Jogo iniciado. Fase 1 - Colocação de peças.")  // controlo
            this.dificuldade = aiDifficulty;
            if (this.game_mode === 'pve') {
                this.escolherDificuldade();
                if (this.jogadorAtual === 'player2') {
                    this.jogadaIA(); 
                    this.atualizarInteracaoNos();
                } 
            } 
        }
    }

    trocarJogador() {
        this.jogadorAtual = this.jogadorAtual === 'player1' ? 'player2' : 'player1';
        console.log(`Trocou player`);
        atualizarMensagemInterface(this.jogadorAtual, this.fase);
        
        if (this.game_mode === 'pve') {
            this.atualizarInteracaoNos();
            if (this.jogadorAtual === 'player2') {this.jogadaIA();}
        }
    }

    escolherDificuldade() {
        if (this.dificuldade === 'easy') {
            this.ia = new easy_mode();
            console.log(`Game mode EASY`);
        } else if (this.dificuldade === 'medium') {
            this.ia = new medium_mode();
            console.log(`Game mode MEDIUM`);
        } else {
            this.ia = new hard_mode();
            console.log(`Game mode HARD`);
        }
    }
    
    // Ativa ou desativa os nós com base no jogador atual
    atualizarInteracaoNos() {
        this.tabuleiro.nos.forEach(no => {
            if (this.jogadorAtual === 'player1') {
                // Ativa o clique ajustando o estilo e remove a classe "desativado"
                no.element.style.pointerEvents = 'auto';
                no.element.classList.remove('desativado');
            } else {
                // Desativa o clique ajustando o estilo e adiciona a classe "desativado"
                no.element.style.pointerEvents = 'none';
                no.element.classList.add('desativado');
            }
        });
    }

    colocarPeca(no) {
        if (this.fase === 1 && no.state === null) {
            no.state = this.jogadorAtual;
            this.tabuleiro.rend.atualizarCasaJogador(no)
            console.log(`Peça do ${this.jogadorAtual} colocada no nó ${no.id}`);    // controlo

            this.atualizarContagemPecas()

            // Atualiza a área lateral de peças
            this.tabuleiro.rend.renderizarPecasPorColocar(this.porJogador1, this.porJogador2);

            // Remove o efeito de piscar verde do nó onde a peça foi colocada
            no.element.classList.remove('destacar-verde');

            this.verificarFaseMovimento()

            // Vamos ver se foi criado um moinho
            
            if (this.verificarMoinho(no, false)) {
                if (this.game_mode === 'pve' && this.jogadorAtual === 'player2') {
                    this.ia.capturarPeca(this);
                } else  {
                    this.iniciarFase3();
                }
            } else  {
                this.trocarJogador();
            }
        } else {
            console.log("Movimento inválido. Escolha uma casa vazia.")  // controlo
        }
    }

    // Atualizar a contagem das peças do jogador atual
    atualizarContagemPecas() {
        if (this.jogadorAtual === 'player1') {
            this.pecasJogador1++;
            this.porJogador1--;
        } else {
            this.pecasJogador2++;
            this.porJogador2--;
        }
        this.totalPecas--;
        console.log(`total peças = ${this.totalPecas}`)   // controlo
    }

    // Verificar se a fase 1 já acabou
    verificarFaseMovimento() {
        if (this.totalPecas === 0) {
            console.log("Todas as peças foram jogadas")   // controlo
            this.tabuleiro.rend.removerTodosPiscarVerde();
            this.fase = 2;  // a fase de colocação das peças acabou, vamos passar para a movimentação
            console.log("Iniciando Fase 2 - Movimento de peças.")   // controlo
        }
    }

    // Esta função vê se a peça colocada gerou um moinho, se isso acontecer as borders dessas peças ficam amarelas
    verificarMoinho(no, test) {
        const jogador = no.state;
        if (!jogador) return false; // Se o nó está vazio, não verifica moinho

        // Função auxiliar para expandir a busca em uma direção (horizontal ou vertical)
        const expandirBusca = (noInicial, eixo) => {
            let listaMoinho = [noInicial];
            let index = 0;

            while (index < listaMoinho.length) {
                const noAtual = listaMoinho[index];
                index++;

                // Para cada conexão do nó atual
                noAtual.conexoes.forEach(conexao => {
                    // Verifica se a conexão tem o mesmo estado e está no mesmo eixo (y ou x)
                    if (conexao.state === jogador && 
                        !listaMoinho.includes(conexao) &&  // Evita duplicados
                        ((eixo === 'horizontal' && conexao.y === noInicial.y) ||
                        (eixo === 'vertical' && conexao.x === noInicial.x))) {
                        listaMoinho.push(conexao);
                    }
                });
            }
            return listaMoinho;
        };

        // Expande a busca em ambas as direções
        const moinhoHorizontal = expandirBusca(no, 'horizontal');
        const moinhoVertical = expandirBusca(no, 'vertical');

        let m = false;  // saber se criou moinho ou não (podem ser criados 2 um na vertical e outro na horizontal)

        // Verifica se há um moinho (precisamos de exatamente 3 nós conectados)
        if (moinhoHorizontal.length >= 3) {
            if (test === false) {
                this.adicionarMoinho(moinhoHorizontal.slice(0,3))
                console.log(`Moinho horizontal formado pelo ${jogador} no nó ${no.id}`);
            }
            m = true;
        }

        if (moinhoVertical.length >= 3) {
            if (test === false) {
                this.adicionarMoinho(moinhoVertical.slice(0,3))
                console.log(`Moinho vertical formado pelo ${jogador} no nó ${no.id}`);
            }
            m = true
        }
        
        return m; // Indica se um moinho foi formado
    }

    // Adiciona o moinho ao jogo
    adicionarMoinho(moinho) {
        // Ordena os nós por localização (primeiro `y`, depois `x`)
        moinho.sort((a, b) => {
            if (a.y === b.y) {
                return a.x - b.x;
            }
            return a.y - b.y;
        });

        // Adiciona o moinho à lista de moinhos ativos e aplica o destaque
        this.moinhosAtivos.push(moinho);
        moinho.forEach(no => no.moinho = true);
        this.tabuleiro.rend.destacarMoinho(moinho);
    }

    // Atualiza os moinhos afetados após movimento
    removerMoinhos() {
        this.moinhosAtivos.forEach(moinho => {
            // Remove o destaque visual do moinho
            this.tabuleiro.rend.removerDestaqueMoinho(moinho);
            moinho.forEach(no => no.moinho = false)
        })
        this.moinhosAtivos = []
    }

    iniciarFase3() {
        this.previous = this.fase;
        this.fase = 3;
        let jogadorOposto = this.jogadorAtual === 'player1' ? 'player2' : 'player1';   //Ir buscar a pessoa a quem podemos remover peças
        console.log(`Entrou fase 3 com ${jogadorOposto}`);

        let listaNosCapturaveis = this.tabuleiro.nos.filter(no => no.state === jogadorOposto);

        if (this.previous === 1) {this.tabuleiro.rend.removerTodosPiscarVerde();}

        // Destaca os nós capturáveis em vermelho
        this.tabuleiro.rend.destacarCapturaveis(listaNosCapturaveis);
        console.log("Iniciando Fase 3 - Captura de peças.");
        
        // Armazena a lista para remover o destaque posteriormente
        this.listaNosCapturaveis = listaNosCapturaveis;

        atualizarMensagemInterface(this.jogadorAtual, this.fase);
    }

    // Retirar uma peça ao adversário
    capturarPeca(no) {
        // Apenas aceita a peça se não estiver num moinho ou se só houver moinhos
        let jogadorOposto = this.jogadorAtual === 'player1' ? 'player2' : 'player1';
        if (no.state === jogadorOposto) {
            no.state = null;    // Remove a peça do tabuleiro
            this.tabuleiro.rend.removerCasaJogador(no);
            this.pecaCapturada();
            this.tabuleiro.rend.renderizarPecasCapturadas(this.capturadas1, this.capturadas2);

            console.log(`Peça do ${jogadorOposto} capturada no nó ${no.id}`);   // controlo
    
            // Atualiza o número de peças do jogador adversário
            if (jogadorOposto === 'player1') {
                this.pecasJogador1--;
            } else {
                this.pecasJogador2--;
            }

            this.finalizarFase3();
    
        } else {
            console.log("Peça inválida para captura. Selecione outra peça do adversário.");
        }
    }

    // Atualiza os contadores de peças capturadas (para a renderização)
    pecaCapturada() {
        if (this.jogadorAtual == 'player1') {
            this.capturadas1 += 1;
        } else {
            this.capturadas2 += 1;
        }
    }

    finalizarFase3() {
        // Apenas retorna à fase 2 após a captura
        if (this.previous === 1) {
            this.fase = 1; // Garante que a fase seja mantida como 1 após a fase de captura
            this.tabuleiro.rend.aplicarTodosPiscarVerde();
        } else if (this.previous === 2) {
            this.fase = 2; // Garante o retorno à fase de movimentação
        }

        // Remove o destaque vermelho dos nós capturáveis
        if (this.listaNosCapturaveis) {
            this.tabuleiro.rend.removerDestacarCapturaveis(this.listaNosCapturaveis);
            this.listaNosCapturaveis = null; // Limpa a lista
        }

        if (this.fase === 1) {this.tabuleiro.rend.aplicarTodosPiscarVerde();}

        this.removerMoinhos();
        console.log("Finalizando Fase 3 - Captura concluída.");
        this.trocarJogador();
        this.verificarFimDoJogo();
    }

    // Seleciona uma peça para mover e destaca movimentos válidos
    selecionarPecaParaMover(no) {
        if (no.state === this.jogadorAtual) {
            this.noSelecionado = no;
            this.tabuleiro.rend.destacarNoSelecionado(no);
            console.log(`Peça do ${this.jogadorAtual} selecionada no nó ${no.id}`);
            
            // Destaca os movimentos válidos a partir da peça selecionada
            this.movimentosValidos = this.encontrarMovimentosValidos(no);
            // Usando um pequeno atraso para suavizar a transição
            setTimeout(() => {
                this.tabuleiro.rend.destacarMovimentosValidos(this.movimentosValidos);
                this.movimentosValidos = this.encontrarMovimentosValidos(no);
            }, 100); // 100ms de atraso, ajuste conforme necessário
        } else {
            console.log("Selecione uma de suas próprias peças para mover.");
        }
    }       

    // Retorna os nós adjacentes e vazios (movimentos válidos)
    encontrarMovimentosValidos(no) {
        if ((this.jogadorAtual === 'player1' && this.pecasJogador1 === 3) ||
            (this.jogadorAtual === 'player2' && this.pecasJogador2 === 3)) {
            // Movimento livre para qualquer casa vazia
            return this.tabuleiro.nos.filter(nos => nos.state === null);
        } else {
            // Movimento restrito a casas adjacentes
            return no.conexoes.filter(conexao => conexao.state === null);
        }
    }

    // Movimenta a peça para o nó de destino
    moverPeca(no) {
        if (this.noSelecionado && this.movimentosValidos.includes(no)) {
            // Atualiza o estado dos nós de origem e destino
            no.state = this.jogadorAtual;
            // Caso o nó de origem tivesse moinhos, elimina-os
            this.noSelecionado.state = null;

            // Atualiza o tabuleiro visualmente
            this.tabuleiro.rend.removerCasaJogador(this.noSelecionado);
            this.tabuleiro.rend.atualizarCasaJogador(no);

            console.log(`Peça do ${this.jogadorAtual} movida para o nó ${no.id}`);

            
            // Verifica se formou um moinho com o movimento
            if (this.verificarMoinho(no, false)) {
                if (this.game_mode === 'pve' && this.jogadorAtual === 'player2') {
                    this.ia.capturarPeca(this);
                } else  {
                    this.iniciarFase3();
                }
            } else {
                this.trocarJogador(); // Troca o turno
            }

            // Limpa a seleção
            this.tabuleiro.rend.removerNoSelecionado(this.noSelecionado);
            this.noSelecionado = null;
            this.tabuleiro.rend.removerMovimentosValidos(this.movimentosValidos);
            this.movimentosValidos = [];
            if(this.pecasJogador1 === 3 && this.pecasJogador2 === 3) {this.contadorEmpate++;}
            this.verificarFimDoJogo();
        } else {
            console.log("Movimento inválido. Selecione uma casa vazia adjacente.");
        }
    }

    // Verifica as condições de termino do jogo
    verificarFimDoJogo() {
        if(this.previous === 1) {return;}
        // Verifica condições de vitória por número de peças
        if (this.pecasJogador1 < 3) {
            this.incrementarPontos('player2');
            console.log("Jogador 2 venceu!");
            alert("Jogador 2 venceu!");
            this.fimDoJogo();
            return;
        } else if (this.pecasJogador2 < 3) {
            this.incrementarPontos('player1');
            console.log("Jogador 1 venceu!");
            alert("Jogador 1 venceu!");
            this.fimDoJogo();
            return;
        }

        // Verifica se o jogador atual possui movimentos possíveis
        const jogadorAtual = this.jogadorAtual;
        const possuiMovimento = this.tabuleiro.nos.some(no => 
            no.state === jogadorAtual && this.encontrarMovimentosValidos(no).length > 0
        );

        if (!possuiMovimento) {
            this.incrementarPontos(vencedor);
            console.log(`O jogador ${jogadorAtual === 'player1' ? '2' : '1'} venceu por bloqueio de movimento!`);
            alert(`O jogador ${jogadorAtual === 'player1' ? '2' : '1'} venceu por bloqueio de movimento!`);
            this.fimDoJogo();
            return;
        }

        // Condição de empate
        if (this.pecasJogador1 === 3 && this.pecasJogador2 === 3) {
            console.log(`Perto de ser empate: ${this.contadorEmpate}`);
            if (this.contadorEmpate >= 10) {
                console.log("Empate! Nenhum vencedor.");
                alert("Empate! Nenhum vencedor.");
                this.fimDoJogo();
                return;
            }
        }
    }

    // Declara que o jogo terminou
    fimDoJogo() {
        // Desativa interações com o tabuleiro e nós
        this.tabuleiro.nos.forEach(no => {
            no.element.removeEventListener('click', this.handleClick.bind(this));
            no.element.classList.add('desativado'); // Adiciona um estilo de desativação
        });

        // Exibe um pop-up indicando que o jogo terminou e fornece opção para reiniciar
        setTimeout(() => {
            const jogarNovamente = confirm("O jogo terminou! Deseja jogar novamente?");
            
            if (jogarNovamente) {
                restartGame(config); // Reinicia o jogo com as configurações iniciais
            } else {
                alert("Obrigado por jogar!");
            }
        }, 100); // Pequeno atraso para garantir que a interface esteja pronta
    }

    // Função que gere os cliques nas peças consoante a fase de jogo
    handleClick(no) {
        if (this.jogadorAtual === 'player2' && this.game_mode === 'pve') {return;}
        if (this.fase === 1) {  // colocar peças
            this.colocarPeca(no);
        } else if (this.fase === 2) {   // mover peças
            // Caso ainda não haja uma peça selecionada para mover
            if (this.noSelecionado === null) {
                console.log("Selecionou um nó.");
                if (no.state === this.jogadorAtual) {
                    this.selecionarPecaParaMover(no);
                } else {
                    console.log("Selecione uma de suas próprias peças para mover.");
                }
            } 
            // Caso uma peça já esteja selecionada, verifica o clique em um movimento válido
            else if (this.movimentosValidos.includes(no)) {
                console.log("Vai mover uma peça");
                this.moverPeca(no);
            } 
            // Se o jogador clica em uma nova peça própria, redefine a seleção
            else if (no.state === this.jogadorAtual) {
                if (this.noSelecionado != null) {
                    this.tabuleiro.rend.removerMovimentosValidos(this.movimentosValidos); // Remove destaque dos movimentos válidos anteriores
                    this.noSelecionado.element.classList.remove('destacar-selecao-verde');
                }
                console.log("Escolheu outro nó.");
                // Redefine a seleção anterior e destaca os movimentos da nova peça
                this.selecionarPecaParaMover(no);
            } else {
                console.log("Movimento inválido. Selecione uma casa válida ou uma peça sua.");
            }
        } else if (this.fase === 3) {   // capturar uma peça (foi criado um moinho)
            this.capturarPeca(no);
        }
    }

    // Função para finalizar o jogo atual
    matarJogo() {
        // Limpa os nós
        if (this.tabuleiro && this.tabuleiro.nos) {
            this.tabuleiro.nos.forEach(no => {
                if (no.element) {
                    // Remove classes e event listeners dos elementos de cada nó
                    no.element.className = ''; // Remove todas as classes
                    no.element.removeEventListener('click', () => this.handleClick(no));
                }
            });
        }

        // Remove as linhas de conexão do DOM
        const linhas = document.querySelectorAll('.linha');
        linhas.forEach(linha => linha.remove());

        // Limpa o array de moinhos ativos e redefine estados necessários
        this.moinhosAtivos = [];
        console.log("Jogo finalizado e recursos limpos.");
    }

    async jogadaIA() {
        console.log("IA a jogar...");
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        // Executa a jogada da IA com base na fase atual
        if (this.fase === 1) {
            this.ia.colocarPeca(this);
        } else if (this.fase === 2) {
            this.ia.escolherPeca(this);
        }
    }

    // Função para retornar o jogador oponente
    jogadorOponente() {
        return this.jogadorAtual === 'player1' ? 'player2' : 'player1';
    }

    criarCopiaJogo() {
        // Cria uma nova instância do jogo para a cópia profunda
        const copiaJogo = new Jogo(this.numNiveis, this.jogadorAtual, this.game_mode, this.dificuldade, false);

        // Copia propriedades de estado primitivo
        copiaJogo.jogadorAtual = this.jogadorAtual;
        copiaJogo.fase = this.fase;
        copiaJogo.totalPecas = this.totalPecas;
        copiaJogo.porJogador1 = this.porJogador1;
        copiaJogo.porJogador2 = this.porJogador2;
        copiaJogo.pecasJogador1 = this.pecasJogador1;
        copiaJogo.pecasJogador2 = this.pecasJogador2;
        copiaJogo.capturadas1 = this.capturadas1;
        copiaJogo.capturadas2 = this.capturadas2;
        copiaJogo.contadorEmpate = this.contadorEmpate;

        // Realiza uma cópia profunda dos nós e de suas conexões
        copiaJogo.tabuleiro.nos = this.tabuleiro.nos.map(no => {
            const novoNo = new No(no.id, no.x, no.y);
            novoNo.state = no.state;
            novoNo.moinho = no.moinho;
            return novoNo;
        });

        // Restabelece as conexões entre os nós copiados
        copiaJogo.tabuleiro.nos.forEach((noCopiado, index) => {
            const noOriginal = this.tabuleiro.nos[index];
            noCopiado.conexoes = noOriginal.conexoes.map(conexaoOriginal => {
                const indexConexao = this.tabuleiro.nos.indexOf(conexaoOriginal);
                return copiaJogo.tabuleiro.nos[indexConexao];
            });
        });

        return copiaJogo;
    }

        getPontosJogador1() {
        return pontosJogador1;
    }

    getPontosJogador2() {
        return pontosJogador2;
    }

    incrementarPontos(vencedor) {
        if (vencedor === 'player1') {
            pontosJogador1++;
        } else {
            pontosJogador2++;
        }
    }

}

// Faz jogadas random
class easy_mode {
    colocarPeca(jogo) {
        console.log("A usar easy mode.")
        const no = this.movimentoAleatorio(jogo.tabuleiro.nos.filter(no => no.state === null));
        jogo.colocarPeca(no);
    }

    capturarPeca(jogo) {
        jogo.iniciarFase3();
        setTimeout(() => {
            let jogadorOposto = this.jogadorAtual === 'player1' ? 'player2' : 'player1';
            const remove = this.movimentoAleatorio(jogo.tabuleiro.nos.filter(no => no.state === jogadorOposto));
            jogo.capturarPeca(remove);
        }, 1000); // 1000 milissegundos = 1 segundo
    }

    escolherPeca(jogo) {
        const no = this.movimentoAleatorio(jogo.tabuleiro.nos.filter(no => no.state === 'player2' && no.conexoes.some(conexao => conexao.state === null )));
        jogo.selecionarPecaParaMover(no);
        setTimeout(() => {
            const move = this.movimentoAleatorio(jogo.encontrarMovimentosValidos(no));
            jogo.moverPeca(move);
        }, 1000); // 1000 milissegundos = 1 segundo
    }

    // escolhe uma peça de uma lista aleatóriamente
    movimentoAleatorio(nosDisponiveis) {
        return nosDisponiveis[Math.floor(Math.random() * nosDisponiveis.length)];
    }
}

// Prioriza a criação de moinhos tanto na fase 1 como na fase 2
class medium_mode {
    colocarPeca(jogo) {
        console.log("A usar medium mode.");
        const jogadasValidas = jogo.tabuleiro.nos.filter(no => no.state === null);

        // Filtra jogadas que criam um moinho
        const jogadasParaMoinho = jogadasValidas.filter(no => {
            const copiaJogo = jogo.criarCopiaJogo();
            const index = jogo.tabuleiro.nos.indexOf(no);

            if (index !== -1) {
                copiaJogo.tabuleiro.nos[index].state = copiaJogo.jogadorAtual;
                return copiaJogo.verificarMoinho(copiaJogo.tabuleiro.nos[index], true);
            }
            return false;
        });

        // Escolhe a jogada
        const jogada = jogadasParaMoinho.length > 0
            ? jogadasParaMoinho[Math.floor(Math.random() * jogadasParaMoinho.length)]
            : jogadasValidas[Math.floor(Math.random() * jogadasValidas.length)];

        jogo.colocarPeca(jogada);
    }

    escolherPeca(jogo) {
        const pecasMoviveis = jogo.tabuleiro.nos.filter(no =>
            no.state === jogo.jogadorAtual && jogo.encontrarMovimentosValidos(no).length > 0
        );

        let melhorMovimento = null;
        let noSelecionado = null;

        for (let no of pecasMoviveis) {
            const movimentosValidos = jogo.encontrarMovimentosValidos(no);
            for (let movimento of movimentosValidos) {
                const copiaJogo = jogo.criarCopiaJogo();
                const indexNo = jogo.tabuleiro.nos.indexOf(no);
                const indexMovimento = jogo.tabuleiro.nos.indexOf(movimento);

                if (indexNo !== -1 && indexMovimento !== -1) {
                    copiaJogo.tabuleiro.nos[indexMovimento].state = jogo.jogadorAtual;
                    copiaJogo.tabuleiro.nos[indexNo].state = null;

                    if (copiaJogo.verificarMoinho(copiaJogo.tabuleiro.nos[indexMovimento])) {
                        melhorMovimento = movimento;
                        noSelecionado = no;
                        break;
                    }
                }
            }
            if (melhorMovimento) break;
        }

        if (!melhorMovimento) {
            noSelecionado = pecasMoviveis[Math.floor(Math.random() * pecasMoviveis.length)];
            const movimentosValidos = jogo.encontrarMovimentosValidos(noSelecionado);
            melhorMovimento = movimentosValidos[Math.floor(Math.random() * movimentosValidos.length)];
        }

        jogo.selecionarPecaParaMover(noSelecionado);
        setTimeout(() => jogo.moverPeca(melhorMovimento), 1000);
    }

    capturarPeca(jogo) {
        jogo.iniciarFase3();
        setTimeout(() => {
            let jogadorOposto = this.jogadorAtual === 'player1' ? 'player2' : 'player1';
            const remove = this.movimentoAleatorio(jogo.tabuleiro.nos.filter(no => no.state === jogadorOposto));
            jogo.capturarPeca(remove);
        }, 1000);
    }

    movimentoAleatorio(nosDisponiveis) {
        return nosDisponiveis[Math.floor(Math.random() * nosDisponiveis.length)];
    }
}


// Prioriza a criação de moinhos e o bloqueio do oponente
class hard_mode {
    colocarPeca(jogo) {
        console.log("A usar hard mode.");
        const jogadasValidas = jogo.tabuleiro.nos.filter(no => no.state === null);

        const jogadasParaMoinho = jogadasValidas.filter(no => {
            const copiaJogo = jogo.criarCopiaJogo();
            const index = jogo.tabuleiro.nos.indexOf(no);

            if (index !== -1) {
                copiaJogo.tabuleiro.nos[index].state = copiaJogo.jogadorAtual;
                return copiaJogo.verificarMoinho(copiaJogo.tabuleiro.nos[index]);
            }
            return false;
        });

        const jogadasParaBloquear = jogadasValidas.filter(no => {
            const copiaJogo = jogo.criarCopiaJogo();
            const index = jogo.tabuleiro.nos.indexOf(no);

            if (index !== -1) {
                copiaJogo.tabuleiro.nos[index].state = jogo.jogadorOponente();
                return copiaJogo.verificarMoinho(copiaJogo.tabuleiro.nos[index]);
            }
            return false;
        });

        const jogada = jogadasParaMoinho.length > 0
            ? jogadasParaMoinho[Math.floor(Math.random() * jogadasParaMoinho.length)]
            : (jogadasParaBloquear.length > 0
                ? jogadasParaBloquear[Math.floor(Math.random() * jogadasParaBloquear.length)]
                : jogadasValidas[Math.floor(Math.random() * jogadasValidas.length)]);

        jogo.colocarPeca(jogada);
    }

    escolherPeca(jogo) {
        const pecasMoviveis = jogo.tabuleiro.nos.filter(no =>
            no.state === jogo.jogadorAtual && jogo.encontrarMovimentosValidos(no).length > 0
        );

        let melhorMovimento = null;
        let noSelecionado = null;

        for (let no of pecasMoviveis) {
            const movimentosValidos = jogo.encontrarMovimentosValidos(no);
            for (let movimento of movimentosValidos) {
                const copiaJogo = jogo.criarCopiaJogo();
                const indexNo = jogo.tabuleiro.nos.indexOf(no);
                const indexMovimento = jogo.tabuleiro.nos.indexOf(movimento);

                if (indexNo !== -1 && indexMovimento !== -1) {
                    copiaJogo.tabuleiro.nos[indexMovimento].state = jogo.jogadorAtual;
                    copiaJogo.tabuleiro.nos[indexNo].state = null;

                    if (copiaJogo.verificarMoinho(copiaJogo.tabuleiro.nos[indexMovimento])) {
                        melhorMovimento = movimento;
                        noSelecionado = no;
                        break;
                    }
                }
            }
            if (melhorMovimento) break;
        }

        if (!melhorMovimento) {
            noSelecionado = pecasMoviveis[Math.floor(Math.random() * pecasMoviveis.length)];
            const movimentosValidos = jogo.encontrarMovimentosValidos(noSelecionado);
            melhorMovimento = movimentosValidos[Math.floor(Math.random() * movimentosValidos.length)];
        }

        jogo.selecionarPecaParaMover(noSelecionado);
        setTimeout(() => jogo.moverPeca(melhorMovimento), 1000);
    }

    capturarPeca(jogo) {
        jogo.iniciarFase3();
        setTimeout(() => {
            const jogadorOposto = jogo.jogadorAtual === 'player1' ? 'player2' : 'player1';
            const pecasParaCapturar = jogo.tabuleiro.nos.filter(no => no.state === jogadorOposto);
            const alvo = pecasParaCapturar[Math.floor(Math.random() * pecasParaCapturar.length)];
            jogo.capturarPeca(alvo);
        }, 1000);
    }

    movimentoAleatorio(nosDisponiveis) {
        return nosDisponiveis[Math.floor(Math.random() * nosDisponiveis.length)];
    }
}





const config = new ConfiguracaoJogo(); // Cria a configuração com valores padrão
// Inicia o jogo automaticamente ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    restartGame(config);  // Inicia o jogo com a configuração padrão
});

const showRankingBtn = document.getElementById("show-rankings");
const closeRankingBtn = document.getElementById("close-ranking-btn");
const rankingPanel = document.getElementById("ranking-panel");
const rankingBody = document.getElementById("ranking-body");

// Dados de classificação fictícios
function loadRankingData() {
    rankingBody.innerHTML = ""; // Limpa a tabela antes de preencher
    const rankingData = [
        { posicao: 1, jogador: "Jogador 1", pontos: jogoAtual.getPontosJogador1() },
        { posicao: 2, jogador: "Jogador 2", pontos: jogoAtual.getPontosJogador2() }
    ];
    
    rankingData.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.posicao}</td>
            <td>${item.jogador}</td>
            <td>${item.pontos}</td>
        `;
        rankingBody.appendChild(row);
    });
}



// Exibir painel de classificações
showRankingBtn.addEventListener("click", () => {
    loadRankingData();
    rankingPanel.classList.remove("hidden");
    rankingPanel.style.display = "block"; // Exibe o painel
});

// Fechar painel de classificações
closeRankingBtn.addEventListener("click", () => {
    rankingPanel.classList.add("hidden");
    rankingPanel.style.display = "none"; // Oculta o painel
});


document.addEventListener("DOMContentLoaded", function() {
    const resignGameBtn = document.getElementById("resign-game"); // Botão de desistência
    const confirmResignPopup = document.getElementById("confirm-resign-popup");
    const confirmResignYes = document.getElementById("confirm-resign-yes");
    const confirmResignNo = document.getElementById("confirm-resign-no");

    // Função para abrir o popup de confirmação de desistência
    resignGameBtn.addEventListener("click", () => {
        confirmResignPopup.classList.remove("hidden");
        confirmResignPopup.style.display = "block"; // Exibe o popup
    });

    // Função para tratar a confirmação de "Sim" (desistência)
    confirmResignYes.addEventListener("click", () => {
        // Lógica para declarar a vitória do adversário e reiniciar o tabuleiro
        jogoAtual.incrementarPontos(jogoAtual.jogadorOponente())
        // Chame aqui a função para reiniciar o tabuleiro, caso já exista
        restartGame(config);

        // Oculta o popup após confirmar
        confirmResignPopup.classList.add("hidden");
        confirmResignPopup.style.display = "none";
    });

    // Função para tratar a opção "Não" (fechar popup)
    confirmResignNo.addEventListener("click", () => {
        // Oculta o popup sem reiniciar o jogo
        confirmResignPopup.classList.add("hidden");
        confirmResignPopup.style.display = "none";
    });
});


