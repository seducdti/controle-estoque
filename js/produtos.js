// produtos.js
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const form = document.getElementById("formProduto");
const tabela = document.getElementById("listaProdutos");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeProduto").value;
  const quantidade = Number(document.getElementById("quantidadeProduto").value);

  await addDoc(collection(db, "produtos"), { nome, quantidade });

  alert("Produto cadastrado!");
  form.reset();
  carregarProdutos();
});

async function carregarProdutos() {
  tabela.innerHTML = "";
  const snap = await getDocs(collection(db, "produtos"));

  snap.forEach(doc => {
    const p = doc.data();
    const tr = `
      <tr>
        <td>${p.nome}</td>
        <td>${p.quantidade}</td>
      </tr>
    `;
    tabela.innerHTML += tr;
  });
}

carregarProdutos();
