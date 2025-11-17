import { inserirAlimentoSwal } from "./alertas_dietas.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-dieta");
  const tabela = document.getElementById("lista-alimentos");
  const tabelaResumo = document.getElementById("tabela-resumo");
  const btnAdicionar = document.getElementById("abrirModal");

  const alimentos = JSON.parse(window.ALIMENTOS_JSON || "[]");
  const urlBalanceamento = window.URL_BALANCEAMENTO;
  const csrfToken = window.CSRF_TOKEN;

  btnAdicionar.addEventListener("click", () => {
    inserirAlimentoSwal(alimentos, (id, qtd) => {
      const nome = alimentos.find(a => a.id == id)?.nome || "Desconhecido";

      const linhaVazia = tabela.querySelector(".text-center");
      if (linhaVazia) linhaVazia.remove();

      const tr = document.createElement("tr");
      tr.dataset.id = id;
      tr.innerHTML = `
        <td>${nome}</td>
        <td>${qtd}</td>
        <td>
          <button type="button" class="btn btn-danger btn-sm remover-item" title="Remover">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tabela.appendChild(tr);

      const inputAli = document.createElement("input");
      inputAli.type = "hidden";
      inputAli.name = "alimentos[]";
      inputAli.value = id;

      const inputQtd = document.createElement("input");
      inputQtd.type = "hidden";
      inputQtd.name = "quantidades[]";
      inputQtd.value = qtd;

      form.appendChild(inputAli);
      form.appendChild(inputQtd);

      atualizarResumo();
    });
  });

  tabela.addEventListener("click", e => {
    const btn = e.target.closest(".remover-item");
    if (!btn) return;

    const tr = btn.closest("tr");
    const id = tr.dataset.id;
    tr.remove();

    const alimentosInputs = document.querySelectorAll('input[name="alimentos[]"]');
    const qtdInputs = document.querySelectorAll('input[name="quantidades[]"]');
    for (let i = 0; i < alimentosInputs.length; i++) {
      if (alimentosInputs[i].value === id) {
        alimentosInputs[i].remove();
        qtdInputs[i].remove();
        break;
      }
    }

    if (!tabela.querySelector("tr")) {
      tabela.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Nenhum alimento adicionado</td></tr>`;
    }

    atualizarResumo();
  });

  document.querySelector('select[name="exigencia"]').addEventListener("change", atualizarResumo);

  async function atualizarResumo() {
    const exSel = document.querySelector('select[name="exigencia"]').value;
    if (!exSel) {
      tabelaResumo.innerHTML = `<tr><td colspan='4' class='text-center text-muted'>Selecione uma exigência</td></tr>`;
      return;
    }

    const alimentosSel = Array.from(document.querySelectorAll('input[name="alimentos[]"]')).map(i => i.value);
    const quantidades = Array.from(document.querySelectorAll('input[name="quantidades[]"]')).map(i => i.value);

    if (alimentosSel.length === 0) {
      tabelaResumo.innerHTML = `<tr><td colspan='4' class='text-center text-muted'>Adicione alimentos para ver o balanceamento</td></tr>`;
      return;
    }

    const fd = new FormData();
    fd.append("exigencia", exSel);
    alimentosSel.forEach(a => fd.append("alimentos[]", a));
    quantidades.forEach(q => fd.append("quantidades[]", q));

    try {
      const resp = await fetch(urlBalanceamento, {
        method: "POST",
        headers: { "X-CSRFToken": csrfToken },
        body: fd
      });

      if (!resp.ok) throw new Error("Erro de rede");

      const data = await resp.json();
      if (data.erro) throw new Error("Erro no cálculo");

      // pra montar a tabela de nutrientes
      let html = "";
      for (const nome in data.balanceamento) {
        const fornecido = data.totais[nome] ?? 0;
        const exigido = data.exigencia[nome] ?? 0;
        const dif = data.balanceamento[nome] ?? 0;
        const cor = dif < 0 ? "text-danger" : dif > 0 ? "text-success" : "text-muted";

        html += `
          <tr>
            <td>${nome}</td>
            <td>${fornecido.toFixed(2)}</td>
            <td>${exigido.toFixed(2)}</td>
            <td class="${cor}">${dif.toFixed(2)}</td>
          </tr>`;
      }

      tabelaResumo.innerHTML = html || `<tr><td colspan='4' class='text-center'>Nenhum nutriente encontrado</td></tr>`;
    } catch (err) {
      tabelaResumo.innerHTML = `<tr><td colspan='4' class='text-center text-danger'>${err.message}</td></tr>`;
      console.error("Erro ao calcular balanceamento:", err);
    }
  }
});
