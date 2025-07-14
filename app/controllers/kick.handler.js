import noblox from 'noblox.js';

const kickHandler = async (req, res, login, logged, group) => {
  console.log('[WARN] Método de uso: POST /kick [username|id]');

  try {
    if (!logged) {
      const success = await login();
      if (!success) {
        return res.status(500).json({
          response: 'Falha ao autenticar no Roblox.',
          status: false,
          code: 500,
        });
      }
    }

    const { user } = req.body;

    if (!user) {
      return res.status(400).json({
        response: "O parâmetro 'user' é obrigatório!",
        status: false,
        code: 400,
      });
    }

    let groupId;

    if (!isNaN(parseInt(group, 10))) {
      groupId = parseInt(group, 10);
    } else if (
      group &&
      typeof group === 'object' &&
      !isNaN(parseInt(group.id, 10))
    ) {
      groupId = parseInt(group.id, 10);
    } else {
      groupId = null;
    }

    const userId = parseInt(user, 10);

    if (!groupId || isNaN(userId)) {
      return res.status(400).json({
        response: "Os parâmetros 'group' e 'user' devem ser números válidos!",
        status: false,
        code: 400,
      });
    }

    await noblox.exile(groupId, userId);

    return res.status(200).json({
      response: 'O usuário foi exilado com sucesso!',
      status: true,
      code: 200,
    });
  } catch (error) {
    console.error('Erro ao exilar usuário:', error);

    if (
      error?.response?.status === 403 &&
      error?.response?.data?.errors?.[0]?.message?.includes('x-csrf-token')
    ) {
      return res.status(403).json({
        response: 'Erro de CSRF token. Tente novamente.',
        status: false,
        code: 403,
      });
    }

    return res.status(500).json({
      response: 'Ocorreu um erro durante o exílio do usuário.',
      status: false,
      code: 500,
    });
  }
};

export default kickHandler;
