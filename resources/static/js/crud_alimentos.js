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
        atualizar(dados)
    }else if(botao.classList.contains('insert-btn')){ // agora é um array real
        inserir(modalHtml);
    }
});
// Corpo do modal
let optionsHtml = classificacoes.map(n => `<option value="${n.nome}">${n.nome}</option>`).join("");
const modalHtml = `
    <div class="container my-5" style="text-align: start;">
        <div class="row">
            <div class="col">
                <label for="txtNomeAlimento" class="form-label" >Selecione o nutriente</label>
                <input id="txtNomeAlimento" class="form-control" type="text" placeholder="Nome do alimento">
            </div>
            <div class="col">
                <label for="floatingSelect">Classificação</label>
                <select class="form-control" id="floatingSelect">
                    <option value="Sem classificacao">Escolher mais tarde</option>
                    ${optionsHtml}
                </select>
            </div>
        </div>
    </div>
`;

