const data = [
  ["📰", "Jornal", "papel"],
  ["📦", "Caixa de papelão", "papel"],
  ["🥤", "Garrafa PET", "plastico"],
  ["🛍️", "Sacola plástica", "plastico"],
  ["🍾", "Garrafa de vidro", "vidro"],
  ["🫙", "Pote de vidro", "vidro"],
  ["🥫", "Lata de refrigerante", "metal"],
  ["🥄", "Colher de metal", "metal"]
];

const itemsEl = document.querySelector("#items");
const scoreEl = document.querySelector("#score");
const progressEl = document.querySelector("#progress");
const messageEl = document.querySelector("#message");
const bins = document.querySelectorAll(".bin");
let score = 0, correct = 0, dragged = null;

function render() {
  itemsEl.innerHTML = "";
  data.forEach(([emoji, name, type], i) => {
    const el = document.createElement("div");
    el.className = "item";
    el.draggable = true;
    el.dataset.type = type;
    el.dataset.index = i;
    el.innerHTML = `<span class="emoji">${emoji}</span><b>${name}</b>`;

    el.addEventListener("dragstart", () => {
      dragged = el;
      el.classList.add("dragging");
    });
    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      dragged = null;
    });

    // Touch / pointer: funciona em celular, tablet e computador.
    el.addEventListener("pointerdown", startPointer);
    itemsEl.appendChild(el);
  });
}

function startPointer(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  dragged = e.currentTarget;
  dragged.classList.add("dragging");
  dragged.setPointerCapture(e.pointerId);

  const move = ev => {
    if (!dragged) return;
    const target = document.elementFromPoint(ev.clientX, ev.clientY);
    bins.forEach(b => b.classList.toggle("over", b.contains(target)));
  };

  const end = ev => {
    if (!dragged) return;
    const item = dragged;
    const target = document.elementFromPoint(ev.clientX, ev.clientY);
    const bin = target?.closest(".bin");
    bins.forEach(b => b.classList.remove("over"));
    if (bin) checkAnswer(bin);
    item.classList.remove("dragging");
    item.releasePointerCapture?.(e.pointerId);
    dragged = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end, { once: true });
}

document.addEventListener("dragover", e => {
  const bin = e.target.closest?.(".bin");
  if (bin) {
    e.preventDefault();
    bin.classList.add("over");
  }
});

document.addEventListener("dragleave", e => {
  const bin = e.target.closest?.(".bin");
  if (bin && !bin.contains(e.relatedTarget)) bin.classList.remove("over");
});

document.addEventListener("drop", e => {
  const bin = e.target.closest?.(".bin");
  if (bin) {
    e.preventDefault();
    checkAnswer(bin);
    bins.forEach(b => b.classList.remove("over"));
  }
});

function checkAnswer(bin) {
  if (!dragged || dragged.classList.contains("correct")) return;

  if (dragged.dataset.type === bin.dataset.type) {
    score += 100;
    correct++;
    dragged.classList.add("correct");
    dragged.draggable = false;
    dragged.removeEventListener("pointerdown", startPointer);
    dragged = null;

    scoreEl.textContent = score;
    progressEl.textContent = `${correct}/8`;
    messageEl.textContent = "✅ Correto! Você ajudou o meio ambiente. +100 pontos";

    if (correct === data.length) {
      messageEl.textContent = `🌎 Parabéns! Você separou tudo corretamente e fez ${score} pontos!`;
    }
  } else {
    dragged.classList.add("wrong");
    messageEl.textContent = "❌ Ops! Essa não é a categoria correta. Tente novamente.";
    setTimeout(() => dragged?.classList.remove("wrong"), 350);
  }
}

document.querySelector("#restart").addEventListener("click", () => {
  score = 0; correct = 0; dragged = null;
  scoreEl.textContent = "0";
  progressEl.textContent = "0/8";
  messageEl.textContent = "💡 Dica: toque ou clique em um resíduo e arraste até a categoria correta.";
  render();
});

render();
