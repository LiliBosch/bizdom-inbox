export type Language = 'en' | 'es';

type Translations = Record<string, string>;

export const translations = {
  en: {
    'common.language': 'Language',
    'common.english': 'English',
    'common.spanish': 'Spanish',

    'auth.welcomeTitle': 'Welcome',
    'auth.welcomeSubtitle': 'Sign in to continue.',
    'auth.emailLabel': 'Email',
    'auth.passwordLabel': 'Password',
    'auth.signIn': 'Sign in',
    'auth.signingIn': 'Signing in',
    'auth.signInError': 'Unable to sign in.',

    'theme.toLight': 'Switch to light theme',
    'theme.toDark': 'Switch to dark theme',

    'inbox.searchPlaceholder': 'Search conversations',
    'inbox.unreadOnly': 'Unread',
    'inbox.newMessage': 'New message',
    'inbox.signOut': 'Sign out',
    'inbox.conversationsAria': 'Conversations',

    'list.loadingTitle': 'Loading',
    'list.loadingText': 'Fetching your conversations.',
    'list.emptyTitle': 'No conversations',
    'list.emptyText': 'Create a new message to start a thread.',
    'list.loadMore': 'Load more',
    'list.aria': 'Conversation list',

    'thread.selectTitle': 'Select a conversation',
    'thread.aria': 'Reading and writing area',
    'thread.subjectLabel': 'Message subject',
    'thread.recipientsLabel': 'Recipients',

    'ticketStatus.received': 'Received',
    'ticketStatus.reviewed': 'Opened',
    'ticketStatus.inProgress': 'In progress',
    'ticketStatus.resolved': 'Resolved',
    'ticketStatus.setStatus': 'Set status',
    'ticketStatus.receivedAt': 'Received:',
    'ticketStatus.reviewedAt': 'Opened:',
    'ticketStatus.inProgressAt': 'In progress:',
    'ticketStatus.resolvedAt': 'Resolved:',

    'messageReceipts.delivered': 'Delivered',
    'messageReceipts.read': 'Read',
    'ticketStatus.label': 'Ticket status',

    'composer.placeholder': 'Write your reply',
    'composer.send': 'Send',
    'composer.sending': 'Sending',
    'composer.clearDraft': 'Clear draft',
    'composer.sendError': 'Unable to send your reply.',

    'modal.newMessageTitle': 'New message',
    'modal.close': 'Close modal',
    'modal.subject': 'Subject',
    'modal.to': 'To',
    'modal.loadingContacts': 'Loading contacts',
    'modal.selectedRecipients_one': '{count} recipient selected',
    'modal.selectedRecipients_other': '{count} recipients selected',
    'modal.message': 'Message',
    'modal.cancel': 'Cancel',
    'modal.send': 'Send message',
    'modal.sending': 'Sending',
    'modal.loadRecipientsError': 'Unable to load recipients.',
    'modal.createThreadError': 'Unable to create the thread.',

    'conversation.noMessagesYet': 'No messages yet',
    'conversation.unreadAria': 'Unread',
  },
  es: {
    'common.language': 'Idioma',
    'common.english': 'Ingles',
    'common.spanish': 'Espanol',

    'auth.welcomeTitle': 'Bienvenido',
    'auth.welcomeSubtitle': 'Ingresa tus credenciales para continuar.',
    'auth.emailLabel': 'Correo',
    'auth.passwordLabel': 'Contrasena',
    'auth.signIn': 'Entrar',
    'auth.signingIn': 'Entrando',
    'auth.signInError': 'No fue posible iniciar sesion.',

    'theme.toLight': 'Cambiar a tema claro',
    'theme.toDark': 'Cambiar a tema oscuro',

    'inbox.searchPlaceholder': 'Buscar conversaciones',
    'inbox.unreadOnly': 'No leidos',
    'inbox.newMessage': 'Nuevo mensaje',
    'inbox.signOut': 'Cerrar sesion',
    'inbox.conversationsAria': 'Conversaciones',

    'list.loadingTitle': 'Cargando',
    'list.loadingText': 'Estamos buscando tus conversaciones.',
    'list.emptyTitle': 'Sin conversaciones',
    'list.emptyText': 'Crea un nuevo mensaje para iniciar un hilo.',
    'list.loadMore': 'Cargar mas',
    'list.aria': 'Lista de conversaciones',

    'thread.selectTitle': 'Selecciona una conversacion',
    'thread.aria': 'Area de lectura y redaccion',
    'thread.subjectLabel': 'Asunto del mensaje',
    'thread.recipientsLabel': 'Destinatarios',

    'ticketStatus.received': 'Recibido',
    'ticketStatus.reviewed': 'Abierto',
    'ticketStatus.inProgress': 'En progreso',
    'ticketStatus.resolved': 'Resuelto',
    'ticketStatus.setStatus': 'Cambiar estado',
    'ticketStatus.receivedAt': 'Recibido:',
    'ticketStatus.reviewedAt': 'Abierto:',
    'ticketStatus.inProgressAt': 'En progreso:',
    'ticketStatus.resolvedAt': 'Resuelto:',

    'messageReceipts.delivered': 'Entregado',
    'messageReceipts.read': 'Leído',
    'ticketStatus.label': 'Estado del ticket',

    'composer.placeholder': 'Escribe tu respuesta',
    'composer.send': 'Enviar',
    'composer.sending': 'Enviando',
    'composer.clearDraft': 'Borrar borrador',
    'composer.sendError': 'No fue posible enviar la respuesta.',

    'modal.newMessageTitle': 'Nuevo mensaje',
    'modal.close': 'Cerrar modal',
    'modal.subject': 'Asunto',
    'modal.to': 'Para',
    'modal.loadingContacts': 'Cargando contactos',
    'modal.selectedRecipients_one': '{count} destinatario seleccionado',
    'modal.selectedRecipients_other': '{count} destinatarios seleccionados',
    'modal.message': 'Mensaje',
    'modal.cancel': 'Cancelar',
    'modal.send': 'Enviar mensaje',
    'modal.sending': 'Enviando',
    'modal.loadRecipientsError': 'No fue posible cargar destinatarios.',
    'modal.createThreadError': 'No fue posible crear el hilo.',

    'conversation.noMessagesYet': 'Sin mensajes todavia',
    'conversation.unreadAria': 'No leido',
  },
} as const satisfies Record<Language, Translations>;

export type TranslationKey = keyof typeof translations.en;
