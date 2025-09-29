export function ativar(elemento){
    Swal.fire({
        title: 'Deseja ativar essa exigência?',
        text: "Você pode desativá-la mais tarde.",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, ativar!',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed) {
            window.acaoExigencia = 'ativar';
            htmx.ajax('POST', '/ativar_exigencia/', {
                values: {
                    id: elemento.dataset.id
                },
                swap: 'none'
            });
        }
    });
}

export function desativar(elemento){
    Swal.fire({
        title: 'Deseja desativar essa exigência?',
        text: "Você pode reativá-la depois.",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, desativar!',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed) {
            window.acaoExigencia = 'desativar';
            htmx.ajax('POST', '/desativar_exigencia/', {
                values: {
                    id: elemento.dataset.id
                },
                swap: 'none'
            });
        }
    });
}

export function inserir(html){
    Swal.fire({
        width: '700px',
        title: 'Inserir Exigência',
        html: html,
        confirmButtonText: 'Inserir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const popup = Swal.getPopup();
            const nome = popup.querySelector('#txtNome').value.trim();
            const categoria = popup.querySelector('#idCategoria').value;
            const pb = parseFloat(popup.querySelector('#txtPb').value.replace(',', '.'));
            const ed = parseFloat(popup.querySelector('#txtEd').value.replace(',', '.'));
            if (!nome || isNaN(pb) || isNaN(ed)) {
                Swal.showValidationMessage('Preencha todos os campos corretamente.');
                return false;
            }
            return { nome, pb, ed, categoria };
        }
    }).then(resp => {
        if (resp.isConfirmed) {
            window.acaoExigencia = 'inserir';
            htmx.ajax('POST', '/inserir_exigencia/', {
                values: resp.value,
                swap: 'none'
            });
        }
    });
}

export function atualizar(html, exigencia){
    Swal.fire({
        width: '700px',
        title: 'Atualizar Exigência',
        html: html,
        confirmButtonText: 'Atualizar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const popup = Swal.getPopup();
            const nome = popup.querySelector('#txtNome').value.trim();
            const categoria = popup.querySelector('#idCategoria').value;
            const pb = parseFloat(popup.querySelector('#txtPb').value.replace(',', '.'));
            const ed = parseFloat(popup.querySelector('#txtEd').value.replace(',', '.'));
            if (!nome || isNaN(pb) || isNaN(ed)) {
                Swal.showValidationMessage('Preencha todos os campos corretamente.');
                return false;
            }
            return { nome, pb, ed, categoria };
        }
    }).then(resp => {
        if (resp.isConfirmed) {
            window.acaoExigencia = 'atualizar';
            htmx.ajax('POST', '/atualizar_exigencia/', {
                values: {
                    id: exigencia.id,
                    nome: resp.value.nome,
                    pb: resp.value.pb,
                    ed: resp.value.ed,
                    categoria: resp.value.categoria
                },
                swap: 'none'
            });
        }
    });
}

htmx.on("htmx:responseError", (event) => {
    event.stopPropagation();
    const status = event.detail.xhr.status;
    let mensagem = 'Erro inesperado.';

    try {
        const resp = JSON.parse(event.detail.xhr.responseText);
        if (resp.Mensagem) mensagem = resp.Mensagem;
    } catch (e) {
        console.error("Erro ao interpretar JSON:", e);
    }

    Swal.fire({
        title: 'Erro!',
        text: mensagem,
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#2f453a',
    });
});


htmx.on("htmx:afterOnLoad", (event) => {
    let resp = {};
    try {
        resp = JSON.parse(event.detail.xhr.response);
    } catch (e) {
        Swal.fire({
            title: 'Erro!',
            text: 'Resposta do servidor não é JSON válida.',
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
        });
        return;
    }

    const mensagem = resp.Mensagem || resp.mensagem || '';

    if (event.detail.xhr.status === 200) {
        if (mensagem.toLowerCase().includes('inserido') || 
            mensagem.toLowerCase().includes('atualizada') ||
            mensagem.toLowerCase().includes('ativada') ||
            mensagem.toLowerCase().includes('ativado') ||
            mensagem.toLowerCase().includes('desativada') ||
            mensagem.toLowerCase().includes('desativado')) {

            Swal.fire({
                title: 'Sucesso!',
                text: mensagem,
                icon: 'success',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#2f453a',
                timer: 3000,
                timerProgressBar: true,
            }).then(() => window.location.reload());

        } else if (mensagem.toLowerCase().includes('já existe') || 
                   mensagem.toLowerCase().includes('já existente')) {

            Swal.fire({
                title: 'Erro!',
                text: mensagem,
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#2f453a',
            });

        } else {
            Swal.fire({
                title: 'Erro inesperado',
                text: mensagem || 'Resposta inesperada do servidor.',
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#2f453a',
            });
        }
    }
});

export function ativar_composicao_exigencia(composicao, exigencia, id_composicao){
    Swal.fire({
        title: 'Tem certeza que deseja ativar esse nutriente da exigência?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, ativar!',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed){
            const url = `/ativar_composicaoExigencia/`;   
            htmx.ajax('POST', url, {
                values: {
                    id: id_composicao,
                    idExigencia: exigencia.id
                },
                swap:'none'
            });
        } else {
            carregar_composicao_exigencia(composicao, exigencia);
        }
    });
}

