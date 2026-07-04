const config = require('./config.js');

function isAdmin(member) {
  return (
    member.id === config.ownerID ||
    (config.adminID && member.id === config.adminID)
  );
}

module.exports = { isAdmin };
