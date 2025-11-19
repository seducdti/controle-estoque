// app.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Carrega totais
async function carregarResumo() {
  const produtosSnap = await getDocs(collection(db, "produtos"));
  const entradasSnap = await getDocs(collection(db, "entradas"));
  const saidasSnap = await getDocs(collection(db, "saidas"));

  let totalEstoque = 0;

  produtosSnap.forEach(doc => {
    totalEstoque += doc.data().quantidade;
  });

  document.getElementById("totalProdutos").textContent = produtosSnap.size;
  document.getElementById("totalEstoque").textContent = totalEstoque;
  document.getElementById("totalEntradas").textContent = entradasSnap.size;
  document.getElementById("totalSaidas").textContent = saidasSnap.size;

  gerarGrafico(totalEstoque, entradasSnap.size, saidasSnap.size);
}

// Gráfico
function gerarGrafico(estoque, entradas, saidas) {
  const ctx = document.getElementById("graficoEstoque");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Estoque", "Entradas", "Saídas"],
      datasets: [{
        label: "Resumo Geral",
        data: [estoque, entradas, saidas]
      }]
    }
  });
}

carregarResumo();
