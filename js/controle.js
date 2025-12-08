// ===============================
// produtos.js — Cadastro e Lista de Produtos (Firebase)
// ===============================

import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const tabela = document.getElementById("listaProdutos");
const form = document.getElementById("formProduto");
const inputNome = document.getElementById("nomeProduto");
const inputQuantidade = document.getElementById("quantidadeProduto");
const btnSalvar = document.getElementById("btnSalvar");
const inputPesquisa = document.getElementById("pesquisaProduto");

let editandoId = null;
let listaProdutos = [];
let termoPesquisa = "";

// Referência Firebase
const produtosCol = collection(db, "produtos");

// ----------------------
// Listener para Pesquisa
// ----------------------
if (inputPesquisa) {
  inputPesquisa.addEventListener("input", () => {
    termoPesquisa = inputPesquisa.value.toLowerCase();
    montarTabela();
  });
}

// ----------------------
// Carregar produtos em tempo real
// ----------------------
onSnapshot(query(produtosCol, orderBy("nome")), snap => {
  listaProdutos = snap.docs.map(doc => ({
    id: doc.id,
    nome: doc.data().nome,
    quantidade: Number(doc.data().quantidade || 0)
  }));
  montarTabela();
});

// ----------------------
// Monta tabela visual
// ----------------------
function montarTabela() {
  if (!tabela) return;

  tabela.innerHTML = "";

  // Aplica filtro da pesquisa
  const filtrados = listaProdutos.filter(p =>
    p.nome.toLowerCase().includes(termoPesquisa)
  );

  if (filtrados.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="4" class="muted">Nenhum produto encontrado</td>
      </tr>
    `;
    return;
  }

  filtrados.forEach(prod => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prod.nome}</td>
      <td>${prod.quantidade}</td>
      <td>
        <button class="btn-editar" data-id="${prod.id}">Editar</button>
      </td>
      <td>
        <button class="btn-excluir" data-id="${prod.id}">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });

  ativarEventosTabela();
}

// ----------------------
// Eventos dos botões
// ----------------------
function ativarEventosTabela() {
  document.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => carregarParaEdicao(btn.dataset.id));
  });

  document.querySelectorAll(".btn-excluir").forEach(btn => {
    btn.addEventListener("click", () => excluirProduto(btn.dataset.id));
  });
}

// ----------------------
// Editar Produto
// ----------------------
function carregarParaEdicao(id) {
  const p = listaProdutos.find(x => x.id === id);
  if (!p) return;

  editandoId = id;
  inputNome.value = p.nome;
  inputQuantidade.value = p.quantidade;
  btnSalvar.textContent = "Atualizar Produto";
}

// ----------------------
// Excluir Produto
// ----------------------
async function excluirProduto(id) {
  if (!confirm("Deseja realmente excluir este produto?")) return;

  await deleteDoc(doc(db, "produtos", id));
}

// ----------------------
// Salvar ou Atualizar Produto
// ----------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = inputNome.value.trim();
  const quantidade = Number(inputQuantidade.value || 0);

  if (!nome) {
    alert("Digite o nome do produto.");
    return;
  }

  if (quantidade < 0) {
    alert("A quantidade não pode ser negativa.");
    return;
  }

  // Atualizar produto existente
  if (editandoId) {
    await updateDoc(doc(db, "produtos", editandoId), {
      nome,
      quantidade
    });
    editandoId = null;
    btnSalvar.textContent = "Salvar Produto";
  }

  // Criar novo produto
  else {
    await addDoc(produtosCol, {
      nome,
      quantidade
    });
  }

  // Limpar campos
  form.reset();
});

// ----------------------
console.log("produtos.js carregado com sucesso");
