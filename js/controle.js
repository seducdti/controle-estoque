// ===============================
// controle.js — Dashboard Geral
// ===============================

import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const tabela = document.getElementById("tabelaProdutos");
const searchInput = document.getElementById("pesquisarProduto");

const produtosCol = collection(db, "produtos");
const entradasCol = collection(db, "entradas");
const saidasCol = collection(db, "saidas");

// ===============================
// Função para carregar dados
// ===============================

async function carregarTudo() {
  const produtosSnap = await getDocs(produtosCol);
  const entradasSnap = await getDocs(entradasCol);
  const saidasSnap = await getDocs(saidasCol);

  const produtos = [];
  produtosSnap.forEach(docSnap => {
    produtos.push({
      id: docSnap.id,
      ...docSnap.data(),
      quantidade: Number(docSnap.data().quantidade) || 0
    });
  });

  const entradas = [];
  entradasSnap.forEach(docSnap => {
    const d = docSnap.data();
    entradas.push({
      id: docSnap.id,
      ...d,
      quantidade: Number(d.quantidade) || 0,
      data: d.data || null
    });
  });

  const saidas = [];
  saidasSnap.forEach(docSnap => {
    const d = docSnap.data();
    saidas.push({
      id: docSnap.id,
      ...d,
      quantidade: Number(d.quantidade) || 0,
      data: d.data || null
    });
  });

  montarTabela(produtos, entradas, saidas);
}

// ===============================
// Construir tabela
// ===============================

function montarTabela(produtos, entradas, saidas) {
  if (!tabela) return;

  tabela.innerHTML = "";

  produtos.forEach(prod => {

    // somatórios seguros
    const totalEntradas = entradas
      .filter(e => e.produtoId === prod.id)
      .reduce((acc, e) => acc + (Number(e.quantidade) || 0), 0);

    const totalSaidas = saidas
      .filter(s => s.produtoId === prod.id)
      .reduce((acc, s) => acc + (Number(s.quantidade) || 0), 0);

    // saldo calculado
    const saldo = totalEntradas - totalSaidas;

    // nível automático
    let nivel = "OK";
    let cor = "green";

    if (saldo <= 0) {
      nivel = "CRÍTICO";
      cor = "red";
    } else if (saldo < 5) {
      nivel = "BAIXO";
      cor = "orange";
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${prod.id}</td>
      <td>${prod.nome || "-"}</td>
      <td>${totalEntradas}</td>
      <td>${totalSaidas}</td>
      <td>${saldo}</td>
      <td>
        <span style="color:${cor}; font-weight:bold;">
          ● ${nivel}
        </span>
      </td>
    `;

    tabela.appendChild(tr);
  });
}

// ===============================
// Pesquisa na tabela
// ===============================

searchInput?.addEventListener("input", () => {
  const termo = searchInput.value.toLowerCase();

  Array.from(tabela.querySelectorAll("tr")).forEach(tr => {
    const texto = tr.textContent.toLowerCase();
    tr.style.display = texto.includes(termo) ? "" : "none";
  });
});

// ===============================
// Iniciar
// ===============================

carregarTudo();
