import {ativar, desativar, atualizar, inserir, crud_composicao} from './alertas_alimentos.js'
document.body.addEventListener('click', function (evento){ 
    const botao = evento.target.closest('button');
    if (!botao) return;
    const dados = evento.target.closest('tr');
    if (botao.classList.contains('desativar-btn')) {
        evento.preventDefault()
        desativar(dados);
    }else if(botao.classList.contains('ativar-btn')) {
        evento.preventDefault()    
        ativar(dados)
    }else if(botao.classList.contains('update-btn')) {
        evento.preventDefault()
        const id_alimento = botao.id
        fetch(`/alimento_json/?id=${id_alimento}`)
        .then(response => response.json())
        .then(alimento => {
            return fetch('/classificacoes_json/') 
                .then(response => response.json())
                .then(classificacoes => ({ alimento, classificacoes }));
        })
        .then(({ alimento, classificacoes }) => {
            const optionsHtml = classificacoes.map(n => 
                `<option value="${n.id}" ${n.id === parseInt(dados.dataset.idClass) ? 'selected' : ''}>
                    ${n.nome}
                </option>`
            ).join('');
            const modalHtml = `
                <div class="container my-3" style="text-align: start;">
                    <div class="row mb-4">
                        <div class="col" style="text-align: start;">
                            <label for="txtNome" class="form-label">Nome do alimento</label>
                            <input id="txtNome" class="form-control" type="text" placeholder="Nome do alimento" value="${alimento.nome}">
                        </div>
                        <div class="col">
                            <label for="idClassificacao" class="form-label">Classificação</label>
                            <select class="form-control" id="idClassificacao">
                                ${optionsHtml}
                            </select>
                        </div>
                    </div>

                    <div class="row ">
                        <div class="col">
                            <label for="txtMs" class="form-label">Matéria Seca (%)</label>
                            <div class="d-flex align-items-center">
                                <input id="txtMs" class="form-control me-2" type="text" placeholder="Valor" value="${alimento.ms}">
                            </div>
                        </div>
                        <div class="col">
                            <label for="txtEd" class="form-label">Energia Digestiva (Mcal)</label>
                            <div class="d-flex align-items-center">
                                <input id="txtEd" class="form-control me-2" type="text" placeholder="Valor" value="${alimento.ed}">
                            </div>
                        </div>
                        <div class="col">
                            <label for="txtPb" class="form-label">Proteína Bruta (% M.S)</label>
                            <div class="d-flex align-items-center">
                                <input id="txtPb" class="form-control me-2" type="text" placeholder="Valor" value="${alimento.pb}">
                            </div>
                        </div>
                    </div>
                </div>`;
            atualizar(modalHtml, alimento);
        })
    }else if(botao.classList.contains('insert-btn')){
        evento.preventDefault()
        fetch('/classificacoes_json/')
            .then(response => response.json())
            .then(classificacoes => {
                const optionsHtml = classificacoes.map(n =>
                    `<option value="${n.id}">${n.nome}</option>`).join("");
                const modalHtml = `
                    <div class="container my-3" style="text-align: start;">
                    <div class="row mb-4">
                        <div class="col" style="text-align: start;">
                            <label for="txtNome" class="form-label">Nome do alimento</label>
                            <input id="txtNome" class="form-control" type="text" placeholder="Nome do alimento">
                        </div>
                        <div class="col">
                            <label for="idClassificacao" class="form-label">Classificação</label>
                            <select class="form-control" id="idClassificacao">
                                ${optionsHtml}
                            </select>
                        </div>
                    </div>

                    <div class="row ">
                        <div class="col">
                            <label for="txtMs" class="form-label">Matéria Seca (%)</label>
                            <div class="d-flex align-items-center">
                                <input id="txtMs" class="form-control me-2" type="text" placeholder="Valor" value="0.00">
                            </div>
                        </div>
                        <div class="col">
                            <label for="txtEd" class="form-label">Energia Digestiva (Mcal)</label>
                            <div class="d-flex align-items-center">
                                <input id="txtEd" class="form-control me-2" type="text" placeholder="Valor" value="0.00">
                            </div>
                        </div>
                        <div class="col">
                            <label for="txtPb" class="form-label">Proteína Bruta (% M.S)</label>
                            <div class="d-flex align-items-center">
                                <input id="txtPb" class="form-control me-2" type="text" placeholder="Valor" value="0.00">
                            </div>
                        </div>
                    </div>
                </div>`;
                inserir(modalHtml);
            })
            .catch(error => {
                console.error('Erro ao carregar classificações:', error);
                Swal.fire('Erro', 'Não foi possível carregar as classificações.', 'error');
        });
    }else if(botao.classList.contains('composicao-btn')){
        evento.preventDefault()
        fetch(`/composicao_json/?id=${botao.id}`)
        .then(response => response.json())
        .then(({ alimento, composicao }) => {
            if (composicao && composicao.length > 0) {
                let dados_composicao = '';
                for (let i = 0; i < composicao.length; i += 2) {
                    const bloco = `
                        <div class="row mb-3">
                            <div class="col">
                                <label class="form-label">${composicao[i].nutriente_nome}</label>
                                <div class="d-flex align-items-center">
                                    <input class="form-control me-2" type="text" placeholder="Valor" value="${composicao[i].valor}">
                                </div>
                            </div>

                            ${composicao[i + 1] ? `
                            <div class="col">
                                <label class="form-label">${composicao[i + 1].nutriente_nome}</label>
                                <div class="d-flex align-items-center">
                                    <input class="form-control me-2" type="text" placeholder="Valor" value="${composicao[i + 1].valor}">
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    `;
                    dados_composicao += bloco;
                }

                const html = `
                    <div class="container my-3" style="text-align: start;">
                        <h3 class="mb-4 text-center fs-3 fw-bold border-bottom pb-2">${alimento.nome}</h3>
                        ${dados_composicao}
                    </div>
                `;
                crud_composicao(composicao, html);
            } else {
                Swal.fire({
                    icon: 'warning',
                    text: 'Esse alimento ainda não possui nutrientes vinculados',
                    confirmButtonColor: '#2f453a',
                    cancelButtonColor: '#FF0000',
                    confirmButtonText: 'Inserir',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'botao-confirma-alerta',
                        cancelButton: 'botao-cancela-alerta',
                    },
                    showCancelButton: true,
                }).then(resp => {
                    if (resp.isConfirmed) {
                        console.log("Usuário clicou no botao de confirmação");
                    } else {
                        console.log("O usuário deseja cancelar");
                    }
                });
            }
        });

    }
});
