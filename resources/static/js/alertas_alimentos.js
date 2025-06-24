export function ativar(elemento){
    Swal.fire({
        title: 'Tem certeza que deseja ativar essa Alimento?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#32CD32',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, ativar',
        cancelButtonText: 'Cancelar'
    }).then(resp => {
        if (resp.isConfirmed) {
            const url = '/ativar_alimento/';
            console.log("A ativar: ", elemento.dataset.nome);
            htmx.ajax('POST', url, {
                values: {
                    id: elemento.dataset.id,
                    nome: elemento.dataset.nome 
                },
                swap: 'none'
            });
        }else{
            console.log("O usuário deseja cancelar")
        }
    });
}
export function desativar(elemento){
    Swal.fire({
        title: 'Tem certeza que deseja desativar ess Alimento?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FF0000',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, desativar',
        cancelButtonText: 'Cancelar'
    }).then(resp => {
        if (resp.isConfirmed) {
            const url = '/desativar_alimento/';
            console.log("A desativar: ", elemento.dataset.nome);
            htmx.ajax('POST', url, {
                values: {
                    id: elemento.dataset.id,
                    nome: elemento.dataset.nome
                },
                swap: 'none'
            });
        }else{
            console.log("O usuário deseja cancelar");
        }
    });
}
export function atualizar(html, alimento){
    Swal.fire({
        width: '700px',
        title: 'Atualizar Alimento',
        html: html,
        confirmButtonText: 'Atualizar',
        cancelButtonText: 'Cancelar',
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
        }else{
            console.log("O usuário deseja cancelar")
        }
    });
}
export function inserir(modalHtml){
    swal.fire({
        width: '700px',
        title: "Inserir Alimentos",
        html: modalHtml,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonColor: '#32CD32',
        customClass: {
            title: 'titulo-customizado',
            confirmButton: 'botao-confirma-alerta',
        },
        cancelButtonColor: '#3085d6',
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
            console.log(nome, idClass, ms, ed, pb)
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
                confirmButtonColor: '#3085d6'
            }).then(() => {
                window.location.reload();
            });
        }else if(resp.Mensagem?.includes('desativado')){
            Swal.fire({
            title: 'Sucesso!',
            text: resp.Mensagem,
            icon: 'success',
            confirmButtonColor: '#3085d6',
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
            confirmButtonColor: '#3085d6',
            timer: 10000,
            timerProgressBar: true
        }).then(() => {
            window.location.reload();
        });
        }else if (resp.Mensagem?.includes("alterado")) {
        Swal.fire({
            title: 'Erro!',
            text: resp.Mensagem,
            icon: 'error',
            confirmButtonColor: '#3085d6',
        }).then(() => {
            window.location.reload();
        });
        }else if (resp.Mensagem?.includes('inserido')) {
            Swal.fire({
                title: 'Sucesso!',
                text: resp.Mensagem,
                icon: 'success',
                timer: 3000,
                timerProgressBar: true,   
                confirmButtonColor: '#3085d6'
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
            confirmButtonColor: '#3085d6',
        });
    }else if (status === 400 && resp.Mensagem?.includes("alterado")) {
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
