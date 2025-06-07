import {ativar, desativar, atualizar} from './alertas_alimentos.js'
document.body.addEventListener('click', function (evento){ 
    const btn_desativar = evento.target.closest('.desativar-btn');
    const btn_ativar = evento.target.closest('.ativar-btn');
    const btn_atualizar = evento.target.closest('.update-btn');
    if (btn_desativar) {
        evento.preventDefault()
        desativar(btn_desativar)
    }
    if (btn_ativar) {
        evento.preventDefault()
        ativar(btn_ativar)
    }
    if (btn_atualizar) {
        evento.preventDefault()
        atualizar(btn_atualizar)
    }
});
