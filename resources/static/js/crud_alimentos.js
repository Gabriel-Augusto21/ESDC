import {ativar, desativar, atualizar, inserir, exibir_composicao, carregar_composicao} from './alertas_alimentos.js'
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
                    <!-- Nome do Alimento -->
                    <div class="col-12 col-md-6 mb-3 mb-md-0" style="text-align: start;">
                        <label for="txtNome" class="form-label">Nome do alimento</label>
                        <input id="txtNome" class="form-control" type="text" placeholder="Nome do alimento" value="${alimento.nome}">
                    </div>
                    <div class="col-12 col-md-6">
                        <label for="idClassificacao" class="form-label">Classificação</label>
                        <select class="form-control" id="idClassificacao">
                            ${optionsHtml}
                        </select>
                    </div>
                </div>

                <div class="row ">
                    <div class="col-12 col-md-4 mb-3 mb-md-0">
                        <label for="txtMs" class="form-label">Matéria Seca (%)</label>
                        <div class="d-flex align-items-center">
                            <input id="txtMs" class="form-control" type="text" placeholder="Valor" value="${alimento.ms}">
                        </div>
                    </div>
                    <div class="col-12 col-md-4 mb-3 mb-md-0">
                        <label for="txtEd" class="form-label">Energia Digestiva (Mcal)</label>
                        <div class="d-flex align-items-center">
                            <input id="txtEd" class="form-control" type="text" placeholder="Valor" value="${alimento.ed}">
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <label for="txtPb" class="form-label">Proteína Bruta (% M.S)</label>
                        <div class="d-flex align-items-center">
                            <input id="txtPb" class="form-control" type="text" placeholder="Valor" value="${alimento.pb}">
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
                            <!-- Nome do Alimento -->
                            <div class="col-12 col-md-6 mb-3 mb-md-0" style="text-align: start;">
                                <label for="txtNome" class="form-label">Nome do alimento</label>
                                <input id="txtNome" class="form-control" type="text" placeholder="Nome do alimento">
                            </div>

                            <!-- Classificação -->
                            <div class="col-12 col-md-6">
                                <label for="idClassificacao" class="form-label">Classificação</label>
                                <select class="form-control" id="idClassificacao">
                                    ${optionsHtml}
                                </select>
                            </div>
                        </div>

                        <div class="row">
                            <!-- Matéria Seca -->
                            <div class="col-12 col-md-4 mb-3 mb-md-0">
                                <label for="txtMs" class="form-label">Matéria Seca (%)</label>
                                <input id="txtMs" class="form-control" type="text" placeholder="Valor" value="0.00">
                            </div>

                            <!-- Energia Digestiva -->
                            <div class="col-12 col-md-4 mb-3 mb-md-0">
                                <label for="txtEd" class="form-label">Energia Digestiva (Mcal)</label>
                                <input id="txtEd" class="form-control" type="text" placeholder="Valor" value="0.00">
                            </div>

                            <!-- Proteína Bruta -->
                            <div class="col-12 col-md-4">
                                <label for="txtPb" class="form-label">Proteína Bruta (% M.S)</label>
                                <input id="txtPb" class="form-control" type="text" placeholder="Valor" value="0.00">
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
                carregar_composicao(alimento.id, alimento.nome)
            } else {
                const html = "Esse alimento não possui nutrientes vinculados!";
                exibir_composicao(alimento, html, '400px');
            }

        });

    }
});