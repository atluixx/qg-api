import noblox from 'noblox.js';
import 'dotenv/config';

let currentUser = null;

const login = async () => {
  try {
    await noblox.setCookie(process.env.ACCOUNT_COOKIE);
    currentUser = await noblox.getAuthenticatedUser();

    console.log(
      `[STATUS] Logged in successfully as: ${currentUser.name} (${currentUser.id})`
    );
    return true;
  } catch (error) {
    console.error(`[STATUS] Failed to login: ${error.message}`);
    currentUser = null;
    return false;
  }
};

// Função para obter o usuário atual (se quiser expor)
const getCurrentUser = () => currentUser;

export default login;
export { getCurrentUser };
