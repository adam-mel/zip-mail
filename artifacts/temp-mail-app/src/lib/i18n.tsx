import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'fr' | 'es' | 'pt' | 'de';

type Copy = {
  brand: string;
  brandTag: string;
  language: string;
  createTitle: string;
  createBody: string;
  createButton: string;
  createAnother: string;
  chooseExpiry: string;
  privacyNote: string;
  noTracking: string;
  messages: string;
  message: string;
  inbox: string;
  inboxReady: string;
  expires: string;
  archivedUntil: string;
  created: string;
  refresh: string;
  refreshed: string;
  share: string;
  copied: string;
  copyAddress: string;
  copyLink: string;
  rotate: string;
  rotateTitle: string;
  rotateBody: string;
  rotateButton: string;
  cancel: string;
  close: string;
  emptyTitle: string;
  emptyBody: string;
  waiting: string;
  loading: string;
  loadError: string;
  retry: string;
  archivedTitle: string;
  archivedBody: string;
  deletedTitle: string;
  deletedBody: string;
  readOnly: string;
  from: string;
  received: string;
  selectMessage: string;
  textVersion: string;
  htmlVersion: string;
  noHtml: string;
  newInbox: string;
  oneHour: string;
  sixHours: string;
  oneDay: string;
  threeDays: string;
  sevenDays: string;
  footer: string;
  secure: string;
  live: string;
  archive: string;
  unavailable: string;
  addressCopied: string;
  linkCopied: string;
  restored: string;
  creating: string;
  rotating: string;
};

