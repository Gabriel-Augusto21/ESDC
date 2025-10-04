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

export function ativar_composicao_exigencia(composicao, exigencia, id_composicao) {
    Swal.fire({
        title: 'Tem certeza que deseja ativar esse nutriente da exigência?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, ativar!',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading()
    }).then(resp => {
        if (!resp.isConfirmed) return;

        const formData = new FormData();
        formData.append('id', id_composicao);
        formData.append('idExigencia', exigencia.id);

        fetch('/ativar_composicaoExigencia/', {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            credentials: 'same-origin'
        })
        .then(r => r.json().then(json => ({ ok: r.ok, json })))
        .then(({ ok, json }) => {
            if (!ok) throw json;

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: json.Mensagem || 'Ativado',
                confirmButtonColor: '#2f453a',
                showConfirmButton: true
            }).then(() => {
                if (json.data && json.data.composicao) {
                    carregar_composicao_exigencia(json.data.composicao, json.data.exigencia);
                } else {
                    carregar_composicao_exigencia(composicao, exigencia);
                }
            });
        })
        .catch(err => {
            console.error('erro ativar_composicao_exigencia', err);
            const msg = (err && err.Mensagem) ? err.Mensagem : 'Falha ao ativar a composição.';
            Swal.fire({ icon: 'error', title: 'Erro', text: msg, confirmButtonColor: '#2f453a', showConfirmButton: true });
            carregar_composicao_exigencia(composicao, exigencia);
        });
    });
}

export function desativar_composicao_exigencia(composicao, exigencia, id_composicao) {
    Swal.fire({
        title: 'Tem certeza que deseja desativar esse nutriente da exigência?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, desativar!',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading()
    }).then(resp => {
        if (!resp.isConfirmed) return;

        const formData = new FormData();
        formData.append('id', id_composicao);
        formData.append('idExigencia', exigencia.id);

        fetch('/desativar_composicaoExigencia/', {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            credentials: 'same-origin'
        })
        .then(r => r.json().then(json => ({ ok: r.ok, json })))
        .then(({ ok, json }) => {
            if (!ok) throw json;

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: json.Mensagem || 'Desativado',
                confirmButtonColor: '#2f453a',
                showConfirmButton: true
            }).then(() => {
                if (json.data && json.data.composicao) {
                    carregar_composicao_exigencia(json.data.composicao, json.data.exigencia);
                } else {
                    carregar_composicao_exigencia(composicao, exigencia);
                }
            });
        })
        .catch(err => {
            console.error('erro desativar_composicao_exigencia', err);
            const msg = (err && err.Mensagem) ? err.Mensagem : 'Falha ao desativar a composição.';
            Swal.fire({ icon: 'error', title: 'Erro', text: msg, confirmButtonColor: '#2f453a', showConfirmButton: true });
            carregar_composicao_exigencia(composicao, exigencia);
        });
    });
}


