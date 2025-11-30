// --- Importações Necessárias ---
require('dotenv').config();
const express = require('express');
const knexConfig = require('./knexfile').development;
const db = require('knex')(knexConfig);
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // NOVO: Para permitir requisições do Front-end

const app = express();

// --- Middleware CORS (CORREÇÃO DE FUNCIONALIDADE) ---
// Isso permite que o seu front-end (localhost:8080) se comunique com o back-end (localhost:3000)
app.use(cors()); 

app.use(express.json());

// --- Configuração do Nodemailer ---
// Usa as variáveis EMAIL_USER e EMAIL_PASS do seu arquivo .env
const transporter = nodemailer.createTransport({
    service: 'gmail', // Mude para o seu serviço (ex: 'Outlook')
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// ----------------------------------

// =======================================================
// ROTA: REGISTRO (/register)
// =======================================================
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    
    try {
        const existingUser = await db('usuarios').where({ email }).first();
        if (existingUser) {
            return res.status(400).json({ erro: 'Este email já está em uso.' });
        }

        const saltRounds = 10;
        const hashedSenha = await bcrypt.hash(senha, saltRounds);

        await db('usuarios').insert({ nome, email, senha: hashedSenha });
        
        return res.status(201).json({ mensagem: 'Usuário registrado com sucesso.' });

    } catch (error) {
        console.error('Erro no registro:', error);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

// =======================================================
// ROTA: LOGIN (/login)
// =======================================================
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        const user = await db('usuarios').where({ email }).first();
        if (!user) {
            return res.status(401).json({ erro: 'Email ou senha inválidos.' });
        }

        const match = await bcrypt.compare(senha, user.senha);
        if (!match) {
            return res.status(401).json({ erro: 'Email ou senha inválidos.' });
        }
        
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ token, usuario: { id: user.id, nome: user.nome, email: user.email } });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

// =======================================================
// ROTA: TODAS AS MÚSICAS (/musicas) - NECESSÁRIO PARA O app.js
// =======================================================
app.get('/musicas', async (req, res) => {
    try {
        // Retorna todas as músicas, ordenadas por popularidade (se você tiver essa coluna)
        const musicas = await db('musicas').select('*').orderBy('id', 'desc'); 
        return res.status(200).json(musicas);
    } catch (error) {
        console.error('Erro ao carregar músicas:', error);
        return res.status(500).json({ erro: 'Erro ao carregar músicas.' });
    }
});

// =======================================================
// ROTA: SOLICITAR REDEFINIÇÃO (/forgot-password)
// =======================================================
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await db('usuarios').where({ email }).first();

        if (!user) {
            return res.status(200).json({ mensagem: 'Se o email estiver cadastrado, um link será enviado.' });
        }

        const token = uuidv4(); 
        const expiresAt = new Date(Date.now() + 3600000); // 1 hora

        // O Knex não possui 'onConflict' nativo para MySQL como o SQLite/PostgreSQL.
        // O método 'merge()' é uma extensão do Knex para o onConflict. 
        // Se a sua versão do Knex não suportar, esta linha pode dar erro.
        // Assumindo que você está usando uma versão que suporta onConflict().merge() no knexfile.js:
        await db('password_resets').insert({
            usuario_id: user.id,
            token: token,
            expira_em: expiresAt
        }).onConflict('usuario_id').merge();

        const resetUrl = `http://localhost:8080/reset-password.html?token=${token}`; 

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'MoodMusic - Redefinição de Senha',
            html: `
                <p>Você solicitou a redefinição de sua senha.</p>
                <p>Clique no link abaixo para redefinir:</p>
                <a href="${resetUrl}">Redefinir Senha</a>
                <p>Este link expira em 1 hora.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({ mensagem: 'Link de redefinição enviado com sucesso.' });

    } catch (error) {
        console.error('Erro no forgot-password:', error);
        return res.status(500).json({ erro: 'Erro interno do servidor ao enviar e-mail.' });
    }
});


// =======================================================
// ROTA: REDEFINIR SENHA (/reset-password)
// =======================================================
app.post('/reset-password', async (req, res) => {
    const { token, senha } = req.body;

    const resetEntry = await db('password_resets')
        .where({ token })
        .andWhere('expira_em', '>', db.fn.now())
        .first();

    if (!resetEntry) {
        return res.status(400).json({ erro: 'Token inválido ou expirado. Por favor, solicite um novo link.' });
    }

    try {
        const saltRounds = 10;
        const hashedSenha = await bcrypt.hash(senha, saltRounds);
        
        await db('usuarios')
            .where({ id: resetEntry.usuario_id })
            .update({ senha: hashedSenha }); 

        await db('password_resets')
            .where({ token })
            .del();

        return res.status(200).json({ mensagem: 'Senha redefinida com sucesso.' });

    } catch (error) {
        console.error('Erro no reset-password:', error);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor MoodMusic rodando na porta ${PORT}`));