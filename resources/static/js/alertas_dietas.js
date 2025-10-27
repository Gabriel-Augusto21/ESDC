function alertaConfirmacao({ titulo, texto, acao, url, dados }) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#ff0000',
        confirmButtonText: `Sim, ${acao}!`,
        cancelButtonText: 'Cancelar',
        customClass: {
            cancelButton: 'botao-cancela-alerta',
            confirmButton: 'botao-confirma-alerta',
        },
    }).then(result => {
        if (result.isConfirmed) {
            console.log(dados)
            htmx.ajax('GET', url, {
                values: dados,
                swap: 'none'
            });
        }
    });
}

export function desativar(id, nome) {
    alertaConfirmacao(
        {
            titulo: 'Tem certeza que deseja desativar esse dieta?',
            texto: 'Você poderá desfazer isso mais tarde!',
            acao: 'desativar',
            url: '/desativar_dieta/',
            dados: { id, nome }
        }
    );
}
export function ativar(id, nome) {
    alertaConfirmacao({
        titulo: 'Tem certeza que deseja ativar essa dieta?',
        texto: 'Você poderá desfazer isso mais tarde!',
        acao: 'ativar',
        url: '/ativar_dieta/',
        dados: { id, nome }
    });
}

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
        } else if (resp.Mensagem?.includes('desativado')) {
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
        } 
    }
});