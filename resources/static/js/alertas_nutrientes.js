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
                title: 'Inserir Nutriente sss',
                html: `
                    <div class="container my-3" style="text-align: start;">
                        <div class="row mb-4">
                            <!-- Nome do Alimento -->
                            <div class="col">
                                <label for="swal-nome" class="form-label">Nome do Nutriente</label>
                                <input id="swal-nome" class="form-control" type="text" placeholder="Digite o nome do nutriente">
                            </div>
                        </div>
                        <div class="row mb-4">
                            <div class="col">
                                <label for="swal-unidade" class="form-label">Unidade:</label>
                                <input id="swal-unidade" class="form-control" placeholder="Digite a unidade">
                            </div>
                        </div>
                        <div class="row mb-4">
                            <div class="col">
                                <label for="idClassificacao" class="form-label">Classificação:</label>
                                <select id="idClassificacao" class="form-control">
                                    ${optionsHtml}
                                </select>
                            </div>
                        </div>
                    </div>
                `,
                
                confirmButtonText: 'Inserir',
                confirmButtonColor: '#2f453a',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: '#FF0000',
                customClass: {
                    confirmButton: 'botao-confirma-alerta',
                    cancelButton: 'botao-cancela-alerta',
                },
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
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
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
                            confirmButtonColor: '#2f453a',
                                customClass: {
                            confirmButton: 'botao-confirma-alerta',
                            },
                            confirmButtonText: 'Ok',
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Erro!',
                            text: resp.Mensagem || 'Ocorreu um erro na atualização.',
                            icon: 'error',
                            confirmButtonColor: '#2f453a',
                            customClass: {
                                confirmButton: 'botao-confirma-alerta',
                            },
                            confirmButtonText: 'Ok',
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
        title: 'Tem certeza que deseja ativar esse nutriente?',
        text: 'Você poderá desfazer isso mais tarde!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#ff0000',
        confirmButtonText: 'Sim, ativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
    }).then(result => {
        if (result.isConfirmed) {
               htmx.ajax('GET', url, {swap: 'none'});
        }
    });
}
// 🔓 Desativar Nutriente
export function alerta_desativar(btn) {
    const url = btn.dataset.url;
    Swal.fire({
        title: 'Tem certeza que deseja desativar esse nutriente?',
        text: 'Você poderá desfazer isso mais tarde!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '##2f453a',
        cancelButtonColor: '#ff0000',
        confirmButtonText: 'Sim, desativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
    }).then(result => {
        if (result.isConfirmed) {
            htmx.ajax('GET', url, { swap: 'none' });
        }
    });
}
// Inserção bem sucedida
htmx.on("htmx:afterOnLoad", (event) => {
    const resp = JSON.parse(event.detail.xhr.response);
    if (event.detail.xhr.status === 200) {
        if (resp.Mensagem?.includes('ativado')) {            
            Swal.fire({
                title: 'Sucesso!',
                text: resp.Mensagem,
                icon: 'success',
                timer: 3000,
                timerProgressBar: true,
                confirmButtonText: 'Ok',   
                confirmButtonColor: '#2f453a',
                customClass: {
                    confirmButton: 'botao-confirma-alerta',
                },
            }).then(() => {
                window.location.reload();
            });
        }else if(resp.Mensagem?.includes('desativado')){
            Swal.fire({
            title: 'Sucesso!',
            text: resp.Mensagem,
            icon: 'success',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
            timer: 3000,
            timerProgressBar: true
        }).then(() => {
            window.location.reload();
        });
        }else if(resp.Mensagem?.includes('atualizado') || resp.Mensagem?.includes('atualizada') || resp.Mensagem?.includes('atualizados')){
            Swal.fire({
            title: 'Sucesso!',
            text: resp.Mensagem,
            icon: 'success',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
            timer: 3000,
            timerProgressBar: true
        }).then(() => {
            window.location.reload();
        });
        }else if (resp.Mensagem?.includes('inserido')) {
            Swal.fire({
                title: 'Sucesso!',
                text: resp.Mensagem,
                icon: 'success',
                confirmButtonText: 'Ok',
                timer: 3000,
                timerProgressBar: true,   
                confirmButtonColor: '#2f453a',
                customClass: {
                    confirmButton: 'botao-confirma-alerta',
                },
            }).then(() => {
                window.location.reload();
            });
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
         confirmButtonColor: '#2f453a',
         customClass: {
            confirmButton: 'botao-confirma-alerta',
        },
      });
    }
    //Status 401 para icones de informação
    else if (status === 401 && resp.Mensagem?.includes("alterado")) {
    Swal.fire({
        title: 'Informação',
        text: resp.Mensagem,
        icon: 'info',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#2f453a',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
        },
    }).then(() => {
        window.location.reload();
    });
    } else if (status === 401 && resp.Mensagem?.includes("já existe")) {
        Swal.fire({
            title: 'Informação!',
            text: resp.Mensagem,
            icon: 'info',
            confirmButtonColor: '#2f453a',
            confirmButtonText: 'Ok',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
        });
    }  else {
        Swal.fire({
            title: 'Erro inesperado',
            text: 'Algo deu errado. Tente novamente mais tarde.',
            icon: 'error',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
            confirmButtonText: 'Ok',
        });
    }
});