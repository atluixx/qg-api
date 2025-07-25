import noblox from 'noblox.js';
import getUserId from '../functions/get.user.id.js';

const roleController = async (req, res, login, logged, group) => {
  const { user, role } = req.body;

  console.log(
    '⚠️ [POST] /change-role iniciado - Dados recebidos:',
    JSON.stringify({ user, role })
  );

  if (!user || !role) {
    return res.status(400).json({
      response: "❌ Campos obrigatórios ausentes: 'user' e 'role'",
      status: false,
      code: 400,
    });
  }

  try {
    // Obtém userId aceitando ID numérico direto ou username
    let userId = Number(user);
    if (isNaN(userId)) {
      const userData = await getUserId({ username: user });
      userId = userData?.user?.id;
      if (!userId) {
        return res.status(404).json({
          response: '❌ Usuário não encontrado no Roblox.',
          status: false,
          code: 404,
        });
      }
    }

    // Pega os cargos disponíveis no grupo
    const roles = await noblox.getRoles(group.id);
    let rankToSet;

    if (typeof role === 'string' && isNaN(role)) {
      // role como nome do cargo
      const roleObj = roles.find(
        (r) => r.name.trim().toLowerCase() === role.trim().toLowerCase()
      );
      if (!roleObj) {
        return res.status(400).json({
          response: `❌ Cargo '${role}' não encontrado no grupo.`,
          status: false,
          code: 400,
        });
      }
      rankToSet = roleObj.rank;
    } else if (!isNaN(role)) {
      // role como número rank direto
      rankToSet = Number(role);
    } else {
      return res.status(400).json({
        response: '❌ Formato de cargo inválido. Use nome ou número.',
        status: false,
        code: 400,
      });
    }

    // Faz a troca de cargo
    const result = await noblox.setRank(group.id, userId, rankToSet);

    console.log(`✅ Cargo de usuário ${user} alterado para rank ${rankToSet}`);

    return res.status(200).json({
      response: `✅ Cargo de usuário ${user} alterado para rank ${rankToSet}.`,
      status: true,
      code: 200,
      rank: rankToSet,
      result,
    });
  } catch (error) {
    console.error('❌ Erro ao mudar o cargo:', error);
    return res.status(500).json({
      response: '❌ Erro ao mudar o cargo: ' + (error.message || error),
      status: false,
      code: 500,
    });
  }
};

export default roleController;
