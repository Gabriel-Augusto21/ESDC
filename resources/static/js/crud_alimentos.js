import {ativar, desativar, atualizar, inserir, exibir_composicao, carregar_composicao, desativar_composicao, ativar_composicao, atualizar_composicao} from './alertas_alimentos.js'

const htmlAtualizacao = document.getElementById('txtAtualizar');
const htmlInsercao = document.getElementById('txtInserir');
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
            
            // pegando o html que esta escondido na alimentos.html
            const clone = htmlAtualizacao;
            clone.removeAttribute('hidden');

            // pegando os elementos clonados
            const select = clone.querySelector('#idClassificacao');
            const nome = clone.querySelector('#txtNome');
            const ms = clone.querySelector('#txtMs');
            const ed = clone.querySelector('#txtEd');
            const pb = clone.querySelector('#txtPb');
            
            // atibuindo valores a esse elementos
            nome.value = alimento.nome;
            ms.value = alimento.ms;
            pb.value = alimento.pb;
            ed.value = alimento.ed;
            select.innerHTML = optionsHtml;

            atualizar(clone, alimento);
        })
    }else if(botao.classList.contains('insert-btn')){
        evento.preventDefault()
            fetch('/classificacoes_json/')
                .then(response => response.json())
                .then(classificacoes => {
                    const optionsHtml = classificacoes.map(n =>
                        `<option value="${n.id}">${n.nome}</option>`).join("");

                    const clone = htmlInsercao.cloneNode(true); // Clonar de fato
                    clone.removeAttribute('hidden');

                    const nomeInput = clone.querySelector('.txtNome'); // Ajuste conforme seletor real

                    clone.querySelectorAll('input').forEach(el => {
                        if (!clone.querySelectorAll('txtNome')) {
                            el.value = 0.00;
                        }
                    });

                    const select = clone.querySelector('#idClassificacao');
                    select.innerHTML = optionsHtml;

                    inserir(clone);

                })
                .catch(error => {
                    console.error('Erro ao carregar classificações:', error);
                    Swal.fire('Erro', 'Não foi possível carregar as classificações.', 'error');
            });
    }else if(botao.classList.contains('composicao-btn')){
        fetch(`/composicao_json/?id=${botao.id}`)
        .then(response => response.json())
        .then(({ alimento, composicao }) => {
            if (composicao && composicao.length > 0) {
                carregar_composicao(composicao, alimento, botao.id)
            } else {
                const html = "Esse alimento não possui nutrientes vinculados!";
                exibir_composicao(composicao, alimento, html, '400px');
            }

        });

    }
});
