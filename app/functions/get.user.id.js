import axios from "axios";
import noblox from "noblox.js";

const getUserId = async ({ username }) => {
  try {
    if (!username.trim())
      return {
        response: "O parâmetro 'username' é obrigatório!",
        status: false,
      };

    const userId = await noblox.getIdFromUsername(username);
    const user = await noblox.getUserInfo(userId);
    return {
      response: user
        ? `Usuário encontrado: \nDisplay Name: ${user.displayName} \nName: ${user.name} \nID: ${user.id}`
        : "Usuário não encontrado.",
      user,
      status: !!user,
    };
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return {
      response: "Erro ao buscar usuário: " + error.message,
      status: false,
      code: error?.response.status || 429,
    };
  }
};

export default getUserId;
