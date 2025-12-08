// js/controle.js
import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const tabela = document.getElementById("listaControle");
const pesquisaInput = document.getElementById("pesquisaProduto");

const produtosCol = collection(db, "produtos");
const entradasCol = collection(db, "entradas");
const saidasCol = collection(db, "saidas");

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
  let termoPesquisa = "";

  // observa produtos
  onSnapshot(query(produtosCol, orderBy("nome")), snap => {
    listaProdutos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    atualizarTabela();
  });

  // observa entradas
  onSnapshot(entradasCol, snap => {
    listaEntradas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    atualizarTabela();
  });

  // observa saídas
  onSnapshot(saidasCol, snap => {
    listaSaidas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    atualizarTabela();
  });

  // pesquisa em tempo real (se input existir)
  if (pesquisaInput) {
    pesquisaInput.addEventListener("input", (e) => {
      termoPesquisa = (e.target.value || "").trim().toLowerCase();
      atualizarTabela();
    });
  }

  function atualizarTabela() {
    if (!tabela) return;

    if (listaProdutos.length === 0) {
      tabela.innerHTML = `
        <tr><td colspan="6" class="muted">Nenhum produto cadastrado</td></tr>
      `;
      return;
    }

    tabela.innerHTML = "";

    const maxEstoque = Math.max(...listaProdutos.map(p => Number(p.quantidade || 0)), 1);

    // aplicar filtro de pesquisa: procura em id ou nome
    const produtosFiltrados = termoPesquisa
      ? listaProdutos.filter(p => {
          const nome = (p.nome || "").toString().toLowerCase();
          const id = (p.id || "").toString().toLowerCase();
          return nome.includes(termoPesquisa) || id.includes(termoPesquisa);
        })
      : listaProdutos;

    if (produtosFiltrados.length === 0) {
      tabela.innerHTML = `<tr><td colspan="6" class="muted">Nenhum produto corresponde à pesquisa</td></tr>`;
      return;
    }

    produtosFiltrados.forEach(prod => {
      const entradas = listaEntradas
        .filter(e => e.produtoId === prod.id || e.produtoId === (prod.id + "")) // tolerância string/number
        .reduce((s, e) => s + Number(e.quantidade || 0), 0);

      const saidas = listaSaidas
        .filter(s => s.produtoId === prod.id || s.produtoId === (prod.id + ""))
        .reduce((s, e) => s + Number(e.quantidade || 0), 0);

      const saldo = Number(prod.quantidade || 0);
      const nivel = calcularNivelEstoque(saldo, maxEstoque);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${prod.id}</td>
        <td>${escapeHtml(prod.nome || "")}</td>
        <td>${entradas}</td>
        <td>${saidas}</td>
        <td>${saldo}</td>
        <td><span class="nivel ${nivel.cor}">${nivel.texto}</span></td>
      `;
      tabela.appendChild(tr);
    });
  }
}

function escapeHtml(s){
  if(!s) return "";
  return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

document.addEventListener("DOMContentLoaded", iniciarControle);
