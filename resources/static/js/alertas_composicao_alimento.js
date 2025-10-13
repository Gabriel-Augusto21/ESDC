// 🔔 Inserir Nutriente com alimentos e nutrientes do banco
export function alerta_inserir(btn) {
    fetch('/listar_alimentos_nutrientes/')
        .then(response => response.json())
        .then(data => {
            const alimentosOptions = data.alimentos.map(alimento =>
                `<option value="${alimento.id}">${alimento.nome}</option>`).join('');

            const nutrientesOptions = data.nutrientes.map(nutriente =>
                `<option value="${nutriente.id}">${nutriente.nome}</option>`).join('');

            Swal.fire({
                title: 'Inserir Composição de Alimento',
                html: `
                    <select id="swal-alimento" class="swal2-select">${alimentosOptions}</select>
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
                    const alimento_id = document.getElementById('swal-alimento').value;
                    const nutriente_id = document.getElementById('swal-nutriente').value;
                    const valor = document.getElementById('swal-valor').value.trim();

                    if (!valor) {
                        Swal.showValidationMessage('Informe o valor');
                        return false;
                    }

                    return { alimento_id, nutriente_id, valor };
                }
            }).then(result => {
                if (result.isConfirmed) {
                    const { alimento_id, nutriente_id, valor } = result.value;
                    const url = `${btn.dataset.url}` +
                        `?alimento_id=${encodeURIComponent(alimento_id)}` +
                        `&nutriente_id=${encodeURIComponent(nutriente_id)}` +
                        `&valor=${encodeURIComponent(valor)}`;

                    htmx.ajax('GET', url, { swap: 'none' });
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar alimentos e nutrientes:', error);
            Swal.fire('Erro', 'Não foi possível carregar alimentos e nutrientes.', 'error');
        });
}
// // 🔔 Atualizar Nutriente
// export function alerta_update(btn) {
//     const id = btn.dataset.id;
//     Promise.all([
//         fetch('/listar_alimentos_nutrientes/').then(r => r.json()),
//         fetch(`/get_composicaoAlimento/?id=${id}`).then(r => r.json())
//     ])
//     .then(([listas, composicao]) => {
//         const alimentosOptions = listas.alimentos.map(alimento =>
//             `<option value="${alimento.id}" ${composicao.alimento === alimento.nome ? 'selected' : ''}>${alimento.nome}</option>`
//         ).join('');

//         const nutrientesOptions = listas.nutrientes.map(nutriente =>
//             `<option value="${nutriente.id}" ${composicao.nutriente === nutriente.nome ? 'selected' : ''}>${nutriente.nome}</option>`
//         ).join('');

//         Swal.fire({
//             title: 'Atualizar Composição de Alimento',
//             html: `
//                 <select id="swal-alimento" class="swal2-select">${alimentosOptions}</select>
//                 <select id="swal-nutriente" class="swal2-select">${nutrientesOptions}</select>
//                 <input id="swal-valor" class="swal2-input" placeholder="Valor" value="${composicao.valor || ''}">
//             `,
//             confirmButtonText: 'Atualizar',
//             showCancelButton: true,
//             focusConfirm: false,
//             preConfirm: () => {
//                 const alimentoId = document.getElementById('swal-alimento').value;
//                 const nutrienteId = document.getElementById('swal-nutriente').value;
//                 const valor = document.getElementById('swal-valor').value.trim();
//                 if (!valor) {
//                     Swal.showValidationMessage('Informe o valor');
//                     return false;
//                 }
//                 return { alimentoId, nutrienteId, valor };
//             }
//         }).then(result => {
//             if (result.isConfirmed) {
//                 const { alimentoId, nutrienteId, valor } = result.value;
//                 const url = `/atualizar_composicaoAlimento/?id=${id}` +
//                     `&alimento_id=${encodeURIComponent(alimentoId)}` +
//                     `&nutriente_id=${encodeURIComponent(nutrienteId)}` +
//                     `&valor=${encodeURIComponent(valor)}`;
//                 htmx.ajax('GET', url, { 
//                     swap: 'none'
//                 });
//             }
//         });
//     })
//     .catch(error => {
//         console.error('Erro ao carregar dados:', error);
//         Swal.fire('Erro', 'Não foi possível carregar os dados para edição.', 'error');
//     });
// }
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
        customClass: {
                    confirmButton: 'botao-confirma-alerta',
                    cancelButton: 'botao-cancela-alerta',
                },
        confirmButtonText: 'Sim, ativar',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
    }).then(result => {
        if (result.isConfirmed) {
            htmx.ajax('GET', url, { 
                swap: 'none' 
            });
            Swal.fire({
                title: 'Tudo certo!',
                text: 'Esse nutriente agora está ativo!',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                customClass: {
                    confirmButton: 'botao-confirma-alerta',
                },
            }).then(() => {
               window.location.reload();
            });
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
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
    }).then(result => {
        if (result.isConfirmed) {
            htmx.ajax('GET', url, {
                swap: 'none'
            });
            Swal.fire({
                title: 'Tudo certo!',
                text: 'Esse nutriente agora está inativo!',
                icon: 'success',
                confirmButtonColor: '#3085d6',
            }).then(() => window.location.reload());
        }
    });
}
htmx.on("htmx:afterOnLoad", (event) => {
    try {
        const resp = JSON.parse(event.detail.xhr.response);
        const path = event.detail.requestConfig.path;
        if (resp.Mensagem) {
            if (path.includes('/atualizar_composicaoAlimento') && resp.Mensagem.includes('atualizada com sucesso')) {
                Swal.fire({
                    title: 'Tudo certo!',
                    text: resp.Mensagem,
                    icon: 'success',
                    confirmButtonColor: '#2f453a',
                    customClass: {
                        confirmButton: 'botao-confirma-alerta',
                    },
                }).then(() => window.location.reload());
            } else if (path.includes('/inserir_composicaoAlimento') && resp.Mensagem.includes('inserida com sucesso')) {
                Swal.fire({
                    title: 'Tudo certo!',
                    text: resp.Mensagem,
                    icon: 'success',
                    confirmButtonColor: '#2f453a',
                    customClass: {
                        confirmButton: 'botao-confirma-alerta',
                    },
                }).then(() => window.location.reload());
            }
        }
    } catch {
    }
});
// 🎯 Erros das requisições via htmx
htmx.on("htmx:responseError", (event) => {
    try {
        const status = event.detail.xhr.status;
        const resp = JSON.parse(event.detail.xhr.response);
        if (status === 400 && resp.Mensagem?.includes("já existe")) {
            Swal.fire({
                title: 'Erro!',
                text: resp.Mensagem,
                icon: 'error',
                confirmButtonColor: '#3085d6',
            });
        } else {
            Swal.fire({
                title: 'Erro inesperado',
                text: 'Algo deu errado. Tente novamente mais tarde.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
            });
        }
    } catch {
        Swal.fire({
            title: 'Erro inesperado',
            text: 'Algo deu errado. Tente novamente mais tarde.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
        });
    }
});
