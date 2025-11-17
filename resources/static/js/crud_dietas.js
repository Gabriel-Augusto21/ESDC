const htmlInsercao = document.getElementById('txtInserir');

document.body.addEventListener('click', function (evento){ 
    const botao = evento.target.closest('button');
    
    if (!botao) return;
    
    const id = botao.dataset.id;
    const nome = botao.dataset.nome;
    
    if (botao.classList.contains('desativar-btn')) {
        evento.preventDefault();
        desativar(id, nome);
    } else if(botao.classList.contains('ativar-btn')) {
        evento.preventDefault();    
        ativar(id, nome);
    }
});