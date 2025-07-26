import handleRequest from '../functions/handle.group.request.js';

const requestController = async (req, res, login, logged, group) => {
  console.log('[⚠️] POST /requests - Iniciando processamento da solicitação.');

  const { method, user } = req.body;

  try {
    // Evita múltiplos logins concorrentes com flag simples
    if (!logged) {
      if (requestController.isLoggingIn) {
        // Espera até que o login atual termine (polling simples)
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (!requestController.isLoggingIn) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      } else {
        requestController.isLoggingIn = true;
        const success = await login();
        requestController.isLoggingIn = false;

        if (!success) {
          return res.status(500).json({
            response: '❌ Falha ao autenticar no Roblox.',
            status: false,
            code: 500,
          });
        }
      }
    }

    // Validação de método (case insensitive)
    const normalizedMethod =
      typeof method === 'string' ? method.toLowerCase() : null;

    if (!normalizedMethod || !['accept', 'reject'].includes(normalizedMethod)) {
      return res.status(400).json({
        response: "❌ O parâmetro 'method' deve ser 'accept' ou 'reject'.",
        status: false,
        code: 400,
      });
    }

    // Valida usuário
    if (!user || typeof user !== 'string') {
      return res.status(400).json({
        response: "❌ O parâmetro 'user' deve ser fornecido e ser uma string.",
        status: false,
        code: 400,
      });
    }

    // Trata userId com regex para evitar NaN inválido
    let userId = null;
    const userTrim = user.trim();

    if (/^\d+$/.test(userTrim)) {
      userId = Number(userTrim);
    } else {
      // Supõe username, tenta resolver via getUserId
      const userResult = await getUserId({ username: userTrim });
      userId = userResult?.user?.id ?? null;
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

    if (response?.status === true) {
      return res.status(200).json({
        response: `✅ Usuário ${
          normalizedMethod === 'accept' ? 'aceito' : 'rejeitado'
        } com sucesso!`,
        status: true,
        code: 200,
      });
    } else if (response?.status === false) {
      return res.status(404).json({
        response: '❌ Usuário não encontrado nas solicitações de entrada.',
        status: false,
        code: 404,
      });
    } else {
      // Resposta inesperada
      console.warn('⚠️ Resposta inesperada de handleRequest:', response);
      return res.status(500).json({
        response: '❌ Resposta inesperada da função handleRequest.',
        status: false,
        code: 500,
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

// Flag para controle de login concorrente
requestController.isLoggingIn = false;

export default requestController;
