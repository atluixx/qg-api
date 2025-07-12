import noblox from "noblox.js";
import getUserId from "../functions/get.user.id.js";

const roleController = async (req, res, login, logged, group) => {
  const { user, role } = req.body;

  console.log(
    "[WARN] Método de uso: POST /change-role [rolename|roleid] [username|id]"
  );

  if (!user || !role) {
    return res.status(400).json({
      error: "Campos obrigatórios ausentes: 'user' e 'role'",
    });
  }

  try {
    const userId = (await getUserId({ username: user })).user.id;

    if (!userId) {
      return res
        .status(404)
        .json({ error: "Usuário não encontrado no Roblox." });
    }

    const roles = await noblox.getRoles(group.id);
    let rankToSet;

    if (typeof role === "string") {
      const roleObj = roles.find(
        (r) => r.name.trim().toLowerCase() === role.trim().toLowerCase()
      );
      if (!roleObj) {
        return res
          .status(400)
          .json({ error: `Cargo '${role}' não encontrado no grupo.` });
      }
      rankToSet = roleObj.rank;
    } else if (!isNaN(role)) {
      rankToSet = Number(role);
    } else {
      return res.status(400).json({ error: "Formato de cargo inválido." });
    }

    const result = await noblox.setRank(group.id, userId, rankToSet);

    console.log(`✔️ Cargo de ${user} alterado para rank ${rankToSet}`);

    return res.status(200).json({
      message: `Cargo de ${user} alterado para rank ${rankToSet}.`,
      rank: rankToSet,
      result,
    });
  } catch (error) {
    console.error("❌ Erro ao mudar o cargo:", error.message);
    return res.status(500).json({
      error: "Erro ao mudar o cargo: " + error.message,
    });
  }
};

export default roleController;
