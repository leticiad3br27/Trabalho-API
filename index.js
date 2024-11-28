import express from 'express';
import { 
    buscarHistoricoCompletoIPCA, 
    buscarHistoricoIPCAPorAno, 
    buscarHistoricoIPCAPorId, 
    calcularValorAjustadoPeloIPCA 
} from './servicos/servicos.js';

const app = express();

// Função para gerar mensagens de erro padronizadas
const gerarErro = (res, status, mensagem) => {
    res.status(status).json({ "Erro": mensagem });
};

// Rota para buscar histórico do IPCA
app.get('/histIPCA', (req, res) => {
    const ano = req.query.ano;
    const resultado = (ano !== undefined) 
        ? buscarHistoricoIPCAPorAno(ano) 
        : buscarHistoricoCompletoIPCA();

    if (resultado.length > 0) {
        res.json(resultado);
    } else if (isNaN(ano)) {
        gerarErro(res, 400, "Parâmetro 'ano' está ausente ou inválido.");
    } else {
        gerarErro(res, 404, "Nenhum histórico encontrado para o ano especificado.");
    }
});

// Rota para cálculo ajustado pelo IPCA
app.get('/histIPCA/calculo', (req, res) => {
    const valor = parseFloat(req.query.valor);
    const mesInicial = parseInt(req.query.mesInicial);
    const anoInicial = parseInt(req.query.anoInicial);
    const mesFinal = parseInt(req.query.mesFinal);
    const anoFinal = parseInt(req.query.anoFinal);

    if (isNaN(valor) || isNaN(mesInicial) || isNaN(anoInicial) || isNaN(mesFinal) || isNaN(anoFinal)) {
        return gerarErro(res, 400, "Parâmetros inválidos.");
    }

    if (anoInicial > anoFinal || (anoInicial === anoFinal && mesInicial > mesFinal)) {
        return gerarErro(res, 400, "Ano e mês inicial devem ser anteriores ao final.");
    }

    if (
        anoInicial < 2015 || anoFinal > 2024 || 
        mesInicial < 1 || mesInicial > 12 || 
        mesFinal < 1 || mesFinal > 12
    ) {
        return gerarErro(res, 400, "Parâmetros fora do intervalo permitido.");
    }

    const resultado = calcularValorAjustadoPeloIPCA(valor, mesInicial, anoInicial, mesFinal, anoFinal);
    res.json({ resultado });
});

// Rota para buscar IPCA por ID
app.get('/histIPCA/:id', (req, res) => {
    const id = buscarHistoricoIPCAPorId(req.params.id);

    if (id) {
        res.json(id);
    } else if (isNaN(parseInt(req.params.id))) {
        gerarErro(res, 400, "Requisição inválida. O ID deve ser numérico.");
    } else {
        gerarErro(res, 404, "Elemento não encontrado.");
    }
});

// Inicialização do servidor
app.listen(8080, () => {
    console.log(`Servidor iniciado na porta 8080`);
});
