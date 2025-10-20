import {ativar, desativar, atualizar, inserir} from './alertas_animais.js'

const html = document.getElementById('modalInserir');

document.getElementById('inserir-btn').addEventListener('click', () => {
    let clone = html
    clone.removeAttribute('hidden')
    inserir(clone);
});

document.querySelectorAll('.ativar-btn, .desativar-btn, .editar-btn').forEach(btn => {
    btn.addEventListener('click', function (event) {
        event.stopPropagation(); // evita acionar outros cliques no card

        // acha o card pai mais próximo
        const card = this.closest('.card-animal');

        // pega o ID e nome (ou outros dados, se quiser)
        const id = card.dataset.id;
        const nome = card.dataset.nome;

        if (this.classList.contains('desativar-btn')) {
            desativar(id, nome)
        } else if (this.classList.contains('ativar-btn')) {
            ativar(id, nome)
        } else if (this.classList.contains('editar-btn')) {
            atualizar(id,nome)
        }
    });
});
