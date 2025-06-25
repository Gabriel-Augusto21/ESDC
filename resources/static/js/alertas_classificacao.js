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

            if (nome === nomeAntigo) {
                Swal.fire({
                    title: 'Erro!',
                    text: `O novo nome é igual ao atual. Tente um nome diferente!`,
                    icon: 'error',
                    confirmButtonColor: '#2f453a',
                    customClass: {
                        confirmButton: 'botao-confirma-alerta',
                    },
                });
                return;
            }

            const url = `/atualizar_classificacao/?id=${id}&nome=${encodeURIComponent(nome)}`;

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
                        });
                    }
                });
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
         Swal.fire({
            title: 'Tudo certo!',
            text: `Essa classificacao agora está ativa!`,
            icon: 'success',
            confirmButtonColor: '#2f453a',
         }).then(() => {
            // Redireciona após o usuário fechar o alerta
            window.location.reload();
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
         Swal.fire({
            title: 'Tudo certo!',
            text: `Essa classificacao agora está inativa!`,
            icon: 'success',
            confirmButtonColor: '#2f453a',
         }).then(() => {
            // Redireciona após o usuário fechar o alerta
            window.location.href = '/classificacao/';
         });
      }
   });
}

// Inserção bem sucedida
htmx.on("htmx:afterOnLoad", (event) => {
    const resp = JSON.parse(event.detail.xhr.response);
    if (resp.Mensagem?.includes("inserido com sucesso")) {
        Swal.fire({
            title: 'Sucesso!',
            text: resp.Mensagem,
            icon: 'success',
            confirmButtonColor: '#2f453a',
        }).then(() => {
            window.location.reload();
        });
    }else if(resp.Mensagem.includes('atualizada com sucesso!')) {
        Swal.fire({
            title: 'Tudo certo!',
            text: resp.Mensagem,
            icon: 'success',
            confirmButtonColor: '#2f453a',
            customClass: {
                confirmButton: 'botao-confirma-alerta',
            },
            confirmButtonText: 'Ok',
        }).then(() =>{
            window.location.reload()
        });
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
