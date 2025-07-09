export function ativar(elemento){
    Swal.fire({
        title: 'Tem certeza que deseja desativar esse alimento?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, ativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed) {
            const url = '/ativar_alimento/';
            htmx.ajax('POST', url, {
                values: {
                    id: elemento.dataset.id,
                    nome: elemento.dataset.nome 
                },
                swap: 'none'
            });
        }
    });
}
export function desativar(elemento){
    Swal.fire({
        title: 'Tem certeza que deseja desativar esse alimento?',
        html: `<p>Você poderá desfazer isso mais tarde!</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, desativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
    }).then(resp => {
        if (resp.isConfirmed) {
            const url = '/desativar_alimento/';
            htmx.ajax('POST', url, {
                values: {
                    id: elemento.dataset.id,
                    nome: elemento.dataset.nome
                },
                swap: 'none'
            });
        }
    });
}
export function atualizar(html, alimento){
    Swal.fire({
        width: '700px',
        title: 'Atualizar Alimento',
        html: html,
        confirmButtonText: 'Atualizar',
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
            const popup = Swal.getPopup();
            const nome = popup.querySelector('#txtNome').value.trim();
            const idClass = popup.querySelector('#idClassificacao').value.trim();
            const normalizeNumber = (str) => str.replace(',', '.');
            const ms = normalizeNumber(popup.querySelector('#txtMs').value.trim());
            const ed = normalizeNumber(popup.querySelector('#txtEd').value.trim());
            const pb = normalizeNumber(popup.querySelector('#txtPb').value.trim());
            if (isNaN(ms) || isNaN(ed) || isNaN(pb)) {
            Swal.showValidationMessage('Por favor, insira valores numéricos válidos.');
            return false;
            }
            if (!nome) {
                Swal.showValidationMessage('O nome do alimento é obrigatório!');
                return false;
            }
            return { nome, idClass, ms, ed, pb};
        }
    }).then(resp => {
        if (resp.isConfirmed) {
            const url = '/atualizar_alimento/';
            htmx.ajax('POST', url, {
                values: {
                    nome: resp.value.nome,
                    id: alimento.id,
                    idClass: resp.value.idClass,
                    ms: resp.value.ms,
                    ed: resp.value.ed,
                    pb: resp.value.pb
                },
                swap: 'none',
                // callback para erros:
                error: function(xhr) {
                    console.error('Erro ao atualizar alimento:', xhr.status, xhr.responseText);
                    alert('Erro: ' + xhr.responseText);
                }
            });
        }
    });
}
export function inserir(modalHtml){
    swal.fire({
        width: '700px',
        title: "Inserir Alimento",
        html: modalHtml,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonColor: '#2f453a',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Inserir',
        preConfirm: () => {
            const popup = Swal.getPopup();
            const nome = popup.querySelector('#txtNome').value.trim();
            const idClass = popup.querySelector('#idClassificacao').value.trim();
            const normalizeNumber = (str) => str.replace(',', '.');
            const ms = normalizeNumber(popup.querySelector('#txtMs').value.trim());
            const ed = normalizeNumber(popup.querySelector('#txtEd').value.trim());
            const pb = normalizeNumber(popup.querySelector('#txtPb').value.trim());
            if (isNaN(ms) || isNaN(ed) || isNaN(pb)) {
                Swal.showValidationMessage('Por favor, insira valores numéricos válidos.');
                return false;
            }
            if (!nome) {
                Swal.showValidationMessage('O nome do alimento é obrigatório!');
                return false;
            }
            return { nome, idClass, ms, ed, pb};
        }
    }).then((resp) => {
        if (resp.isConfirmed) {
            htmx.ajax('POST', '/inserir_alimento/', {
                values: {
                    nome: resp.value.nome,
                    id_classificacao: resp.value.idClass,
                    ms: resp.value.ms,
                    ed: resp.value.ed,
                    pb: resp.value.pb
                },
                swap: 'none'
            });
        }
    });
}
export function crud_composicao(composicao, html){
    Swal.fire({
        width: '700px',
        title: 'Composicao Alimentar',
        html: html,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Inserir',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed) {
            console.log("Usuário clicou no botao de confirmação")
        }else{
            console.log("O usuário deseja cancelar")
        }
    });
}
// Tratamento das responses
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
htmx.on("htmx:responseError", (event) => {
    event.stopPropagation(); // Evita que o erro suba
    const status = event.detail.xhr.status;
    const resp = JSON.parse(event.detail.xhr.response);

    if (status === 400 && resp.Mensagem?.includes("já existente")) {
        Swal.fire({
            title: 'Erro!',
            text: resp.Mensagem,
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
        });
    }else if (status === 400 && resp.Mensagem?.includes("alterado")) {
        Swal.fire({
            title: 'Erro!',
            text: resp.Mensagem,
            icon: 'error',
            confirmButtonText: 'Ok',
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
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
        });
    }
});
