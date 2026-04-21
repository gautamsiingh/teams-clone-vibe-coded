const chats = {
  design: {
    avatar: "SP",
    avatarClass: "gradient-a",
    title: "Supriya Patel",
    status: "Available",
    preview: "Can we tighten the spacing in the sidebar before review?",
    messages: [
      { author: "Supriya Patel", time: "2:02 PM", text: "We are very close. The left rail feels right, but the chat list could use a little more breathing room.", incoming: true },
      { author: "You", time: "2:05 PM", text: "I’ll adjust the card spacing and make the active state sharper so it reads more like Teams.", incoming: false },
      { author: "Supriya Patel", time: "2:08 PM", text: "Shared the reference file so we can compare spacing and hover states.", incoming: true },
      { author: "Supriya Patel", time: "2:14 PM", text: "Can we tighten the spacing in the sidebar before review?", incoming: true, reactions: ["👍 2", "✨ 1"] },
    ],
  },
  marketing: {
    avatar: "AM",
    avatarClass: "gradient-b",
    title: "Arjun Mehta",
    status: "In a meeting",
    preview: "The campaign deck is ready. I dropped the final slides here.",
    messages: [
      { author: "Arjun Mehta", time: "12:56 PM", text: "I tightened the narrative in the first three slides so the launch story lands faster.", incoming: true },
      { author: "You", time: "12:58 PM", text: "Nice. I’ll review the cover and the CTA slide next.", incoming: false },
      { author: "Arjun Mehta", time: "1:02 PM", text: "The campaign deck is ready. I dropped the final slides here.", incoming: true },
    ],
  },
  standup: {
    avatar: "UX",
    avatarClass: "gradient-c",
    title: "UX Standup",
    status: "7 participants active",
    preview: "Priya: shared the updated flow for the mobile composer.",
    messages: [
      { author: "Priya", time: "11:40 AM", text: "Shared the updated flow for the mobile composer and the collapsed chat list behavior.", incoming: true },
      { author: "Nikhil", time: "11:44 AM", text: "I’ll handle accessibility notes and focus rings this afternoon.", incoming: true },
      { author: "You", time: "11:48 AM", text: "I’ll turn the static mock into a more interactive prototype after lunch.", incoming: false },
    ],
  },
  ops: {
    avatar: "OP",
    avatarClass: "gradient-d",
    title: "Ops Desk",
    status: "Monitoring",
    preview: "Reminder: deployment freeze begins Friday at 6 PM.",
    messages: [
      { author: "Ops Desk", time: "Yesterday", text: "Reminder: deployment freeze begins Friday at 6 PM.", incoming: true },
      { author: "You", time: "Yesterday", text: "Acknowledged. We’ll push UI changes before the freeze window.", incoming: false },
    ],
  },
};

let activeChatId = "design";
let activeRailView = "Chat";
let unreadOnly = false;
let formatEnabled = false;
let newChatCount = 1;

const chatCards = () => Array.from(document.querySelectorAll(".chat-card"));
const railItems = document.querySelectorAll(".rail-item[data-rail-view]");
const activeAvatar = document.getElementById("activeAvatar");
const activeTitle = document.getElementById("activeTitle");
const activeStatus = document.getElementById("activeStatus");
const paneEyebrow = document.getElementById("paneEyebrow");
const paneTitle = document.getElementById("paneTitle");
const chatGroups = document.getElementById("chatGroups");
const chatEmptyState = document.getElementById("chatEmptyState");
const chatSearchInput = document.getElementById("chatSearchInput");
const filterButton = document.getElementById("filterButton");
const newChatButton = document.getElementById("newChatButton");
const appsButton = document.getElementById("appsButton");
const videoCallButton = document.getElementById("videoCallButton");
const callButton = document.getElementById("callButton");
const moreActionsButton = document.getElementById("moreActionsButton");
const moreActionsMenu = document.getElementById("moreActionsMenu");
const composerForm = document.getElementById("composerForm");
const composerInput = document.getElementById("composerInput");
const chatThread = document.getElementById("chatThread");
const messageTemplate = document.getElementById("messageTemplate");
const toastStack = document.getElementById("toastStack");
const formatButton = document.getElementById("formatButton");
const attachButton = document.getElementById("attachButton");
const emojiButton = document.getElementById("emojiButton");
const loopButton = document.getElementById("loopButton");

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const autosizeComposer = () => {
  composerInput.style.height = "auto";
  composerInput.style.height = `${Math.min(composerInput.scrollHeight, 180)}px`;
};

