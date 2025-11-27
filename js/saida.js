// js/saida.js
// Registra saídas no Firestore e atualiza quantidade do produto

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
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const formSaida = document.getElementById("formSaida");
const produtoSelectSaida = document.querySelector('select[data-produto-select="true"]#produtoSaida') || document.getElementById("produtoSaida");
const quantidadeSaidaInput = document.getElementById("quantidadeSaida");
const dataSaidaInput = document.getElementById("dataSaida");
const destinoInput = document.getElementById("destinoSaida");
const tabelaSaidas = document.getElementById("listaSaidas");

const saidasCol = collection(db, "saidas");

// Listener histórico saídas
function iniciarListenerSaidas() {
  const q = query(saidasCol, orderBy("data", "desc"));
  onSnapshot(q, (snap) => {
    if (!tabelaSaidas) return;
    tabelaSaidas.innerHTML = "";
    snap.forEach(docSnap => {
      const d = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.produtoNome || "-"}</td>
        <td>${d.quantidade}</td>
        <td>${d.data ? (new Date(d.data)).toLocaleString() : "-"}</td>
        <td>${d.destino || "-"}</td>
        <td>
          <button onclick="excluirSaidaFirestore('${docSnap.id}')">🗑️</button>
        </td>
      `;
      tabelaSaidas.appendChild(tr);
    });
  }, err => console.error("Erro listener saidas:", err));
}

// Registrar saída
async function registrarSaida(e) {
  if (e) e.preventDefault();
  const produtoDocId = produtoSelectSaida?.value;
  const qtd = Number(quantidadeSaidaInput?.value || 0);
  const dataVal = dataSaidaInput?.value ? new Date(dataSaidaInput.value).toISOString() : new Date().toISOString();
  const destino = destinoInput?.value?.trim() || "";

  if (!produtoDocId || !qtd || qtd <= 0) return alert("Selecione produto e informe quantidade válida.");

  try {
    const pRef = doc(db, "produtos", produtoDocId);
    const pSnap = await getDoc(pRef);
    if (!pSnap.exists()) return alert("Produto não encontrado.");

    const atual = Number(pSnap.data().quantidade || 0);
    if (qtd > atual) return alert("Estoque insuficiente.");

    // cria saída
    await addDoc(saidasCol, {
      produtoId: produtoDocId,
      produtoNome: pSnap.data().nome,
      quantidade: qtd,
      data: dataVal,
      destino
    });

    // atualiza estoque
    await updateDoc(pRef, { quantidade: atual - qtd });

    formSaida.reset();
    alert("Saída registrada com sucesso!");
  } catch (err) {
    console.error("Erro registrar saída:", err);
    alert("Erro ao registrar saída (veja console).");
  }
}

// Excluir saída (não reverte estoque automaticamente)
async function excluirSaidaFirestore(docId) {
  if (!confirm("Excluir este registro de saída? (não reverte estoque automaticamente)")) return;
  try {
    await deleteDoc(doc(db, "saidas", docId));
    alert("Saída excluída.");
  } catch (err) {
    console.error("Erro excluir saída:", err);
    alert("Erro ao excluir (veja console).");
  }
}

window.excluirSaidaFirestore = excluirSaidaFirestore;

if (formSaida) formSaida.addEventListener("submit", registrarSaida);
if (tabelaSaidas) iniciarListenerSaidas();
