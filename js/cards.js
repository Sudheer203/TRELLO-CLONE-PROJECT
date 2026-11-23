// Card operations: display, create, rename, archive, and the card detail modal.
const Cards = {
  currentId: null,

  element(card) {
    const wrap = el("article", "card");
    wrap.tabIndex = 0;
    wrap.appendChild(el("div", "card-title", card.name));

    const p = Checkitems.progress(card.checklists);
    if (p.total > 0) {
      const badge = el("span", "badge" + (p.done === p.total ? " done" : ""));
      badge.innerHTML = `<i class="fa-regular fa-square-check"></i> ${p.done}/${p.total}`;
      wrap.appendChild(badge);
    }

    const actions = el("div", "card-actions");
    actions.appendChild(iconButton("icon-btn", "fa-solid fa-pen", "Rename card", () => this.promptRename(card)));
    actions.appendChild(iconButton("icon-btn danger", "fa-solid fa-box-archive", "Archive card", () => this.confirmArchive(card)));
    wrap.appendChild(actions);

    wrap.addEventListener("click", () => this.openDetail(card.id));
    wrap.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target === wrap) this.openDetail(card.id); });
    return wrap;
  },

  promptCreate(list) {
    Ui.prompt({ title: "Create card", label: `Card name (in "${list.name}")`, submitText: "Create card" }, async (name) => {
      const card = await Api.post("/cards", { idList: list.id, name, pos: "bottom" });
      card.checklists = [];
      Board.state.cards.push(card);
      Board.render();
      Ui.toast("Card created");
    });
  },

  promptRename(card) {
    Ui.prompt({ title: "Rename card", label: "Card name", value: card.name }, async (name) => {
      const updated = await Api.put(`/cards/${card.id}`, { name });
      card.name = updated.name;
      Board.render();
      Ui.toast("Card renamed");
    });
  },

  renameCurrent() {
    const card = Board.findCard(this.currentId);
    if (card) this.promptRename(card);
  },

  confirmArchive(card) {
    Ui.confirm(`Archive the card "${card.name}"?`, async () => {
      await Api.put(`/cards/${card.id}`, { closed: "true" });
      Board.state.cards = Board.state.cards.filter((c) => c.id !== card.id);
      if (this.currentId === card.id) Ui.close("cardModal");
      Board.render();
      Ui.toast("Card archived");
    });
  },

  async openDetail(cardId) {
    this.currentId = cardId;
    Ui.open("cardModal");
    this.refreshDetail();
    // Refresh checklists from the API so the modal always shows real data.
    try {
      await Checklists.load(cardId);
    } catch (err) {
      Ui.toast(err.message, "error");
    }
  },

  refreshDetail() {
    const card = Board.findCard(this.currentId);
    if (!card) return Ui.close("cardModal");
    $("#cardTitle").textContent = card.name;
    const list = Board.findList(card.idList);
    $("#cardListName").textContent = list ? `in list ${list.name}` : "";
    Checklists.render(card);
  },
};
