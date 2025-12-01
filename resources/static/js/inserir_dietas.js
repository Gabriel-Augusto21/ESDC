// ============================================
// INSERIR DIETAS - PASSO 1
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-dieta");
  const tabela = document.getElementById("lista-alimentos");
  const tabelaResumo = document.getElementById("tabela-resumo");
  const btnAdicionar = document.getElementById("abrirModal");

  // Se não existir os elementos do Passo 1, não executa
  if (!form || !tabela || !tabelaResumo || !btnAdicionar) return;

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

// ============================================
// INSERIR DIETAS - PASSO 2
// ============================================

// URLs e constantes vindas do Django
let URL_ADD, URL_REMOVE, URL_BAL, EXIGENCIA, CSRF_TOKEN;

// Função para inicializar as variáveis do Passo 2
function initVariables(urls) {
    URL_ADD = urls.add;
    URL_REMOVE = urls.remove;
    URL_BAL = urls.bal;
    EXIGENCIA = urls.exigencia;
    CSRF_TOKEN = urls.csrf;
}

// Verifica se estamos na página do Passo 2
if (document.getElementById("btnAdd")) {
    
    // Event Listener para adicionar item
    document.getElementById("btnAdd").addEventListener("click", async () => {
        const ali = document.getElementById("alimento").value;
        const qtd = document.getElementById("quantidade").value;

        if (!ali || !qtd) {
            Swal.fire("Erro", "Selecione o alimento e a quantidade.", "warning");
            return;
        }

        const form = new FormData();
        form.append("alimento", ali);
        form.append("quantidade", qtd);
        form.append("csrfmiddlewaretoken", CSRF_TOKEN);

        const r = await fetch(URL_ADD, { method: "POST", body: form });
        const data = await r.json();

        atualizarTabela(data.itens);
        calcularBalanceamento();

        document.getElementById("alimento").value = "";
        document.getElementById("quantidade").value = "";
    });

    // Event Listener para remover item
    document.addEventListener("click", async e => {
        if (e.target.classList.contains("remover-item")) {
            console.log('Clicou')
            const id = e.target.closest("tr").dataset.id;
            console.log(id)
            const form = new FormData();
            form.append("id", id);
            form.append("csrfmiddlewaretoken", CSRF_TOKEN);

            const r = await fetch(URL_REMOVE, { method: "POST", body: form });
            const data = await r.json();

            atualizarTabela(data.itens);
            calcularBalanceamento();
        }
    });

    // Event Listener para mudanças na quantidade (recalcula balanceamento)
    document.addEventListener("input", e => {
        if (e.target.classList.contains("quantidade-input")) {
            calcularBalanceamento();
        }
    });

    // Função para atualizar a tabela de itens
    function atualizarTabela(lista) {
        const tbody = document.getElementById("itens-corpo");
        tbody.innerHTML = '';

        if (lista.length === 0) {
            tbody.innerHTML = `
                <tr class="linha-vazia">
                    <td colspan="3" class="text-center text-muted">Nenhum alimento adicionado</td>
                </tr>`;
            return;
        }

        lista.forEach(i => {
            tbody.innerHTML += `
                <tr data-id="${i.id}">
                    <td>${i.nome}</td>
                    <td>
                        <input type="number" 
                               class="form-control form-control-sm quantidade-input" 
                               value="${i.quantidade}" 
                               min="0.01" 
                               step="0.01"
                               style="width: 100px;">
                    </td>
                    <td><button type="button" class="btn remover-item">
                                <i class="bi bi-trash"></i>
                            </button></td>
                </tr>`;
        });
    }

    // Função para calcular balanceamento
    async function calcularBalanceamento() {
        const itens = [...document.querySelectorAll("#itens-corpo tr[data-id]")];

        if (itens.length === 0) {
            document.getElementById("box-balanceamento").innerHTML =
                `<p class="text-center text-muted">Nenhum alimento para balancear...</p>`;
            return;
        }

        const form = new FormData();
        form.append("exigencia", EXIGENCIA);
        form.append("csrfmiddlewaretoken", CSRF_TOKEN);

        itens.forEach(tr => {
            const qtdInput = tr.querySelector(".quantidade-input");
            form.append("alimentos[]", tr.dataset.id);
            form.append("quantidades[]", qtdInput.value.trim().replace(",", "."));
        });

        const r = await fetch(URL_BAL, { method: "POST", body: form });
        const data = await r.json();

        renderBalanceamento(data);
    }

    // Função para renderizar o balanceamento
    function renderBalanceamento(data) {
        const box = document.getElementById("box-balanceamento");
        const { exigencia, totais, contribuicao, balanceamento } = data;

        const alimentos = Object.keys(contribuicao);
        const nutrientes = Object.keys(totais);

        let html = `
        <div class="table-responsive" style="border-radius: 10px;">
            <table class="table">
                <thead class="fw-bold" style="background-color:#2f453a; color:white">
                    <tr>
                        <th>Alimento</th>
                        <th>Quantidade</th>
                        <th style="white-space: nowrap;">MS (%)</th>
                        <th style="white-space: nowrap;">PB (Mcal)</th>
                        <th style="white-space: nowrap;">ED (%MS)</th>`;

        nutrientes.forEach(n => {
            html += `<th style="white-space: nowrap;">${n}</th>`;
        });

        html += `</tr></thead><tbody>`;

        alimentos.forEach(alimento => {
            const info = contribuicao[alimento];
            html += `
                <tr>
                    <td>${alimento}</td>
                    <td>${parseFloat(info.quantidade || 0).toFixed(2)} <small>(kg)</small></td>
                    <td>${parseFloat(info.ms || 0).toFixed(2)}</td>
                    <td>${parseFloat(info.pb || 0).toFixed(2)}</td>
                    <td>${parseFloat(info.ed || 0).toFixed(2)}</td>`;

            nutrientes.forEach(n => {
                html += `<td>${parseFloat(info[n] || 0).toFixed(2)}</td>`;
            });

            html += `</tr>`;
        });

        html += `
            <tr class="fw-bold" style="background-color:#2f453a; color:white">
                <td colspan="5" class="text-end">Total Fornecido:</td>`;

        nutrientes.forEach(n => {
            html += `<td>${parseFloat(totais[n] || 0).toFixed(2)}</td>`;
        });

        html += `</tr>
            <tr class="fw-bold" style="background-color:#2f453a; color:white">
                <td colspan="5" class="text-end">Exigência:</td>`;

        nutrientes.forEach(n => {
            html += `<td>${parseFloat(exigencia[n] || 0).toFixed(2)}</td>`;
        });

        html += `</tr>
            <tr class="fw-bold" style="background-color:#2f453a; color:white">
                <td colspan="5" class="text-end">Balanceamento (Diferença p/ Exigência):</td>`;

        nutrientes.forEach(n => {
            const val = parseFloat(balanceamento[n] || 0).toFixed(2);
            html += `<td class="${val >= 0 ? "text-success" : "text-danger"}">${val}</td>`;
        });

        html += `</tr></tbody></table></div>`;

        box.innerHTML = html;
    }
}