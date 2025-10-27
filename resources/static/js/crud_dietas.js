import {ativar, desativar} from './alertas_dietas.js'

const htmlInsercao = document.getElementById('txtInserir');
document.body.addEventListener('click', function (evento){ 
    const botao = evento.target.closest('button');
    const id = botao.dataset.id;
    const nome = botao.dataset.nome;
    if (!botao) return;
    if (botao.classList.contains('desativar-btn')) {
        evento.preventDefault()
        desativar(id, nome);

    }else if(botao.classList.contains('ativar-btn')) {
        evento.preventDefault()    
        ativar(id, nome)
    }
});