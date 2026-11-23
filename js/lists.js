// List operations: display, create, rename, delete (archive).
const Lists = {
  element(list) {
    const wrap = el("section", "list");
    const head = el("div", "list-head");
    head.appendChild(el("h3", "", list.name));
    head.appendChild(iconButton("icon-btn", "fa-solid fa-pen", "Rename list", () => this.promptRename(list)));
    head.appendChild(iconButton("icon-btn danger", "fa-solid fa-trash", "Delete list", () => this.confirmDelete(list)));
    wrap.appendChild(head);

    const cardsEl = el("div", "list-cards");
    Board.cardsOf(list.id).forEach((c) => cardsEl.appendChild(Cards.element(c)));
    wrap.appendChild(cardsEl);

    const add = el("button", "add-card-btn");
    add.type = "button";
    add.innerHTML = '<i class="fa-solid fa-plus"></i> Add a card';
    add.addEventListener("click", () => Cards.promptCreate(list));
    wrap.appendChild(add);
    return wrap;
  },

  addTile() {
    const tile = el("div", "add-list-tile");
    const b = el("button", "add-list-btn");
    b.type = "button";
    b.innerHTML = '<i class="fa-solid fa-plus"></i> Add another list';
    b.addEventListener("click", () => this.promptCreate());
    tile.appendChild(b);
    return tile;
  },

  promptCreate() {
    Ui.prompt({ title: "Create list", label: "List name", submitText: "Create list" }, async (name) => {
      const list = await Api.post("/lists", { name, idBoard: Board.state.id, pos: "bottom" });
      Board.state.lists.push(list);
      Board.render();
      Ui.toast("List created");
    });
  },

  promptRename(list) {
    Ui.prompt({ title: "Rename list", label: "List name", value: list.name }, async (name) => {
      const updated = await Api.put(`/lists/${list.id}`, { name });
      list.name = updated.name;
      Board.render();
      Ui.toast("List renamed");
    });
  },

  // Trello's REST API cannot permanently delete lists; archiving ("closed") is the official way to remove one.
  confirmDelete(list) {
    Ui.confirm(`Delete the list "${list.name}"? Its cards will be removed from the board (archived in Trello).`, async () => {
      await Api.put(`/lists/${list.id}/closed`, { value: "true" });
      Board.state.lists = Board.state.lists.filter((l) => l.id !== list.id);
      Board.state.cards = Board.state.cards.filter((c) => c.idList !== list.id);
      Board.render();
      Ui.toast("List deleted");
    });
  },
};