const showToast = (title, body) => {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><p>${body}</p>`;
  toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2600);
};

const createMessageRow = ({ author, time, text, incoming, reactions = [] }) => {
  if (!incoming) {
    const node = messageTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".message-bubble").textContent = text;
    node.querySelector(".message-head strong").textContent = author;
    node.querySelector(".message-head span").textContent = time;
    return node;
  }

  const row = document.createElement("article");
  row.className = "message-row incoming";

  const avatar = document.createElement("div");
  avatar.className = `avatar ${chats[activeChatId].avatarClass}`;
  avatar.textContent = chats[activeChatId].avatar;

  const group = document.createElement("div");
  group.className = "message-group";
  group.innerHTML = `
    <div class="message-head">
      <strong>${author}</strong>
      <span>${time}</span>
    </div>
    <div class="message-bubble">${text}</div>
  `;

  if (reactions.length) {
    const reactionBar = document.createElement("div");
    reactionBar.className = "message-reactions";
    reactions.forEach((reaction) => {
      const pill = document.createElement("span");
      pill.textContent = reaction;
      reactionBar.appendChild(pill);
    });
    group.appendChild(reactionBar);
  }

  row.append(avatar, group);
  return row;
};

const renderMessages = () => {
  chatThread.innerHTML = '<div class="thread-day">Today</div>';
  chats[activeChatId].messages.forEach((message) => {
    chatThread.appendChild(createMessageRow(message));
  });
  chatThread.scrollTop = chatThread.scrollHeight;
};

const setActiveChat = (chatId) => {
  activeChatId = chatId;
  const chat = chats[chatId];
  activeAvatar.textContent = chat.avatar;
  activeAvatar.className = `avatar large ${chat.avatarClass}`;
  activeTitle.textContent = chat.title;
  activeStatus.textContent = chat.status;
  renderMessages();

  chatCards().forEach((card) => {
    card.classList.toggle("selected", card.dataset.chat === chatId);
  });
};

const updateGroupVisibility = () => {
  const labels = Array.from(chatGroups.querySelectorAll(".group-label"));
  labels.forEach((label) => {
    let sibling = label.nextElementSibling;
    let hasVisibleChat = false;
    while (sibling && !sibling.classList.contains("group-label")) {
      if (sibling.classList.contains("chat-card") && !sibling.classList.contains("hidden")) {
        hasVisibleChat = true;
      }
      sibling = sibling.nextElementSibling;
    }
    label.classList.toggle("hidden", !hasVisibleChat);
  });
};

const applySearchAndFilter = () => {
  const query = chatSearchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  chatCards().forEach((card) => {
    const matchesQuery =
      !query ||
      card.dataset.title.toLowerCase().includes(query) ||
      card.dataset.preview.toLowerCase().includes(query);
    const matchesUnread = !unreadOnly || card.dataset.unread === "true";
    const visible = matchesQuery && matchesUnread;
    card.classList.toggle("hidden", !visible);
    if (visible) {
      visibleCount += 1;
    }
  });

  updateGroupVisibility();
  chatEmptyState.classList.toggle("hidden", visibleCount > 0);
};

const updatePaneForRailView = (view) => {
  activeRailView = view;
  paneEyebrow.textContent = view;
  paneTitle.textContent = view === "Chat" ? "Recent" : `${view} hub`;
  railItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.railView === view);
  });

  if (view === "Chat") {
    showToast("Chat", "Back in your messages.");
  } else {
    showToast(view, `${view} is shown as a lightweight preview in this prototype.`);
  }
};

const insertAtCursor = (text) => {
  const start = composerInput.selectionStart;
  const end = composerInput.selectionEnd;
  const current = composerInput.value;
  composerInput.value = `${current.slice(0, start)}${text}${current.slice(end)}`;
  composerInput.selectionStart = composerInput.selectionEnd = start + text.length;
  autosizeComposer();
  composerInput.focus();
};

const addChatCard = (chatId, chat) => {
  const button = document.createElement("button");
  button.className = "chat-card";
  button.dataset.chat = chatId;
  button.dataset.title = chat.title;
  button.dataset.preview = chat.preview;
  button.dataset.group = "Today";
  button.dataset.unread = "true";
  button.innerHTML = `
    <div class="avatar ${chat.avatarClass}">${chat.avatar}</div>
    <div class="card-content">
      <div class="card-topline">
        <strong>${chat.title}</strong>
        <span>Now</span>
      </div>
      <p class="card-preview">${chat.preview}</p>
    </div>
  `;

  const labels = Array.from(chatGroups.querySelectorAll(".group-label"));
  const todayLabel = labels.find((label) => label.textContent === "Today");
  if (todayLabel) {
    todayLabel.insertAdjacentElement("afterend", button);
  } else {
    const label = document.createElement("div");
    label.className = "group-label";
    label.textContent = "Today";
    chatGroups.prepend(label);
    label.insertAdjacentElement("afterend", button);
  }

  button.addEventListener("click", () => setActiveChat(chatId));
  applySearchAndFilter();
};

railItems.forEach((item) => {
  item.addEventListener("click", () => updatePaneForRailView(item.dataset.railView));
});

chatCards().forEach((card) => {
  card.addEventListener("click", () => setActiveChat(card.dataset.chat));
});

chatSearchInput.addEventListener("input", applySearchAndFilter);

filterButton.addEventListener("click", () => {
  unreadOnly = !unreadOnly;
  filterButton.classList.toggle("is-active", unreadOnly);
  applySearchAndFilter();
  showToast(
    unreadOnly ? "Unread filter on" : "Unread filter off",
    unreadOnly ? "Only unread conversations are visible." : "Showing every conversation again.",
  );
});

newChatButton.addEventListener("click", () => {
  const chatId = `new-${newChatCount}`;
  const title = `New chat ${newChatCount}`;
  newChatCount += 1;

  chats[chatId] = {
    avatar: "NC",
    avatarClass: "gradient-d",
    title,
    status: "Draft conversation",
    preview: "Say hello to start the conversation.",
    messages: [
      { author: title, time: formatTime(), text: "This conversation is ready. Send a message to get it started.", incoming: true },
    ],
  };

  addChatCard(chatId, chats[chatId]);
  setActiveChat(chatId);
  composerInput.focus();
  showToast("New chat", `${title} has been created.`);
});

appsButton.addEventListener("click", () => {
  showToast("Apps", "Store, approvals, and custom app surfaces would open here.");
});

videoCallButton.addEventListener("click", () => {
  showToast("Meeting link ready", `Starting a video call with ${chats[activeChatId].title}.`);
});

callButton.addEventListener("click", () => {
  showToast("Audio call", `Calling ${chats[activeChatId].title}.`);
});

moreActionsButton.addEventListener("click", (event) => {
  event.stopPropagation();
  moreActionsMenu.classList.toggle("hidden");
});

moreActionsMenu.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (!action) {
    return;
  }

  const labels = {
    pin: "Conversation pinned to the top of your list.",
    mute: "Notifications are muted for this chat.",
    export: "Transcript export prepared for this prototype.",
  };

  showToast("Conversation action", labels[action]);
  moreActionsMenu.classList.add("hidden");
});

document.addEventListener("click", (event) => {
  if (!moreActionsMenu.contains(event.target) && event.target !== moreActionsButton) {
    moreActionsMenu.classList.add("hidden");
  }
});

formatButton.addEventListener("click", () => {
  formatEnabled = !formatEnabled;
  formatButton.classList.toggle("is-active", formatEnabled);
  showToast(
    formatEnabled ? "Formatting on" : "Formatting off",
    formatEnabled ? "Messages will send wrapped in bold markdown." : "Messages will send as plain text.",
  );
});

attachButton.addEventListener("click", () => {
  insertAtCursor("[Attachment: Project_Update_v4.pdf]");
  showToast("Attachment added", "A mock file placeholder was inserted into the composer.");
});

emojiButton.addEventListener("click", () => {
  insertAtCursor(" 🙂");
});

loopButton.addEventListener("click", () => {
  insertAtCursor("Loop agenda:\n- Status\n- Risks\n- Next steps");
  showToast("Loop component", "A reusable agenda block was inserted.");
});

composerInput.addEventListener("input", autosizeComposer);

composerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composerForm.requestSubmit();
  }
});

composerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let message = composerInput.value.trim();
  if (!message) {
    return;
  }

  if (formatEnabled) {
    message = `**${message}**`;
  }

  const time = formatTime();
  const node = createMessageRow({
    author: "You",
    time,
    text: message,
    incoming: false,
  });

  chatThread.appendChild(node);
  chats[activeChatId].messages.push({
    author: "You",
    time,
    text: message,
    incoming: false,
  });
  chats[activeChatId].preview = message;

  const activeCard = document.querySelector(`.chat-card[data-chat="${activeChatId}"]`);
  if (activeCard) {
    activeCard.dataset.preview = message;
    const preview = activeCard.querySelector(".card-preview");
    const timestamp = activeCard.querySelector(".card-topline span");
    if (preview) {
      preview.textContent = message;
    }
    if (timestamp) {
      timestamp.textContent = "Now";
    }
  }

  composerInput.value = "";
  autosizeComposer();
  chatThread.scrollTop = chatThread.scrollHeight;
});

setActiveChat(activeChatId);
applySearchAndFilter();
autosizeComposer();
