const userClients = new Map();

const addClient = (userId, res) => {
  if (!userClients.has(userId)) {
    userClients.set(userId, new Set());
  }
  userClients.get(userId).add(res);
};

const removeClient = (userId, res) => {
  const clients = userClients.get(userId);
  if (!clients) {
    return;
  }

  clients.delete(res);
  if (clients.size === 0) {
    userClients.delete(userId);
  }
};

const sendEventToUser = (userId, eventName, payload = {}) => {
  const clients = userClients.get(String(userId));
  if (!clients || clients.size === 0) {
    return;
  }

  const data = JSON.stringify(payload);
  for (const client of clients) {
    try {
      client.write(`event: ${eventName}\n`);
      client.write(`data: ${data}\n\n`);
    } catch (error) {
      // Ignore write errors for stale connections
    }
  }
};

module.exports = {
  addClient,
  removeClient,
  sendEventToUser
};
