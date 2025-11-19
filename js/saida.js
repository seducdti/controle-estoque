// saida.js
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.getElementById("formSaida").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("produtoSaida").value;
  const qtd = Number(document.getElementById("quantidadeSaida").value);

  // registra saída
  await addDoc(collection(db, "saidas"), {
    produto: nome,
    quantidade: qtd,
    data: new Date()
  });

  // reduz no estoque
  const snap = await getDocs(collection(db, "produtos"));
  snap.forEach(async (p) => {
    if (p.data().nome === nome) {
      await updateDoc(doc(db, "produtos", p.id), {
        quantidade: p.data().quantidade - qtd
      });
    }
  });

  alert("Saída registrada!");
  e.target.reset();
});
