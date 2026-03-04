const axios = require("axios");

module.exports = {
config: {
name: "accept",
aliases: ['acp', 'requests'],
version: "6.0.0",
author: "Aphelion | fixed Milon",
countDown: 5,
role: 0,
shortDescription: "Accept sender's friend request with status check",
longDescription: "Accepts sender's request or notifies if already friends.",
category: "Utility",
},

onStart: async function ({ event, api, usersData }) {
const { threadID, messageID, senderID } = event;
const name = await usersData.getName(senderID);

try {
// 1. Check Friend Status (Already friends or not)
const userInfo = await api.getUserInfo(senderID);
const isFriend = userInfo[senderID].isFriend;

if (isFriend) {
return api.sendMessage(`┏━━━━━━❰ ROLEX BOT ❱━━━━━━┓\n┃ ⚠️ Hey ${name}!\n┃ You are already in my friend list.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`, threadID, messageID);
}

// 2. Fetch Pending Requests List
const formList = {
av: api.getCurrentUserID(),
fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
fb_api_caller_class: "RelayModern",
doc_id: "4499164963466303",
variables: JSON.stringify({ input: { scale: 3 } })
};

const response = await api.httpPost("https://www.facebook.com/api/graphql/", formList);
const listRequest = JSON.parse(response).data.viewer.friending_possibilities.edges;

// 3. Check if sender is in pending list
const senderRequest = listRequest.find(u => u.node.id == senderID);

if (!senderRequest) {
return api.sendMessage(`┏━━━━━━❰ MILON BOT ❱━━━━━━┓\n┃ ⚠️ Hey ${name}!\n┃ No pending request found from you.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`, threadID, messageID);
}

// 4. Accept the specific request
const formAccept = {
av: api.getCurrentUserID(),
fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
fb_api_caller_class: "RelayModern",
doc_id: "3147613905362928",
variables: JSON.stringify({
input: {
source: "friends_tab",
friend_requester_id: senderID,
actor_id: api.getCurrentUserID(),
client_mutation_id: Math.round(Math.random() * 19).toString()
},
scale: 3,
refresh_num: 0
})
};

const res = await api.httpPost("https://www.facebook.com/api/graphql/", formAccept);

if (JSON.parse(res).errors) {
return api.sendMessage(`❌ Sorry ${name}, failed to accept your request.`, threadID, messageID);
} else {
return api.sendMessage(`╔══════❰ ⚡ SUCCESS ❱══════╗\n┃ ✅ Congratulations ${name}!\n┃ Your request has been accepted.\n┃ ━━━━━━━━━━━━━━━━━━━\n┃ 👑 DONE BY MILON BOT\n╚══════════════════════╝`, threadID, messageID);
}

} catch (err) {
console.error(err);
return api.sendMessage("❌ System Error! Please try again later.", threadID, messageID);
}
}
};
