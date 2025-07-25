import noblox from 'noblox.js';
import getUserId from '../functions/get.user.id.js';

const kickHandler = async (req, res, login, logged, group) => {
  console.log('[⚠️] POST /kick - Iniciando exílio...');

  try {
    if (!logged) {
      const success = await login();
      if (!success) {
        return res.status(500).json({
          response: '❌ Falha ao autenticar no Roblox.',
          status: false,
          code: 500,
        });
      }
    }

    const { user } = req.body;
    if (!user) {
      return res.status(400).json({
        response: "❌ O campo 'user' é obrigatório.",
        status: false,
        code: 400,
      });
    }

    const groupId = typeof group === 'number' ? group : group?.id;
    if (!groupId || isNaN(Number(groupId))) {
      return res.status(400).json({
        response: "❌ Parâmetro 'group' inválido.",
        status: false,
        code: 400,
      });
    }

    let userId = Number(user);
    if (isNaN(userId)) {
      const result = await getUserId({ username: user });
      userId = result?.user?.id;
    }

    if (!userId) {
      return res.status(404).json({
        response: '❌ Usuário não encontrado no Roblox.',
        status: false,
        code: 404,
      });
    }

    await noblox.exile(groupId, userId);

    console.log(`✅ Usuário ${userId} exilado do grupo ${groupId}.`);
    return res.status(200).json({
      response: '✅ O usuário foi exilado com sucesso.',
      status: true,
      code: 200,
    });
  } catch (error) {
    console.error('❌ Erro ao exilar usuário:', error);

    if (
      error?.response?.status === 403 &&
      error?.response?.data?.errors?.[0]?.message?.includes('x-csrf-token')
    ) {
      return res.status(403).json({
        response: '❌ Erro de CSRF token. Tente novamente.',
        status: false,
        code: 403,
      });
    }

    return res.status(500).json({
      response: '❌ Ocorreu um erro ao tentar exilar o usuário.',
      status: false,
      code: 500,
    });
  }
};

export default kickHandler;
