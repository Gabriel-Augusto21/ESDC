import { ativar, desativar, atualizar, inserir } from './alertas_exigencias.js';

document.body.addEventListener('click', function (evento) { 
    const botao = evento.target.closest('button');
    if (!botao) return;
    const linha = botao.closest('tr');

    if (botao.classList.contains('desativar-btn')) {
        evento.preventDefault();
        desativar(linha);

    } else if (botao.classList.contains('ativar-btn')) {
        evento.preventDefault();
        ativar(linha);

    } else if (botao.classList.contains('update-btn')) {
        evento.preventDefault();
        const id = botao.id;
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

    } else if (botao.classList.contains('insert-btn')) {
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
    }
});
