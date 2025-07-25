const requestController = async (req, res, login, logged, group) => {
  console.log('[⚠️] POST /requests - Iniciando processamento da solicitação.');

  const { method, user } = req.body; // importante extrair do body logo

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

    // Valida o método aceito
    const normalizedMethod = method?.toLowerCase();
    if (!normalizedMethod || !['accept', 'reject'].includes(normalizedMethod)) {
      return res.status(400).json({
        response: "❌ O parâmetro 'method' deve ser 'accept' ou 'reject'.",
        status: false,
        code: 400,
      });
    }

    // Valida usuário
    if (!user) {
      return res.status(400).json({
        response: "❌ O parâmetro 'user' deve ser fornecido.",
        status: false,
        code: 400,
      });
    }

    // Obtem userId, aceitando ID direto ou username via getUserId
    let userId = Number(user);
    if (isNaN(userId)) {
      const userResult = await getUserId({ username: user });
      userId = userResult?.user?.id;

      if (!userId) {
        return res.status(404).json({
          response: '❌ Usuário não encontrado.',
          status: false,
          code: 404,
        });
      }
    }

    // Executa ação (accept/reject)
    const response = await handleRequest({
      group,
      id: userId,
      method: normalizedMethod,
    });

    if (response?.status) {
      return res.status(200).json({
        response: `✅ Usuário ${
          normalizedMethod === 'accept' ? 'aceito' : 'rejeitado'
        } com sucesso!`,
        status: true,
        code: 200,
      });
    } else {
      return res.status(404).json({
        response: '❌ Usuário não encontrado nas solicitações de entrada.',
        status: false,
        code: 404,
      });
    }
  } catch (error) {
    console.error('❌ Erro ao processar a solicitação:', error);

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
      response: '❌ Erro interno ao processar a solicitação.',
      status: false,
      code: 500,
    });
  }
};

export default requestController;
