// js/saida.js
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const formSaida = document.getElementById("formSaida");
const produtoSelectSaida = document.querySelector('select[data-produto-select="true"]#produtoSaida') || document.getElementById("produtoSaida");
const quantidadeSaidaInput = document.getElementById("quantidadeSaida");
const dataSaidaInput = document.getElementById("dataSaida");
const destinoInput = document.getElementById("destinoSaida");
const tabelaSaidas = document.getElementById("listaSaidas");
const cancelarEdicaoSaida = document.getElementById("cancelarEdicaoSaida");

const saidasCol = collection(db, "saidas");
const produtosColRef = collection(db, "produtos");

// carregar produtos para selects (fallback)
export async function carregarProdutosParaSelectsSaida() {
  const selects = document.querySelectorAll('select[data-produto-select="true"]');
  if (!selects) return;
  try {
    const snap = await getDocs(produtosColRef);
    selects.forEach(sel => sel.innerHTML = `<option value="">-- Selecione o Produto --</option>`);
    snap.forEach(docSnap => {
      const d = docSnap.data();
      selects.forEach(sel => {
        const opt = document.createElement("option");
        opt.value = docSnap.id;
        opt.textContent = `${d.nome} (ID:${d.id ?? "-"})`;
        sel.appendChild(opt);
      });
    });
  } catch (err) {
    console.error("Erro carregar produtos (saida):", err);
  }
}
carregarProdutosParaSelectsSaida();

// helper format date
function formatDisplayDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleString(); } catch { return ""; }
}

// listener saídas
function iniciarListenerSaidas() {
  if (!tabelaSaidas) return;
  const q = query(saidasCol, orderBy("data", "desc"));
  onSnapshot(q, (snap) => {
    tabelaSaidas.innerHTML = "";
    snap.forEach(docSnap => {
      const id = docSnap.id;
      const d = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.produtoId ?? "-"}</td>
        <td>${d.produtoNome ?? "-"}</td>
        <td>${d.quantidade ?? "-"}</td>
        <td>${formatDisplayDate(d.data)}</td>
        <td>${d.destino ?? ""}</td>
        <td>
          <button class="btn-editar" data-id="${id}" title="Editar">✏️</button>
          <button class="btn-excluir" data-id="${id}" title="Excluir">🗑️</button>
        </td>
      `;
      tabelaSaidas.appendChild(tr);
    });

    tabelaSaidas.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.onclick = async () => {
        const docId = btn.dataset.id;
        if (!confirm("Excluir este registro de saída? Deseja também reverter a quantidade no estoque?")) return;
        const reverter = confirm("Reverter quantidade no estoque?");
        try {
          if (reverter) {
            const snap = await getDoc(doc(db, "saidas", docId));
            if (snap.exists()) {
              const sd = snap.data();
              const pRef = doc(db, "produtos", sd.produtoId);
              const pSnap = await getDoc(pRef);
              if (pSnap.exists()) {
                const atual = Number(pSnap.data().quantidade || 0);
                await updateDoc(pRef, { quantidade: atual + Number(sd.quantidade || 0) });
              }
            }
          }
          await deleteDoc(doc(db, "saidas", docId));
          alert("Registro excluído.");
        } catch (err) {
          console.error("Erro excluir saida:", err);
          alert("Erro ao excluir (veja console).");
        }
      };
    });

    tabelaSaidas.querySelectorAll('.btn-editar').forEach(btn => {
      btn.onclick = async () => {
        const docId = btn.dataset.id;
        try {
          const snap = await getDoc(doc(db, "saidas", docId));
          if (!snap.exists()) return alert("Registro não encontrado.");
          const d = snap.data();
          if (produtoSelectSaida) produtoSelectSaida.value = d.produtoId || "";
          if (quantidadeSaidaInput) quantidadeSaidaInput.value = d.quantidade || "";
          if (dataSaidaInput) dataSaidaInput.value = d.data ? new Date(d.data).toISOString().slice(0,10) : "";
          if (destinoInput) destinoInput.value = d.destino || "";
          if (formSaida) {
            formSaida.setAttribute("data-editing-docid", docId);
            const btnSubmit = document.querySelector('#formSaida button[type="submit"]');
            if (btnSubmit) btnSubmit.textContent = 'Salvar Alterações';
          }
          if (cancelarEdicaoSaida) cancelarEdicaoSaida.style.display = 'inline';
          formSaida?.scrollIntoView({ behavior: "smooth" });
        } catch (err) { console.error(err); }
      };
    });

  }, err => console.error("Erro listener saidas:", err));
}
if (tabelaSaidas) iniciarListenerSaidas();

// registrar / editar saida
async function registrarSaida(e) {
  if (e) e.preventDefault();
  const produtoDocId = produtoSelectSaida?.value;
  const qtd = Number(quantidadeSaidaInput?.value || 0);
  const dataVal = dataSaidaInput?.value ? new Date(dataSaidaInput.value).toISOString() : null;
  const destino = destinoInput?.value?.trim() || "";

  if (!produtoDocId || !qtd || qtd <= 0) return alert("Selecione produto e informe quantidade válida.");

  try {
    const pRef = doc(db, "produtos", produtoDocId);
    const pSnap = await getDoc(pRef);
    if (!pSnap.exists()) return alert("Produto não encontrado.");
    const atual = Number(pSnap.data().quantidade || 0);

    const editDocId = formSaida?.getAttribute("data-editing-docid") || null;

    if (editDocId) {
      const oldSnap = await getDoc(doc(db, "saidas", editDocId));
      if (!oldSnap.exists()) return alert("Registro original não encontrado.");
      const old = oldSnap.data();
      const oldQtd = Number(old.quantidade || 0);
      const diff = qtd - oldQtd;
      await updateDoc(doc(db, "saidas", editDocId), {
        produtoId: produtoDocId,
        produtoNome: pSnap.data().nome,
        quantidade: qtd,
        data: dataVal,
        destino
      });
      const novo = atual - diff;
      await updateDoc(pRef, { quantidade: Math.max(0, novo) });
      alert("Saída atualizada com sucesso!");
      formSaida.removeAttribute("data-editing-docid");
      const btnSubmit = document.querySelector('#formSaida button[type="submit"]');
      if (btnSubmit) btnSubmit.textContent = 'Registrar Saída';
      if (cancelarEdicaoSaida) cancelarEdicaoSaida.style.display = 'none';
    } else {
      if (qtd > atual) return alert("Estoque insuficiente.");
      await addDoc(saidasCol, {
        produtoId: produtoDocId,
        produtoNome: pSnap.data().nome,
        quantidade: qtd,
        data: dataVal,
        destino
      });
      await updateDoc(pRef, { quantidade: atual - qtd });
      alert("Saída registrada com sucesso!");
      formSaida?.reset();
    }
    try { carregarProdutosParaSelectsSaida(); } catch {}
  } catch (err) {
    console.error("Erro registrar/editar saída:", err);
    alert("Erro ao processar saída (veja console).");
  }
}

// cancelar edição
cancelarEdicaoSaida?.addEventListener('click', () => {
  if (!formSaida) return;
  formSaida.removeAttribute("data-editing-docid");
  const btnSubmit = document.querySelector('#formSaida button[type="submit"]');
  if (btnSubmit) btnSubmit.textContent = 'Registrar Saída';
  if (cancelarEdicaoSaida) cancel
  arEdicaoSaida.style.display = 'none';
  formSaida.reset();
});

// hooks
if (formSaida) formSaida.addEventListener("submit", registrarSaida);