export function carregar_composicao_exigencia(composicao, exigencia) {
    if (!exigencia) {
        console.error('Exigência não definida!', composicao, exigencia);
        return;
    }

    const imagemVisibilidade = '/static/img/visibility.png';
    const imagemNVisibilidade = '/static/img/not_visibility.png';
    const imagemEditar = '/static/img/edit.png'; 

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

                    <!-- Botão ativar/desativar -->
                    ${c.is_active ? `
                        <button class="btn btn-sm desativar-composicao-exigencia-btn me-1" data-id="${c.id}">
                            <img src="${imagemVisibilidade}" width="20">
                        </button>` : `
                        <button class="btn btn-sm ativar-composicao-exigencia-btn me-1" data-id="${c.id}">
                            <img src="${imagemNVisibilidade}" width="20">
                        </button>`}

                    <!-- 🔔 Botão atualizar -->
                    <button class="btn btn-sm atualizar-composicao-exigencia-btn" data-id="${c.id}">
                        <img src="${imagemEditar}" width="20">
                    </button>
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
                
            </div>
            ${dados_composicao}
        </div>
    `;

    exibir_composicao_exigencia(composicao, exigencia, html, '900px');
}

export function inserir_composicao_exigencia(composicao, exigencia) {
    fetch(`/nutrientes_disponiveis_exigencia_json/?id_exigencia=${exigencia.id}`)
    .then(response => {
        if (!response.ok) throw new Error('Falha ao carregar nutrientes disponíveis');
        return response.json();
    })
    .then(nutrientes => {
        const optionsHtml = `<option value="-1" selected>Selecione um nutriente</option>` +
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
            focusConfirm: false,
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const modal = Swal.getPopup();
                const id = modal.querySelector('#idNutriente').value.trim();
                const qtd = modal.querySelector('#txtQuantidade').value.trim().replace(',', '.');

                if (id < 0) {
                    Swal.showValidationMessage('Selecione um nutriente válido.');
                    return false;
                }
                if (isNaN(qtd) || qtd <= 0) {
                    Swal.showValidationMessage('Informe uma quantidade numérica válida.');
                    return false;
                }

                const formData = new FormData();
                formData.append('quantidade', qtd);
                formData.append('id_nutriente', id);
                formData.append('id_exigencia', exigencia.id);

                return fetch('/inserir_composicao_exigencia/', {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-CSRFToken': getCookie('csrftoken') },
                    credentials: 'same-origin'
                })
                .then(r => r.json());
            }
        }).then(result => {
            if (result.isConfirmed && result.value) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: result.value.Mensagem || 'Nutriente adicionado com sucesso.',
                    confirmButtonColor: '#2f453a'
                }).then(() => {
                    carregar_composicao_exigencia(
                        result.value.data?.composicao || composicao,
                        result.value.data?.exigencia || exigencia
                    );
                });
            }
        });
    })
    .catch(err => {
        console.error('Erro ao abrir pop-up de inserção:', err);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível carregar os nutrientes disponíveis para inserção.',
            confirmButtonColor: '#2f453a'
        });
    });
}

export function exibir_composicao_exigencia(composicao, exigencia, html, tam) {
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
                    const botaoAtualizar = event.target.closest('.atualizar-composicao-exigencia-btn');

                    if (botaoDesativar) {
                        desativar_composicao_exigencia(composicao, exigencia, botaoDesativar.dataset.id);
                    } else if (botaoAtivar) {
                        ativar_composicao_exigencia(composicao, exigencia, botaoAtivar.dataset.id);
                    } else if (botaoAtualizar) {
                        alerta_update(botaoAtualizar); 
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

export function alerta_update(botao) {
    const id = botao.dataset.id;
    if (!id) {
        Swal.fire('Erro', 'ID da composição ausente no botão.', 'error');
        return;
    }

    fetch(`/get_composicaoExigencia/?id=${id}`)
        .then(resp => {
            if (!resp.ok) throw new Error('Erro ao carregar composição');
            return resp.json();
        })
        .then(composicao => {
            Swal.fire({
                title: `Editar valor do nutriente`,
                html: `
                    <input type="hidden" id="comp_id" value="${composicao.id}">
                    <div class="mb-3">
                        <label class="form-label">Valor (${composicao.nutriente_nome})</label>
                        <input type="number" step="0.01" id="comp_valor" class="form-control" value="${composicao.valor}">
                    </div>
                `,
                confirmButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading(),
                preConfirm: () => {
                    const id = document.getElementById('comp_id').value;
                    const valor = document.getElementById('comp_valor').value;

                    if (!valor || parseFloat(valor) <= 0) {
                        Swal.showValidationMessage('Informe um valor válido');
                        return false;
                    }

                    const formData = new FormData();
                    formData.append('id', id);
                    formData.append('valor', valor);

                    return fetch('/atualizar_composicaoExigencia/', {
                        method: 'POST',
                        body: formData,
                        headers: { 'X-CSRFToken': getCookie('csrftoken') },
                        credentials: 'same-origin'
                    })
                    .then(r => r.json().then(json => ({ ok: r.ok, json })))
                    .then(({ ok, json }) => {
                        if (!ok) throw json;
                        return json;
                    })
                    .catch(err => {
                        console.error('erro atualizar_composicaoExigencia', err);
                        Swal.showValidationMessage((err && err.Mensagem) ? err.Mensagem : 'Erro ao comunicar com o servidor.');
                        return false;
                    });
                }
            }).then(result => {
                if (result.isConfirmed && result.value) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: result.value.Mensagem,
                        confirmButtonColor: '#2f453a',
                        showConfirmButton: true
                    }).then(() => {
                        if (result.value.data && result.value.data.composicao) {
                            carregar_composicao_exigencia(result.value.data.composicao, result.value.data.exigencia);
                        } else {
                            fetch(`/composicao_exigencia_json/?id=${composicao.exigencia_id}`)
                                .then(r => r.json())
                                .then(j => carregar_composicao_exigencia(j.composicao, j.exigencia))
                                .catch(e => {
                                    console.error('Erro ao recarregar composição', e);
                                    carregar_composicao_exigencia([], composicao);
                                });
                        }
                    });
                }
            });
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Erro', 'Falha ao carregar dados da composição.', 'error');
        });
}

function getCookie(name) {
    let cookieValue = null
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}
//tive que colocar essa função getCookie, que serve para buscar o csrftoken que o django salva nos cookies do navegador
//sem esse token, o servidor não aceita a atualização
//então basicamente, o getCookie pega esse token e envia a requisição de atualização
