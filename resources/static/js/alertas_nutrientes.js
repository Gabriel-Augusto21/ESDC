// 🔔 Inserir Nutriente
export function alerta_inserir(btn) {
    fetch('/classificacoes_json/')
        .then(response => response.json())
        .then(classificacoes => {
            const optionsHtml = classificacoes.map(n => 
            `<option value="${n.id}" ${n.id === parseInt(btn.dataset.idClass) ? 'selected' : ''}>
                ${n.nome}
            </option>`).join("");

            Swal.fire({
                title: 'Inserir Nutriente',
                html: `
                    <div class="container">
                        <div class="row mb-2">
                            <div class="col-4">
                                <label for="swal-nome" class="form-label">Nome:</label>
                            </div>
                            <div class="col-8">
                                <input id="swal-nome" class="form-control" placeholder="Digite o nome">
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-4">
                                <label for="swal-unidade" class="form-label">Unidade:</label>
                            </div>
                            <div class="col-8">
                                <input id="swal-unidade" class="form-control" placeholder="Digite a unidade">
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-4">
                                <label for="idClassificacao" class="form-label">Classificação:</label>
                            </div>
                            <div class="col-8">
                                <select id="idClassificacao" class="form-control">
                                    ${optionsHtml}
                                </select>
                            </div>
                        </div>
                    </div>
                `,
                
                confirmButtonText: 'Inserir',
                cancelButtonText: 'Cancelar',
                showCancelButton: true,
                focusConfirm: false,
                preConfirm: () => {
                    const nome = document.getElementById('swal-nome').value.trim();
                    const unidade = document.getElementById('swal-unidade').value.trim();
                    const classificacao = document.getElementById('idClassificacao').value.trim();

                    if (!nome || !unidade) {
                        Swal.showValidationMessage('Nome e Unidade são obrigatórios');
                        return false;
                    }
                    return { nome, unidade, classificacao };
                }
            }).then(result => {
                if (result.isConfirmed) {
                    const { nome, unidade, classificacao } = result.value;
                    const url = `${btn.dataset.url}` +
                        `?nome=${encodeURIComponent(nome)}` +
                        `&unidade=${encodeURIComponent(unidade)}` +
                        `&classificacao=${encodeURIComponent(classificacao)}`;

                    htmx.ajax('GET', url, { swap: 'none' });
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar classificações:', error);
            Swal.fire('Erro', 'Não foi possível carregar as classificações.', 'error');
    });

}

// Inserção bem sucedida
htmx.on("htmx:afterOnLoad", (event) => {
    const resp = JSON.parse(event.detail.xhr.response);
    const path = event.detail.requestConfig.path;
    
    if (resp.Mensagem) {
        if (path.includes('/atualizar_nutriente') && resp.Mensagem.includes('atualizado com sucesso')) {
            Swal.fire({
                title: 'Tudo certo!',
                text: resp.Mensagem,
                icon: 'success',
                confirmButtonColor: '#3085d6',
            }).then(() => window.location.reload());
        } else if (path.includes('/inserir_nutriente') && resp.Mensagem.includes('inserido com sucesso')) {
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
    const nome_antigo = btn.dataset.nome;
    const unidade_antiga = btn.dataset.unidade;
    const classificacao_antiga = btn.dataset.classificacao;
    fetch('/classificacoes_json/')
        .then(response => response.json())
        .then(classificacoes => {
            const optionsHtml = classificacoes.map(n => 
            `<option value="${n.id}" ${n.id === parseInt(classificacao_antiga) ? 'selected' : ''}>
                ${n.nome}
            </option>`).join("");

            Swal.fire({
        title: 'Atualizar Nutriente',
        html: `
            <div class="container">
                <div class="row mb-2">
                    <div class="col-4">
                        <label for="swal-nome" class="form-label">Nome:</label>
                    </div>
                    <div class="col-8">
                        <input id="swal-nome" class="form-control" value="${nome_antigo}">
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-4">
                        <label for="swal-unidade" class="form-label">Unidade:</label>
                    </div>
                    <div class="col-8">
                        <input id="swal-unidade" class="form-control" placeholder="Digite a unidade" value="${unidade_antiga}">
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-4">
                        <label for="idClassificacao" class="form-label">Classificação:</label>
                    </div>
                    <div class="col-8">
                        <select id="idClassificacao" class="form-control">
                            ${optionsHtml}
                        </select>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Atualizar',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const nome = document.getElementById('swal-nome').value.trim();
            const unidade = document.getElementById('swal-unidade').value.trim();
            const classificacao = document.getElementById('idClassificacao').value.trim();
            if (!nome || !unidade) {
                Swal.showValidationMessage('Nome e Unidade são obrigatórios');
                return false;
            }
            return { nome, unidade, classificacao };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { nome, unidade, classificacao } = result.value;
           const url = `/atualizar_nutriente/?id=${id}` +
            `&nome=${encodeURIComponent(nome)}` +
            `&unidade=${encodeURIComponent(unidade)}` +
            `&classificacao=${encodeURIComponent(classificacao)}`;

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
        })
        .catch(error => {
            console.error('Erro ao carregar classificações:', error);
            Swal.fire('Erro', 'Não foi possível carregar as classificações.', 'error');
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