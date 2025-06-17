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
export function atualizar(elemento, html){
    const idAlimento = elemento.dataset.id;
    Swal.fire({
        title: 'Atualizar Alimento',
        html: html,
        confirmButtonText: 'Atualizar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const nome = document.getElementById('txtNomeAlimento').value.trim();
            const idClass = document.getElementById('idClassificacao').value.trim();
            if (!nome) {
                Swal.showValidationMessage('O nome do alimento é obrigatório!');
                return false;
            }
            console.log(idAlimento, nome, idClass)
            return { nome, idClass};
        }
    }).then(resp => {
        if (resp.isConfirmed) {
            console.log("A atualizar: ", resp.value.nome);
            const url = '/atualizar_alimento/';
            htmx.ajax('POST', url, {
                values: {
                    nome: resp.value.nome,
                    id: idAlimento,
                    idClass: resp.value.idClass
                },
                swap: 'none'
            });
        }else{
            console.log("O usuário deseja cancelar")
        }
    });
}
export function inserir(classificacoes, modalHtml){
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
            const nome = document.getElementById('txtNomeAlimento').value.trim();
            const classificacao = document.getElementById('idClassificacao').value.trim();
            if (!nome) {
                Swal.showValidationMessage('O nome do alimento é obrigatório!');
                return false;
            }
            return { nome, classificacao };
        }
    }).then((resp) => {
        if (resp.isConfirmed) {
            htmx.ajax('POST', '/inserir_alimento/', {
                values: {
                    nome: resp.value.nome,
                    id_classificacao: resp.value.classificacao
                },
                swap: 'none'
            });
        } else {
            console.log("O usuário cancelou a ação");
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
    }else if (status === 400 && resp.Mensagem?.includes("inalterados")) {
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
