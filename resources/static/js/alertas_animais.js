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
            titulo: 'Tem certeza que deseja desativar esse animal?',
            texto: 'Você poderá desfazer isso mais tarde!',
            acao: 'desativar',
            url: '/desativar_animal/',
            dados: { id, nome }
        }
    );
}
export function ativar(id, nome) {
    alertaConfirmacao({
        titulo: 'Tem certeza que deseja ativar esse animal?',
        texto: 'Você poderá desfazer isso mais tarde!',
        acao: 'ativar',
        url: '/ativar_animal/',
        dados: { id, nome }
    });
}

export function inserir(html) {
    Swal.fire({
        width: '800px',
        title: 'Inserir Animal',
        html: html,
        confirmButtonText: 'Inserir',
        confirmButtonColor: '#2f453a',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#FF0000',
        showCancelButton: true,
        focusConfirm: false,
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        preConfirm: () => {
            const popup = Swal.getPopup();
            const nome = popup.querySelector('#nomeAnimal')?.value.trim();
            const proprietario = popup.querySelector('#proprietarioAnimal')?.value.trim();
            const peso_vivo = popup.querySelector('#pesoAnimal')?.value.trim();
            const data_nasc = popup.querySelector('#dataNascAnimal')?.value.trim();
            const genero = popup.querySelector('#generoAnimal')?.value.trim();
            const imagem = popup.querySelector('#imagemAnimal')?.files[0];

            if (!nome || !peso_vivo || !data_nasc || !genero) {
                Swal.showValidationMessage('Preencha todos os campos obrigatórios!');
                return false;
            }

            const formData = new FormData();
            formData.append('nome', nome);
            formData.append('proprietario', proprietario);
            formData.append('peso_vivo', peso_vivo);
            formData.append('data_nasc', data_nasc);
            formData.append('genero', genero);
            if (imagem) formData.append('imagem', imagem);

            return fetch('/inserir_animal/', {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRFToken': window.csrf_token },
            })
                .then(response => response.json().then(data => ({ status: response.status, data })))
                .then(result => {
                    if (result.status === 200) {
                        return result.data;
                    } else {
                        Swal.showValidationMessage(result.data.Mensagem || 'Erro ao inserir o animal.');
                    }
                })
                .catch(() => {
                    Swal.showValidationMessage('Erro de conexão com o servidor.');
                });
        }
    }).then(result => {
        if (result.isConfirmed && result.value) {
            Swal.fire({
                title: 'Sucesso!',
                text: result.value.Mensagem,
                icon: 'success',
                confirmButtonColor: '#2f453a',
                timer: 2500,
                timerProgressBar: true,
            }).then(() => {
                window.location.reload();
            });
        }
    });
}


export function atualizar(id, nome, html) {
    Swal.fire({
        width: '850px',
        title: 'Atualizar Animal',
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
        } else if (resp.Mensagem?.includes('atualizado') || resp.Mensagem?.includes('atualizada') || resp.Mensagem?.includes('atualizados')) {
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
        } else if (resp.Mensagem?.includes('inserido')) {
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