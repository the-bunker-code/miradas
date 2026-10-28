/**
 * copy.js — Todos los textos del juego (español neutro, de tú) y las frases de la voz.
 * La lógica nunca escribe frases: pide la clave aquí. Para traducir, solo cambia este archivo.
 *
 * Regla de la serie: la voz no pide ni exige mirar; la palabra "mírame" no aparece.
 */

export const COPY = {
  levels: {
    1: { name: 'Nivel 1', topic: 'Junto a la cara', hint: 'Pon el premio junto a tu cara.' },
    2: { name: 'Nivel 2', topic: 'Muecas', hint: 'Haz una mueca mientras cuentas.' },
    3: { name: 'Nivel 3', topic: '¿Cómo estoy?', hint: 'Pon una emoción con la cara y ella elige.' },
  },

  defaultNames: ['Papá', 'Mamá', 'Niñera'],

  /** Tarjetas: título corto y qué hace el adulto. */
  cards: {
    // Nivel 1
    bubbles: { title: 'Burbujas', instruction: 'Sopla burbujas al decir «¡tres!»' },
    song: { title: 'Canción', instruction: 'Canta un pedacito de su canción favorita' },
    plane: { title: 'Avión', instruction: 'Levántala como avión' },
    block: { title: 'Bloque', instruction: 'Dale un bloque para su torre' },
    applause: { title: 'Aplausos', instruction: 'Aplaude y celebra con ella' },
    tickles: { title: 'Cosquillas', instruction: 'Hazle cosquillas suaves' },
    // Nivel 2
    tongue: { title: 'Lengua', instruction: 'Saca la lengua' },
    kiss: { title: 'Beso', instruction: 'Pon boca de beso' },
    wide: { title: 'Ojos grandes', instruction: 'Abre mucho los ojos y la boca' },
    blink: { title: 'Ojos cerrados', instruction: 'Cierra los ojos y ábrelos de golpe' },
    teeth: { title: 'Dientes', instruction: 'Muestra los dientes sonriendo' },
    // Nivel 3 (la instrucción se arma con la palabra de la emoción)
    happy: { title: 'Feliz', instruction: 'Pon cara de feliz' },
    sad: { title: 'Triste', instruction: 'Pon cara de triste' },
    surprised: { title: 'Sorprendido', instruction: 'Pon cara de sorprendido' },
    angry: { title: 'Enojado', instruction: 'Pon cara de enojado' },
  },

  /** Emociones: la palabra de la opción, lo que dice la voz al acertar y como modelo. */
  emotions: {
    happy: { word: 'Feliz', cheer: '¡Feliz!', model: 'Está feliz' },
    sad: { word: 'Triste', cheer: '¡Triste!', model: 'Está triste' },
    surprised: { word: 'Sorprendido', cheer: '¡Sorprendido!', model: 'Está sorprendido' },
    angry: { word: 'Enojado', cheer: '¡Enojado!', model: 'Está enojado' },
  },

  /** Lo que ve el adulto en cada momento de la ronda. */
  round: {
    count: 'Contar',
    counting: 'Uno… dos…',
    waiting: 'Espera en silencio…',
    looked: '¡Me miró!',
    giveReward: 'Dale el premio',
    faceReward: 'Espera a ver si te imita. No se lo pidas',
    turnScreen: 'Gira la pantalla hacia ella',
    ready: 'Listo',
    next: 'Siguiente',
    finish: 'Terminar',
  },

  /** Frases de la voz. */
  voice: {
    one: 'Uno…',
    two: 'dos…',
    three: '¡Tres!',
    lastOne: 'Una más y terminamos',
    howIs: '¿Cómo está?',
    /** @param {number} stars */
    total: (stars) => (stars === 1 ? 'Hicimos 1 estrella' : `Hicimos ${stars} estrellas`),
  },

  /** Lo que lee el lector de pantalla en cada momento (región role="status"). */
  status: {
    counting: 'Contando',
    waiting: 'Esperando la mirada',
    looked: 'Estrella sumada',
    turn: 'Gira la pantalla',
    choose: 'Elige cómo está',
  },

  end: {
    title: '¡Terminamos!',
    teamTotal: (/** @type {number} */ stars) =>
      stars === 1 ? '1 estrella del equipo' : `${stars} estrellas del equipo`,
    perAdult: 'Estrellas de cada uno',
  },

  progress: {
    title: 'Progreso',
    empty: 'Aún no hay sesiones guardadas.',
    avgLook: 'Tiempo promedio hasta la mirada',
    noLooks: 'sin miradas',
    chartTitle: 'Segundos hasta la mirada, por sesión',
  },

  aria: {
    stars: 'Estrellas del equipo',
    clock: 'Tiempo restante de la sesión',
  },
};
