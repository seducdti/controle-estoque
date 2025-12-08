// ===============================
//  FIREBASE CONFIG
// ===============================
import {
  collection,
  addDoc,
  getDocs,
  getFirestore,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app } from "./firebase.js"; // importa firebase.js
const db = getFirestore(app);

// ===============================
//  ELEMENTOS DA TELA
// ===============================
const produtoSelect = document.getElementById("produto");
const quantidadeInput = document.getElementById("quantidade");
const dataInput = document.getElementById("data");
const destinoInput = document.getElementById("destino");
const origemInput = document.getElementById("origem");

const tabelaEntradas = document.getElementById("tabela-entradas");
const tabelaSaidas = document.getElementById("tabela-saidas");

// ===============================
//  CARREGAR PRODUTOS
// ===============================
async function carregarProdutos() {
  const snap = await getDocs(collection(db, "produtos"));
  produtoSelect.innerHTML = "";

  snap.forEach((d) => {
    const p = d.data();
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = p.nome;
    produtoSelect.appendChild(opt);
  });
}
carregarProdutos();

// ===============================
//  REGISTRAR ENTRADA
// ===============================
export async function registrarEntrada(e) {
  if (e) e.preventDefault();

  const produtoId = produtoSelect.value;
  const qtd = Number(quantidadeInput.value);
  const dataVal = dataInput.value ? new Date(dataInput.value).toISOString() : null;
  const origem = origemInput.value.trim() || "";

  if (!produtoId || qtd <= 0) return alert("Preencha todos os campos.");

  // Busca o produto para salvar o nome junto
  const snap = await getDocs(collection(db, "produtos"));
  let produtoNome = "";

  snap.forEach((d) => {
    if (d.id === produtoId) produtoNome = d.data().nome;
  });

  await addDoc(collection(db, "entradas"), {
    produtoId,
    produtoNome,
    quantidade: qtd,
    data: dataVal,
    origem,
  });

  alert("Entrada registrada!");
  quantidadeInput.value = "";
  origemInput.value = "";

  carregarEntradas();
}

// ===============================
//  REGISTRAR SAÍDA
// ===============================
export async function registrarSaida(e) {
  if (e) e.preventDefault();

  const produtoId = produtoSelect.value;
  const qtd = Number(quantidadeInput.value);
  const destino = destinoInput.value.trim() || "";
  const dataVal = dataInput.value ? new Date(dataInput.value).toISOString() : null;

  if (!produtoId || qtd <= 0) return alert("Preencha todos os campos.");

  // Busca nome do produto
  const snap = await getDocs(collection(db, "produtos"));
  let produtoNome = "";
  let estoqueAtual = 0;
  let produtoRef = null;

  snap.forEach((d) => {
    if (d.id === produtoId) {
      const p = d.data();
      produtoNome = p.nome;
      estoqueAtual = Number(p.estoque || 0);
      produtoRef = d.ref;
    }
  });

  if (qtd > estoqueAtual) {
    return alert("Quantidade maior que o estoque disponível!");
  }

  await addDoc(collection(db, "saidas"), {
    produtoId,
    produtoNome,
    quantidade: qtd,
    data: dataVal,
    destino,
  });

  // Atualiza estoque
  await updateDoc(produtoRef, {
    estoque: estoqueAtual - qtd,
  });

  alert("Saída registrada!");
  quantidadeInput.value = "";
  destinoInput.value = "";

  carregarSaidas();
}

// ===============================
//  LISTAR ENTRADAS
// ===============================
async function carregarEntradas() {
  const snap = await getDocs(collection(db, "entradas"));
  tabelaEntradas.innerHTML = "";

  snap.forEach((d) => {
    const e = d.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${e.produtoNome}</td>
      <td>${e.quantidade}</td>
      <td>${e.origem || "-"}</td>
      <td>${e.data ? new Date(e.data).toLocaleDateString() : "-"}</td>
    `;

    tabelaEntradas.appendChild(tr);
  });
}
carregarEntradas();

// ===============================
//  LISTAR SAÍDAS
// ===============================
async function carregarSaidas() {
  const snap = await getDocs(collection(db, "saidas"));
  tabelaSaidas.innerHTML = "";

  snap.forEach((d) => {
    const s = d.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${s.produtoNome}</td>
      <td>${s.quantidade}</td>
      <td>${s.destino || "-"}</td>
      <td>${s.data ? new Date(s.data).toLocaleDateString() : "-"}</td>
    `;

    tabelaSaidas.appendChild(tr);
  });
}
carregarSaidas();

// ===============================
//  EXPORTAR PDF
// ===============================
export function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Relatório de Controle", 10, 10);

  doc.autoTable({
    startY: 20,
    html: "#tabela-entradas",
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    html: "#tabela-saidas",
    headStyles: { fillColor: [231, 76, 60] },
  });

  doc.save("controle.pdf");
}
