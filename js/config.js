/**
 * config.js — Todo lo que se puede ajustar sin tocar la lógica: tiempos, tarjetas,
 * muecas y emociones. Si quieres cambiar el juego, empieza por CONFIG.
 *
 * Los textos que se leen o se ven NO están aquí: viven en copy.js.
 */

/** @typedef {1|2|3} LevelId */
/** @typedef {1|2|3} AdultCount */

/**
 * @typedef {Object} Card
 * @property {string} id    Id estable: copy.js tiene el texto de esta tarjeta.
 * @property {string} icon  Nombre del ícono en icons.js. Un ícono = un concepto, siempre.
 */

export const CONFIG = {
  /** Duración de la sesión y aviso previo (milisegundos). */
  session: {
    durationMs: 5 * 60 * 1000,
    warnAtMs: 4.5 * 60 * 1000,
  },

  /** Tiempos de una ronda (milisegundos). */
  round: {
    /** Pausa entre "uno" y "dos". */
    countGapMs: 1000,
    /** Si nadie toca "¡Me miró!" en este tiempo, la ronda pasa sola. */
    lookWindowMs: 10 * 1000,
  },

  /** Adultos que juegan. Cada uno tiene un color fijo (clase CSS `adult-N`). */
  adults: {
    max: 3,
    nameMaxLength: 20,
  },

  /** Cuántas sesiones se guardan en el progreso (las más viejas se descartan). */
  maxSavedSessions: 60,

  /** Cuántas opciones aparecen en el nivel 3. */
  choiceCount: 2,

  /** Nivel 1: el premio va junto a la cara. */
  rewards: /** @type {Card[]} */ ([
    { id: 'bubbles', icon: 'bubbles' },
    { id: 'song', icon: 'music' },
    { id: 'plane', icon: 'plane' },
    { id: 'block', icon: 'toy-brick' },
    { id: 'applause', icon: 'party-popper' },
    { id: 'tickles', icon: 'feather' },
  ]),

  /** Nivel 2: muecas para que el adulto las haga mientras cuenta. */
  faces: /** @type {Card[]} */ ([
    { id: 'tongue', icon: 'face-tongue' },
    { id: 'kiss', icon: 'face-kiss' },
    { id: 'wide', icon: 'eye' },
    { id: 'blink', icon: 'eye-closed' },
    { id: 'teeth', icon: 'face-teeth' },
  ]),

  /** Nivel 3: emociones. El adulto pone la cara; la niña elige entre dos. */
  emotions: /** @type {Card[]} */ ([
    { id: 'happy', icon: 'smile' },
    { id: 'sad', icon: 'frown' },
    { id: 'surprised', icon: 'face-surprised' },
    { id: 'angry', icon: 'angry' },
  ]),
};

/**
 * Tarjetas de cada nivel. El nivel 3 usa las emociones como tarjeta.
 * @type {Record<LevelId, Card[]>}
 */
export const CARDS_BY_LEVEL = {
  1: CONFIG.rewards,
  2: CONFIG.faces,
  3: CONFIG.emotions,
};

/** Ícono de cada nivel en el inicio (la señal crece con el nivel, como en Memo Colores). */
export const LEVEL_ICONS = { 1: 'signal-low', 2: 'signal-medium', 3: 'signal-high' };

export const LEVEL_IDS = /** @type {LevelId[]} */ ([1, 2, 3]);
export const ADULT_COUNTS = /** @type {AdultCount[]} */ ([1, 2, 3]);
