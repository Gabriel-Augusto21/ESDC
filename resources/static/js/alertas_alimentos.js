export function ativar(elemento){
    Swal.fire({
        title: 'Tem certeza que deseja ativar esse alimento?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, ativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed) {
            const url = '/ativar_alimento/';
            htmx.ajax('POST', url, {
                values: {
                    id: elemento.dataset.id,
                    nome: elemento.dataset.nome 
                },
                swap: 'none'
            });
        }
    });
}
export function ativar_composicao(composicao, alimento, id_composicao){
    Swal.fire({
        title: 'Tem certeza que deseja ativar esse nutriente da composição?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, ativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed){
            const url = `/ativar_composicaoAlimento/`;   
            htmx.ajax('POST', url,{
                values: {
                    id: id_composicao,
                    idAlimento: alimento.id
                },
                swap:'none'
            });
            // carregar_composicao(composicao, alimento)

        }else{
            carregar_composicao(composicao, alimento)
        }
    });
}
export function desativar(elemento){
    Swal.fire({
        title: 'Tem certeza que deseja desativar esse alimento?',
        html: `<p>Você poderá desfazer isso mais tarde!</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, desativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
    }).then(resp => {
        if (resp.isConfirmed) {
            const url = '/desativar_alimento/';
            htmx.ajax('POST', url, {
                values: {
                    id: elemento.dataset.id,
                    nome: elemento.dataset.nome
                },
                swap: 'none'
            });
        }
    });
}


export function desativar_composicao(composicao, alimento, id_composicao){
    Swal.fire({
        title: 'Tem certeza que deseja desativar esse nutriente da composição?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, desativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed){
            const url = `/desativar_composicaoAlimento/`;   
            htmx.ajax('POST', url,{
                values: {
                    id: id_composicao,
                    idAlimento: alimento.id
                },
                swap:'none'
            });
            // carregar_composicao(composicao, alimento)

        }else{
            carregar_composicao(composicao, alimento)
        }

    });
}
export function atualizar(clone, alimento) {
    Swal.fire({
        width: '700px',
        title: 'Atualizar Alimento',
        html: clone,
        confirmButtonText: 'Atualizar',
        confirmButtonColor: '#2f453a',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#FF0000',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        showCancelButton: true,
        focusConfirm: false,

        didOpen: () => {
            const popup = Swal.getPopup();
            ['#txtMs', '#txtPb', '#txtEd'].forEach(selector => {
                const input = popup.querySelector(selector);
                if (input) {
                    input.dataset.valorOriginal = input.value.trim();

                    input.addEventListener('focus', () => {
                        input.value = '';
                    });

                    input.addEventListener('blur', () => {
                    const normalizeNumber = (str) => str.replace(',', '.');
                    const val = normalizeNumber(input.value.trim());
                    const num = parseFloat(val);

                    // Regras de validação
                    const isEd = selector === '#txtEd';
                    const limite = isEd ? 20 : 100;

                    if (val === '' || isNaN(num) || num > limite) {
                        // Valor inválido: restaura o original
                        input.value = input.dataset.valorOriginal;
                        Swal.showValidationMessage('Por favor, insira valores numéricos válidos, respeitando os limites.');
                        return false;
                    } else {
                        // Valor válido: atualiza o valor original
                        input.dataset.valorOriginal = val;
                        input.value = val;
                    }
                });
                }
            });
        },


        preConfirm: () => {
            const popup = Swal.getPopup();
            const nome = popup.querySelector('#txtNome').value.trim();
            const idClass = popup.querySelector('#idClassificacao').value.trim();

            const normalizeNumber = (str) => str.replace(',', '.');

            const ms = parseFloat(normalizeNumber(popup.querySelector('#txtMs').value.trim()));
            const ed = parseFloat(normalizeNumber(popup.querySelector('#txtEd').value.trim()));
            const pb = parseFloat(normalizeNumber(popup.querySelector('#txtPb').value.trim()));

            if (!nome) {
                Swal.showValidationMessage('O nome do alimento é obrigatório!');
                return false;
            }

            if (isNaN(ms) || isNaN(ed) || isNaN(pb)) {
                Swal.showValidationMessage('Por favor, insira valores numéricos válidos.');
                return false;
            }

            if (ms > 100 || ed > 20 || pb > 100) {
                Swal.showValidationMessage('Por favor, insira valores numéricos válidos.');
                return false;
            }

            return { nome, idClass, ms, ed, pb };
        }

    }).then(resp => {
        if (resp.isConfirmed) {
            const url = '/atualizar_alimento/';
            htmx.ajax('POST', url, {
                values: {
                    nome: resp.value.nome,
                    id: alimento.id,
                    idClass: resp.value.idClass,
                    ms: resp.value.ms,
                    ed: resp.value.ed,
                    pb: resp.value.pb
                },
                swap: 'none',
                error: function(xhr) {
                    console.error('Erro ao atualizar alimento:', xhr.status, xhr.responseText);
                    alert('Erro: ' + xhr.responseText);
                }
            });
        }
    });
}

export function inserir(modalHtml){
    swal.fire({
        width: '800px',
        title: "Inserir Alimento",
        html: modalHtml,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonColor: '#2f453a',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Inserir',
        
        didOpen: () => {
            const popup = Swal.getPopup();
            ['#txtMs', '#txtPb', '#txtEd'].forEach(selector => {
                const input = popup.querySelector(selector);
                if (input) {
                    input.dataset.valorOriginal = input.value.trim();

                    input.addEventListener('focus', () => {
                        input.value = '';
                    });

                    input.addEventListener('blur', () => {
                    const normalizeNumber = (str) => str.replace(',', '.');
                    const val = normalizeNumber(input.value.trim());
                    const num = parseFloat(val);

                    // Regras de validação
                    const isEd = selector === '#txtEd';
                    const limite = isEd ? 20 : 100;

                    if (val === '' || isNaN(num) || num > limite) {
                        // Valor inválido: restaura o original
                        input.value = input.dataset.valorOriginal;
                    } else {
                        // Valor válido: atualiza o valor original
                        input.dataset.valorOriginal = val;
                        input.value = val;
                    }
                });
                }
            });
        },


        preConfirm: () => {
            const popup = Swal.getPopup();
            const nome = popup.querySelector('#txtNome').value.trim();
            const idClass = popup.querySelector('#idClassificacao').value.trim();

            const normalizeNumber = (str) => str.replace(',', '.');

            let ms = parseFloat(normalizeNumber(popup.querySelector('#txtMs').value.trim()));
            let ed = parseFloat(normalizeNumber(popup.querySelector('#txtEd').value.trim()));
            let pb = parseFloat(normalizeNumber(popup.querySelector('#txtPb').value.trim()));
            if (!nome) {
                Swal.showValidationMessage('O nome do alimento é obrigatório!');
                return false;
            }
            
            // Se algum for NaN, atribui 0
            ms = isNaN(ms) ? 0 : ms;
            ed = isNaN(ed) ? 0 : ed;
            pb = isNaN(pb) ? 0 : pb;

            if (ms > 100 || ed > 20 || pb > 100) {
                Swal.showValidationMessage('Por favor, insira valores numéricos válidos.');
                return false;                
            }

            return { nome, idClass, ms, ed, pb };
        }
    }).then((resp) => {
        if (resp.isConfirmed) {
            htmx.ajax('POST', '/inserir_alimento/', {
                values: {
                    nome: resp.value.nome,
                    id_classificacao: resp.value.idClass,
                    ms: resp.value.ms,
                    ed: resp.value.ed,
                    pb: resp.value.pb
                },
                swap: 'none'
            });
        }
    });
}

export function carregar_composicao(composicao, alimento) {
    if (!alimento) {
        console.error('Alimento não definido!', composicao, alimento);
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
                        <button class="btn btn-sm desativar-composicao-btn me-1" data-id="${c.id}">
                            <img src="${imagemVisibilidade}" width="20">
                        </button>` : `
                        <button class="btn btn-sm ativar-composicao-btn me-1" data-id="${c.id}">
                            <img src="${imagemNVisibilidade}" width="20">
                        </button>`}

                    <!-- 🔔 Botão atualizar -->
                    <button class="btn btn-sm atualizar-composicao-btn" data-id="${c.id}">
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
            <h3 class="text-center fs-3 fw-bold border-bottom pb-2">${alimento.nome}</h3>
            <div class="row justify-content-end py-3">
                
            </div>
            ${dados_composicao}
        </div>
    `;

    exibir_composicao(composicao, alimento, html, '900px');
}

export function inserir_composicao(composicao, alimento){
    fetch(`/nutrientes_disponiveis_json/?id_composicao=${alimento.id}`)
    .then(response => response.json())
    .then(nutrientes => {
        const optionsHtml = `<option value="-1" selected>Não selecionado</option>` +
        nutrientes.response.map(n =>
            `<option value="${n.id}">${n.nome}</option>`).join("");
        const htmlInserir = `
            <div class="container my-3" style="text-align: start;">
                <div class="row mb-4">
                    <!-- Nutriente -->
                    <div class="col-12 col-md-6 mb-3 mb-md-0" style="text-align: start;">
                        <label for="idNutriente" class="form-label">Nome do nutriente</label>
                        <select class="form-control" id="idNutriente">
                            ${optionsHtml}
                        </select>
                    </div>
                    <!-- Quantidade -->
                    <div class="col-12 col-md-6">
                        <label for="txtQuantidade" class="form-label">Quantidade</label>
                        <input id="txtQuantidade" class="form-control" type="text" placeholder="00.00">
                    </div>
                </div>
            </div>
        `;
        Swal.fire({
            width: '600px',
            title: `Adicionar nutriente à composição`,
            html: htmlInserir,
            confirmButtonColor: '#2f453a',
            cancelButtonColor: '#FF0000',
            confirmButtonText: 'Inserir',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
                cancelButton: 'botao-cancela-alerta',
            },
            showCancelButton: true,
            preConfirm: () => {
                const modal = Swal.getPopup();
                const id = modal.querySelector('#idNutriente').value.trim();
                const normalizeNumber = (str) => str.replace(',', '.');
                const qtd = normalizeNumber(modal.querySelector('#txtQuantidade').value.trim());
                if (isNaN(qtd)||qtd <= 0) {
                    Swal.showValidationMessage('Por favor, insira valores numéricos válidos.');
                    return false;
                
                }else if (id < 0) {
                    Swal.showValidationMessage('Por favor, escolha um nutriente.');
                    return false;
                }
                return {qtd, id, alimento};
            }
        }).then(resp => {
            if (resp.isConfirmed) {
                const { qtd, id, alimento } = resp.value;
                htmx.ajax('POST', '/inserir_composicao_alimento/', {
                    values: {
                        quantidade: qtd,
                        id_nutriente: id,
                        id_alimento: alimento.id
                    },
                    swap: 'none'
                });
            }
        });
    });
    
}
export function exibir_composicao(composicao, alimento, html, tam) {
    Swal.fire({
        width: tam,
        title: 'Composição Alimentar',
        html: html,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Inserir',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        showCancelButton: true,
        didOpen: () => {
            const container = Swal.getHtmlContainer();
            if (container) {
                container.addEventListener('click', (event) => {
                    const botaoDesativar = event.target.closest('.desativar-composicao-btn');
                    const botaoAtivar = event.target.closest('.ativar-composicao-btn');
                    const botaoAtualizar = event.target.closest('.atualizar-composicao-btn');
                    if (botaoDesativar) {
                        desativar_composicao(composicao, alimento, botaoDesativar.dataset.id);
                    }else if(botaoAtivar){
                        ativar_composicao(composicao, alimento, botaoAtivar.dataset.id);
                    }else if(botaoAtualizar){
                        atualizar_composicao(botaoAtualizar, composicao, alimento);
                    }
                    
                });
            }
        }
    }).then(resp => {
        if (resp.isConfirmed) {
            inserir_composicao(composicao, alimento);
        }
    });
}

// Tratamento das responses
htmx.on("htmx:afterOnLoad", (event) => {
    const resp = JSON.parse(event.detail.xhr.response);
    if (event.detail.xhr.status === 201) {
        if (resp.Mensagem?.includes('inserido')) { 
            Swal.fire({
                title: 'Sucesso!',
                text: resp.Mensagem,
                icon: 'success',
                confirmButtonText: 'Ok',
                timer: 3000,
                timerProgressBar: true,   
                confirmButtonColor: '#2f453a',
                customClass: {
                    confirmButton: 'botao-confirma-alerta',
                },
            }).then(() => {
                carregar_composicao(resp.data.composicao, resp.data.alimento);
            });
        }
    }
    if (event.detail.xhr.status === 202) {
        carregar_composicao(resp.data.composicao, resp.data.alimento);
    }  
    if (event.detail.xhr.status === 200) {
        if (resp.Mensagem?.includes('ativado')) {            
            Swal.fire({
                title: 'Sucesso!',
                text: resp.Mensagem,
                icon: 'success',
                timer: 3000,
                timerProgressBar: true,
                confirmButtonText: 'Ok',   
                confirmButtonColor: '#2f453a',
                customClass: {
                    confirmButton: 'botao-confirma-alerta',
                },
            }).then(() => {
                window.location.reload();
            });
        }else if(resp.Mensagem?.includes('desativado')){
            Swal.fire({
            title: 'Sucesso!',
            text: resp.Mensagem,
            icon: 'success',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
            timer: 3000,
            timerProgressBar: true
        }).then(() => {
            window.location.reload();
        });
        }else if(resp.Mensagem?.includes('atualizado') || resp.Mensagem?.includes('atualizada') || resp.Mensagem?.includes('atualizados')){
            Swal.fire({
            title: 'Sucesso!',
            text: resp.Mensagem,
            icon: 'success',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
            timer: 3000,
            timerProgressBar: true
        }).then(() => {
            window.location.reload();
        });
        }else if (resp.Mensagem?.includes('inserido')) {
            Swal.fire({
                title: 'Sucesso!',
                text: resp.Mensagem,
                icon: 'success',
                confirmButtonText: 'Ok',
                timer: 3000,
                timerProgressBar: true,   
                confirmButtonColor: '#2f453a',
                customClass: {
                    confirmButton: 'botao-confirma-alerta',
                },
            }).then(() => {
                window.location.reload();
            });
        }
    }
});
htmx.on("htmx:responseError", (event) => {
    event.stopPropagation(); // Evita que o erro suba
    const status = event.detail.xhr.status;
    const resp = JSON.parse(event.detail.xhr.response);

    if (status === 400 && resp.Mensagem?.includes("já existente")) {
        Swal.fire({
            title: 'Erro!',
            text: resp.Mensagem,
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
        });
    }else if (status === 400 && resp.Mensagem?.includes("alterado")) {
        Swal.fire({
            title: 'Erro!',
            text: resp.Mensagem,
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
        });
    }
    //Status 401 para icones de informação
    else if (status === 401 && resp.Mensagem?.includes("alterado")) {
    Swal.fire({
        title: 'Informação',
        text: resp.Mensagem,
        icon: 'info',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#2f453a',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
        },
    }).then(() => {
        window.location.reload();
    });
    } else if (status === 401 && resp.Mensagem?.includes("já existe")) {
        Swal.fire({
            title: 'Informação!',
            text: resp.Mensagem,
            icon: 'info',
            confirmButtonColor: '#2f453a',
            confirmButtonText: 'Ok',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
        });
    }  else {
        Swal.fire({
            title: 'Erro inesperado',
            text: 'Algo deu errado. Tente novamente mais tarde.',
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
        });
    }
});

export function atualizar_composicao(botao, composicao, alimento) {
    const id = botao.dataset.id;
    if (!id) {
        Swal.fire('Erro', 'ID da composição ausente no botão.', 'error');
        return;
    }

    fetch(`/get_composicaoAlimento/?id=${id}`)
        .then(resp => {
            if (!resp.ok) throw new Error('Erro ao carregar composição');
            return resp.json();
        })
        .then(comp => {
            Swal.fire({
                title: `Editar valor do nutriente`,
                html: `
                    <input type="hidden" id="comp_id" value="${comp.id}">
                    <div class="mb-3">
                        <label class="form-label">Valor (${comp.nutriente_nome})</label>
                        <input type="number" step="0.01" id="comp_valor" class="form-control" value="${comp.valor}">
                    </div>
                `,
                confirmButtonText: 'Salvar',
                confirmButtonColor: '#2f453a',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: '#FF0000',
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
                    formData.append('alimento_id', comp.alimento_id);   
                    formData.append('nutriente_id', comp.nutriente_id); 

                    console.log('Enviando dados para atualizar:', {
                        id,
                        valor,
                        alimento_id: comp.alimento_id,
                        nutriente_id: comp.nutriente_id
                    });

                    return fetch('/atualizar_composicaoAlimento/', {
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
                        console.error('erro atualizar_composicaoAlimento', err);
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
                            carregar_composicao(result.value.data.composicao, result.value.data.alimento);
                        } else {
                            fetch(`/composicao_json/?id=${comp.alimento_id}`)
                                .then(r => r.json())
                                .then(j => carregar_composicao(j.composicao, j.alimento))
                                .catch(e => {
                                    console.error('Erro ao recarregar composição', e);
                                    carregar_composicao([], alimento);
                                });
                        }
                    });
                } else {
                     carregar_composicao(composicao, alimento)
                }
            });
        })
        .catch(err => {
            console.error('Erro ao carregar composição para edição', err);
            Swal.fire('Erro', 'Falha ao carregar dados da composição.', 'error');
        });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
