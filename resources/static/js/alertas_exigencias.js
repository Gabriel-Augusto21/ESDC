export function ativar(elemento){
    Swal.fire({
        title: 'Deseja ativar essa exigência?',
        text: "Você pode desativá-la mais tarde.",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, ativar!',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed) {
            window.acaoExigencia = 'ativar';
            htmx.ajax('POST', '/ativar_exigencia/', {
                values: {
                    id: elemento.dataset.id
                },
                swap: 'none'
            });
        }
    });
}

export function desativar(elemento){
    Swal.fire({
        title: 'Deseja desativar essa exigência?',
        text: "Você pode reativá-la depois.",
        icon: 'warning',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Sim, desativar!',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
    }).then(resp => {
        if (resp.isConfirmed) {
            window.acaoExigencia = 'desativar';
            htmx.ajax('POST', '/desativar_exigencia/', {
                values: {
                    id: elemento.dataset.id
                },
                swap: 'none'
            });
        }
    });
}

export function inserir(html){
    Swal.fire({
        width: '700px',
        title: 'Inserir Exigência',
        html: html,
        confirmButtonText: 'Inserir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const popup = Swal.getPopup();
            const nome = popup.querySelector('#txtNome').value.trim();
            const categoria = popup.querySelector('#idCategoria').value;
            const pb = parseFloat(popup.querySelector('#txtPb').value.replace(',', '.'));
            const ed = parseFloat(popup.querySelector('#txtEd').value.replace(',', '.'));
            if (!nome || isNaN(pb) || isNaN(ed)) {
                Swal.showValidationMessage('Preencha todos os campos corretamente.');
                return false;
            }
            return { nome, pb, ed, categoria };
        }
    }).then(resp => {
        if (resp.isConfirmed) {
            window.acaoExigencia = 'inserir';
            htmx.ajax('POST', '/inserir_exigencia/', {
                values: resp.value,
                swap: 'none'
            });
        }
    });
}

export function atualizar(html, exigencia){
    Swal.fire({
        width: '700px',
        title: 'Atualizar Exigência',
        html: html,
        confirmButtonText: 'Atualizar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#FF0000',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const popup = Swal.getPopup();
            const nome = popup.querySelector('#txtNome').value.trim();
            const categoria = popup.querySelector('#idCategoria').value;
            const pb = parseFloat(popup.querySelector('#txtPb').value.replace(',', '.'));
            const ed = parseFloat(popup.querySelector('#txtEd').value.replace(',', '.'));
            if (!nome || isNaN(pb) || isNaN(ed)) {
                Swal.showValidationMessage('Preencha todos os campos corretamente.');
                return false;
            }
            return { nome, pb, ed, categoria };
        }
    }).then(resp => {
        if (resp.isConfirmed) {
            window.acaoExigencia = 'atualizar';
            htmx.ajax('POST', '/atualizar_exigencia/', {
                values: {
                    id: exigencia.id,
                    nome: resp.value.nome,
                    pb: resp.value.pb,
                    ed: resp.value.ed,
                    categoria: resp.value.categoria
                },
                swap: 'none'
            });
        }
    });
}

htmx.on("htmx:responseError", (event) => {
    event.stopPropagation();
    const status = event.detail.xhr.status;
    let mensagem = 'Erro inesperado.';

    try {
        const resp = JSON.parse(event.detail.xhr.responseText);
        if (resp.Mensagem) mensagem = resp.Mensagem;
    } catch (e) {
        console.error("Erro ao interpretar JSON:", e);
    }

    Swal.fire({
        title: 'Erro!',
        text: mensagem,
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#2f453a',
    });
});


htmx.on("htmx:afterOnLoad", (event) => {
    let resp = {};
    try {
        resp = JSON.parse(event.detail.xhr.response);
    } catch (e) {
        Swal.fire({
            title: 'Erro!',
            text: 'Resposta do servidor não é JSON válida.',
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#2f453a',
        });
        return;
    }

    const mensagem = resp.Mensagem || resp.mensagem || '';

    if (event.detail.xhr.status === 200) {
        if (mensagem.toLowerCase().includes('inserido') || 
            mensagem.toLowerCase().includes('atualizada') ||
            mensagem.toLowerCase().includes('ativada') ||
            mensagem.toLowerCase().includes('ativado') ||
            mensagem.toLowerCase().includes('desativada') ||
            mensagem.toLowerCase().includes('desativado')) {

            Swal.fire({
                title: 'Sucesso!',
                text: mensagem,
                icon: 'success',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#2f453a',
                timer: 3000,
                timerProgressBar: true,
            }).then(() => window.location.reload());

        } else if (mensagem.toLowerCase().includes('já existe') || 
                   mensagem.toLowerCase().includes('já existente')) {

            Swal.fire({
                title: 'Erro!',
                text: mensagem,
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#2f453a',
            });

        } else {
            Swal.fire({
                title: 'Erro inesperado',
                text: mensagem || 'Resposta inesperada do servidor.',
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#2f453a',
            });
        }
    }
});
