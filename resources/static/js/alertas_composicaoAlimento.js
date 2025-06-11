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


// Inserção bem sucedida
htmx.on("htmx:afterOnLoad", (event) => {
    const resp = JSON.parse(event.detail.xhr.response);
    const path = event.detail.requestConfig.path;
    
    if (resp.Mensagem) {
        if (path.includes('/atualizar_composicaoAlimento') && resp.Mensagem.includes('atualizado com sucesso')) {
            Swal.fire({
                title: 'Tudo certo!',
                text: resp.Mensagem,
                icon: 'success',
                confirmButtonColor: '#3085d6',
            }).then(() => window.location.reload());
        } else if (path.includes('/inserir_composicaoAlimento') && resp.Mensagem.includes('inserido com sucesso')) {
            Swal.fire({
                title: 'Tudo certo!',
                text: resp.Mensagem,
                icon: 'success',
                confirmButtonColor: '#3085d6',
            }).then(() => window.location.reload());
        } 
    }
});

// Erro de inserção
htmx.on("htmx:responseError", (event) => {
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
});

// 🔔 Atualizar Nutriente
export function alerta_update(btn) {
    const id = btn.dataset.id;
    const alimento_antigo = btn.dataset.nome;
    const nutriente_antigo = btn.dataset.unidade;
    const valor_antigo = btn.dataset.categoria;

    Swal.fire({
        title: 'Atualizar Composição de Alimento',
        html: `
            <input id="swal-nome" class="swal2-input" placeholder="Alimento" value="${alimento_antigo}">
            <input id="swal-unidade" class="swal2-input" placeholder="Nutriente" value="${nutriente_antigo}">
            <input id="swal-categoria" class="swal2-input" placeholder="Valor" value="${valor_antigo}">
        `,
        confirmButtonText: 'Atualizar',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const alimento = document.getElementById('swal-alimento').value.trim();
            const nutriente = document.getElementById('swal-nutriente').value.trim();
            const valor = document.getElementById('swal-valor').value.trim();
            if (!alimento || !nutriente) {
                Swal.showValidationMessage('Alimento e Nutriente são obrigatórios');
                return false;
            }
            return { alimento, nutriente, valor };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { alimento, nutriente, quantidade } = result.value;
           const url = `/atualizar_composicaoAlimento/?id=${id}` +
            `&alimento=${encodeURIComponent(alimento)}` +
            `&nutriente=${encodeURIComponent(nutriente)}` +
            `&valor=${encodeURIComponent(valor)}`;

            htmx.ajax('GET', url, { swap: 'none' })
                .then(response => {
                    const resp = JSON.parse(response.xhr.response);
                    if (resp.Mensagem && resp.Mensagem.includes('atualizado com sucesso')) {
                        Swal.fire({
                            title: 'Tudo certo!',
                            text: resp.Mensagem,
                            icon: 'success',
                            confirmButtonColor: '#3085d6',
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Erro!',
                            text: resp.Mensagem || 'Ocorreu um erro na atualização.',
                            icon: 'error',
                            confirmButtonColor: '#d33',
                        });
                    }
                });
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
               htmx.ajax('GET', url, { 
                  swap: 'none' 
            });
            Swal.fire({
                title: 'Tudo certo!',
                text: 'Esse nutriente agora está ativo!',
                icon: 'success',
                confirmButtonColor: '#3085d6',
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