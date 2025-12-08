const entradasCol = collection(db, "entradas");
const saidasCol = collection(db, "saidas");

// Define o nível de estoque
// Função para calcular nível de estoque
function calcularNivelEstoque(qtd, max) {
  const pct = (qtd / max) * 100;
  if (pct <= 25) return { texto: "Baixo", cor: "vermelho" };
@@ -25,23 +25,28 @@ function calcularNivelEstoque(qtd, max) {
}
function iniciarControle() {

  if (!tabela) return;

  let listaProdutos = [];
  let listaEntradas = [];
  let listaSaidas = [];

  // ----- Carregar produtos -----
  // ----------------------
  // Carregar PRODUTOS
  // ----------------------
  onSnapshot(query(produtosCol, orderBy("nome")), snap => {
    listaProdutos = snap.docs.map(doc => ({
      id: doc.id,
      nome: doc.data().nome,
      quantidade: Number(doc.data().quantidade || 0)
      quantidade: Number(doc.data().quantidade || 0) // SALDO REAL
    }));
    atualizarTabela();
  });

onSnapshot(entradasCol, snap => {
    listaEntradas = snap.docs.map(doc => ({
      id: doc.id,
@@ -51,7 +56,9 @@ function iniciarControle() {
    atualizarTabela();
  });

  // ----- Carregar saídas -----
  // ----------------------
  // Carregar SAÍDAS
  // ----------------------
  onSnapshot(saidasCol, snap => {
    listaSaidas = snap.docs.map(doc => ({
      id: doc.id,
@@ -61,8 +68,11 @@ function iniciarControle() {
    atualizarTabela();
  });
// ----- Montar tabela -----
  // ----------------------
  // Montar Tabela Final
  // ----------------------
  function atualizarTabela() {

    if (listaProdutos.length === 0) {
      tabela.innerHTML = `
        <tr>
@@ -81,18 +91,18 @@ function iniciarControle() {

    listaProdutos.forEach(prod => {

      // Somatório das entradas do produto
      // Total de ENTRADAS (histórico)
      const entradas = listaEntradas
        .filter(e => e.produtoId === prod.id)
        .reduce((total, e) => total + e.quantidade, 0);

      // Somatório das saídas do produto
      // Total de SAÍDAS (histórico)
      const saidas = listaSaidas
        .filter(s => s.produtoId === prod.id)
        .reduce((total, s) => total + s.quantidade, 0);

      // Saldo real = estoque inicial + entradas - saídas
      const saldo = prod.quantidade + entradas - saidas;
      // SALDO REAL — já atualizado na coleção produtos
      const saldo = prod.quantidade;

      const nivel = calcularNivelEstoque(saldo, maxEstoque);
