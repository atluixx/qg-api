import express from 'express';
import noblox from 'noblox.js';
import 'dotenv/config';
import cors from 'cors';

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

let logged = false;

logged = await login();
if (!logged) {
  console.error('❌ Falha ao fazer login inicial no Roblox. Encerrando...');
  process.exit(1);
}
console.log('✅ Login inicial bem-sucedido.');

const authMiddleware = async (req, res, next) => {
  if (!logged) {
    logged = await login();
    if (!logged) {
      return res.status(500).json({
        response: '❌ Não foi possível autenticar no Roblox.',
        status: false,
      });
    }
  }

  req.login = login;
  req.logged = logged;
  req.group = group;
  next();
};

app.get('/requests', authMiddleware, async (req, res) => {
  try {
    const { data } = await noblox.getJoinRequests(group.id);
    return res.json({ requests: data });
  } catch (error) {
    console.error('Erro ao obter solicitações:', error);
    return res.status(500).json({
      response: 'Erro ao obter solicitações de entrada.',
      status: false,
    });
  }
});

app.post('/requests', authMiddleware, async (req, res) =>
  requestController(req, res, req.login, req.logged, req.group)
);

app.post('/kick', authMiddleware, (req, res) =>
  kickHandler(req, res, req.login, req.logged, req.group)
);

app.post('/change-role', authMiddleware, (req, res) =>
  roleHandler(req, res, req.login, req.logged, req.group)
);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
