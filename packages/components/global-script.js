export default function GlobalFunction() {
  SetupChatOnlineStatus();
}

function SetupChatOnlineStatus() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://libraryh3lp.com/presence/jid/umlibraryaskalibrarian/chat.libraryh3lp.com/js";
  script.onload = function() {
    window.chatOnline = jabber_resources[0].show === "available";
  };
  document.head.appendChild(script);
}
