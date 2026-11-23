// Shared helpers (DOM + UI) and application start-up.
const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function iconButton(cls, iconCls, title, onClick) {
  const b = el("button", cls);
  b.type = "button";
  b.title = title;
  b.setAttribute("aria-label", title);
  b.innerHTML = `<i class="${iconCls}"></i>`;
  b.addEventListener("click", (e) => { e.stopPropagation(); onClick(e); });
  return b;
}

const Ui = {
  toast(message, type = "success") {
    const t = el("div", `toast ${type}`, message);
    $("#toasts").appendChild(t);
    setTimeout(() => t.remove(), 3500);
  },
  loading(on) { $("#loader").hidden = !on; },
  open(id) { $("#" + id).hidden = false; },
  close(id) {
    $("#" + id).hidden = true;
    if (id === "cardModal") Cards.currentId = null;
  },

  // Generic input modal. `handler(value)` is async; the modal closes only if it succeeds.
  prompt({ title, label, value = "", submitText = "Save" }, handler) {
    $("#promptTitle").textContent = title;
    $("#promptLabel").textContent = label;
    $("#promptSubmit").textContent = submitText;
    $("#promptError").textContent = "";
    const input = $("#promptInput");
    input.value = value;
    this.open("promptModal");
    input.focus();
    input.select();
    $("#promptForm").onsubmit = async (e) => {
      e.preventDefault();
      const submit = $("#promptSubmit");
      if (submit.disabled) return; // prevent duplicate submissions
      const v = input.value.trim();
      if (!v) { $("#promptError").textContent = "This field cannot be empty."; return; }
      submit.disabled = true;
      try {
        await handler(v);
        this.close("promptModal");
      } catch (err) {
        $("#promptError").textContent = err.message;
      } finally {
        submit.disabled = false;
      }
    };
  },

  confirm(message, handler) {
    $("#confirmText").textContent = message;
    this.open("confirmModal");
    const ok = $("#confirmOk");
    ok.onclick = async () => {
      if (ok.disabled) return;
      ok.disabled = true;
      try {
        await handler();
        this.close("confirmModal");
      } catch (err) {
        this.close("confirmModal");
        this.toast(err.message, "error");
      } finally {
        ok.disabled = false;
      }
    };
  },
};

const App = {
  init() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("mousedown", (e) => { if (e.target === modal) Ui.close(modal.id); });
      modal.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => Ui.close(modal.id)));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const order = ["confirmModal", "promptModal", "cardModal"];
      const top = order.find((id) => !$("#" + id).hidden);
      if (top) Ui.close(top);
    });
    $("#refreshBtn").addEventListener("click", () => Board.load(true));
    $("#renameCardBtn").addEventListener("click", () => Cards.renameCurrent());
    $("#addChecklistBtn").addEventListener("click", () => Checklists.promptCreate());
    Board.load();
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
