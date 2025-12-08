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

// ===============================
// REFERÊNCIAS
// ===============================

const tabela = document.getElementById("listaControle");

const produtosCol = collection(db, "produtos");
const entradasCol = collection(db, "entradas");
const saidasCol = collection(db, "saidas");

// ===============================
// CALCULAR NÍVEL
// ===============================

function calcularNivelEstoque(qtd, max) {
  const pct = (qtd / max) * 100;

  if (pct <= 25) return { texto: "Baixo", cor: "vermelho" };
  if (pct <= 75) return { texto: "Médio", cor: "amarelo" };
  return { texto: "Alto", cor: "verde" };
}

// ===============================
// ATUALIZA TABELA EM TEMPO REAL
// ===============================

function iniciarControle() {
  if (!tabela) return;

  let listaProdutos = [];
  let listaEntradas = [];
  let listaSaidas = [];

  // Carregar produtos
  onSnapshot(query(produtosCol, orderBy("nome")), snap => {
    listaProdutos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    atualizarTabela();
  });

  // Carregar entradas — AGORA COM ID
  onSnapshot(entradasCol, snap => {
    listaEntradas = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    atualizarTabela();
  });

  // Carregar saídas — AGORA COM ID
  onSnapshot(saidasCol, snap => {
    listaSaidas = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    atualizarTabela();
  });

  // Função principal de atualização
  function atualizarTabela() {
    tabela.innerHTML = "";

    if (listaProdutos.length === 0) {
      tabela.innerHTML = `
        <tr>
          <td colspan="6" class="muted">Nenhum produto cadastrado</td>
        </tr>
      `;
      return;
    }

    // Encontrar maior quantidade para calcular níveis
    const maxEstoque = Math.max(
      ...listaProdutos.map(p => Number(p.quantidade || 0)),
      1
    );

    listaProdutos.forEach(prod => {
      const entradas = listaEntradas
        .filter(e => e.produtoId === prod.id)
        .reduce((s, e) => s + Number(e.quantidade || 0), 0);

      const saidas = listaSaidas
        .filter(s => s.produtoId === prod.id)
        .reduce((s, e) => s + Number(e.quantidade || 0), 0);

      const saldo = Number(prod.quantidade || 0);

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
