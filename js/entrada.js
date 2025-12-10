// ===============================
// entrada.js — Controle de Entradas (Firebase)
// ===============================

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

// ===============================
// ELEMENTOS
// ===============================

const formEntrada = document.getElementById("formEntrada");
const produtoSelect = document.querySelector("#produtoEntrada[data-produto-select='true']");
const quantidadeInput = document.getElementById("quantidadeEntrada");
const dataInput = document.getElementById("dataEntrada");
const origemInput = document.getElementById("origemEntrada");
const localInput = document.getElementById("localMaterial");
const tabelaEntradas = document.getElementById("listaEntradas");
const cancelarBtn = document.getElementById("cancelarEdicao");

const entradasCol = collection(db, "entradas");
const produtosColRef = collection(db, "produtos");

// ===============================
// CARREGAR PRODUTOS NO SELECT
// ===============================

export async function carregarProdutosParaSelects() {
  const selects = document.querySelectorAll("select[data-produto-select='true']");
  if (!selects || selects.length === 0) {
    console.warn("⚠ Nenhum select com data-produto-select encontrado.");
    return;
  }

  try {
    const snap = await getDocs(produtosColRef);

    // limpar selects
    selects.forEach(sel => {
      sel.innerHTML = `<option value="">-- Selecione o Produto --</option>`;
    });

    // preencher com produtos
    snap.forEach(docSnap => {
      const d = docSnap.data();

      selects.forEach(sel => {
        const opt = document.createElement("option");
        opt.value = docSnap.id;
        opt.textContent = `${d.nome}`;
        sel.appendChild(opt);
      });
    });

  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

// carregar imediatamente ao abrir a página
carregarProdutosParaSelects();

// ===============================
// RESETAR FORMULÁRIO
// ===============================

function resetFormState() {
  if (!formEntrada) return;

  formEntrada.removeAttribute("data-editing-docid");

  const btn = formEntrada.querySelector('button[type="submit"]');
  if (btn) btn.textContent = "Registrar Entrada";

  if (cancelarBtn) cancelarBtn.style.display = "none";

  formEntrada.reset();
}

// ===============================
// FORMATAR DATA PARA EXIBIÇÃO
// ===============================

function formatDisplayDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch {
    return "";
  }
}

// ===============================
// LISTENER EM TEMPO REAL — ENTRADAS
// ===============================

function iniciarListenerEntradas() {
  if (!tabelaEntradas) return;

  const q = query(entradasCol, orderBy("data", "desc"));

  onSnapshot(
    q,
    (snap) => {
      tabelaEntradas.innerHTML = "";

      snap.forEach((docSnap) => {
        const id = docSnap.id;
        const d = docSnap.data();

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${id}</td>
          <td>${d.produtoNome ?? "-"}</td>
          <td>${d.quantidade ?? "-"}</td>
          <td>${formatDisplayDate(d.data)}</td>
          <td>${d.origem ?? ""}</td>
          <td>${d.localMaterial ?? ""}</td>
          <td>
            <button class="btn-editar" data-id="${id}">✏️</button>
            <button class="btn-excluir" data-id="${id}">🗑️</button>
          </td>
        `;

        tabelaEntradas.appendChild(tr);
      });

      configurarBotoes();
    },
    (err) => console.error("Erro listener entradas:", err)
  );
}

function configurarBotoes() {
  // excluir
  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.onclick = async () => {
      const docId = btn.dataset.id;
      if (!confirm("Excluir esta entrada?")) return;

      try {
        const snap = await getDoc(doc(db, "entradas", docId));
        if (snap.exists()) {
          const d = snap.data();

          // reverter estoque
          const pRef = doc(db, "produtos", d.produtoId);
          const pSnap = await getDoc(pRef);

          if (pSnap.exists()) {
            const atual = Number(pSnap.data().quantidade || 0);
            const novo = Math.max(0, atual - Number(d.quantidade || 0));
            await updateDoc(pRef, { quantidade: novo });
          }
        }

        await deleteDoc(doc(db, "entradas", docId));
        alert("Entrada excluída.");

      } catch (err) {
        console.error("Erro excluir:", err);
      }
    };
  });

  // editar
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.onclick = async () => {
      const docId = btn.dataset.id;

      try {
        const snap = await getDoc(doc(db, "entradas", docId));
        if (!snap.exists()) return alert("Registro não existe.");

        const d = snap.data();

        produtoSelect.value = d.produtoId || "";
        quantidadeInput.value = d.quantidade || "";

        dataInput.value = d.data
          ? new Date(d.data).toISOString().slice(0, 10)
          : "";

        origemInput.value = d.origem || "";
        localInput.value = d.localMaterial || "";

        formEntrada.setAttribute("data-editing-docid", docId);
        formEntrada.querySelector('button[type="submit"]').textContent =
          "Salvar Alterações";
        cancelarBtn.style.display = "inline";

        formEntrada.scrollIntoView({ behavior: "smooth" });

      } catch (err) {
        console.error("Erro ao editar:", err);
      }
    };
  });
}

if (tabelaEntradas) iniciarListenerEntradas();

// ===============================
// REGISTRAR OU EDITAR ENTRADA
// ===============================

async function registrarEntrada(e) {
  if (e) e.preventDefault();

  const produtoDocId = produtoSelect?.value;
  const qtd = Number(quantidadeInput?.value || 0);

  const dataVal =
    dataInput?.value ? new Date(dataInput.value).toISOString() : "";

  const origem = origemInput?.value?.trim() || "";
  const localMaterial = localInput?.value?.trim() || "";

  if (!produtoDocId || !qtd || qtd <= 0)
    return alert("Selecione um produto e informe a quantidade.");

  try {
    const pRef = doc(db, "produtos", produtoDocId);
    const pSnap = await getDoc(pRef);

    if (!pSnap.exists()) return alert("Produto não encontrado.");

    const pData = pSnap.data();
    const atual = Number(pData.quantidade || 0);

    const editDocId = formEntrada.getAttribute("data-editing-docid");

    if (editDocId) {
      // edição
      const entradaSnap = await getDoc(doc(db, "entradas", editDocId));
      if (!entradaSnap.exists()) return alert("Entrada não existe.");

      const old = entradaSnap.data();
      const oldQtd = Number(old.quantidade || 0);
      const diff = qtd - oldQtd;

      await updateDoc(doc(db, "entradas", editDocId), {
        produtoId: produtoDocId,
        produtoNome: pData.nome,
        quantidade: qtd,
        data: dataVal,
        origem,
        localMaterial
      });

      await updateDoc(pRef, { quantidade: Math.max(0, atual + diff) });

      alert("Entrada atualizada!");
      resetFormState();
    } else {
      // nova entrada
      await addDoc(entradasCol, {
        produtoId: produtoDocId,
        produtoNome: pData.nome,
        quantidade: qtd,
        data: dataVal,
        origem,
        localMaterial
      });

      await updateDoc(pRef, { quantidade: atual + qtd });

      alert("Entrada registrada!");
      formEntrada.reset();
    }

    carregarProdutosParaSelects();

  } catch (err) {
    console.error("Erro registrar entrada:", err);
    alert("Erro ao registrar entrada.");
  }
}

// ===============================
// CANCELAR EDIÇÃO
// ===============================

cancelarBtn?.addEventListener("click", resetFormState);

// ===============================
// SUBMIT DO FORM
// ===============================

formEntrada?.addEventListener("submit", registrarEntrada);

// ===============================
// SUBMIT DO FORM
// ===============================

formEntrada?.addEventListener("submit", registrarEntrada);

// ===============================
// PESQUISA NA TABELA DE ENTRADAS
// ===============================

const campoPesquisa = document.getElementById("pesquisaEntrada");

if (campoPesquisa) {
  campoPesquisa.addEventListener("input", () => {
    const termo = campoPesquisa.value.toLowerCase();
    const linhas = tabelaEntradas.querySelectorAll("tr");

    linhas.forEach(linha => {
      const textoLinha = linha.textContent.toLowerCase();
      linha.style.display = textoLinha.includes(termo) ? "" : "none";
    });
  });
}



