import noblox from "noblox.js";

const handleUser = async ({ id, group, method }) => {
  const methodMap = {
    aceitar: "accept",
    accept: "accept",
    rejeitar: "reject",
    recusar: "reject",
    reject: "reject",
  };

  const action = methodMap[method?.toLowerCase()];
  if (!action) {
    return {
      response: "Método inválido. Use 'aceitar' ou 'rejeitar'.",
      status: false,
      code: 400,
    };
  }

  try {
    const requests = await noblox.getJoinRequests(group.id);

    const userInRequests = requests.data.some(
      (req) => req.requester.userId === id
    );

    if (!userInRequests) {
      return {
        response: "Usuário não está na lista de pedidos.",
        status: false,
        code: 404,
      };
    }

    await noblox.handleJoinRequest(group.id, id, action);
    const user = await noblox.getPlayerInfo(id);
    return {
      response: `Usuário ${
        action === "accept" ? "aceito" : "rejeitado"
      } com sucesso.`,
      user,
      status: true,
      code: 200,
    };
  } catch (error) {
    return {
      response: "Erro ao processar o pedido: " + error.message,
      status: false,
      code: error.response?.status || 500,
    };
  }
};

export default handleUser;
