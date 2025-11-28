// js/entrada.js
// Registra entradas no Firestore, edita e exclui (com opção de reverter estoque)
// Requisitos: importar ./firebase.js que exporte `db`

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

// elementos
const formEntrada = document.getElementById("formEntrada");
const produtoSelect = document.querySelector('select[data-produto-select="true"]#produtoEntrada') || document.getElementById("produtoEntrada");
const quantidadeInput = document.getElementById("quantidadeEntrada");
const dataInput = document.getElementById("dataEntrada");
const origemInput = document.getElementById("origemEntrada");
const localInput = document.getElementById("localMaterial");
const tabelaEntradas = document.getElementById("listaEntradas");
const cancelarBtn = document.getElementById("cancelarEdicao");

const entradasCol = collection(db, "entradas");
const produtosColRef = collection(db, "produtos");

// --- Carregar produtos (fallback) ---
export async function carregarProdutosParaSelects() {
  const selects = document.querySelectorAll('select[data-produto-select="true"]');
  if (!selects || selects.length === 0) return;
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
    console.error("Erro carregar produtos:", err);
  }
}
// chama agora (página carrega)
carregarProdutosParaSelects();

// --- Helper form state ---
function resetFormState() {
  formEntrada.removeAttribute("data-editing-docid");
  formEntrada.querySelector('button[type="submit"]').textContent = 'Registrar Entrada';
  cancelarBtn.style.display = 'none';
  formEntrada.reset();
}

// --- Render row helper (keeps columns consistent) ---
function formatDisplayDate(iso) {
  if (!iso) return ""; // vazio se não preenchido
  try {
    return new Date(iso).toLocaleString();
  } catch { return ""; }
}

// --- Listener (real-time) para entradas ---
function iniciarListenerEntradas() {
  const q = query(entradasCol, orderBy("data", "desc"));
  onSnapshot(q, (snap) => {
    if (!tabelaEntradas) return;
    tabelaEntradas.innerHTML = "";
    snap.forEach(docSnap => {
      const id = docSnap.id;
      const d = docSnap.data();
      // build row: ID(produtoId) | produtoNome | qtd | data | origem | local | ações (editar/excluir)
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.produtoId ?? "-"}</td>
        <td>${d.produtoNome ?? "-"}</td>
        <td>${d.quantidade ?? "-"}</td>
        <td>${formatDisplayDate(d.data)}</td>
        <td>${d.origem ?? ""}</td>
        <td>${d.localMaterial ?? ""}</td>
        <td>
          <button class="btn-editar" data-id="${id}" title="Editar">✏️</button>
          <button class="btn-excluir" data-id="${id}" title="Excluir">🗑️</button>
        </td>
      `;
      tabelaEntradas.appendChild(tr);
    });

    // eventos delegados para editar/excluir
    tabelaEntradas.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.onclick = async () => {
        const docId = btn.dataset.id;
        if (!confirm("Excluir este registro de entrada? Deseja também reverter a quantidade no estoque?")) return;
        // perguntar se reverter
        const reverter = confirm("Reverter quantidade no estoque?");
        try {
          if (reverter) {
            // obter doc antes de deletar
            const snap = await getDoc(doc(db, "entradas", docId));
            if (snap.exists()) {
              const ed = snap.data();
              // ajustar produto
              const pRef = doc(db, "produtos", ed.produtoId);
              const pSnap = await getDoc(pRef);
              if (pSnap.exists()) {
                const atual = Number(pSnap.data().quantidade || 0);
                const novo = atual - Number(ed.quantidade || 0);
                await updateDoc(pRef, { quantidade: novo < 0 ? 0 : novo });
              }
            }
          }
          await deleteDoc(doc(db, "entradas", docId));
          alert("Registro excluído.");
        } catch (err) {
          console.error("Erro excluir entrada:", err);
          alert("Erro ao excluir (veja console).");
        }
      };
    });

    tabelaEntradas.querySelectorAll('.btn-editar').forEach(btn => {
      btn.onclick = async () => {
        const docId = btn.dataset.id;
        try {
          const snap = await getDoc(doc(db, "entradas", docId));
          if (!snap.exists()) return alert("Registro não encontrado.");
          const d = snap.data();
          // carregar no form
          produtoSelect.value = d.produtoId || "";
          quantidadeInput.value = d.quantidade || "";
          // se data estiver vazia (null/""/undefined) mantemos vazio
          dataInput.value = d.data ? new Date(d.data).toISOString().slice(0,10) : "";
          origemInput.value = d.origem || "";
          localInput.value = d.localMaterial || "";
          // marcar estado de edição
          formEntrada.setAttribute("data-editing-docid", docId);
          formEntrada.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
          cancelarBtn.style.display = 'inline';
          // scroll to form
          formEntrada.scrollIntoView({ behavior: "smooth" });
        } catch (err) {
          console.error("Erro ao carregar para edição:", err);
        }
      };
    });

  }, err => console.error("Erro listener entradas:", err));
}

// chama listener se tabela existir
if (tabelaEntradas) iniciarListenerEntradas();

// --- Registrar / Editar entrada ---
async function registrarEntrada(e) {
  if (e) e.preventDefault();
  const produtoDocId = produtoSelect?.value;
  const qtd = Number(quantidadeInput?.value || 0);

  // Se o usuário não informar a data, salvar string vazia
  const dataVal = dataInput?.value
      ? new Date(dataInput.value).toISOString()
      : "";

  const origem = origemInput?.value?.trim() || "";
  const localMaterial = localInput?.value?.trim() || "";


  if (!produtoDocId || !qtd || qtd <= 0) return alert("Selecione produto e informe quantidade válida.");

  try {
    const pRef = doc(db, "produtos", produtoDocId);
    const pSnap = await getDoc(pRef);
    if (!pSnap.exists()) return alert("Produto não encontrado.");
    const pData = pSnap.data();
    const atual = Number(pData.quantidade || 0);

    const editDocId = formEntrada.getAttribute("data-editing-docid") || null;

    if (editDocId) {
      // edição: precisamos ajustar estoque pela diferença
      const entradaSnap = await getDoc(doc(db, "entradas", editDocId));
      if (!entradaSnap.exists()) return alert("Registro original não encontrado.");
      const old = entradaSnap.data();
      const oldQtd = Number(old.quantidade || 0);
      const diff = qtd - oldQtd; // se positivo, aumentar estoque; se negativo, reduzir
      // atualizar entrada
      await updateDoc(doc(db, "entradas", editDocId), {
        produtoId: produtoDocId,
        produtoNome: pData.nome,
        quantidade: qtd,
        data: dataVal,
        origem,
        localMaterial
      });
      // ajustar produto
      await updateDoc(pRef, { quantidade: Math.max(0, atual + diff) });

      alert("Entrada atualizada com sucesso!");
      resetFormState();
    } else {
      // criar nova entrada
      await addDoc(entradasCol, {
        produtoId: produtoDocId,
        produtoNome: pData.nome,
        quantidade: qtd,
        data: dataVal,
        origem,
        localMaterial
      });
      // aumenta estoque
      await updateDoc(pRef, { quantidade: atual + qtd });

      alert("Entrada registrada com sucesso!");
      formEntrada.reset();
    }

    // atualizar selects (caso) e tabela — listeners farão isso
    try { carregarProdutosParaSelects(); } catch {}
  } catch (err) {
    console.error("Erro registrar/editar entrada:", err);
    alert("Erro ao processar entrada (veja console).");
  }
}

// cancelar edição
cancelarBtn?.addEventListener('click', () => resetFormState());

// hook do form
if (formEntrada) formEntrada.addEventListener("submit", registrarEntrada);

