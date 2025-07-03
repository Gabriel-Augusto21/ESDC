// 🔔 Inserir Classificação
export function alerta_inserir(btn) {
    Swal.fire({
        title: 'Inserir Classificação',
        html: `<input id="swal-nome" class="form-control" placeholder="Nome da classificação">`,
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
            if (!nome) {
                Swal.showValidationMessage('O nome da classificação é obrigatório!');
                return false;
            }
            return { nome };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { nome } = result.value;
            const url = `${btn.dataset.url}?nome=${encodeURIComponent(nome)}`;
            htmx.ajax('GET', url, {
                swap: 'none',
                target: 'body'
            });
        }
    });
}


// 🔁 Atualizar Classificação
export function alerta_update(btn) {
    const id = btn.dataset.id;
    const tr = btn.closest('tr');
    // const nomeAntigo = tr.querySelector('#txtNome')?.textContent.trim() || '';
    const nomeAntigo = btn.dataset.nome;
    console.log(nomeAntigo)


    Swal.fire({
        title: 'Atualizar Classificação',
        html: `
            <input id="swal-nome" class="form-control" value="${nomeAntigo}">
        `,
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
            const nome = document.getElementById('swal-nome').value.trim();
            if (!nome) {
                Swal.showValidationMessage('O nome da classificação é obrigatório!');
                return false;
            }
            return { nome };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { nome } = result.value;
            const url = `/atualizar_classificacao/?id=${id}&nome=${encodeURIComponent(nome)}`;
            htmx.ajax('GET', url, { 
                swap: 'none',
                error: function(xhr) {
                    console.error('Erro ao atualizar classificação:', xhr.status, xhr.responseText);
                    alert('Erro: ' + xhr.responseText);
                }
            })
                
        }
    });
}


export function alerta_ativar(ativar_btn){
   const url = ativar_btn.dataset.url;
   Swal.fire({
      title: 'Tem certeza que deseja ativar essa classificação?',
      text: "Você poderá desfazer isso mais tarde!",
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
   }).then((result) => {
      if (result.isConfirmed) {
         // Dispara HTMX manualmente
         htmx.ajax('GET', url, {
            swap: 'none'
         });
      }
   });
}
export function alerta_desativar(desativar_btn){
   const url = desativar_btn.dataset.url;
   
   Swal.fire({
      title: 'Tem certeza que deseja desativar essa classificação?',
      text: "Você poderá desfazer isso mais tarde!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2f453a',
      cancelButtonColor: '#ff0000',
      confirmButtonText: 'Sim, desativar!',
      cancelButtonText: 'Cancelar',
      customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
   }).then((result) => {
      if (result.isConfirmed) {
         // Dispara HTMX manualmente
         htmx.ajax('GET', url, {
            swap: 'none'
         });
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
            confirmButtonText: 'Ok',
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
    } else {
      Swal.fire({
         title: 'Erro inesperado',
         text: 'Algo deu errado. Tente novamente mais tarde.',
         icon: 'error',
         confirmButtonColor: '#2f453a',
         confirmButtonText: 'Ok',
         customClass: {
            confirmButton: 'botao-confirma-alerta',
         },
      });
   }
});
