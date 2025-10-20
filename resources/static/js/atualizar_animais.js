import { ativar, desativar, atualizar, inserir } from './alertas_animais.js'

const html = document.getElementById('modalInserir');
const htmlAtualizar = document.getElementById('modalAtualizar');
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
            let clone = htmlAtualizar;
            clone.removeAttribute('hidden')
            let imagem = clone.querySelector('#idVisual');
            imagem.src = card.dataset.imagem;
            let nomeInput = clone.querySelector('#txtNome');
            nomeInput.value = nome;
            let proprietarioInput = clone.querySelector('#txtProprietario');
            proprietarioInput.value = card.dataset.proprietario;
            let generoInput = clone.querySelector('#txtGenero');
            generoInput.value = card.dataset.genero;
            let idadeInput = htmlAtualizar.querySelector('#dataNasc');
            const raw = card.dataset.idade; // ex: "19 de Fevereiro de 2018"
            if (idadeInput) {
                idadeInput.value = textoParaIsoDate(raw); // agora funciona no input[type=date]
            }

            atualizar(id, nome, clone)
        }
    });
});

function textoParaIsoDate(str) {
    if (!str) return '';

    const meses = {
        janeiro: '01', fevereiro: '02', março: '03', abril: '04',
        maio: '05', junho: '06', julho: '07', agosto: '08',
        setembro: '09', outubro: '10', novembro: '11', dezembro: '12'
    };

    // separa a string
    const partes = str.toLowerCase().split(' '); // ["19", "de", "fevereiro", "de", "2018"]
    
    if (partes.length >= 5) {
        const dia = partes[0].padStart(2, '0');
        const mes = meses[partes[2]];
        const ano = partes[4];
        if (mes) {
            return `${ano}-${mes}-${dia}`;
        }
    }

    return ''; // fallback se não conseguir converter
}