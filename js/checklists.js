// Checklist operations: display, create, rename, delete.
const Checklists = {
  async load(cardId) {
    const card = Board.findCard(cardId);
    if (!card) return;
    card.checklists = await Api.get(`/cards/${cardId}/checklists`);
    Board.render();
  },

  render(card) {
    const area = $("#checklistArea");
    area.innerHTML = "";
    const lists = card.checklists || [];
    if (!lists.length) {
      area.appendChild(el("p", "muted", "No checklists yet. Add one to start tracking tasks."));
      return;
    }
    lists.forEach((cl) => area.appendChild(this.element(card, cl)));
  },

  element(card, cl) {
    cl.checkItems = (cl.checkItems || []).slice().sort((a, b) => a.pos - b.pos);
    const wrap = el("div", "checklist");
    const head = el("div", "checklist-head");
    head.appendChild(el("h4", "", cl.name));
    head.appendChild(iconButton("icon-btn", "fa-solid fa-pen", "Rename checklist", () => this.promptRename(cl)));
    head.appendChild(iconButton("icon-btn danger", "fa-solid fa-trash", "Delete checklist", () => this.confirmDelete(card, cl)));
    wrap.appendChild(head);

    const p = Checkitems.progress([cl]);
    const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
    const row = el("div", "progress-row");
    row.appendChild(el("span", "", pct + "%"));
    const bar = el("div", "progress");
    const fill = el("span", pct === 100 ? "full" : "");
    fill.style.width = pct + "%";
    bar.appendChild(fill);
    row.appendChild(bar);
    row.appendChild(el("span", "", `${p.done} done, ${p.total - p.done} pending`));
    wrap.appendChild(row);

    cl.checkItems.forEach((item) => wrap.appendChild(Checkitems.element(card, cl, item)));

    const add = el("button", "btn btn-ghost btn-sm add-item-btn");
    add.type = "button";
    add.innerHTML = '<i class="fa-solid fa-plus"></i> Add an item';
    add.addEventListener("click", () => Checkitems.promptCreate(cl));
    wrap.appendChild(add);
    return wrap;
  },

  promptCreate() {
    const card = Board.findCard(Cards.currentId);
    if (!card) return;
    Ui.prompt({ title: "Add checklist", label: "Checklist name", submitText: "Add checklist" }, async (name) => {
      const cl = await Api.post("/checklists", { idCard: card.id, name });
      cl.checkItems = cl.checkItems || [];
      card.checklists = (card.checklists || []).concat(cl);
      Board.render();
      Ui.toast("Checklist created");
    });
  },

  promptRename(cl) {
    Ui.prompt({ title: "Rename checklist", label: "Checklist name", value: cl.name }, async (name) => {
      const updated = await Api.put(`/checklists/${cl.id}`, { name });
      cl.name = updated.name;
      Board.render();
      Ui.toast("Checklist renamed");
    });
  },

  confirmDelete(card, cl) {
    Ui.confirm(`Delete the checklist "${cl.name}" and all its items?`, async () => {
      await Api.delete(`/checklists/${cl.id}`);
      card.checklists = card.checklists.filter((c) => c.id !== cl.id);
      Board.render();
      Ui.toast("Checklist deleted");
    });
  },
};
