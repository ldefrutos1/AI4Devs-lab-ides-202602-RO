export type Locale = 'en' | 'es';

export type StringKey =
    | 'app.name'
    | 'a11y.skipToContent'
    | 'nav.dashboard'
    | 'nav.addCandidate'
    | 'nav.logout'
    | 'nav.language'
    | 'login.title'
    | 'login.subtitle'
    | 'login.username'
    | 'login.password'
    | 'login.submit'
    | 'login.error'
    | 'dashboard.title'
    | 'dashboard.welcome'
    | 'dashboard.addCandidateCta'
    | 'dashboard.addCandidateHint'
    | 'dashboard.candidatesCardTitle'
    | 'dashboard.candidatesCardHint'
    | 'dashboard.candidatesEmpty'
    | 'dashboard.candidatesLoadError'
    | 'dashboard.candidatesLoading'
    | 'addCandidate.title'
    | 'addCandidate.subtitle'
    | 'addCandidate.back'
    | 'field.firstName'
    | 'field.lastName'
    | 'field.email'
    | 'field.phone'
    | 'field.address'
    | 'field.institution'
    | 'field.degreeTitle'
    | 'field.startDate'
    | 'field.endDate'
    | 'field.company'
    | 'field.position'
    | 'field.description'
    | 'education.section'
    | 'education.add'
    | 'education.remove'
    | 'education.max'
    | 'work.section'
    | 'work.add'
    | 'work.remove'
    | 'cv.label'
    | 'cv.hint'
    | 'cv.required'
    | 'submit'
    | 'submitting'
    | 'success.title'
    | 'success.addAnother'
    | 'error.network'
    | 'error.server'
    | 'error.validation'
    | 'validation.required'
    | 'validation.email'
    | 'validation.name'
    | 'validation.phone'
    | 'validation.addressLength'
    | 'validation.dateOrder'
    | 'validation.cvType'
    | 'validation.cvSize'
    | 'validation.educationRow'
    | 'validation.workRow';