export function desativar_composicao_exigencia(composicao, exigencia, id_composicao){
    Swal.fire({
        title: 'Tem certeza que deseja desativar esse nutriente da exigência?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, desativar!',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed){
            const url = `/desativar_composicaoExigencia/`;   
            htmx.ajax('POST', url, {
                values: {
                    id: id_composicao,
                    idExigencia: exigencia.id
                },
                swap:'none'
            });
        } else {
            carregar_composicao_exigencia(composicao, exigencia);
        }
    });
}

export function carregar_composicao_exigencia(composicao, exigencia) {
    if (!exigencia) {
        console.error('Exigência não definida!', composicao, exigencia);
        return;
    }

    const imagemVisibilidade = '/static/img/visibility.png';
    const imagemNVisibilidade = '/static/img/not_visibility.png';

    let dados_composicao = '';
    for (let i = 0; i < composicao.length; i++) {
        if (i % 3 === 0) {
            dados_composicao += `<div class="row mb-3">`;
        }

        const c = composicao[i];
        dados_composicao += `
            <div class="col-12 col-md-4">
                <label class="form-label">
                    ${c.nutriente_nome} (${c.nutriente_unidade})
                </label>
                <div class="d-flex align-items-center">
                    <input class="form-control me-2" type="text" value="${parseFloat(c.valor).toFixed(2)}">
                    ${c.is_active ? `
                        <button class="btn btn-sm desativar-composicao-exigencia-btn" data-id="${c.id}">
                            <img src="${imagemVisibilidade}" width="20">
                        </button>` : `
                        <button class="btn btn-sm ativar-composicao-exigencia-btn" data-id="${c.id}">
                            <img src="${imagemNVisibilidade}" width="20">
                        </button>`}
                </div>
            </div>
        `;

        if ((i % 3 === 2) || (i === composicao.length - 1)) {
            dados_composicao += `</div>`;
        }
    }

    const html = `
        <div class="container my-3" style="text-align: start;">
            <h3 class="text-center fs-3 fw-bold border-bottom pb-2">${exigencia.nome}</h3>
            <div class="row justify-content-end py-3">
                <div class="col-auto">
                    <button id="btn-atualizar-exigencia" class="botao-confirma-alerta">Atualizar</button>
                </div>
            </div>
            ${dados_composicao}
        </div>
    `;

    exibir_composicao_exigencia(composicao, exigencia, html, '700px');
}


export function inserir_composicao_exigencia(composicao, exigencia){
    fetch(`/nutrientes_disponiveis_exigencia_json/?id_composicao=${exigencia.id}`)
    .then(response => response.json())
    .then(nutrientes => {
        const optionsHtml = `<option value="-1" selected>Não selecionado</option>` +
            nutrientes.response.map(n => `<option value="${n.id}">${n.nome}</option>`).join("");

        const htmlInserir = `
            <div class="container my-3">
                <div class="row mb-4">
                    <div class="col-12 col-md-6">
                        <label for="idNutriente" class="form-label">Nome do nutriente</label>
                        <select class="form-control" id="idNutriente">${optionsHtml}</select>
                    </div>
                    <div class="col-12 col-md-6">
                        <label for="txtQuantidade" class="form-label">Quantidade</label>
                        <input id="txtQuantidade" class="form-control" type="text" placeholder="00.00">
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            width: '600px',
            title: 'Adicionar nutriente à exigência',
            html: htmlInserir,
            confirmButtonColor: '#2f453a',
            cancelButtonColor: '#FF0000',
            confirmButtonText: 'Inserir',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            preConfirm: () => {
                const modal = Swal.getPopup();
                const id = modal.querySelector('#idNutriente').value.trim();
                const normalizeNumber = str => str.replace(',', '.');
                const qtd = normalizeNumber(modal.querySelector('#txtQuantidade').value.trim());

                if (isNaN(qtd) || qtd <= 0) {
                    Swal.showValidationMessage('Por favor, insira valores numéricos válidos.');
                    return false;
                } else if (id < 0) {
                    Swal.showValidationMessage('Por favor, escolha um nutriente.');
                    return false;
                }
                return { qtd, id, exigencia };
            }
        }).then(resp => {
            if (resp.isConfirmed) {
                const { qtd, id, exigencia } = resp.value;
                htmx.ajax('POST', '/inserir_composicao_exigencia/', {
                    values: {
                        quantidade: qtd,
                        id_nutriente: id,
                        id_exigencia: exigencia.id
                    },
                    swap: 'none'
                });
            }
        });
    });
}

export function exibir_composicao_exigencia(composicao, exigencia, html, tam){
    Swal.fire({
        width: tam,
        title: 'Composição de Exigência',
        html: html,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Inserir',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        didOpen: () => {
            const container = Swal.getHtmlContainer();
            if (container) {
                container.addEventListener('click', (event) => {
                    const botaoDesativar = event.target.closest('.desativar-composicao-exigencia-btn');
                    const botaoAtivar = event.target.closest('.ativar-composicao-exigencia-btn');
                    if (botaoDesativar) {
                        desativar_composicao_exigencia(composicao, exigencia, botaoDesativar.dataset.id);
                    } else if (botaoAtivar) {
                        ativar_composicao_exigencia(composicao, exigencia, botaoAtivar.dataset.id);
                    }
                });
            }
        }
    }).then(resp => {
        if (resp.isConfirmed) {
            inserir_composicao_exigencia(composicao, exigencia);
        }
    });
}

