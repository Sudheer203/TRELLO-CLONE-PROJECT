// Loads the board, holds shared state and renders lists + cards.
const Board = {
  state: { id: "", name: "", lists: [], cards: [] },
  async load(showToast = false) {
    const errorBox = $("#errorBox");
    errorBox.hidden = true;
    Ui.loading(true);
    try {
      Api.validateConfig();
      const id = CONFIG.BOARD_ID;
      const [board, lists, cards] = await Promise.all([
        Api.get(`/boards/${id}`, { fields: "name,id" }),
        Api.get(`/boards/${id}/lists/open`, { fields: "name,pos" }),
        Api.get(`/boards/${id}/cards/open`, {
          fields: "name,idList,pos",
          checklists: "all",
        }),
      ]);
      this.state.id = board.id;
      this.state.name = board.name;
      this.state.lists = lists.sort((a, b) => a.pos - b.pos);
      this.state.cards = cards.sort((a, b) => a.pos - b.pos);
      this.render();
      if (showToast) Ui.toast("Board refreshed");
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
      $("#boardTitle").textContent = "Board unavailable";
      $("#board").innerHTML = "";
      Ui.toast(err.message, "error");
    } finally {
      Ui.loading(false);
    }
  },

  cardsOf(listId) {
    return this.state.cards.filter((c) => c.idList === listId);
  },
  findCard(id) {
    return this.state.cards.find((c) => c.id === id);
  },
  findList(id) {
    return this.state.lists.find((l) => l.id === id);
  },

  render() {
    $("#boardTitle").textContent = this.state.name;
    const boardEl = $("#board");
    boardEl.innerHTML = "";
    this.state.lists.forEach((list) =>
      boardEl.appendChild(Lists.element(list)),
    );
    boardEl.appendChild(Lists.addTile());
    if (Cards.currentId) Cards.refreshDetail();
  },
};
