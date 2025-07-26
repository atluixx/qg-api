import noblox from 'noblox.js';
import getUserId from '../functions/get.user.id.js';

const roleController = async (req, res, login, logged, group) => {
  const { user, role } = req.body;

  console.log(
    '⚠️ [POST] /change-role iniciado - Dados recebidos:',
    JSON.stringify({ user, role })
  );

  if (!user || !role) {
    console.log('❌ Campos obrigatórios ausentes.');
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
      console.log(`🔍 Buscando userId para username: ${user}`);
      const userData = await getUserId({ username: user });
      userId = userData?.user?.id;
      console.log(`🆔 Resultado da busca por username:`, userData);

      if (!userId) {
        console.log('❌ Usuário não encontrado no Roblox.');
        return res.status(404).json({
          response: '❌ Usuário não encontrado no Roblox.',
          status: false,
          code: 404,
        });
      }
    } else {
      console.log(`✅ userId recebido diretamente: ${userId}`);
    }

    console.log(`📥 Obtendo cargos do grupo ${group.id}...`);
    const roles = await noblox.getRoles(group.id);
    console.log(
      `📋 Cargos obtidos:`,
      roles.map((r) => ({ name: r.name, rank: r.rank }))
    );

    let rankToSet;

    if (typeof role === 'string' && isNaN(role)) {
      console.log(`🔍 Buscando cargo pelo nome: '${role}'`);
      const roleObj = roles.find(
        (r) => r.name.trim().toLowerCase() === role.trim().toLowerCase()
      );

      if (!roleObj) {
        console.log(`❌ Cargo '${role}' não encontrado.`);
        return res.status(400).json({
          response: `❌ Cargo '${role}' não encontrado no grupo.`,
          status: false,
          code: 400,
        });
      }

      rankToSet = roleObj.rank;
      console.log(
        `✅ Cargo encontrado: '${roleObj.name}' com rank ${rankToSet}`
      );
    } else if (!isNaN(role)) {
      rankToSet = Number(role);
      console.log(`🔢 Cargo definido diretamente pelo rank: ${rankToSet}`);
    } else {
      console.log('❌ Formato inválido de cargo.');
      return res.status(400).json({
        response: '❌ Formato de cargo inválido. Use nome ou número.',
        status: false,
        code: 400,
      });
    }

    console.log(
      `🔧 Alterando cargo do usuário ${userId} para rank ${rankToSet}...`
    );
    const result = await noblox.setRank(group.id, userId, rankToSet);

    console.log(
      `✅ Cargo alterado com sucesso para o usuário ${userId}. Resultado:`,
      result
    );

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
