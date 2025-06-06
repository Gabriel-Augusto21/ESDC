// criei um escutador que espera um evento de click no body
document.body.addEventListener('click', function (evento){ 
    const desativar_btn = evento.target.closest('.desativar-btn');
    const ativar_btn = evento.target.closest('.ativar-btn');
    const atualizar_btn = evento.target.closest('.update-btn');
    if (desativar_btn) {
        evento.preventDefault()
        console.log('Permissão para desativar: ', desativar_btn.dataset.id);
        ativar(desativar_btn)
    }
    if (ativar_btn) {
        evento.preventDefault()
        console.log('Permissão para ativar   : ', ativar_btn.dataset.id);
    }
    if (atualizar_btn) {
        evento.preventDefault()
        console.log('Permissão para atualizar: ', atualizar_btn.dataset.id);
    }
});

function ativar(elemento){
    const url = 'teste'
    Swal.fire({
        icon: 'info',
        confirmButtonColor: ''
    }).then(resp => {
        console.log('Saída: '+url+resp)
    });
}