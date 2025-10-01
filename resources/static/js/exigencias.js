import { 
    ativar, 
    desativar, 
    atualizar, 
    inserir, 
    exibir_composicao_exigencia, 
    carregar_composicao_exigencia, 
    desativar_composicao_exigencia, 
    ativar_composicao_exigencia 
} from './alertas_exigencias.js';

document.body.addEventListener('click', function (evento) { 
    const el = evento.target.closest('button, a');
    if (!el) return;
    const linha = el.closest('tr');

    if (el.classList.contains('desativar-btn')) {
        evento.preventDefault();
        desativar(linha);
        return;
    }

    if (el.classList.contains('ativar-btn')) {
        evento.preventDefault();
        ativar(linha);
        return;
    }

    if (el.classList.contains('update-btn')) {
        evento.preventDefault();
        const id = el.id || el.dataset.id || (linha && linha.dataset.id);
        fetch(`/get_exigencia/?id=${id}`)
            .then(resp => resp.json())
            .then(exigencia => {
                fetch('/get_categorias/')
                    .then(resp => resp.json())
                    .then(categorias => {
                        const options = categorias.map(c =>
                            `<option value="${c.id}" ${c.id == exigencia.categoria_id ? 'selected' : ''}>${c.descricao}</option>`
                        ).join('');

                        const html = `
                            <div class="container my-3" style="text-align: start;">
                                <div class="row mb-3">
                                    <div class="col">
                                        <label>Nome da Exigência</label>
                                        <input id="txtNome" class="form-control" type="text" value="${exigencia.nome}">
                                    </div>
                                    <div class="col">
                                        <label>Categoria</label>
                                        <select class="form-control" id="idCategoria">${options}</select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <label>PB (%)</label>
                                        <input id="txtPb" class="form-control" type="text" value="${exigencia.pb}">
                                    </div>
                                    <div class="col">
                                        <label>ED (Mcal)</label>
                                        <input id="txtEd" class="form-control" type="text" value="${exigencia.ed}">
                                    </div>
                                </div>
                            </div>
                        `;

                        atualizar(html, exigencia);
                    });
            });
        return;
    }

    if (el.classList.contains('insert-btn')) {
        evento.preventDefault();
        fetch('/get_categorias/')
            .then(resp => resp.json())
            .then(categorias => {
                const options = categorias.map(c =>
                    `<option value="${c.id}">${c.descricao}</option>`
                ).join('');

                const html = `
                    <div class="container my-3" style="text-align: start;">
                        <div class="row mb-2">
                            <div class="col">
                                <label>Nome da Exigência</label>
                                <input id="txtNome" class="form-control" type="text">
                            </div>
                            <div class="col">
                                <label>Categoria</label>
                                <select class="form-control" id="idCategoria">${options}</select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <label>PB (%)</label>
                                <input id="txtPb" class="form-control" type="text" value="0.00">
                            </div>
                            <div class="col">
                                <label>ED (Mcal)</label>
                                <input id="txtEd" class="form-control" type="text" value="0.00">
                            </div>
                        </div>
                    </div>
                `;

                inserir(html);
            });
        return;
    }

    const href = el.tagName === 'A' ? (el.getAttribute('href') || '') : '';
    if (el.classList.contains('composicao-btn') || href.includes('composicao')) {
        evento.preventDefault();
        const id = el.id || el.dataset.id || (linha && linha.dataset.id);
        if (!id) {
            console.error('id da exigência não encontrado para composicao', el, linha);
            return;
        }

        fetch(`/composicao_exigencia_json/?id=${id}`)
            .then(r => r.json())
            .then(data => {
                if (!data || !data.exigencia || !data.composicao) {
                    console.error('Exigência ou composição não definida!', data);
                    return;
                }
                carregar_composicao_exigencia(data.composicao, data.exigencia);
            })
            .catch(err => {
                console.error('erro ao buscar composicao', err);
            });
        return;
    }
});
