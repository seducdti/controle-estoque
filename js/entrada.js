// js/entrada.js
// Registra entradas no Firestore e atualiza quantidade do produto

import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// CARREGAR PRODUTOS PARA OS SELECTS
import { getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function carregarProdutos() {
  const selects = document.querySelectorAll('select[data-produto-select="true"]');

  const snap = await getDocs(collection(db, "produtos"));

  selects.forEach(sel => {
    sel.innerHTML = `<option value="">-- Selecione o Produto --</option>`;
  });

  snap.forEach(docSnap => {
    const d = docSnap.data();
    selects.forEach(sel => {
      const opt = document.createElement("option");
      opt.value = docSnap.id;
      opt.textContent = d.nome + ` (ID:${d.id})`;
      sel.appendChild(opt);
    });
  });
}

// carregar produtos ao abrir a página
carregarProdutos();


const formEntrada = document.getElementById("formEntrada");
const produtoSelect = document.querySelector('select[data-produto-select="true"]#produtoEntrada') || document.getElementById("produtoEntrada");
const quantidadeInput = document.getElementById("quantidadeEntrada");
const dataInput = document.getElementById("dataEntrada");
const origemInput = document.getElementById("origemEntrada");
const localInput = document.getElementById("localMaterial");
const tabelaEntradas = document.getElementById("listaEntradas");

const entradasCol = collection(db, "entradas");
const produtosCol = collection(db, "produtos");

// Carrega histórico em tempo real (opcional, útil na tabela)
function iniciarListenerEntradas() {
  const q = query(entradasCol, orderBy("data", "desc"));
  onSnapshot(q, (snap) => {
    if (!tabelaEntradas) return;
    tabelaEntradas.innerHTML = "";
    snap.forEach(docSnap => {
      const d = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.produtoNome || "-"}</td>
        <td>${d.quantidade}</td>
        <td>${d.data ? (new Date(d.data)).toLocaleString() : "-"}</td>
        <td>${d.origem || "-"}</td>
        <td>${d.localMaterial || "-"}</td>
        <td>
          <button onclick="excluirEntradaFirestore('${docSnap.id}')">🗑️</button>
        </td>
      `;
      tabelaEntradas.appendChild(tr);
    });
  }, err => console.error("Erro listener entradas:", err));
}

// Registrar entrada: cria doc em entradas e atualiza quantidade do produto
async function registrarEntrada(e) {
  if (e) e.preventDefault();
  const produtoDocId = produtoSelect?.value;
  const qtd = Number(quantidadeInput?.value || 0);
  const dataVal = dataInput?.value ? new Date(dataInput.value).toISOString() : new Date().toISOString();
  const origem = origemInput?.value?.trim() || "";
  const localMaterial = localInput?.value?.trim() || "";

  if (!produtoDocId || !qtd || qtd <= 0) return alert("Selecione produto e informe quantidade válida.");

  try {
    // pega produto atual
    const pRef = doc(db, "produtos", produtoDocId);
    const pSnap = await getDoc(pRef);
    if (!pSnap.exists()) return alert("Produto não encontrado.");

    const pData = pSnap.data();
    const atual = Number(pData.quantidade || 0);

    // cria entrada
    await addDoc(entradasCol, {
      produtoId: produtoDocId,
      produtoNome: pData.nome,
      quantidade: qtd,
      data: dataVal,
      origem,
      localMaterial
    });

    // atualiza quantidade do produto
    await updateDoc(pRef, { quantidade: atual + qtd });

    formEntrada.reset();
    alert("Entrada registrada com sucesso!");
  } catch (err) {
    console.error("Erro registrar entrada:", err);
    alert("Erro ao registrar entrada (veja console).");
  }
}

// Excluir entrada (opcional): só para histórico — NÃO reverte estoque automático aqui
async function excluirEntradaFirestore(docId) {
  if (!confirm("Excluir este registro de entrada? (não reverte estoque automaticamente)")) return;
  try {
    await deleteDoc(doc(db, "entradas", docId));
    alert("Entrada excluída.");
  } catch (err) {
    console.error("Erro excluir entrada:", err);
    alert("Erro ao excluir (veja console).");
  }
}

// Expor função global
window.excluirEntradaFirestore = excluirEntradaFirestore;

// Hook do form
if (formEntrada) formEntrada.addEventListener("submit", registrarEntrada);

// Start listener se existir tabela
if (tabelaEntradas) iniciarListenerEntradas();

