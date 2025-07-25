import noblox from 'noblox.js';
import 'dotenv/config';

const login = async () => {
  try {
    await noblox.setCookie(process.env.ACCOUNT_COOKIE);
    const user = await noblox.getAuthenticatedUser();

    console.log(
      `[STATUS] Logged in successfully as: ${user.name} (${user.id})`
    );
    return true;
  } catch (error) {
    console.error(`[STATUS] Failed to login: ${error.message}`);
    return false;
  }
};

export default login;