const copies: Record<Language, Copy> = {
  en: {
     brand: 'ZipMail',
    brandTag: 'temporary mail, quietly',
    language: 'Language',
    createTitle: 'A private address, on your terms.',
    createBody: 'Get a working inbox in one click. Choose how long it stays, then let it disappear when you are done.',
    createButton: 'Create private inbox',
    createAnother: 'Create a new inbox',
    chooseExpiry: 'Keep it for',
    privacyNote: 'No account. No marketing trail. Your inbox is only as temporary as you decide.',
    noTracking: 'No account required',
    messages: 'messages',
    message: 'message',
    inbox: 'Inbox',
    inboxReady: 'Your inbox is ready',
    expires: 'Expires',
    archivedUntil: 'Archive available until',
    created: 'Created',
    refresh: 'Check for mail',
    refreshed: 'Up to date',
    share: 'Share',
    copied: 'Copied',
    copyAddress: 'Copy address',
    copyLink: 'Copy inbox link',
    rotate: 'Rotate address',
    rotateTitle: 'Start a fresh address',
    rotateBody: 'Your current inbox will move to read-only archive. Choose how long the new address should live.',
    rotateButton: 'Rotate and continue',
    cancel: 'Cancel',
    close: 'Close',
    emptyTitle: 'Nothing here yet',
    emptyBody: 'Keep this tab open. New messages will appear here as soon as they arrive.',
    waiting: 'Listening for new mail',
    loading: 'Opening your private inbox',
    loadError: 'This inbox could not be opened.',
    retry: 'Try again',
    archivedTitle: 'This inbox has closed',
    archivedBody: 'The address no longer receives mail. Messages are kept below as a read-only archive.',
    deletedTitle: 'This inbox is no longer available',
    deletedBody: 'The archive window has ended, so its contents were permanently removed.',
    readOnly: 'Read-only archive',
    from: 'From',
    received: 'Received',
    selectMessage: 'Choose a message to read',
    textVersion: 'Text',
    htmlVersion: 'Rich view',
    noHtml: 'No rich version was included with this message.',
    newInbox: 'New inbox',
    oneHour: '1 hour',
    sixHours: '6 hours',
    oneDay: '24 hours',
    threeDays: '3 days',
    sevenDays: '7 days',
    footer: 'A small utility for moments that need a little privacy.',
    secure: 'Private by default',
    live: 'Live',
    archive: 'Archived',
    unavailable: 'Unavailable',
    addressCopied: 'Address copied',
    linkCopied: 'Inbox link copied',
    restored: 'Your previous inbox was restored',
    creating: 'Creating your address…',
    rotating: 'Rotating address…',
  },
  fr: {
     brand: 'ZipMail', brandTag: 'e-mail temporaire, en toute discrétion', language: 'Langue',
    createTitle: 'Une adresse privée, selon vos règles.', createBody: 'Obtenez une boîte de réception fonctionnelle en un clic. Choisissez sa durée, puis laissez-la disparaître.', createButton: 'Créer une boîte privée', createAnother: 'Créer une nouvelle boîte', chooseExpiry: 'La garder pendant', privacyNote: 'Pas de compte. Pas de trace marketing. Votre boîte ne dure que le temps choisi.', noTracking: 'Sans compte', messages: 'messages', message: 'message', inbox: 'Boîte de réception', inboxReady: 'Votre boîte est prête', expires: 'Expire', archivedUntil: 'Archive disponible jusqu’au', created: 'Créée', refresh: 'Vérifier les e-mails', refreshed: 'À jour', share: 'Partager', copied: 'Copié', copyAddress: 'Copier l’adresse', copyLink: 'Copier le lien', rotate: 'Changer d’adresse', rotateTitle: 'Commencer avec une nouvelle adresse', rotateBody: 'Votre boîte actuelle passera en archive en lecture seule. Choisissez la durée de la nouvelle adresse.', rotateButton: 'Changer et continuer', cancel: 'Annuler', close: 'Fermer', emptyTitle: 'Rien pour le moment', emptyBody: 'Gardez cet onglet ouvert. Les nouveaux messages apparaîtront dès leur arrivée.', waiting: 'En attente de nouveaux e-mails', loading: 'Ouverture de votre boîte privée', loadError: 'Cette boîte ne peut pas être ouverte.', retry: 'Réessayer', archivedTitle: 'Cette boîte est fermée', archivedBody: 'Cette adresse ne reçoit plus de messages. Les messages restent accessibles en lecture seule.', deletedTitle: 'Cette boîte n’est plus disponible', deletedBody: 'La période d’archive est terminée et son contenu a été supprimé.', readOnly: 'Archive en lecture seule', from: 'De', received: 'Reçu', selectMessage: 'Choisissez un message à lire', textVersion: 'Texte', htmlVersion: 'Version riche', noHtml: 'Aucune version riche pour ce message.', newInbox: 'Nouvelle boîte', oneHour: '1 heure', sixHours: '6 heures', oneDay: '24 heures', threeDays: '3 jours', sevenDays: '7 jours', footer: 'Un petit outil pour les moments qui demandent un peu d’intimité.', secure: 'Privé par défaut', live: 'Active', archive: 'Archivée', unavailable: 'Indisponible', addressCopied: 'Adresse copiée', linkCopied: 'Lien copié', restored: 'Votre boîte précédente a été restaurée', creating: 'Création de votre adresse…', rotating: 'Changement d’adresse…',
  },
  es: {
     brand: 'ZipMail', brandTag: 'correo temporal, sin ruido', language: 'Idioma',
    createTitle: 'Una dirección privada, bajo tus reglas.', createBody: 'Obtén una bandeja funcional en un clic. Elige cuánto tiempo permanece y deja que desaparezca cuando termines.', createButton: 'Crear bandeja privada', createAnother: 'Crear una bandeja nueva', chooseExpiry: 'Conservar durante', privacyNote: 'Sin cuenta. Sin rastro comercial. Tu bandeja dura solo lo que decidas.', noTracking: 'No requiere cuenta', messages: 'mensajes', message: 'mensaje', inbox: 'Bandeja de entrada', inboxReady: 'Tu bandeja está lista', expires: 'Caduca', archivedUntil: 'Archivo disponible hasta', created: 'Creada', refresh: 'Buscar correo', refreshed: 'Al día', share: 'Compartir', copied: 'Copiado', copyAddress: 'Copiar dirección', copyLink: 'Copiar enlace', rotate: 'Cambiar dirección', rotateTitle: 'Comenzar con una dirección nueva', rotateBody: 'Tu bandeja actual pasará a un archivo de solo lectura. Elige cuánto vivirá la nueva dirección.', rotateButton: 'Cambiar y continuar', cancel: 'Cancelar', close: 'Cerrar', emptyTitle: 'Todavía no hay nada', emptyBody: 'Mantén abierta esta pestaña. Los mensajes nuevos aparecerán al llegar.', waiting: 'Esperando correo nuevo', loading: 'Abriendo tu bandeja privada', loadError: 'No se pudo abrir esta bandeja.', retry: 'Reintentar', archivedTitle: 'Esta bandeja se ha cerrado', archivedBody: 'La dirección ya no recibe correo. Los mensajes quedan abajo como archivo de solo lectura.', deletedTitle: 'Esta bandeja ya no está disponible', deletedBody: 'Terminó el periodo de archivo y su contenido se eliminó.', readOnly: 'Archivo de solo lectura', from: 'De', received: 'Recibido', selectMessage: 'Elige un mensaje para leer', textVersion: 'Texto', htmlVersion: 'Vista enriquecida', noHtml: 'Este mensaje no incluye una versión enriquecida.', newInbox: 'Nueva bandeja', oneHour: '1 hora', sixHours: '6 horas', oneDay: '24 horas', threeDays: '3 días', sevenDays: '7 días', footer: 'Una pequeña utilidad para los momentos que necesitan privacidad.', secure: 'Privado por defecto', live: 'Activo', archive: 'Archivado', unavailable: 'No disponible', addressCopied: 'Dirección copiada', linkCopied: 'Enlace copiado', restored: 'Se restauró tu bandeja anterior', creating: 'Creando tu dirección…', rotating: 'Cambiando dirección…',
  },
  pt: {
     brand: 'ZipMail', brandTag: 'e-mail temporário, sem ruído', language: 'Idioma',
    createTitle: 'Um endereço privado, do seu jeito.', createBody: 'Tenha uma caixa de entrada funcional com um clique. Escolha por quanto tempo ela fica disponível.', createButton: 'Criar caixa privada', createAnother: 'Criar uma nova caixa', chooseExpiry: 'Manter por', privacyNote: 'Sem conta. Sem rastro de marketing. A caixa dura apenas o tempo que você escolher.', noTracking: 'Não exige conta', messages: 'mensagens', message: 'mensagem', inbox: 'Caixa de entrada', inboxReady: 'Sua caixa está pronta', expires: 'Expira', archivedUntil: 'Arquivo disponível até', created: 'Criada', refresh: 'Verificar e-mails', refreshed: 'Atualizado', share: 'Compartilhar', copied: 'Copiado', copyAddress: 'Copiar endereço', copyLink: 'Copiar link', rotate: 'Trocar endereço', rotateTitle: 'Começar com um endereço novo', rotateBody: 'Sua caixa atual irá para um arquivo somente leitura. Escolha quanto tempo o novo endereço ficará ativo.', rotateButton: 'Trocar e continuar', cancel: 'Cancelar', close: 'Fechar', emptyTitle: 'Nada por aqui ainda', emptyBody: 'Mantenha esta aba aberta. Novas mensagens aparecem assim que chegam.', waiting: 'Aguardando novos e-mails', loading: 'Abrindo sua caixa privada', loadError: 'Não foi possível abrir esta caixa.', retry: 'Tentar novamente', archivedTitle: 'Esta caixa foi encerrada', archivedBody: 'O endereço não recebe mais mensagens. O conteúdo fica abaixo como arquivo somente leitura.', deletedTitle: 'Esta caixa não está mais disponível', deletedBody: 'O período do arquivo terminou e o conteúdo foi removido.', readOnly: 'Arquivo somente leitura', from: 'De', received: 'Recebido', selectMessage: 'Escolha uma mensagem para ler', textVersion: 'Texto', htmlVersion: 'Versão rica', noHtml: 'Esta mensagem não inclui uma versão rica.', newInbox: 'Nova caixa', oneHour: '1 hora', sixHours: '6 horas', oneDay: '24 horas', threeDays: '3 dias', sevenDays: '7 dias', footer: 'Uma pequena ferramenta para momentos que pedem privacidade.', secure: 'Privado por padrão', live: 'Ativa', archive: 'Arquivada', unavailable: 'Indisponível', addressCopied: 'Endereço copiado', linkCopied: 'Link copiado', restored: 'Sua caixa anterior foi restaurada', creating: 'Criando seu endereço…', rotating: 'Trocando endereço…',
  },
  de: {
     brand: 'ZipMail', brandTag: 'temporäre mail, ganz ruhig', language: 'Sprache',
    createTitle: 'Eine private Adresse. Du bestimmst.', createBody: 'Erhalte mit einem Klick ein funktionierendes Postfach. Wähle die Dauer und lass es danach verschwinden.', createButton: 'Privates Postfach erstellen', createAnother: 'Neues Postfach erstellen', chooseExpiry: 'Behalten für', privacyNote: 'Kein Konto. Keine Werbespur. Dein Postfach bleibt nur so lange wie gewünscht.', noTracking: 'Kein Konto nötig', messages: 'Nachrichten', message: 'Nachricht', inbox: 'Posteingang', inboxReady: 'Dein Postfach ist bereit', expires: 'Läuft ab', archivedUntil: 'Archiv verfügbar bis', created: 'Erstellt', refresh: 'Nach E-Mails suchen', refreshed: 'Aktuell', share: 'Teilen', copied: 'Kopiert', copyAddress: 'Adresse kopieren', copyLink: 'Postfach-Link kopieren', rotate: 'Adresse wechseln', rotateTitle: 'Mit einer frischen Adresse starten', rotateBody: 'Dein aktuelles Postfach wird zu einem schreibgeschützten Archiv. Wähle die Dauer der neuen Adresse.', rotateButton: 'Wechseln und fortfahren', cancel: 'Abbrechen', close: 'Schließen', emptyTitle: 'Noch nichts hier', emptyBody: 'Lass diesen Tab geöffnet. Neue Nachrichten erscheinen, sobald sie eintreffen.', waiting: 'Warte auf neue Nachrichten', loading: 'Privates Postfach wird geöffnet', loadError: 'Dieses Postfach konnte nicht geöffnet werden.', retry: 'Erneut versuchen', archivedTitle: 'Dieses Postfach ist geschlossen', archivedBody: 'Die Adresse empfängt keine Nachrichten mehr. Die Nachrichten bleiben unten als schreibgeschütztes Archiv.', deletedTitle: 'Dieses Postfach ist nicht mehr verfügbar', deletedBody: 'Das Archivfenster ist abgelaufen und sein Inhalt wurde gelöscht.', readOnly: 'Schreibgeschütztes Archiv', from: 'Von', received: 'Empfangen', selectMessage: 'Nachricht zum Lesen auswählen', textVersion: 'Text', htmlVersion: 'Rich-Ansicht', noHtml: 'Diese Nachricht enthält keine Rich-Version.', newInbox: 'Neues Postfach', oneHour: '1 Stunde', sixHours: '6 Stunden', oneDay: '24 Stunden', threeDays: '3 Tage', sevenDays: '7 Tage', footer: 'Ein kleines Werkzeug für Momente, die etwas Privatsphäre brauchen.', secure: 'Privat voreingestellt', live: 'Aktiv', archive: 'Archiviert', unavailable: 'Nicht verfügbar', addressCopied: 'Adresse kopiert', linkCopied: 'Link kopiert', restored: 'Dein vorheriges Postfach wurde wiederhergestellt', creating: 'Adresse wird erstellt…', rotating: 'Adresse wird gewechselt…',
  },
};

const languageNames: Record<Language, string> = { en: 'English', fr: 'Français', es: 'Español', pt: 'Português', de: 'Deutsch' };
const supported: Language[] = ['en', 'fr', 'es', 'pt', 'de'];

function detectLanguage(): Language {
  const saved = window.localStorage.getItem('quietbox-language') as Language | null;
  if (saved && supported.includes(saved)) return saved;
  const browser = navigator.language.toLowerCase();
  return supported.find((language) => browser.startsWith(language)) ?? 'en';
}

type I18nValue = { language: Language; setLanguage: (language: Language) => void; t: Copy; names: Record<Language, string> };
const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);
  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem('quietbox-language', next);
  };
  const value = useMemo(() => ({ language, setLanguage, t: copies[language], names: languageNames }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
