// Checkitem operations: display, create, edit, check/uncheck, delete.
const Checkitems = {
  progress(checklists) {
    let total = 0, done = 0;
    (checklists || []).forEach((cl) => (cl.checkItems || []).forEach((i) => {
      total++;
      if (i.state === "complete") done++;
    }));
    return { total, done };
  },

  element(card, cl, item) {
    const row = el("div", "checkitem");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = item.state === "complete";
    box.setAttribute("aria-label", item.name);
    box.addEventListener("change", () => this.toggle(card, item, box));
    row.appendChild(box);
    row.appendChild(el("span", "text" + (box.checked ? " done" : ""), item.name));
    row.appendChild(iconButton("icon-btn", "fa-solid fa-pen", "Edit item", () => this.promptEdit(card, item)));
    row.appendChild(iconButton("icon-btn danger", "fa-solid fa-trash", "Delete item", () => this.confirmDelete(cl, item)));
    return row;
  },

  async toggle(card, item, box) {
    if (box.disabled) return;
    box.disabled = true; // prevent double clicks while the request runs
    const state = box.checked ? "complete" : "incomplete";
    try {
      await Api.put(`/cards/${card.id}/checkItem/${item.id}`, { state });
      item.state = state;
      Board.render();
    } catch (err) {
      box.checked = !box.checked;
      box.disabled = false;
      Ui.toast(err.message, "error");
    }
  },

  promptCreate(cl) {
    Ui.prompt({ title: "Add item", label: "Item text", submitText: "Add item" }, async (name) => {
      const item = await Api.post(`/checklists/${cl.id}/checkItems`, { name });
      cl.checkItems.push(item);
      Board.render();
      Ui.toast("Item added");
    });
  },

  promptEdit(card, item) {
    Ui.prompt({ title: "Edit item", label: "Item text", value: item.name }, async (name) => {
      const updated = await Api.put(`/cards/${card.id}/checkItem/${item.id}`, { name });
      item.name = updated.name;
      Board.render();
      Ui.toast("Item updated");
    });
  },

  confirmDelete(cl, item) {
    Ui.confirm(`Delete the item "${item.name}"?`, async () => {
      await Api.delete(`/checklists/${cl.id}/checkItems/${item.id}`);
      cl.checkItems = cl.checkItems.filter((i) => i.id !== item.id);
      Board.render();
      Ui.toast("Item deleted");
    });
  },
};
