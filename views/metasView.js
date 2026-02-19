function metasView(funcionarios, metaAtual, vendas, usuarioLogado) {

    // =========================
    // TOTAIS GERAIS POR TIPO
    // =========================

    const totalRetornoGeral = (vendas || []).filter(v => v.metodo_venda === 'Retorno').length;
    const totalVisitaGeral = (vendas || []).filter(v => v.metodo_venda === 'Visita').length;
    const totalProspeccaoGeral = (vendas || []).filter(v => v.metodo_venda === 'Prospecção').length;
    const totalChurnGeral = (vendas || []).filter(v => v.metodo_venda === 'Churn').length;


    const totalVendas = funcionarios.reduce((soma, f) => soma + Number(f.meta || 0), 0);
    const totalClientes = funcionarios.reduce((soma, f) => soma + Number(f.clientes || 0), 0);
    const totalFechamentos = funcionarios.reduce((soma, f) => soma + Number(f.fechamentos || 0), 0);
    const totalVisitas = funcionarios.reduce((soma, f) => soma + Number(f.visitas || 0), 0);

    const metaVendasAtingida =
        metaAtual && totalVendas >= Number(metaAtual.meta_valor || 0);

    const metaClientesAtingida =
        metaAtual && totalClientes >= Number(metaAtual.meta_clientes || 0);

    const metaFechamentosAtingida =
        metaAtual && totalFechamentos >= Number(metaAtual.meta_fechamentos || 0);

    const metaVisitasAtingida =
        metaAtual && totalVisitas >= Number(metaAtual.meta_visitas || 0);


    // =========================
    // LISTA DE CLIENTES POR TIPO
    // =========================

    const clientesRetorno = (vendas || [])
        .filter(v => v.metodo_venda === 'Retorno')
        .map(v => v.cliente);

    const clientesProspeccao = (vendas || [])
        .filter(v => v.metodo_venda === 'Prospecção')
        .map(v => v.cliente);

    const clientesChurn = (vendas || [])
        .filter(v => v.metodo_venda === 'Churn')
        .map(v => v.cliente);

    function montarTooltip(lista) {
        if (!lista.length) return 'Nenhum cliente';

        return lista
            .map(c => '• ' + c)
            .join('<br>');
    }

    function gerarRanking(campoReal, campoMeta) {

        const lista = funcionarios.map(f => {

            const real = Number(f[campoReal] || 0);
            const meta = Number(f[campoMeta] || 0);

            let percentual = 0;
            if (meta > 0) {
                percentual = (real / meta) * 100;
            }

            return {
                nome: f.nome,
                percentual: percentual
            };

        });

        lista.sort((a, b) => b.percentual - a.percentual);

        if (lista.length === 0) return 'Nenhum dado';

        return lista.map((f, index) => {
            return `${index + 1}º - ${f.nome} (${f.percentual.toFixed(0)}%)`;
        }).join('<br>');
    }

    const rankingVendas = gerarRanking('meta', 'meta_valor');
    const rankingClientes = gerarRanking('clientes', 'meta_clientes');
    const rankingFechamentos = gerarRanking('fechamentos', 'meta_fechamentos');
    const rankingVisitas = gerarRanking('visitas', 'meta_visitas');


    function calcularPercentualGeral(real, meta) {
        if (!meta || meta == 0) return 0;
        return (real / meta) * 100;
    }

    const percVendasGeral = calcularPercentualGeral(totalVendas, metaAtual?.meta_valor);
    const percClientesGeral = calcularPercentualGeral(totalClientes, metaAtual?.meta_clientes);
    const percFechGeral = calcularPercentualGeral(totalFechamentos, metaAtual?.meta_fechamentos);
    const percVisitasGeral = calcularPercentualGeral(totalVisitas, metaAtual?.meta_visitas);


    function formatarMes(mesString) {
        if (!mesString) return '';

        const [ano, mes] = mesString.split('-');

        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril',
            'Maio', 'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        return `${meses[parseInt(mes) - 1]} de ${ano}`;
    }

    function formatarMoedaBR(valor) {
        if (!valor) return '0,00';

        return Number(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatarMoedaBR(valor) {
        if (valor === null || valor === undefined || valor === '') return '0,00';

        return Number(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function renderLinhaMeta(titulo, valorAtual, meta, percentual) {

        return `
    <div class="mb-3">

        <div class="d-flex justify-content-between">
            <small class="text-muted">${titulo}</small>
            <small>
                <strong>${valorAtual || 0}</strong> / ${meta || 0}
                (${percentual}%)
            </small>
        </div>

        <div class="progress" style="height:6px;">
            <div class="progress-bar ${percentual >= 100 ? 'bg-success' : 'bg-primary'}"
                style="width:${percentual}%">
            </div>
        </div>

    </div>
    `;
    }

    function renderKPICompacto(titulo, valorAtual, meta, percentual) {

        const estiloTextoValor = titulo === 'Valor (R$)'
            ? 'font-size: 0.75rem; font-weight: 500;'
            : 'font-size: 0.9rem; font-weight: 600;';

        return `
    <div class="col-6">
        <div class="rounded p-2 kpi-dark">

            <div class="d-flex justify-content-between">
                <small class="text-muted">${titulo}</small>
                <small class="fw-bold">${percentual}%</small>
            </div>

            <div style="${estiloTextoValor}">
                ${valorAtual || 0} / ${meta || 0}
            </div>

            <div class="progress mt-1" style="height:4px;">
                <div class="progress-bar ${percentual >= 100 ? 'bg-success' : 'bg-primary'}"
                     style="width:${percentual}%">
                </div>
            </div>

        </div>
    </div>
    `;
    }


    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Sistema de Metas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>

/* ========================= */
/* BADGE ARCO-ÍRIS SUAVE */
/* ========================= */

.badge-arcoiris {
    background: linear-gradient(
        90deg,
        #ff0000,
        #ff9900,
        #ffff00,
        #00ff00,
        #00ffff,
        #0000ff,
        #9900ff,
        #ff0000
    );
    background-size: 300% 300%;
    color: white;
    font-weight: 600;
    border: none;
    animation: arcoirisAnimado 8s linear infinite;
}

/* Movimento contínuo e circular */
@keyframes arcoirisAnimado {
    0%   { background-position: 0% 50%; }
    100% { background-position: 300% 50%; }
}


/* ========================= */
/* BRILHO DOS CARDS DASHBOARD */
/* ========================= */

.dashboard-card {
    position: relative;
    overflow: hidden;
}

.dashboard-card::before {
    content: "";
    position: absolute;
    top: -100%;
    left: -100%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        120deg,
        rgba(255,255,255,0) 30%,
        rgba(255,255,255,0.6) 50%,
        rgba(255,255,255,0) 70%
    );
    transform: rotate(25deg);
    animation: brilhoDashboard 1.2s ease-out;
}

@keyframes brilhoDashboard {
    0% {
        transform: translateX(-100%) rotate(25deg);
    }
    100% {
        transform: translateX(100%) rotate(25deg);
    }
}

/* Efeito de entrada suave dos gráficos */
.grafico-container {
    opacity: 0;
    transform: translateY(15px);
    animation: animarGrafico 0.8s ease forwards;
}

@keyframes animarGrafico {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ========================= */
/* DARK MODE GLOBAL */
/* ========================= */

body {
    background-color: #121212 !important;
    color: #e0e0e0 !important;
}

.card {
    background-color: #1e1e1e;
    border: 1px solid #2c2c2c;
}

.modal-content {
    background-color: #1e1e1e;
    color: #e0e0e0;
    border: 1px solid #2c2c2c;
}

.modal-header,
.modal-footer {
    border-color: #2c2c2c;
}

.form-control {
    background-color: #2a2a2a;
    border: 1px solid #3a3a3a;
    color: #fff;
}

.form-control::placeholder {
    color: #aaa;
}

.form-control:focus {
    background-color: #2a2a2a;
    color: #fff;
    border-color: #0d6efd;
    box-shadow: none;
}

.border {
    border-color: #2c2c2c !important;
}

.bg-light {
    background-color: #2a2a2a !important;
}

.progress {
    background-color: #2c2c2c;
}

small.text-muted {
    color: #aaa !important;
}

.alert-warning {
    background-color: #332b00;
    border-color: #665200;
    color: #ffdd57;
}

/* ========================= */
/* CORREÇÃO DE TEXTOS DARK MODE */
/* ========================= */

/* Força textos escuros a ficarem claros */
.text-dark {
    color: #e0e0e0 !important;
}

.btn-outline-dark {
    color: #e0e0e0;
    border-color: #444;
}

.btn-outline-dark:hover {
    background-color: #2c2c2c;
    color: #fff;
}

.btn-outline-secondary {
    color: #ddd;
    border-color: #555;
}

.btn-outline-secondary:hover {
    background-color: #333;
    color: #fff;
}

.btn-outline-danger {
    color: #ff6b6b;
    border-color: #ff6b6b;
}

.btn-outline-danger:hover {
    background-color: #ff6b6b;
    color: #fff;
}

/* Títulos */
h1, h2, h3, h4, h5, h6 {
    color: #f5f5f5;
}

/* Texto padrão */
p, span, div {
    color: inherit;
}

/* ========================= */
/* KPI DARK MODE */
/* ========================= */

.kpi-dark {
    background-color: #2a2a2a;
    color: #f1f1f1;
}

.kpi-dark small {
    color: #bbbbbb !important;
}

.kpi-dark .fw-semibold {
    color: #ffffff;
}
    .card-body {
    color: #e0e0e0;
}

.tipo-vendas-container {
    gap: 6px;
}

.tipo-badge {
    font-size: 11px;
    padding: 4px 6px;
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 55px;
    justify-content: center;
}

.tipo-vendas-container {
    gap: 6px;
    flex-wrap: nowrap;
}

.tipo-badge {
    font-size: 11px;
    padding: 4px 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
}

/* ========================= */
/* INDICADORES GERAIS */
/* ========================= */

.atividade-card {
    background-color: #1e1e1e;
    border: 1px solid #2c2c2c;
    border-radius: 10px;
    padding: 15px;
    transition: 0.3s ease;
}

.atividade-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 12px rgba(255,255,255,0.05);
}

.atividade-label {
    font-size: 13px;
    color: #bbbbbb;
}

.atividade-valor {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
}

/* ========================= */
/* ARCO-ÍRIS DASHBOARD */
/* ========================= */

.dashboard-arcoiris {
    position: relative;
    overflow: hidden;
}

.dashboard-arcoiris::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(
        90deg,
        #ff0000,
        #ff9900,
        #ffff00,
        #00ff00,
        #00ffff,
        #0000ff,
        #9900ff,
        #ff0000
    );
    background-size: 300% 300%;
    animation: arcoirisAnimado 8s linear infinite;
    -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
}
            /* ========================= */
/* TOOLTIP ALINHADO À ESQUERDA */
/* ========================= */

.tooltip-inner {
    text-align: left !important;
    max-width: 260px;
    font-size: 13px;
    line-height: 1.4;
}

/* ========================= */
/* LOADING SCREEN */
/* ========================= */

/* ========================= */
/* LOADING SCREEN BLUR CLEAN */
/* ========================= */

#loadingScreen {
    position: fixed;
    inset: 0;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    background: rgba(18, 18, 18, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.4s ease, visibility 0.4s ease;
}

#loadingScreen.hidden {
    opacity: 0;
    visibility: hidden;
}

/* Remove qualquer container visual */
.loading-content {
    background: transparent;
    padding: 0;
    box-shadow: none;
}


</style>



</head>

<body class="bg-dark text-light">

<div id="loadingScreen">
    <div class="loading-content text-center">
        <div class="spinner-border text-light" 
             style="width: 3rem; height: 3rem;" 
             role="status">
        </div>
    </div>
</div>


<div class="container mt-4">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center gap-3">
    <img src="/logo.png" 
         alt="EcoCaixas" 
         style="height:45px; width:auto; object-fit:contain;">

    <h3 class="mb-0">Ecocaixas - Setor Comercial</h3>
</div>

        <div class="d-flex gap-2">

    <!-- METAS FUNCIONÁRIOS -->
    <button class="btn btn-outline-secondary"
        data-bs-toggle="modal"
        data-bs-target="#modalMetasFuncionarios"
        title="Metas Individuais">
        <i class="fa-solid fa-bullseye"></i>
        Meta individual
    </button>

    <!-- METAS GERAIS -->
    <button class="btn btn-outline-dark"
        data-bs-toggle="modal"
        data-bs-target="#modalMetasGerais"
        title="Metas Gerais">
        <i class="fa-solid fa-chart-line"></i>
        Meta geral
    </button>

    <button class="btn btn-success"
        onclick="baixarRelatorio()"
        title="Baixar Relatório">
        <i class="fa-solid fa-file-excel"></i>
    </button>


    <!-- NOVO FUNCIONÁRIO -->
    <button class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#modalCadastro"
        title="Novo Funcionário">
        <i class="fa-solid fa-user-plus"></i>
    </button>

    <!-- LISTA FUNCIONÁRIOS -->
    <button class="btn btn-outline-danger"
        data-bs-toggle="modal"
        data-bs-target="#modalListaFuncionarios"
        data-bs-toggle="tooltip"
        title="Funcionários">
        <i class="fa-solid fa-users"></i>
    </button>

    <!-- USUÁRIO LOGADO -->
        <div class="d-flex align-items-center gap-2 text-light">
            <i class="fa-solid fa-user-circle"></i>
            <span class="fw-semibold">
                ${usuarioLogado ? usuarioLogado.nome : ''}
            </span>
        </div>
    </div>

            <a href="/logout" class="btn btn-sm p-0 border-0 bg-transparent text-white">
    <i class="fa-solid fa-right-from-bracket"></i>
</a>

    </div>

    <!-- METAS DO MÊS -->
${metaAtual ? `
<div class="mb-4 p-4 rounded shadow-sm"
    style="background:#1e1e1e; border-left:6px solid #0d6efd;">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0 fw-bold">
            Dashboard de Metas
        </h5>

        <span class="badge bg-primary fs-6">
            ${formatarMes(metaAtual.mes)}
        </span>
    </div>

    <div class="row g-3">

        <!-- VENDAS -->
<div class="col-md-3">
    <div class="p-3 rounded text-white shadow-sm dashboard-card
${metaVendasAtingida ? 'dashboard-arcoiris' : ''}"
         data-bs-toggle="tooltip"
         data-bs-html="true"
         data-bs-placement="top"
         data-bs-title="${rankingVendas}"
         style="background:linear-gradient(135deg,#198754,#157347);">

        <small class="text-light">Meta Vendas</small>
        <h4 class="fw-bold mb-1">
            R$ ${formatarMoedaBR(metaAtual.meta_valor)}
        </h4>

        <small class="text-light opacity-75">
            Alcançado: R$ ${formatarMoedaBR(totalVendas)}
        </small>
    </div>
</div>


        <!-- CLIENTES -->
<div class="col-md-3">
    <div class="p-3 rounded text-white shadow-sm dashboard-card
${metaClientesAtingida ? 'dashboard-arcoiris' : ''}"
         data-bs-toggle="tooltip"
         data-bs-html="true"
         data-bs-placement="top"
         data-bs-title="${rankingClientes}"
         style="background:linear-gradient(135deg,#0d6efd,#0a58ca);">

        <small class="text-light">Meta Clientes</small>
        <h4 class="fw-bold mb-1">
            ${metaAtual.meta_clientes}
        </h4>

        <small class="text-light opacity-75">
            Alcançado: ${totalClientes}
        </small>
    </div>
</div>


        <!-- FECHAMENTOS -->
<div class="col-md-3">
    <div class="p-3 rounded text-white shadow-sm dashboard-card
${metaFechamentosAtingida ? 'dashboard-arcoiris' : ''}"
         data-bs-toggle="tooltip"
         data-bs-html="true"
         data-bs-placement="top"
         data-bs-title="${rankingFechamentos}"
         style="background:linear-gradient(135deg,#ffc107,#e0a800);">

        <small class="text-light">Meta Fechamentos</small>
        <h4 class="fw-bold mb-1 text-dark">
            ${metaAtual.meta_fechamentos}
        </h4>

        <small class="text-dark opacity-75">
            Alcançado: ${totalFechamentos}
        </small>
    </div>
</div>


        <!-- VISITAS -->
<div class="col-md-3">
    <div class="p-3 rounded text-white shadow-sm dashboard-card
${metaVisitasAtingida ? 'dashboard-arcoiris' : ''}"
         data-bs-toggle="tooltip"
         data-bs-html="true"
         data-bs-placement="top"
         data-bs-title="${rankingVisitas}"
         style="background:linear-gradient(135deg,#6f42c1,#59359c);">

        <small class="text-light">Meta Visitas</small>
        <h4 class="fw-bold mb-1">
            ${metaAtual.meta_visitas}
        </h4>

        <small class="text-light opacity-75">
            Alcançado: ${totalVisitas}
        </small>
    </div>
</div>


    </div>

</div>

<div class="card shadow-sm mb-4 mt-3">
    <div class="card-body">

        <h6 class="fw-bold mb-3">
            Indicadores Gerais de Atividade Comercial
        </h6>

        <div class="row g-3 justify-content-between text-center">

            <div class="col-md-3">
    <div class="atividade-card border-info"
         data-bs-toggle="tooltip"
         data-bs-html="true"
         data-bs-placement="top"
         data-bs-title="${montarTooltip(clientesRetorno)}">

        <i class="fa-solid fa-rotate fa-lg text-info mb-2"></i>
        <div class="atividade-label">Retorno</div>
        <div class="atividade-valor">${totalRetornoGeral}</div>
    </div>
</div>

            <!--DESATIVADO POR ENQUANTO-->
            <!--<div class="col-md-3">
                <div class="atividade-card border-primary">
                    <i class="fa-solid fa-handshake fa-lg text-primary mb-2"></i>
                    <div class="atividade-label">Visita</div>
                    <div class="atividade-valor">${totalVisitaGeral}</div>
                </div>
            </div>-->

            <div class="col-md-3">
    <div class="atividade-card border-warning"
         data-bs-toggle="tooltip"
         data-bs-html="true"
         data-bs-placement="top"
         data-bs-title="${montarTooltip(clientesProspeccao)}">

        <i class="fa-solid fa-bullseye fa-lg text-warning mb-2"></i>
        <div class="atividade-label">Prospecção</div>
        <div class="atividade-valor">${totalProspeccaoGeral}</div>
    </div>
</div>

            <div class="col-md-3">
    <div class="atividade-card border-danger"
         data-bs-toggle="tooltip"
         data-bs-html="true"
         data-bs-placement="top"
         data-bs-title="${montarTooltip(clientesChurn)}">

        <i class="fa-solid fa-user-xmark fa-lg text-danger mb-2"></i>
        <div class="atividade-label">Churn</div>
        <div class="atividade-valor">${totalChurnGeral}</div>
    </div>
</div>

        </div>

    </div>
</div>

` : `
<div class="alert alert-warning mb-4 shadow-sm">
    Nenhuma meta definida para este mês.
</div>
`}


<!-- CONTAINER GRÁFICOS INDIVIDUAIS -->
<div class="card shadow-sm mb-4">
    <div class="card-body">
        <h6 class="fw-bold mb-4">Comparativo Individual Meta x Alcançado</h6>

        <div class="row g-4">

            <div class="col-lg-3 col-md-6">
                <div class="border rounded p-3 grafico-container bg-dark">
                    <h6 class="text-center">Vendas</h6>
                    <div style="height:180px;">
                        <canvas id="graficoVendas"></canvas>
                    </div>
                </div>
            </div>

            <div class="col-lg-3 col-md-6">
                <div class="border rounded p-3 grafico-container bg-dark">
                    <h6 class="text-center">Clientes</h6>
                    <div style="height:180px;">
                        <canvas id="graficoClientes"></canvas>
                    </div>
                </div>
            </div>

            <div class="col-lg-3 col-md-6">
                <div class="border rounded p-3 grafico-container bg-dark">
                    <h6 class="text-center">Fechamentos</h6>
                    <div style="height:180px;">
                        <canvas id="graficoFechamentos"></canvas>
                    </div>
                </div>
            </div>

            <div class="col-lg-3 col-md-6">
                <div class="border rounded p-3 grafico-container bg-dark">
                    <h6 class="text-center">Visitas</h6>
                    <div style="height:180px;">
                        <canvas id="graficoVisitas"></canvas>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

    <!-- CARDS FUNCIONÁRIOS -->
<div class="row">
${funcionarios.map(f => {

        function calcularPercentual(real, meta) {
            if (!meta || meta == 0) return 0;
            return Math.min((real / meta) * 100, 100).toFixed(0);
        }

        const percClientes = calcularPercentual(f.clientes, f.meta_clientes);
        const percFech = calcularPercentual(f.fechamentos, f.meta_fechamentos);
        const percVisitas = calcularPercentual(f.visitas, f.meta_visitas);
        const percValor = calcularPercentual(f.meta, f.meta_valor);

        const mediaGeral = Math.round(
            (parseInt(percClientes) +
                parseInt(percFech) +
                parseInt(percVisitas) +
                parseInt(percValor)) / 4
        );

        const statusTexto = mediaGeral >= 100
            ? 'Meta alcançada'
            : mediaGeral + '%';

        // =========================
        // CÁLCULO COMISSÃO
        // =========================

        const percentualComissao = f.nome.trim().toLowerCase() === 'hérica'
            ? 0.005   // 0,5%
            : 0.003;  // 0,3%

        const valorVendido = Number(f.meta || 0);
        const valorComissao = valorVendido * percentualComissao;

        const percentualTexto = (percentualComissao * 100).toFixed(1).replace('.', ',');


        // =========================
        // CONTAGEM DE TIPOS DE VENDA
        // =========================
        const vendasFuncionario = (vendas || []).filter(v => v.funcionario_id === f.id);

        const totalRetorno = vendasFuncionario.filter(v => v.metodo_venda === 'Retorno').length;
        const totalVisita = vendasFuncionario.filter(v => v.metodo_venda === 'Visita').length;
        const totalProspeccao = vendasFuncionario.filter(v => v.metodo_venda === 'Prospecção').length;
        const totalChurn = vendasFuncionario.filter(v => v.metodo_venda === 'Churn').length;

        return `
    <div class="col-lg-4 col-md-6 mb-3">
        <div class="card shadow-sm h-100">

            <div class="card-body">

                <div class="d-flex justify-content-between align-items-center mb-3">
                    <strong>${f.nome}</strong>
                    <span class="badge ${mediaGeral >= 100 ? 'badge-arcoiris' : 'bg-primary'}">
                        ${statusTexto}
                    </span>
                </div>

                <div class="row g-2">

                    ${renderKPICompacto(
            'Valor (R$)',
            formatarMoedaBR(f.meta),
            formatarMoedaBR(f.meta_valor),
            percValor
        )}

                    ${renderKPICompacto('Clientes', f.clientes, f.meta_clientes, percClientes)}
                    ${renderKPICompacto('Fechamentos', f.fechamentos, f.meta_fechamentos, percFech)}
                    ${renderKPICompacto('Visitas', f.visitas, f.meta_visitas, percVisitas)}

                </div>

                <hr class="my-3">

                <!-- INDICADORES DE TIPO -->
                <div class="d-flex justify-content-between align-items-center mt-3 tipo-vendas-container">

                    <span class="badge tipo-badge bg-info">
                        <i class="fa-solid fa-rotate"></i> Retorno: ${totalRetorno}
                    </span>

                    <!--<span class="badge tipo-badge bg-primary">
                        <i class="fa-solid fa-handshake"></i> Visita: ${totalVisita}
                    </span>-->

                    <span class="badge tipo-badge bg-warning text-dark">
                        <i class="fa-solid fa-bullseye"></i> Prospecção: ${totalProspeccao}
                    </span>

                    <span class="badge tipo-badge bg-danger">
                        <i class="fa-solid fa-user-xmark"></i> Churn: ${totalChurn}
                    </span>

                    <span class="badge bg-success">
                        R$ ${formatarMoedaBR(valorComissao)}
                    </span>

                </div>


                <div class="mt-3 text-end">
                    <button class="btn btn-sm btn-outline-secondary"
                        onclick="abrirEdicao(${f.id}, '${f.meta}', '${f.clientes}', '${f.fechamentos}', '${f.visitas}')">
                        Atualizar dados
                    </button>
                </div>

            </div>
        </div>
    </div>
    `;
    }).join('')}
</div>

    </div>
</div>


<!-- ========================= MODAIS ========================= -->

<!-- MODAL CADASTRO -->
<div class="modal fade" id="modalCadastro">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Novo Funcionário</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <input class="form-control mb-2" id="nome" placeholder="Nome">
        <input class="form-control mb-2" id="meta" placeholder="Meta">
        <input class="form-control mb-2" id="clientes" placeholder="Clientes">
        <input class="form-control mb-2" id="fechamentos" placeholder="Fechamentos">
        <input class="form-control mb-2" id="visitas" placeholder="Visitas">
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        <button class="btn btn-success" onclick="salvar()">Salvar</button>
      </div>
    </div>
  </div>
</div>


<!-- MODAL EDIÇÃO -->
<div class="modal fade" id="modalEdicao">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title">Atualizar</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">

        <input type="hidden" id="editId">

        <div class="row">

          <div class="col-md-6 mb-3">
            <label class="form-label">Valor em Vendas (R$)</label>
            <input class="form-control" id="editMeta">
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Clientes</label>
            <input class="form-control" id="editClientes">
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Fechamentos</label>
            <input class="form-control" id="editFechamentos">
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Visitas</label>
            <input class="form-control" id="editVisitas">
          </div>

        </div>

        <hr class="my-4">

        <!-- BLOCO VENDAS -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0">Vendas Registradas</h6>

          <button class="btn btn-sm btn-outline-primary"
              onclick="adicionarVendaCard()">
              <i class="fa-solid fa-plus"></i>
          </button>
        </div>

        <div id="listaVendas"></div>

      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        <button class="btn btn-primary" onclick="atualizar()">Atualizar</button>
      </div>

    </div>
  </div>
</div>




<!-- MODAL METAS GERAIS -->
<div class="modal fade" id="modalMetasGerais">
  <div class="modal-dialog">
    <div class="modal-content shadow-sm">

      <div class="modal-header bg-light">
        <h5 class="modal-title fw-bold">
          <i class="fa-solid fa-bullseye me-2"></i>
          Metas Gerais do Mês
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">

        <div class="mb-3">
          <label for="metaValorMes" class="form-label fw-semibold">
            Meta de Faturamento (R$)
          </label>
          <input type="number" class="form-control" id="metaValorMes" placeholder="Ex: 50000">
        </div>

        <div class="mb-3">
          <label for="metaClientesMes" class="form-label fw-semibold">
            Meta de Clientes
          </label>
          <input type="number" class="form-control" id="metaClientesMes">
        </div>

        <div class="mb-3">
          <label for="metaFechamentosMes" class="form-label fw-semibold">
            Meta de Fechamentos
          </label>
          <input type="number" class="form-control" id="metaFechamentosMes">
        </div>

        <div class="mb-2">
          <label for="metaVisitasMes" class="form-label fw-semibold">
            Meta de Visitas
          </label>
          <input type="number" class="form-control" id="metaVisitasMes">
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">
          Fechar
        </button>
        <button class="btn btn-outline-danger" onclick="abrirConfirmacaoReset()">
          <i class="fa-solid fa-rotate-left me-1"></i> Zerar
        </button>
        <button class="btn btn-success" onclick="salvarMetasGerais()">
          <i class="fa-solid fa-check me-1"></i> Salvar
        </button>
      </div>

    </div>
  </div>
</div>



<!-- MODAL CONFIRMAÇÃO RESET -->
<div class="modal fade" id="modalConfirmReset">
  <div class="modal-dialog modal-sm">
    <div class="modal-content">
      <div class="modal-header">
        <h6 class="modal-title">Confirmar</h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body text-center">
        Tem certeza que deseja zerar as metas do mês?
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
        <button class="btn btn-danger btn-sm" onclick="confirmarReset()">Confirmar</button>
      </div>
    </div>
  </div>
</div>


<!-- MODAL METAS FUNCIONÁRIOS -->
<div class="modal fade" id="modalMetasFuncionarios" tabindex="-1">
  <div class="modal-dialog modal-xl">
    <div class="modal-content shadow">

      <div class="modal-header bg-light">
        <h5 class="modal-title fw-bold">
          <i class="fa-solid fa-bullseye me-2"></i> Metas Individuais
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">

        ${funcionarios.map(f => `
        <div class="card mb-3 border-0 shadow-sm">
          <div class="card-body py-3">

            <h6 class="fw-bold text-primary mb-3">
              <i class="fa-solid fa-user me-1"></i> ${f.nome}
            </h6>

            <div class="row g-2">

              <div class="col-md-3">
                <label class="form-label small mb-1">Meta Valor (R$)</label>
                <input 
                  type="number" 
                  class="form-control form-control-sm" 
                  id="metaValor_${f.id}" 
                  value="${f.meta_valor || 0}">
              </div>

              <div class="col-md-3">
                <label class="form-label small mb-1">Meta Clientes</label>
                <input 
                  type="number" 
                  class="form-control form-control-sm" 
                  id="metaClientes_${f.id}" 
                  value="${f.meta_clientes || 0}">
              </div>

              <div class="col-md-3">
                <label class="form-label small mb-1">Meta Fechamentos</label>
                <input 
                  type="number" 
                  class="form-control form-control-sm" 
                  id="metaFechamentos_${f.id}" 
                  value="${f.meta_fechamentos || 0}">
              </div>

              <div class="col-md-3">
                <label class="form-label small mb-1">Meta Visitas</label>
                <input 
                  type="number" 
                  class="form-control form-control-sm" 
                  id="metaVisitas_${f.id}" 
                  value="${f.meta_visitas || 0}">
              </div>

            </div>

          </div>
        </div>
        `).join('')}

      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">
          Fechar
        </button>

        <button class="btn btn-success"
          onclick="salvarMetasTodos()">
          <i class="fa-solid fa-floppy-disk me-1"></i>
          Salvar
        </button>
      </div>

    </div>
  </div>
</div>



<!-- MODAL LISTA FUNCIONÁRIOS -->
<div class="modal fade" id="modalListaFuncionarios">
  <div class="modal-dialog">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title">Funcionários Cadastrados</h5>

        <!-- BOTÃO FECHAR -->
        <button type="button" 
                class="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Fechar">
        </button>
      </div>

      <div class="modal-body">

        ${funcionarios.length === 0 ? `
    <div class="text-muted">Nenhum funcionário cadastrado.</div>
` : funcionarios.map(f => `
    <div class="border rounded p-3 mb-2">

        <div class="d-flex justify-content-between align-items-start">

            <div>
                <div class="fw-bold">${f.nome}</div>

                <div class="small mt-1">
                    <i class="fa-solid fa-key me-1 text-warning"></i>
                    <span class="token-text text-white fw-semibold">
                        ${f.token_acesso || '—'}
                    </span>
                </div>

            </div>

            <div class="d-flex gap-2">

                <button class="btn btn-sm btn-outline-secondary"
                    onclick="copiarToken('${f.token_acesso}')"
                    title="Copiar Token">
                    <i class="fa-solid fa-copy"></i>
                </button>

                <button class="btn btn-sm btn-danger"
                    onclick="confirmarExclusao(${f.id})"
                    title="Excluir">
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

        </div>

    </div>
`).join('')}


      </div>

    </div>
  </div>
</div>

<!-- MODAL CONFIRMAÇÃO EXCLUSÃO -->
<div class="modal fade" id="modalConfirmarExclusao">
  <div class="modal-dialog modal-sm">
    <div class="modal-content text-center p-3">

        <h6 class="mb-3">Deseja realmente excluir este funcionário?</h6>

        <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-secondary btn-sm"
                data-bs-dismiss="modal">
                Cancelar
            </button>

            <button class="btn btn-danger btn-sm"
                id="btnConfirmarExcluir">
                Excluir
            </button>
        </div>

    </div>
  </div>
</div>



<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<script>
function salvar(){

    if(!nome.value.trim()){
        alert('O nome é obrigatório.');
        return;
    }

    fetch('/funcionarios',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
            nome: nome.value.trim(),
            meta: meta.value || 0,
            clientes: clientes.value || 0,
            fechamentos: fechamentos.value || 0,
            visitas: visitas.value || 0
        })
    })
    .then(res => res.json())
    .then(data => {

        console.log("Funcionário criado! Token de acesso:" + data.token);

        location.reload();
    });

}

