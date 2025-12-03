// ===============================
// controle.js — Resumo visual do estoque (Firebase)
// ===============================

import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const tabela = document.getElementById("listaControle");

const produtosCol = collection(db, "produtos");
const entradasCol = collection(db, "entradas");
const saidasCol = collection(db, "saidas");

// Define o nível de estoque
function calcularNivelEstoque(qtd, max) {
  const pct = (qtd / max) * 100;
  if (pct <= 25) return { texto: "Baixo", cor: "vermelho" };
  if (pct <= 75) return { texto: "Médio", cor: "amarelo" };
  return { texto: "Alto", cor: "verde" };
}

function iniciarControle() {
  if (!tabela) return;

  let listaProdutos = [];
  let listaEntradas = [];
  let listaSaidas = [];

  // ----- Carregar produtos -----
  onSnapshot(query(produtosCol, orderBy("nome")), snap => {
    listaProdutos = snap.docs.map(doc => ({
      id: doc.id,
      nome: doc.data().nome,
      quantidade: Number(doc.data().quantidade || 0)
    }));
    atualizarTabela();
  });

  // ----- Carregar entradas -----
  onSnapshot(entradasCol, snap => {
    listaEntradas = snap.docs.map(doc => ({
      id: doc.id,
      produtoId: doc.data().produtoId,
      quantidade: Number(doc.data().quantidade || 0)
    }));
    atualizarTabela();
  });

  // ----- Carregar saídas -----
  onSnapshot(saidasCol, snap => {
    listaSaidas = snap.docs.map(doc => ({
      id: doc.id,
      produtoId: doc.data().produtoId,
      quantidade: Number(doc.data().quantidade || 0)
    }));
    atualizarTabela();
  });

  // ----- Montar tabela -----
  function atualizarTabela() {
    if (listaProdutos.length === 0) {
      tabela.innerHTML = `
        <tr>
          <td colspan="6" class="muted">Nenhum produto cadastrado</td>
        </tr>
      `;
      return;
    }

    tabela.innerHTML = "";

    const maxEstoque = Math.max(
      ...listaProdutos.map(p => p.quantidade),
      1
    );

    listaProdutos.forEach(prod => {

      // Somatório das entradas do produto
      const entradas = listaEntradas
        .filter(e => e.produtoId === prod.id)
        .reduce((total, e) => total + e.quantidade, 0);

      // Somatório das saídas do produto
      const saidas = listaSaidas
        .filter(s => s.produtoId === prod.id)
        .reduce((total, s) => total + s.quantidade, 0);

      // Saldo real = estoque inicial + entradas - saídas
      const saldo = prod.quantidade + entradas - saidas;

      const nivel = calcularNivelEstoque(saldo, maxEstoque);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${prod.id}</td>
        <td>${prod.nome}</td>
        <td>${entradas}</td>
        <td>${saidas}</td>
        <td>${saldo}</td>
        <td><span class="nivel ${nivel.cor}">${nivel.texto}</span></td>
      `;

      tabela.appendChild(tr);
    });
  }
}

document.addEventListener("DOMContentLoaded", iniciarControle);
