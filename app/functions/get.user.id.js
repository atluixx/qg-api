import noblox from 'noblox.js';

const getUserId = async ({ username }) => {
  try {
    if (!username?.toString().trim()) {
      return {
        response: "O parâmetro 'username' é obrigatório!",
        status: false,
        user: null,
      };
    }

    const maybeId = Number(username);
    if (!isNaN(maybeId) && maybeId > 0) {
      try {
        const user = await noblox.getUserInfo(maybeId);
        return {
          response: `Usuário encontrado: ${user.name} (ID: ${user.id})`,
          user,
          status: true,
        };
      } catch (innerError) {
        // Se não encontrar pelo ID, tenta seguir para username normalmente
        console.warn(
          `ID informado não válido como usuário: ${maybeId}`,
          innerError
        );
      }
    }

    // Se não foi ID válido ou não encontrou pelo ID, tenta username
    const userId = await noblox.getIdFromUsername(username);
    const user = await noblox.getUserInfo(userId);

    return {
      response: user
        ? `Usuário encontrado:\nDisplay Name: ${user.displayName}\nName: ${user.name}\nID: ${user.id}`
        : 'Usuário não encontrado.',
      user: user || null,
      status: !!user,
    };
  } catch (error) {
    return {
      response: 'Erro ao buscar usuário: ' + error.message,
      user: null,
      status: false,
      code: error?.response?.status || 429,
    };
  }
};

export default getUserId;
