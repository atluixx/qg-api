import handleRequest from '../functions/handle.group.request.js';
import getUserId from '../functions/get.user.id.js';

const requestController = async (req, res, login, logged, group) => {
  const { method, user } = req.body;

  console.log(
    '[WARN] Método de uso: POST /requests [accept|reject] [username|id]'
  );

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

    const normalizedMethod = method?.toLowerCase();
    if (!normalizedMethod || !['accept', 'reject'].includes(normalizedMethod)) {
      return res.status(400).json({
        response: "O parâmetro 'method' deve ser 'accept' ou 'reject'.",
        status: false,
        code: 400,
      });
    }

    if (!user) {
      return res.status(400).json({
        response: "O parâmetro 'user' deve ser fornecido.",
        status: false,
        code: 400,
      });
    }

    const action = normalizedMethod === 'accept';
    let userId = parseInt(user, 10);

    if (isNaN(userId)) {
      const result = await getUserId({ username: user });
      userId = result?.user?.id;

      if (!userId) {
        return res.status(404).json({
          response: 'Usuário não encontrado.',
          status: false,
          code: 404,
        });
      }
    }

    const response = await handleRequest({
      group,
      id: userId,
      method: normalizedMethod,
    });

    if (response?.status) {
      return res.status(200).json({
        response: `Usuário ${action ? 'aceito' : 'rejeitado'} com sucesso!`,
        status: true,
        code: 200,
      });
    } else {
      return res.status(404).json({
        response: 'Usuário não encontrado nas solicitações de entrada.',
        status: false,
        code: 404,
      });
    }
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);

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
      response: 'Erro interno ao processar a solicitação.',
      status: false,
      code: 500,
    });
  }
};

export default requestController;
