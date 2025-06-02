// 🔔 Inserir Nutriente
export function alerta_inserir(btn) {
    Swal.fire({
        title: 'Inserir Nutriente',
        html: `
            <input id="swal-nome" class="swal2-input" placeholder="Nome">
            <input id="swal-unidade" class="swal2-input" placeholder="Unidade">
            <input id="swal-categoria" class="swal2-input" placeholder="Categoria (opcional)">
        `,
        confirmButtonText: 'Inserir',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const nome = document.getElementById('swal-nome').value.trim();
            const unidade = document.getElementById('swal-unidade').value.trim();
            const categoria = document.getElementById('swal-categoria').value.trim();
            if (!nome || !unidade) {
                Swal.showValidationMessage('Nome e Unidade são obrigatórios');
                return false;
            }
            return { nome, unidade, categoria };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { nome, unidade, categoria } = result.value;
            const url = `${btn.dataset.url}?nome=${encodeURIComponent(nome)}&unidade=${encodeURIComponent(unidade)}&categoria=${encodeURIComponent(categoria)}`;
            htmx.ajax('GET', url, { swap: 'none' });
        }
    });
}

// 🔔 Atualizar Nutriente
export function alerta_update(btn) {
    const id = btn.dataset.id;
    const nome_antigo = btn.dataset.nome;
    const unidade_antiga = btn.dataset.unidade;
    const categoria_antiga = btn.dataset.categoria;

    Swal.fire({
        title: 'Atualizar Nutriente',
        html: `
            <input id="swal-nome" class="swal2-input" placeholder="Nome" value="${nome_antigo}">
            <input id="swal-unidade" class="swal2-input" placeholder="Unidade" value="${unidade_antiga}">
            <input id="swal-categoria" class="swal2-input" placeholder="Categoria" value="${categoria_antiga}">
        `,
        confirmButtonText: 'Atualizar',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const nome = document.getElementById('swal-nome').value.trim();
            const unidade = document.getElementById('swal-unidade').value.trim();
            const categoria = document.getElementById('swal-categoria').value.trim();
            if (!nome || !unidade) {
                Swal.showValidationMessage('Nome e Unidade são obrigatórios');
                return false;
            }
            return { nome, unidade, categoria };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { nome, unidade, categoria } = result.value;
            const url = `/atualizar_nutriente/?id=${id}&nome=${encodeURIComponent(nome)}&unidade=${encodeURIComponent(unidade)}&categoria=${encodeURIComponent(categoria)}`;
            htmx.ajax('GET', url, { swap: 'none' });
        }
    });
}

// 🔒 Ativar Nutriente
export function alerta_ativar(btn) {
    const url = btn.dataset.url;
    Swal.fire({
        title: 'Tem certeza que deseja ativar esse Nutriente?',
        text: 'Você poderá desfazer isso mais tarde!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#32CD32',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, ativar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) {
            htmx.ajax('GET', url, { swap: 'none' });
            Swal.fire({
                title: 'Tudo certo!',
                text: 'Esse nutriente agora está ativo!',
                icon: 'success',
                confirmButtonColor: '#3085d6',
            }).then(() => window.location.reload());
        }
    });
}

// 🔓 Desativar Nutriente
export function alerta_desativar(btn) {
    const url = btn.dataset.url;
    Swal.fire({
        title: 'Tem certeza que deseja desativar esse Nutriente?',
        text: 'Você poderá desfazer isso mais tarde!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FF0000',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, desativar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) {
            htmx.ajax('GET', url, { swap: 'none' });
            Swal.fire({
                title: 'Tudo certo!',
                text: 'Esse nutriente agora está inativo!',
                icon: 'success',
                confirmButtonColor: '#3085d6',
            }).then(() => window.location.reload());
        }
    });
}

// ✅ Respostas de sucesso e erro HTMX
htmx.on("htmx:afterOnLoad", event => {
    const resp = JSON.parse(event.detail.xhr.response);
    Swal.fire({
        title: 'Sucesso!',
        text: resp.mensagem,
        icon: 'success',
    }).then(() => window.location.reload());
});

htmx.on("htmx:responseError", () => {
    Swal.fire({
        title: 'Erro!',
        text: 'Algo deu errado. Verifique os dados e tente novamente.',
        icon: 'error',
    });
});
