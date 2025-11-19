// entrada.js
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.getElementById("formEntrada").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("produtoEntrada").value;
  const qtd = Number(document.getElementById("quantidadeEntrada").value);

  // registra entrada
  await addDoc(collection(db, "entradas"), {
    produto: nome,
    quantidade: qtd,
    data: new Date()
  });

  // aumenta no estoque
  const snap = await getDocs(collection(db, "produtos"));
  snap.forEach(async (p) => {
    if (p.data().nome === nome) {
      await updateDoc(doc(db, "produtos", p.id), {
        quantidade: p.data().quantidade + qtd
      });
    }
  });

  alert("Entrada registrada!");
  e.target.reset();
});
