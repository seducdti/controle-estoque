import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// -----------------------------
// Referências Firebase
// -----------------------------
const produtosCol = collection(db, "produtos");
const entradasCol = collection(db, "entradas");
const saidasCol   = collection(db, "saidas");

const tabela = document.getElementById("listaControle");
const pesquisaInput = document.getElementById("pesquisaProduto");

let produtos = [];
let entradas = [];
let saidas = [];
let termoPesquisa = "";

// -------------------------------------------
// FILTRO EM TEMPO REAL
// -------------------------------------------
pesquisaInput.addEventListener("input", () => {
  termoPesquisa = pesquisaInput.value.toLowerCase().trim();
  montarTabela();
});

// -------------------------------------------
// CARREGAMENTO DOS DADOS EM TEMPO REAL
// -------------------------------------------
onSnapshot(query(produtosCol, orderBy("nome")), snap => {
  produtos = snap.docs.map(doc => ({
    id: doc.id,
    nome: doc.data().nome,
    quantidadeInicial: Number(doc.data().quantidade || 0)
  }));
  montarTabela();
});

onSnapshot(entradasCol, snap => {
  entradas = snap.docs.map(doc => doc.data());
  montarTabela();
});

onSnapshot(saidasCol, snap => {
  saidas = snap.docs.map(doc => doc.data());
  montarTabela();
});

// -------------------------------------------
// MONTAR A TABELA DE RESUMO
// -------------------------------------------
function montarTabela() {
  if (!tabela) return;

  tabela.innerHTML = "";

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(termoPesquisa)
  );

  filtrados.forEach(produto => {
    const totalEntradas = entradas
      .filter(e => e.produtoId === produto.id)
      .reduce((acc, e) => acc + Number(e.qtd), 0);

    const totalSaidas = saidas
      .filter(s => s.produtoId === produto.id)
      .reduce((acc, s) => acc + Number(s.qtd), 0);

    const saldo = produto.quantidadeInicial + totalEntradas - totalSaidas;

    const nivel =
      saldo <= 0 ? "⚠️ Sem estoque" :
      saldo <= 3 ? "🔸 Baixo" :
      "🟢 OK";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${produto.id}</td>
      <td>${produto.nome}</td>
      <td>${totalEntradas}</td>
      <td>${totalSaidas}</td>
      <td>${saldo}</td>
      <td>${nivel}</td>
    `;
    tabela.appendChild(tr);
  });

  if (filtrados.length === 0) {
    tabela.innerHTML = `
      <tr><td colspan="6" class="muted">Nenhum produto encontrado</td></tr>
    `;
  }
}

console.log("controle.js carregado com sucesso!");