function abrirEdicao(id, meta, clientes, fechamentos, visitas){

    editId.value=id;
    editMeta.value=meta;
    editClientes.value=clientes;
    editFechamentos.value=fechamentos;
    editVisitas.value=visitas;

    carregarVendas(id);

    new bootstrap.Modal(document.getElementById('modalEdicao')).show();
}

function carregarVendas(funcionarioId){

    const container = document.getElementById('listaVendas');
    container.innerHTML = '';

    fetch('/funcionarios/' + funcionarioId + '/vendas')
        .then(res => res.json())
        .then(vendas => {

            vendas.forEach(v => {

                container.insertAdjacentHTML('beforeend', \`
                    <div class="border rounded p-3 mb-3" id="venda_\${v.id}">

                        <div class="row align-items-center">

                            <div class="col-md-2">
                                <strong>\${v.cliente}</strong>
                            </div>

                            <div class="col-md-2">
                                \${v.metodo_venda}
                            </div>

                            <div class="col-md-3">
                                \${v.tipo_venda || 'Venda local'}
                            </div>

                            <div class="col-md-3">
                                \${v.observacao || ''}
                            </div>

                            <div class="col-md-2 text-end">

                                <button class="btn btn-sm btn-outline-warning me-2"
                                    onclick="editarVenda(\${v.id}, 
                                        '\${v.cliente}', 
                                        '\${v.metodo_venda}', 
                                        '\${v.tipo_venda || 'Venda local'}',
                                        '\${v.observacao || ''}')">
                                    <i class="fa-solid fa-pen"></i>
                                </button>

                                <button class="btn btn-sm btn-outline-danger"
                                    onclick="excluirVenda(\${v.id})">
                                    <i class="fa-solid fa-trash"></i>
                                </button>

                            </div>

                        </div>

                    </div>
                \`);

            });

        });
}


function editarVenda(id, cliente, metodo, tipoVenda, obs){

    const container = document.getElementById('venda_' + id);

    container.innerHTML = \`
        <div class="row mb-2 align-items-center">

            <div class="col-md-2">
                <input class="form-control" id="edit_cliente_\${id}" value="\${cliente}">
            </div>

            <div class="col-md-2">
                <select class="form-select" id="edit_metodo_\${id}">
                    <option \${metodo==='Retorno'?'selected':''}>Retorno</option>
                    <option \${metodo==='Visita'?'selected':''}>Visita</option>
                    <option \${metodo==='Prospecção'?'selected':''}>Prospecção</option>
                    <option \${metodo==='Churn'?'selected':''}>Churn</option>
                </select>
            </div>

            <div class="col-md-3">
                <select class="form-select" id="edit_tipo_\${id}">
                    <option value="Venda local" \${tipoVenda==='Venda local'?'selected':''}>Venda local</option>
                    <option value="Venda externa" \${tipoVenda==='Venda externa'?'selected':''}>Venda externa</option>
                </select>
            </div>

            <div class="col-md-3">
                <input class="form-control" id="edit_obs_\${id}" value="\${obs}">
            </div>

            <div class="col-md-2 text-end">
                <button class="btn btn-sm btn-success me-2"
                    onclick="salvarEdicaoVenda(\${id})">
                    <i class="fa-solid fa-check"></i>
                </button>

                <button class="btn btn-sm btn-secondary"
                    onclick="carregarVendas(editId.value)">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

        </div>
    \`;
}


function salvarEdicaoVenda(id){

    const cliente = document.getElementById('edit_cliente_' + id).value;
    const metodo = document.getElementById('edit_metodo_' + id).value;
    const tipo = document.getElementById('edit_tipo_' + id).value;
    const obs = document.getElementById('edit_obs_' + id).value;

    fetch('/vendas/' + id, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            cliente: cliente,
            metodo_venda: metodo,
            tipo_venda: tipo,
            observacao: obs
        })
    }).then(()=>{
        carregarVendas(editId.value);
    });
}


function excluirVenda(id){

    if(!confirm('Deseja realmente excluir esta venda?')) return;

    fetch('/vendas/' + id, {
        method: 'DELETE'
    }).then(()=>{
        carregarVendas(editId.value);
    });
}


function atualizar(){
    fetch('/funcionarios/'+editId.value,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
            meta:editMeta.value,
            clientes:editClientes.value,
            fechamentos:editFechamentos.value,
            visitas:editVisitas.value
        })
    }).then(()=>{
    mostrarLoading();
    location.reload();
});
}

function salvarMetasGerais(){
    fetch('/metas-mensais',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
            meta_valor:metaValorMes.value,
            meta_clientes:metaClientesMes.value,
            meta_fechamentos:metaFechamentosMes.value,
            meta_visitas:metaVisitasMes.value
        })
    }).then(()=>{
    mostrarLoading();
    location.reload();
});
}

function abrirConfirmacaoReset(){
    new bootstrap.Modal(document.getElementById('modalConfirmReset')).show();
}

function confirmarReset(){
    fetch('/metas-mensais/zerar',{method:'POST'})
    .then(()=>{
    mostrarLoading();
    location.reload();
});
}

function salvarMetasIndividual(id){
    fetch('/funcionarios/'+id+'/metas',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
            meta_valor:document.getElementById('metaValor_'+id).value,
            meta_clientes:document.getElementById('metaClientes_'+id).value,
            meta_fechamentos:document.getElementById('metaFechamentos_'+id).value,
            meta_visitas:document.getElementById('metaVisitas_'+id).value
        })
    }).then(()=>{
    mostrarLoading();
    location.reload();
});
}

function confirmarResetIndividual(id){
    if(confirm('Deseja realmente zerar as metas deste funcionário?')){
        fetch('/funcionarios/'+id+'/zerar-metas',{method:'POST'})
        .then(()=>{
    mostrarLoading();
    location.reload();
});
    }
}

let funcionarioParaExcluir = null;

function confirmarExclusao(id){
    funcionarioParaExcluir = id;

    const modal = new bootstrap.Modal(
        document.getElementById('modalConfirmarExclusao')
    );
    modal.show();
}

document.addEventListener('DOMContentLoaded', function(){

    const btn = document.getElementById('btnConfirmarExcluir');

    if(btn){
        btn.addEventListener('click', function(){

            fetch('/funcionarios/' + funcionarioParaExcluir, {
                method: 'DELETE'
            }).then(() => {
                location.reload();
            });

        });
    }

});

document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

function baixarRelatorio(){
    window.location.href = '/relatorio';
}

document.addEventListener('DOMContentLoaded', function(){

    function criarGrafico(id, meta, realizado, corMeta, corRealizado){

        const ctx = document.getElementById(id);
        if(!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Meta', 'Alcançado'],
                datasets: [{
                    data: [meta, realizado],
                    backgroundColor: [corMeta, corRealizado],
                    borderRadius: 6
                }]
            },
            options: {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
        legend: { 
            display: false 
        },
        tooltip: {
            backgroundColor: '#1e1e1e',
            titleColor: '#ffffff',
            bodyColor: '#e0e0e0',
            borderColor: '#333',
            borderWidth: 1
        }
    },

    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: '#cccccc'
            },
            grid: {
                color: '#2c2c2c'
            }
        },
        x: {
            ticks: {
                color: '#cccccc'
            },
            grid: {
                color: '#2c2c2c'
            }
        }
    }
}
        });
    }

    criarGrafico(
        'graficoVendas',
        ${metaAtual?.meta_valor || 0},
        ${totalVendas || 0},
        '#0d6efd',
        '#198754'
    );

    criarGrafico(
        'graficoClientes',
        ${metaAtual?.meta_clientes || 0},
        ${totalClientes || 0},
        '#0d6efd',
        '#198754'
    );

    criarGrafico(
        'graficoFechamentos',
        ${metaAtual?.meta_fechamentos || 0},
        ${totalFechamentos || 0},
        '#0d6efd',
        '#198754'
    );

    criarGrafico(
        'graficoVisitas',
        ${metaAtual?.meta_visitas || 0},
        ${totalVisitas || 0},
        '#0d6efd',
        '#198754'
    );

});

document.addEventListener('DOMContentLoaded', function(){

    const graficos = document.querySelectorAll('.grafico-container');

    graficos.forEach((el, index) => {
        el.style.animationDelay = (index * 0.2) + 's';
    });

});

function adicionarVendaCard(){

    const container = document.getElementById('listaVendas');
    const idTemp = Date.now();

    container.insertAdjacentHTML('beforeend', \`
        <div class="border rounded p-3 mb-3" id="venda_\${idTemp}">

            <div class="row mb-3">

                <div class="col-md-3">
                    <input class="form-control form-control-sm" 
                        placeholder="Cliente"
                        id="cliente_\${idTemp}">
                </div>

                <div class="col-md-3">
                    <select class="form-select form-select-sm"
                        id="metodo_\${idTemp}">
                        <option value="">Método</option>
                        <option value="Retorno">Retorno</option>
                        <option value="Visita">Visita</option>
                        <option value="Prospecção">Prospecção</option>
                        <option value="Churn">Churn</option>
                    </select>
                </div>

                <div class="col-md-3">
                    <select class="form-select form-select-sm"
                        id="tipo_\${idTemp}">
                        <option value="Venda local">Venda local</option>
                        <option value="Venda externa">Venda externa</option>
                    </select>
                </div>

                <div class="col-md-3">
                    <input class="form-control form-control-sm" 
                        placeholder="Observação"
                        id="obs_\${idTemp}">
                </div>

            </div>

            <div class="text-end">
                <button class="btn btn-sm btn-success me-2"
                    onclick="salvarVenda(\${idTemp})">
                    <i class="fa-solid fa-check"></i>
                </button>

                <button class="btn btn-sm btn-danger"
                    onclick="removerVendaCard(\${idTemp})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>

        </div>
    \`);
}

function salvarVenda(idTemp){

    const cliente = document.getElementById('cliente_'+idTemp).value;
    const metodo = document.getElementById('metodo_'+idTemp).value;
    const tipo = document.getElementById('tipo_'+idTemp).value;
    const obs = document.getElementById('obs_'+idTemp).value;

    fetch('/funcionarios/' + editId.value + '/vendas', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            cliente: cliente,
            metodo_venda: metodo,
            tipo_venda: tipo,
            observacao: obs
        })
    }).then(()=>{
        carregarVendas(editId.value);
    });
}

function removerVendaCard(idTemp){
    document.getElementById('venda_'+idTemp).remove();
}

function salvarMetasTodos(){

    const promises = [];

    ${funcionarios.map(f => `
    promises.push(
        fetch('/funcionarios/${f.id}/metas',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                meta_valor: document.getElementById('metaValor_${f.id}').value,
                meta_clientes: document.getElementById('metaClientes_${f.id}').value,
                meta_fechamentos: document.getElementById('metaFechamentos_${f.id}').value,
                meta_visitas: document.getElementById('metaVisitas_${f.id}').value
            })
        })
    );
    `).join('')}

    Promise.all(promises).then(()=>{
        location.reload();
    });
}

window.addEventListener('load', function () {
    const loader = document.getElementById('loadingScreen');

    setTimeout(() => {
        loader.classList.add('hidden');
    }, 500); // pequeno delay elegante
});


function mostrarLoading(){
    const loader = document.getElementById('loadingScreen');
    loader.classList.remove('hidden');
}

</script>

</body>
</html>
`;
}

module.exports = metasView;