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
    
    initPasso2();
}

function initPasso2() {
    const btnAdd = document.getElementById("btnAdd");
    
    if (!btnAdd) return;
    
    restaurarItensDoLocalStorage();
    
    const tbody = document.getElementById("itens-corpo");
    const linhas = tbody.querySelectorAll('tr:not(.linha-vazia)');
    if (linhas.length > 0) {
        calcularBalanceamento();
    }
    
    btnAdd.addEventListener("click", adicionarItem);

    document.getElementById("itens-corpo").addEventListener("click", async (e) => {
        const btnRemover = e.target.closest(".remover-item");
        if (!btnRemover) return;
        
        e.preventDefault();
        
        const tr = btnRemover.closest("tr");
        const id = tr.dataset.id;
        const nomeAlimento = tr.querySelector("td:first-child").textContent;
        
        const result = await Swal.fire({
            title: 'Confirmar remoção',
            text: `Deseja remover "${nomeAlimento}" da dieta?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2f453a',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, remover',
            cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) return;
        
        const form = new FormData();
        form.append("id", id);
        form.append("csrfmiddlewaretoken", CSRF_TOKEN);

        try {
            const r = await fetch(URL_REMOVE, { method: "POST", body: form });
            const data = await r.json();

            if (data.ok) {
                atualizarTabela(data.itens);
                
                if (data.itens.length > 0) {
                    calcularBalanceamento();
                } else {
                    limparBalanceamento();
                }
                
                salvarItensNoLocalStorage();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Removido!',
                    text: 'Alimento removido da dieta',
                    confirmButtonColor: '#2f453a',
                    timer: 2000
                });
            }
        } catch (error) {
            console.error('Erro ao remover:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao remover alimento',
                confirmButtonColor: '#2f453a'
            });
        }
    });

    document.getElementById("itens-corpo").addEventListener("change", async (e) => {
        if (!e.target.classList.contains("quantidade-input")) return;
        
        const input = e.target;
        const tr = input.closest("tr");
        const id = tr.dataset.id;
        const novaQuantidade = parseFloat(input.value);
        
        if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: 'Quantidade deve ser maior que zero',
                confirmButtonColor: '#2f453a'
            });
            input.value = input.defaultValue; 
            return;
        }
        
        const form = new FormData();
        form.append("alimento", id);
        form.append("quantidade", novaQuantidade);
        form.append("csrfmiddlewaretoken", CSRF_TOKEN);
        
        try {
            const r = await fetch(URL_ADD, { method: "POST", body: form });
            const data = await r.json();
            
            if (data.ok) {
                input.defaultValue = novaQuantidade.toFixed(2);
                
                calcularBalanceamento();
                
                salvarItensNoLocalStorage();
            }
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao atualizar quantidade',
                confirmButtonColor: '#2f453a'
            });
        }
    });
}

async function adicionarItem() {
    const ali = document.getElementById("alimento").value;
    const qtd = document.getElementById("quantidade").value;

    if (!ali) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção',
            text: 'Selecione um alimento',
            confirmButtonColor: '#2f453a'
        });
        return;
    }
    
    if (!qtd || parseFloat(qtd) <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção',
            text: 'Informe uma quantidade válida',
            confirmButtonColor: '#2f453a'
        });
        return;
    }

    const form = new FormData();
    form.append("alimento", ali);
    form.append("quantidade", qtd);
    form.append("csrfmiddlewaretoken", CSRF_TOKEN);

    try {
        const r = await fetch(URL_ADD, { method: "POST", body: form });
        const data = await r.json();

        if (data.ok) {
            atualizarTabela(data.itens);
            calcularBalanceamento();

            document.getElementById("alimento").value = "";
            document.getElementById("quantidade").value = "";
            
            salvarItensNoLocalStorage();
            
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Alimento adicionado à dieta',
                confirmButtonColor: '#2f453a',
                timer: 2000
            });
        }
    } catch (error) {
        console.error('Erro ao adicionar:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Erro ao adicionar alimento',
            confirmButtonColor: '#2f453a'
        });
    }
}

function atualizarTabela(lista) {
    const tbody = document.getElementById("itens-corpo");
    
    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr class="linha-vazia">
                <td colspan="3" class="text-center text-muted">Nenhum alimento adicionado ainda</td>
            </tr>`;
        return;
    }

    tbody.innerHTML = '';
    
    lista.forEach(i => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', i.id);
        
        const quantidadeFormatada = parseFloat(i.quantidade).toFixed(2);
        
        tr.innerHTML = `
            <td>${i.nome}</td>
            <td>
                <input type="number" 
                        class="form-control form-control-sm quantidade-input mx-auto" 
                        value="${quantidadeFormatada}" 
                        min="0.01" 
                        step="0.01"
                        style="width: 100px;">
            </td>
            <td>
                <button type="button" class="btn remover-item">
                    <i class="bi bi-trash"></i>
                </button>
            </td>`;
        
        tbody.appendChild(tr);
        
        const input = tr.querySelector('.quantidade-input');
        input.defaultValue = quantidadeFormatada;
    });
    
    salvarItensNoLocalStorage();
}

async function calcularBalanceamento() {
    const tbody = document.getElementById("itens-corpo");
    const itens = tbody.querySelectorAll("tr[data-id]");

    if (itens.length === 0) {
        limparBalanceamento();
        return;
    }

    const form = new FormData();
    form.append("exigencia", EXIGENCIA);
    form.append("csrfmiddlewaretoken", CSRF_TOKEN);

    itens.forEach(tr => {
        const qtdInput = tr.querySelector(".quantidade-input");
        const quantidade = qtdInput.value.trim().replace(",", ".");
        form.append("alimentos[]", tr.dataset.id);
        form.append("quantidades[]", quantidade);
    });

    try {
        const r = await fetch(URL_BAL, { method: "POST", body: form });
        const data = await r.json();

        if (data.erro) {
            console.error('Erro no balanceamento:', data.erro);
            return;
        }

        renderBalanceamento(data);
    } catch (error) {
        console.error('Erro ao calcular balanceamento:', error);
    }
}

function limparBalanceamento() {
    const box = document.getElementById("box-balanceamento");
    box.innerHTML = '<p class="text-muted text-center">Adicione alimentos para calcular o balanceamento nutricional...</p>';
}

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
        const val = parseFloat(balanceamento[n] || 0);
        const classe = val >= 0 ? "text-success" : "text-danger";
        html += `<td class="${classe}">${val.toFixed(2)}</td>`;
    });

    html += `</tr></tbody></table></div>`;

    box.innerHTML = html;
}

function salvarItensNoLocalStorage() {
    const itens = [];
    document.querySelectorAll('#itens-corpo tr[data-id]').forEach(row => {
        const id = row.getAttribute('data-id');
        const nome = row.querySelector('td:first-child').textContent.trim();
        const quantidade = row.querySelector('.quantidade-input').value;
        itens.push({ id, nome, quantidade });
    });
    localStorage.setItem('dietaItens', JSON.stringify(itens));
}

function restaurarItensDoLocalStorage() {
    const itensSalvos = localStorage.getItem('dietaItens');
    if (itensSalvos) {
        const itens = JSON.parse(itensSalvos);
        const tbody = document.getElementById('itens-corpo');
        tbody.innerHTML = '';

        itens.forEach(item => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', item.id);
            tr.innerHTML = `
                <td>${item.nome}</td>
                <td class="text-center">
                    <input type="number" 
                        class="form-control form-control-sm quantidade-input mx-auto"
                        value="${item.quantidade}" 
                        data-id="${item.id}"
                        min="0.01" step="0.01" 
                        style="width: 100px;">
                </td>
                <td>
                    <button type="button" class="btn remover-item" data-id="${item.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}