// 🔔 Inserir Composição de Exigência (modelo baseado no alerta de alimento)
export function alerta_inserir(btn) {
    fetch('/listar_exigencias_nutrientes/')
        .then(response => response.json())
        .then(data => {
            const exigenciasOptions = data.exigencias.map(e =>
                `<option value="${e.id}">${e.nome}</option>`).join('');

            const nutrientesOptions = data.nutrientes.map(n =>
                `<option value="${n.id}">${n.nome}</option>`).join('');

            Swal.fire({
                title: 'Inserir Composição de Exigência',
                html: `
                    <select id="swal-exigencia" class="swal2-select">${exigenciasOptions}</select>
                    <select id="swal-nutriente" class="swal2-select">${nutrientesOptions}</select>
                    <input id="swal-valor" class="swal2-input" placeholder="Valor">
                `,
                confirmButtonText: 'Inserir',
                cancelButtonText: 'Cancelar',
                customClass: {
                    confirmButton: 'botao-confirma-alerta',
                    cancelButton: 'botao-cancela-alerta',
                },
                showCancelButton: true,
                focusConfirm: false,
                preConfirm: () => {
                    const exigencia_id = document.getElementById('swal-exigencia').value;
                    const nutriente_id = document.getElementById('swal-nutriente').value;
                    const valor = document.getElementById('swal-valor').value.trim();

                    if (!valor) {
                        Swal.showValidationMessage('Informe o valor');
                        return false;
                    }
                    return { exigencia_id, nutriente_id, valor };
                }
            }).then(result => {
                if (result.isConfirmed) {
                    const { exigencia_id, nutriente_id, valor } = result.value;
                    const url = `${btn.dataset.url}` +
                        `?exigencia_id=${encodeURIComponent(exigencia_id)}` +
                        `&nutriente_id=${encodeURIComponent(nutriente_id)}` +
                        `&valor=${encodeURIComponent(valor)}`;

                    // usa htmx para enviar (mantendo comportamento do seu projeto)
                    htmx.ajax('GET', url, { swap: 'none' });
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar exigencias e nutrientes:', error);
            Swal.fire('Erro', 'Não foi possível carregar exigências e nutrientes.', 'error');
        });
}

// 🔔 Atualizar Composição de Exigência
export function alerta_update(btn) {
    const id = btn.dataset.id;
    Promise.all([
        fetch('/listar_exigencias_nutrientes/').then(r => r.json()),
        fetch(`/get_composicaoExigencia/?id=${id}`).then(r => r.json())
    ])
    .then(([listas, composicao]) => {
        // seleciona pelo id (mais confiável que comparar nomes)
        const exigenciasOptions = listas.exigencias.map(e =>
            `<option value="${e.id}" ${String(composicao.exigencia_id) === String(e.id) ? 'selected' : ''}>${e.nome}</option>`
        ).join('');

        const nutrientesOptions = listas.nutrientes.map(n =>
            `<option value="${n.id}" ${String(composicao.nutriente_id) === String(n.id) ? 'selected' : ''}>${n.nome}</option>`
        ).join('');

        Swal.fire({
            title: 'Atualizar Composição de Exigência',
            html: `
                <select id="swal-exigencia" class="swal2-select">${exigenciasOptions}</select>
                <select id="swal-nutriente" class="swal2-select">${nutrientesOptions}</select>
                <input id="swal-valor" class="swal2-input" placeholder="Valor" value="${composicao.valor ?? ''}">
            `,
            confirmButtonText: 'Atualizar',
            showCancelButton: true,
            focusConfirm: false,
            preConfirm: () => {
                const exigenciaId = document.getElementById('swal-exigencia').value;
                const nutrienteId = document.getElementById('swal-nutriente').value;
                const valor = document.getElementById('swal-valor').value.trim();
                if (!valor) {
                    Swal.showValidationMessage('Informe o valor');
                    return false;
                }
                return { exigenciaId, nutrienteId, valor };
            }
        }).then(result => {
            if (result.isConfirmed) {
                const { exigenciaId, nutrienteId, valor } = result.value;
                const url = `/atualizar_composicaoExigencia/?id=${id}` +
                    `&exigencia_id=${encodeURIComponent(exigenciaId)}` +
                    `&nutriente_id=${encodeURIComponent(nutrienteId)}` +
                    `&valor=${encodeURIComponent(valor)}`;
                htmx.ajax('GET', url, { swap: 'none' });
            }
        });
    })
    .catch(error => {
        console.error('Erro ao carregar dados:', error);
        Swal.fire('Erro', 'Não foi possível carregar os dados para edição.', 'error');
    });
}

// 🔒 Ativar
export function alerta_ativar(btn) {
    const url = btn.dataset.url;
    Swal.fire({
        title: 'Tem certeza que deseja ativar essa composição?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, ativar',
        cancelButtonText: 'Cancelar',
        customClass: { confirmButton: 'botao-confirma-alerta', cancelButton: 'botao-cancela-alerta' },
    }).then(result => {
        if (result.isConfirmed) {
            htmx.ajax('GET', url, { swap: 'none' });
            Swal.fire('Tudo certo!', 'Composição ativada.', 'success').then(() => window.location.reload());
        }
    });
}

// 🔓 Desativar
export function alerta_desativar(btn) {
    const url = btn.dataset.url;
    Swal.fire({
        title: 'Tem certeza que deseja desativar essa composição?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, desativar',
        cancelButtonText: 'Cancelar',
        customClass: { confirmButton: 'botao-confirma-alerta', cancelButton: 'botao-cancela-alerta' },
    }).then(result => {
        if (result.isConfirmed) {
            htmx.ajax('GET', url, { swap: 'none' });
            Swal.fire('Tudo certo!', 'Composição desativada.', 'success').then(() => window.location.reload());
        }
    });
}

// --- handlers HTMX (mesma lógica do alimento, adaptada aos endpoints)
htmx.on("htmx:afterOnLoad", (event) => {
    try {
        const resp = JSON.parse(event.detail.xhr.response);
        const path = event.detail.requestConfig.path;
        if (resp.Mensagem) {
            if (path.includes('/atualizar_composicaoExigencia') && resp.Mensagem.toLowerCase().includes('atualiz')) {
                Swal.fire('Tudo certo!', resp.Mensagem, 'success').then(() => window.location.reload());
            } else if (path.includes('/inserir_composicaoExigencia') && resp.Mensagem.toLowerCase().includes('inser')) {
                Swal.fire('Tudo certo!', resp.Mensagem, 'success').then(() => window.location.reload());
            }
        }
    } catch (e) {
        // silent
    }
});

htmx.on("htmx:responseError", (event) => {
    try {
        const status = event.detail.xhr.status;
        const resp = JSON.parse(event.detail.xhr.response);
        if (status === 400 && resp.Mensagem?.includes("já existe")) {
            Swal.fire('Erro!', resp.Mensagem, 'error');
        } else {
            Swal.fire('Erro inesperado', 'Algo deu errado. Tente novamente mais tarde.', 'error');
        }
    } catch {
        Swal.fire('Erro inesperado', 'Algo deu errado. Tente novamente mais tarde.', 'error');
    }
});