const STRINGS: Record<Locale, Record<StringKey, string>> = {
    en: {
        'app.name': 'LTI ATS',
        'a11y.skipToContent': 'Skip to main content',
        'nav.dashboard': 'Dashboard',
        'nav.addCandidate': 'Add candidate',
        'nav.logout': 'Log out',
        'nav.language': 'Language',
        'login.title': 'Recruiter sign in',
        'login.subtitle': 'Enter your credentials to access the ATS.',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.submit': 'Sign in',
        'login.error': 'Invalid username or password.',
        'dashboard.title': 'Dashboard',
        'dashboard.welcome': 'Welcome, {name}. Manage candidates and hiring flows from here.',
        'dashboard.addCandidateCta': 'Add new candidate',
        'dashboard.addCandidateHint'
            : 'Register a candidate with contact details, education, work history, and CV.',
        'dashboard.candidatesCardTitle': 'Existing candidates',
        'dashboard.candidatesCardHint': 'Recently registered in this ATS (newest first).',
        'dashboard.candidatesEmpty': 'No candidates yet. Use “Add new candidate” above.',
        'dashboard.candidatesLoadError': 'Could not load the candidate list. Try again later.',
        'dashboard.candidatesLoading': 'Loading candidates…',
        'addCandidate.title': 'Add candidate',
        'addCandidate.subtitle': 'Complete the form. Fields marked with * are required.',
        'addCandidate.back': 'Back to dashboard',
        'field.firstName': 'First name',
        'field.lastName': 'Last name',
        'field.email': 'Email',
        'field.phone': 'Phone (optional)',
        'field.address': 'Address (optional)',
        'field.institution': 'Institution',
        'field.degreeTitle': 'Degree / title',
        'field.startDate': 'Start date',
        'field.endDate': 'End date (optional)',
        'field.company': 'Company',
        'field.position': 'Position',
        'field.description': 'Description (optional)',
        'education.section': 'Education',
        'education.add': 'Add education',
        'education.remove': 'Remove',
        'education.max': 'You can add up to three education entries.',
        'work.section': 'Work experience',
        'work.add': 'Add work experience',
        'work.remove': 'Remove',
        'cv.label': 'CV (PDF or DOCX)',
        'cv.hint': 'Maximum file size 10 MB.',
        'cv.required': 'Please choose a CV file.',
        'submit': 'Save candidate',
        'submitting': 'Saving…',
        'success.title': 'The candidate was added successfully.',
        'success.addAnother': 'Add another candidate',
        'error.network': 'Unable to reach the server. Check your connection and try again.',
        'error.server': 'Something went wrong. Please try again later.',
        'error.validation': 'Please fix the errors below.',
        'validation.required': 'This field is required.',
        'validation.email': 'Enter a valid email address.',
        'validation.name': 'Use letters, spaces, or hyphens only (2–100 characters).',
        'validation.phone': 'Use a valid phone format (max 30 characters).',
        'validation.addressLength': 'Address must be at most 100 characters.',
        'validation.dateOrder': 'End date must be on or after the start date.',
        'validation.cvType': 'Only PDF or DOCX files are allowed.',
        'validation.cvSize': 'File must be 10 MB or smaller.',
        'validation.educationRow': 'Complete all fields in this education row or remove it.',
        'validation.workRow': 'Complete all required fields in this work row or remove it.',
    },
    es: {
        'app.name': 'LTI ATS',
        'a11y.skipToContent': 'Ir al contenido principal',
        'nav.dashboard': 'Panel',
        'nav.addCandidate': 'Añadir candidato',
        'nav.logout': 'Cerrar sesión',
        'nav.language': 'Idioma',
        'login.title': 'Acceso reclutador',
        'login.subtitle': 'Introduce tus credenciales para acceder al ATS.',
        'login.username': 'Usuario',
        'login.password': 'Contraseña',
        'login.submit': 'Entrar',
        'login.error': 'Usuario o contraseña incorrectos.',
        'dashboard.title': 'Panel',
        'dashboard.welcome': 'Hola, {name}. Gestiona candidatos y procesos desde aquí.',
        'dashboard.addCandidateCta': 'Añadir nuevo candidato',
        'addCandidate.subtitle': 'Completa el formulario. Los campos con * son obligatorios.',
        'addCandidate.title': 'Añadir candidato',
        'addCandidate.back': 'Volver al panel',
        'dashboard.addCandidateHint'
            : 'Registra un candidato con datos de contacto, formación, experiencia y CV.',
        'dashboard.candidatesCardTitle': 'Candidatos existentes',
        'dashboard.candidatesCardHint': 'Registrados recientemente en este ATS (más recientes primero).',
        'dashboard.candidatesEmpty': 'Aún no hay candidatos. Usa «Añadir nuevo candidato» arriba.',
        'dashboard.candidatesLoadError': 'No se pudo cargar la lista de candidatos. Inténtalo más tarde.',
        'dashboard.candidatesLoading': 'Cargando candidatos…',
        'field.firstName': 'Nombre',
        'field.lastName': 'Apellidos',
        'field.email': 'Correo electrónico',
        'field.phone': 'Teléfono (opcional)',
        'field.address': 'Dirección (opcional)',
        'field.institution': 'Centro educativo',
        'field.degreeTitle': 'Título / titulación',
        'field.startDate': 'Fecha inicio',
        'field.endDate': 'Fecha fin (opcional)',
        'field.company': 'Empresa',
        'field.position': 'Puesto',
        'field.description': 'Descripción (opcional)',
        'education.section': 'Formación',
        'education.add': 'Añadir formación',
        'education.remove': 'Eliminar',
        'education.max': 'Puedes añadir hasta tres registros de formación.',
        'work.section': 'Experiencia laboral',
        'work.add': 'Añadir experiencia',
        'work.remove': 'Eliminar',
        'cv.label': 'CV (PDF o DOCX)',
        'cv.hint': 'Tamaño máximo 10 MB.',
        'cv.required': 'Selecciona un archivo de CV.',
        'submit': 'Guardar candidato',
        'submitting': 'Guardando…',
        'success.title': 'El candidato se ha añadido correctamente.',
        'success.addAnother': 'Añadir otro candidato',
        'error.network': 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
        'error.server': 'Ha ocurrido un error. Inténtalo de nuevo más tarde.',
        'error.validation': 'Corrige los errores indicados abajo.',
        'validation.required': 'Este campo es obligatorio.',
        'validation.email': 'Introduce un correo válido.',
        'validation.name': 'Usa solo letras, espacios o guiones (2–100 caracteres).',
        'validation.phone': 'Formato de teléfono no válido (máx. 30 caracteres).',
        'validation.addressLength': 'La dirección admite como máximo 100 caracteres.',
        'validation.dateOrder': 'La fecha fin debe ser igual o posterior a la de inicio.',
        'validation.cvType': 'Solo se permiten archivos PDF o DOCX.',
        'validation.cvSize': 'El archivo debe ser de 10 MB o menos.',
        'validation.educationRow': 'Completa todos los campos de esta formación o elimínala.',
        'validation.workRow': 'Completa los campos obligatorios de esta experiencia o elimínala.',
    },
};

export function t(locale: Locale, key: StringKey, vars?: Record<string, string>): string {
    let s = STRINGS[locale][key];
    if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
            s = s.replace(`{${k}}`, v);
        });
    }
    return s;
}
