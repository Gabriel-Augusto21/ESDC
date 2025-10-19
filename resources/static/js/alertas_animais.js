export function desativar(id, nome) {
    Swal.fire({
        title: 'Tem certeza que deseja desativar esse animal?',
        text: 'Você poderá desfazer isso mais tarde!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#ff0000',
        confirmButtonText: 'Sim, desativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            cancelButton: 'botao-cancela-alerta',
            confirmButton: 'botao-confirma-alerta',
        },
    }).then(result => {
        if (result.isConfirmed) {
            const url = '/desativar_animal/';
            htmx.ajax('GET', url, {
                values: {
                    id: id,
                    nome: nome
                },
                swap: 'none'
            });
        }
    });
}
export function ativar(id, nome) {
    Swal.fire({
        title: 'Tem certeza que deseja ativar esse animal?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#ff0000',
        confirmButtonText: 'Sim, ativar!',
        cancelButtonText: 'Cancelar',
        customClass: {
            cancelButton: 'botao-cancela-alerta',
            confirmButton: 'botao-confirma-alerta',
        },
    }).then(result => {
        if (result.isConfirmed) {
            const url = '/ativar_animal/';
            htmx.ajax('GET', url, {
                values: {
                    id: id,
                    nome: nome
                },
                swap: 'none'
            });
        }
    });
}
// Tratamento das responses
htmx.on("htmx:afterOnLoad", (event) => {
    const resp = JSON.parse(event.detail.xhr.response);
    if (event.detail.xhr.status === 201) {
        if (resp.Mensagem?.includes('inserido')) { 
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
                carregar_composicao(resp.data.composicao, resp.data.alimento);
            });
        }
    }
    if (event.detail.xhr.status === 202) {
        carregar_composicao(resp.data.composicao, resp.data.alimento);
    }  
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