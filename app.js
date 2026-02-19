const express = require('express');
const path = require('path');
const db = require('./db');
const metasView = require('./views/metasView');
const ExcelJS = require('exceljs');
const crypto = require('crypto');
const session = require('express-session');
const loginView = require('./views/loginView');

const app = express();

app.use(session({
    secret: 'sistema-metas-ecocaixas',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function protegerRota(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    next();
}

app.get('/login', (req, res) => {
    res.send(loginView());
});

app.post('/login', async (req, res) => {

    const { token } = req.body;

    const [rows] = await db.query(
        'SELECT * FROM funcionarios WHERE token_acesso = ?',
        [token]
    );

    if (rows.length === 0) {
        return res.json({ sucesso: false });
    }

    req.session.usuario = {
        id: rows[0].id,
        nome: rows[0].nome
    };

    res.json({ sucesso:true, redirect:'/dashboard' });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/', (req, res) => {
    return res.redirect('/login');
});

app.get('/dashboard', protegerRota, async (req, res) => {

    const mesAtual = new Date().toISOString().slice(0, 7);

    const [funcionarios] = await db.query('SELECT * FROM funcionarios');

    const [metasMes] = await db.query(`
        SELECT * FROM metas_mensais 
        WHERE mes = ?
        ORDER BY id DESC 
        LIMIT 1
    `, [mesAtual]);

    const metaAtual = metasMes[0] || null;

    const [vendas] = await db.query(`
        SELECT * FROM vendas_detalhadas
    `);

    res.send(
        metasView(funcionarios, metaAtual, vendas, req.session.usuario)
    );

});


app.post('/funcionarios', async (req, res) => {

    const { nome, meta, clientes, fechamentos, visitas } = req.body;

    if (!nome || !nome.trim()) {
        return res.status(400).json({ erro: 'Nome é obrigatório' });
    }

    const token = crypto.randomUUID();

    await db.query(`
        INSERT INTO funcionarios 
        (nome, meta, clientes, fechamentos, visitas, token_acesso)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        nome.trim(),
        meta || 0,
        clientes || 0,
        fechamentos || 0,
        visitas || 0,
        token
    ]);

    res.json({ sucesso: true, token });

});

app.post('/funcionarios/:id', async (req, res) => {
    const { meta, clientes, fechamentos, visitas } = req.body;
    const { id } = req.params;

    await db.query(`
        UPDATE funcionarios
        SET meta = ?, clientes = ?, fechamentos = ?, visitas = ?
        WHERE id = ?
    `, [meta, clientes, fechamentos, visitas, id]);

    res.json({ sucesso: true });
});

app.post('/metas-mensais', async (req, res) => {
    const { meta_valor, meta_clientes, meta_fechamentos, meta_visitas } = req.body;

    const mesAtual = new Date().toISOString().slice(0, 7);

    await db.query(`
        INSERT INTO metas_mensais 
        (meta_valor, meta_clientes, meta_fechamentos, meta_visitas, mes)
        VALUES (?, ?, ?, ?, ?)
    `, [
        meta_valor || 0,
        meta_clientes || 0,
        meta_fechamentos || 0,
        meta_visitas || 0,
        mesAtual
    ]);

    res.json({ sucesso: true });
});

app.post('/metas-mensais/zerar', async (req, res) => {

    const mesAtual = new Date().toISOString().slice(0, 7);

    await db.query(`
        UPDATE metas_mensais
        SET meta_valor = 0,
            meta_clientes = 0,
            meta_fechamentos = 0,
            meta_visitas = 0
        WHERE mes = ?
    `, [mesAtual]);

    res.json({ sucesso: true });
});

app.post('/funcionarios/:id/metas', async (req, res) => {

    const { id } = req.params;
    const { meta_valor, meta_clientes, meta_fechamentos, meta_visitas } = req.body;

    await db.query(`
        UPDATE funcionarios
        SET meta_valor = ?,
            meta_clientes = ?,
            meta_fechamentos = ?,
            meta_visitas = ?
        WHERE id = ?
    `, [
        meta_valor || 0,
        meta_clientes || 0,
        meta_fechamentos || 0,
        meta_visitas || 0,
        id
    ]);

    res.json({ sucesso: true });
});

app.post('/funcionarios/:id/zerar-metas', async (req, res) => {

    const { id } = req.params;

    await db.query(`
        UPDATE funcionarios
        SET meta_valor = 0,
            meta_clientes = 0,
            meta_fechamentos = 0,
            meta_visitas = 0
        WHERE id = ?
    `, [id]);

    res.json({ sucesso: true });
});

app.delete('/funcionarios/:id', async (req, res) => {
    const { id } = req.params;

    await db.query('DELETE FROM funcionarios WHERE id = ?', [id]);

    res.json({ sucesso: true });
});

app.get('/relatorio', async (req, res) => {

    const ExcelJS = require('exceljs');

    const mesAtual = new Date().toISOString().slice(0, 7);

    const [funcionarios] = await db.query('SELECT * FROM funcionarios');

    const [metasMes] = await db.query(`
        SELECT * FROM metas_mensais 
        WHERE mes = ?
        ORDER BY id DESC 
        LIMIT 1
    `, [mesAtual]);

    const metaAtual = metasMes[0] || {};

    // ===== SOMATÓRIOS DA EQUIPE =====
    const totalVendas = funcionarios.reduce((s, f) => s + Number(f.meta || 0), 0);
    const totalClientes = funcionarios.reduce((s, f) => s + Number(f.clientes || 0), 0);
    const totalFechamentos = funcionarios.reduce((s, f) => s + Number(f.fechamentos || 0), 0);
    const totalVisitas = funcionarios.reduce((s, f) => s + Number(f.visitas || 0), 0);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Relatório Metas');

    // ===== TÍTULO =====
    sheet.mergeCells('A1:E1');
    sheet.getCell('A1').value = 'Relatório de Metas - ' + mesAtual;
    sheet.getCell('A1').font = { size: 14, bold: true };

    sheet.addRow([]);

    // ===== DASHBOARD =====
    sheet.addRow(['Dashboard Geral']);
    sheet.getRow(sheet.lastRow.number).font = { bold: true };

    sheet.addRow([
        'Meta Vendas',
        metaAtual.meta_valor || 0,
        'Alcançado',
        totalVendas
    ]);

    sheet.addRow([
        'Meta Clientes',
        metaAtual.meta_clientes || 0,
        'Alcançado',
        totalClientes
    ]);

    sheet.addRow([
        'Meta Fechamentos',
        metaAtual.meta_fechamentos || 0,
        'Alcançado',
        totalFechamentos
    ]);

    sheet.addRow([
        'Meta Visitas',
        metaAtual.meta_visitas || 0,
        'Alcançado',
        totalVisitas
    ]);

    sheet.addRow([]);
    sheet.addRow([]);

    // ===== TABELA FUNCIONÁRIOS =====
    sheet.addRow(['Funcionários']);
    sheet.getRow(sheet.lastRow.number).font = { bold: true };

    sheet.addRow([
        'Nome',
        'Vendas',
        'Meta Vendas',
        'Clientes',
        'Meta Clientes',
        'Fechamentos',
        'Meta Fechamentos',
        'Visitas',
        'Meta Visitas'
    ]);

    sheet.getRow(sheet.lastRow.number).font = { bold: true };

    funcionarios.forEach(f => {
        sheet.addRow([
            f.nome,
            f.meta,
            f.meta_valor,
            f.clientes,
            f.meta_clientes,
            f.fechamentos,
            f.meta_fechamentos,
            f.visitas,
            f.meta_visitas
        ]);
    });

    // ===== LARGURA COLUNAS =====
    sheet.columns.forEach(col => {
        col.width = 18;
    });

    // ===== FORMATAÇÃO MONETÁRIA =====
    sheet.eachRow((row) => {
        row.eachCell((cell) => {
            if (typeof cell.value === 'number') {
                cell.numFmt = '#,##0.00';
            }
        });
    });

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=relatorio-metas.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
});

app.get('/funcionarios/:id/vendas', async (req, res) => {
    const { id } = req.params;

    const [vendas] = await db.query(
        'SELECT * FROM vendas_detalhadas WHERE funcionario_id = ? ORDER BY id DESC',
        [id]
    );

    res.json(vendas);
});


app.post('/funcionarios/:id/vendas', async (req, res) => {

    const { id } = req.params;
    const { cliente, metodo_venda, observacao } = req.body;

    await db.query(`
        INSERT INTO vendas_detalhadas 
        (funcionario_id, cliente, metodo_venda, observacao)
        VALUES (?, ?, ?, ?)
    `, [id, cliente, metodo_venda, observacao]);

    res.json({ sucesso: true });
});

app.delete('/vendas/:id', async (req, res) => {

    const { id } = req.params;

    await db.query(
        'DELETE FROM vendas_detalhadas WHERE id = ?',
        [id]
    );

    res.json({ sucesso: true });
});

app.put('/vendas/:id', async (req, res) => {

    const { id } = req.params;
    const { cliente, metodo_venda, observacao } = req.body;

    await db.query(
        `UPDATE vendas_detalhadas 
         SET cliente = ?, metodo_venda = ?, observacao = ?
         WHERE id = ?`,
        [cliente, metodo_venda, observacao, id]
    );

    res.json({ sucesso: true });
});

app.post('/funcionarios/:id/nome', (req, res) => {

    const { nome } = req.body;

    db.query(
        'UPDATE funcionarios SET nome = ? WHERE id = ?',
        [nome, req.params.id],
        (err) => {

            if (err) {
                console.log(err);
                return res.status(500).json({ erro: 'Erro ao atualizar' });
            }

            res.json({ sucesso: true });
        }
    );

});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
