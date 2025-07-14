import noblox from 'noblox.js';

/**
 * Busca o ID e dados do usuário no Roblox.
 * @param {{ username: string }} param0
 * @returns {Promise<{ response: string, user: object|null, status: boolean, code?: number }>}
 */
const getUserId = async ({ username }) => {
  try {
    if (!username?.trim()) {
      return {
        response: "O parâmetro 'username' é obrigatório!",
        status: false,
        user: null,
      };
    }

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
