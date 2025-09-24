// composicao_exigencia.js
import { alerta_inserir, alerta_update, alerta_ativar, alerta_desativar } from './alertas_composicao_exigencias.js';

console.log("composicao_exigencia.js carregado"); // confirma carregamento do módulo

document.body.addEventListener('click', function (e) {
    // debug rápido
    const target = e.target.closest('button, a');
    if (target) console.log("clicou em:", target.className, target.dataset);

    const insert_btn = e.target.closest('.insert-btn');
    const update_btn = e.target.closest('.update-btn');
    const ativar_btn = e.target.closest('.ativar-btn');
    const desativar_btn = e.target.closest('.desativar-btn');

    if (insert_btn) {
        e.preventDefault();
        console.log("insert_btn interceptado");
        alerta_inserir(insert_btn);
    }
    if (update_btn) {
        e.preventDefault();
        console.log("update_btn interceptado");
        alerta_update(update_btn);
    }
    if (ativar_btn) {
        e.preventDefault();
        console.log("ativar_btn interceptado");
        alerta_ativar(ativar_btn);
    }
    if (desativar_btn) {
        e.preventDefault();
        console.log("desativar_btn interceptado");
        alerta_desativar(desativar_btn);
    }
});
