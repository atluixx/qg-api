import noblox from 'noblox.js';
import getUserId from '../functions/get.user.id.js';

/**
 * Controlador para alterar o cargo de um usuário no grupo Roblox.
 * Espera receber no body: { user: string (username ou ID), role: string (nome ou rank) }
 */
const roleController = async (req, res, login, logged, group) => {
  const { user, role } = req.body;

  console.log(
    '⚠️ [POST] /change-role iniciado - Dados recebidos:',
    JSON.stringify({ user, role })
  );

  if (!user || !role) {
    return res.status(400).json({
      error: "❌ Campos obrigatórios ausentes: 'user' e 'role'",
    });
  }

  try {
    // Obtém dados do usuário
    const userData = await getUserId({ username: user });

    if (!userData || !userData.user || !userData.user.id) {
      return res.status(404).json({
        error: '❌ Usuário não encontrado no Roblox.',
      });
    }

    const userId = userData.user.id;

    // Pega os cargos disponíveis no grupo
    const roles = await noblox.getRoles(group.id);
    let rankToSet;

    // Caso role seja um nome de cargo
    if (typeof role === 'string' && isNaN(role)) {
      const roleObj = roles.find(
        (r) => r.name.trim().toLowerCase() === role.trim().toLowerCase()
      );
      if (!roleObj) {
        return res.status(400).json({
          error: `❌ Cargo '${role}' não encontrado no grupo.`,
        });
      }
      rankToSet = roleObj.rank;
    }

    // Caso role seja um número (rank direto)
    else if (!isNaN(role)) {
      rankToSet = Number(role);
    }

    // Formato inválido
    else {
      return res.status(400).json({
        error: '❌ Formato de cargo inválido. Use nome ou número.',
      });
    }

    // Faz a troca de cargo
    const result = await noblox.setRank(group.id, userId, rankToSet);

    console.log(
      `✅ Cargo de ${user} alterado com sucesso para rank ${rankToSet}`
    );

    return res.status(200).json({
      message: `✅ Cargo de ${user} alterado para rank ${rankToSet}.`,
      rank: rankToSet,
      result,
    });
  } catch (error) {
    console.error('❌ Erro ao mudar o cargo:', error);
    return res.status(500).json({
      error: '❌ Erro ao mudar o cargo: ' + (error.message || error),
    });
  }
};

export default roleController;
