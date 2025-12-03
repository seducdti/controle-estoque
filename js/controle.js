// ===============================
// controle.js — Resumo visual do estoque (Firebase)
// ===============================

import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

// ===============================
// CARREGAR DADOS DO FIRESTORE
// ===============================

async function getDadosFirebase() {
  const produtosSnap = await getDocs(collection(db, "produtos"));
  const entradasSnap = await getDocs(collection(db, "entradas"));
  const saidasSnap = await getDocs(collection(db, "saidas"));

  return {
    produtos: produtosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    entradas: entradasSnap.docs.map(doc => doc.data()),
    saidas: saidasSnap.docs.map(doc => doc.data())
  };
}

// ===============================
// FUNÇÃO PARA CALCULAR NÍVEL
// ===============================

function calcularNivelEstoque(quantidade, maximo) {
  const percentual = (quantidade / maximo) * 100;

  if (percentual <= 25) return { texto: "Baixo", cor: "vermelho" };
  if (percentual <= 75) return { texto: "Médio", cor: "amarelo" };
  return { texto: "Alto", cor: "verde" };
}

// ===============================
// ATUALIZAR TABELA DE CONTROLE
// ===============================

async function atualizarControleEstoque() {
  const tbody = document.getElementById("listaControle");
  if (!tbody) return;

  const dados = await getDadosFirebase();
  const produtos = dados.produtos;

  if (produtos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="muted">Nenhum produto cadastrado</td></tr>';
    return;
  }

  // Saldo máximo encontrado (para calcular nível)
  const maxEstoque = Math.max(...produtos.map(p => p.quantidade || 0), 1);

  tbody.innerHTML = '';

  produtos.forEach(prod => {
    const entradas = dados.entradas
      .filter(e => e.produtoNome === prod.nome)
      .reduce((acc, e) => acc + (e.quantidade || 0), 0);

    const saidas = dados.saidas
      .filter(s => s.produtoNome === prod.nome)
      .reduce((acc, s) => acc + (s.quantidade || 0), 0);

    const saldo = (prod.quantidade || 0);
    const nivel = calcularNivelEstoque(saldo, maxEstoque);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.id}</td>
      <td>${prod.nome}</td>
      <td>${entradas}</td>
      <td>${saidas}</td>
      <td>${saldo}</td>
      <td><span class="nivel ${nivel.cor}">${nivel.texto}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ===============================
// INICIAR AO CARREGAR A PÁGINA
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  atualizarControleEstoque();
});
