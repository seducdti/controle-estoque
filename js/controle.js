// controle.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const box = document.getElementById("relatorio");

async function gerarRelatorio() {
  let html = "<h3>Relatório Geral</h3>";

  html += "<h4>Produtos</h4>";
  const produtos = await getDocs(collection(db, "produtos"));
  produtos.forEach(p => {
    const d = p.data();
    html += `${d.nome}: ${d.quantidade} unidades<br>`;
  });

  html += "<br><h4>Entradas</h4>";
  const entradas = await getDocs(collection(db, "entradas"));
  entradas.forEach(e => {
    const d = e.data();
    html += `${d.produto} +${d.quantidade}<br>`;
  });

  html += "<br><h4>Saídas</h4>";
  const saidas = await getDocs(collection(db, "saidas"));
  saidas.forEach(s => {
    const d = s.data();
    html += `${d.produto} -${d.quantidade}<br>`;
  });

  box.innerHTML = html;
}

gerarRelatorio();
