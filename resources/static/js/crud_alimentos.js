import {ativar, desativar, atualizar, inserir} from './alertas_alimentos.js'
document.body.addEventListener('click', function (evento){ 
    const botao = evento.target.closest('button');
    if (!botao) return;
    const dados = evento.target.closest('tr');
    evento.preventDefault()
    if (botao.classList.contains('desativar-btn')) {
        desativar(dados);
    }else if(botao.classList.contains('ativar-btn')) {
        ativar(dados)
    }else if(botao.classList.contains('update-btn')) {
        console.log(dados.dataset.idClassificacao)
        fetch('/classificacoes_json/')
            .then(response => response.json())
            .then(classificacoes => {
                const optionsHtml = classificacoes.map(n => 
                `<option value="${n.id}" ${n.id == dados.dataset.idClassificacao ? 'selected' : ''}>
                    ${n.nome}
                </option>`).join("");

                const modalHtml = `
                    <div class="container my-3" style="text-align: start;">
                        <div class="row">
                            <div class="container my-3" style="text-align: start;">
                                <label for="txtNomeAlimento" class="form-label">Nome do alimento</label>
                                <input id="txtNomeAlimento" class="form-control" type="text" placeholder="Nome do alimento" value="${dados.dataset.nome}">
                            </div>
                            <div class="col">
                                <label for="idClassificacao" class="form-label">Classificação</label>
                                <select class="form-control" id="idClassificacao">
                                    ${optionsHtml}
                                </select>
                            </div>
                        </div>
                    </div>
                `;
                atualizar(dados, modalHtml)
            })
            .catch(error => {
                console.error('Erro ao carregar classificações:', error);
                Swal.fire('Erro', 'Não foi possível carregar as classificações.', 'error');
        });
    }else if(botao.classList.contains('insert-btn')){
        fetch('/classificacoes_json/')
            .then(response => response.json())
            .then(classificacoes => {
                const optionsHtml = classificacoes.map(n =>
                    `<option value="${n.id}">${n.nome}</option>`).join("");

                const modalHtml = `
                    <div class="container my-3" style="text-align: start;">
                        <div class="row">
                            <div class="col">
                                <label for="txtNomeAlimento" class="form-label">Nome do alimento</label>
                                <input id="txtNomeAlimento" class="form-control" type="text" placeholder="Nome do alimento">
                            </div>
                            <div class="col">
                                <label for="idClassificacao" class="form-label">Classificação</label>
                                <select class="form-control" id="idClassificacao">
                                    ${optionsHtml}
                                </select>
                            </div>
                        </div>
                    </div>
                `;
                inserir(modalHtml);
            })
            .catch(error => {
                console.error('Erro ao carregar classificações:', error);
                Swal.fire('Erro', 'Não foi possível carregar as classificações.', 'error');
        });
    }
});
