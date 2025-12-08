// ===============================
// controle.js — Resumo Geral de Estoque
// ===============================

import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const tabela = document.getElementById("listaControle");
const inputPesquisa = document.getElementById("pesquisaProduto");

let produtos = [];
let entradas = [];
let saidas = [];
let termoPesquisa = "";

// coleções
const produtosCol = collection(db, "produtos");
const entradasCol = collection(db, "entradas");
const saidasCol = collection(db, "saidas");

// pesquisa
inputPesquisa?.addEventListener("input", () => {
  termoPesquisa = inputPesquisa.value.toLowerCase().trim();
  montarTabela();
});

// listener produtos
onSnapshot(query(produtosCol, orderBy("nome")), snap => {
  produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  montarTabela();
});

// listener entradas
onSnapshot(query(entradasCol, orderBy("data", "desc")), snap => {
  entradas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  montarTabela();
});

// listener saídas
onSnapshot(query(saidasCol, orderBy("data", "desc")), snap => {
  saidas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  montarTabela();
});

// ===============================
// MONTAR TABELA
// ===============================
function montarTabela() {
  if (!tabela) return;

  tabela.innerHTML = "";

  // filtro pesquisa
  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(termoPesquisa)
  );

  if (filtrados.length === 0) {
    tabela.innerHTML = `
      <tr><td colspan="6">Nenhum produto encontrado</td></tr>
    `;
    return;
  }

  filtrados.forEach(prod => {
    // soma entradas do produto
    const entradasProduto = entradas.filter(e => e.produtoId === prod.id);
    const totalEntradas = entradasProduto.reduce(
      (s, e) => s + Number(e.quantidade || 0),
      0
    );

    // soma saídas do produto
    const saidasProduto = saidas.filter(s => s.produtoId === prod.id);
    const totalSaidas = saidasProduto.reduce(
      (s, e) => s + Number(e.quantidade || 0),
      0
    );

    // saldo atual
    const saldo = Number(prod.quantidade || 0);

    // nivel
    let nivel = "";
    if (saldo <= 3) nivel = "🔴 Baixo";
    else if (saldo <= 10) nivel = "🟡 Médio";
    else nivel = "🟢 Alto";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${prod.id}</td>
      <td>${prod.nome}</td>
      <td>${totalEntradas}</td>
      <td>${totalSaidas}</td>
      <td>${saldo}</td>
      <td>${nivel}</td>
    `;

    tabela.appendChild(tr);
  });
}

console.log("controle.js carregado");
