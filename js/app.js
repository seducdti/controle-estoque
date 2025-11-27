// js/app.js
import { db } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const totalProdutosEl = document.getElementById("totalProdutos");
const totalEstoqueEl = document.getElementById("totalEstoque");
const totalEntradasEl = document.getElementById("totalEntradas");
const totalSaidasEl = document.getElementById("totalSaidas");

const produtosCol = collection(db, "produtos");
const entradasCol = collection(db, "entradas");
const saidasCol = collection(db, "saidas");

function atualizarDashboardSnapshot() {
  // produtos
  onSnapshot(query(produtosCol), (snap) => {
    const produtos = snap.docs.map(d => d.data());
    const totalProdutos = produtos.length;
    const totalEstoque = produtos.reduce((s, p) => s + Number(p.quantidade || 0), 0);
    if (totalProdutosEl) totalProdutosEl.textContent = totalProdutos;
    if (totalEstoqueEl) totalEstoqueEl.textContent = totalEstoque;
  });

  // entradas (contagem)
  onSnapshot(query(entradasCol), (snap) => {
    if (totalEntradasEl) totalEntradasEl.textContent = snap.size;
  });

  // saidas (contagem)
  onSnapshot(query(saidasCol), (snap) => {
    if (totalSaidasEl) totalSaidasEl.textContent = snap.size;
  });
}

atualizarDashboardSnapshot();
