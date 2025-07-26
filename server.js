import noblox from 'noblox.js';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import requestController from './app/controllers/group.requests.js';
import kickHandler from './app/controllers/kick.handler.js';
import roleHandler from './app/controllers/role.handler.js';
import login from './app/functions/authenticate.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
  })
);

const group = {
  id: 34909073,
  name: 'EB | Exército Brasileiro EB |',
};

// Estado de login e controle de concorrência
let logged = false;
let isLoggingIn = false;
let loginQueue = [];

async function ensureLogin() {
  if (logged) return true;
  if (isLoggingIn) {
    // Espera o login atual terminar
    return new Promise((resolve) => loginQueue.push(resolve));
  }
  isLoggingIn = true;
  logged = await login();
  isLoggingIn = false;

  // Resolve todas as promises pendentes
  loginQueue.forEach((resolve) => resolve(logged));
  loginQueue = [];

  return logged;
}

// Faz login inicial antes de subir servidor
(async () => {
  logged = await login();
  if (!logged) {
    console.error('❌ Falha ao fazer login inicial no Roblox. Encerrando...');
    process.exit(1);
  }
  console.log('✅ Login inicial bem-sucedido.');

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
})();

// Middleware para autenticação
const authMiddleware = async (req, res, next) => {
  const success = await ensureLogin();
  if (!success) {
    return res.status(500).json({
      response: '❌ Não foi possível autenticar no Roblox.',
      status: false,
    });
  }

  // Passa funções e estado no req para os controllers
  req.login = login;
  req.logged = logged;
  req.group = group;
  next();
};

app.get('/requests', authMiddleware, async (req, res) => {
  try {
    const data = await noblox.getJoinRequests(group.id);
    return res.json({ requests: data });
  } catch (error) {
    console.error('Erro ao obter solicitações:', error);
    return res.status(500).json({
      response: 'Erro ao obter solicitações de entrada.',
      status: false,
    });
  }
});

app.post('/requests', authMiddleware, (req, res) =>
  requestController(req, res, req.login, req.logged, req.group)
);

app.post('/kick', authMiddleware, (req, res) =>
  kickHandler(req, res, req.login, req.logged, req.group)
);

app.post('/change-role', authMiddleware, (req, res) =>
  roleHandler(req, res, req.login, req.logged, req.group)
);
