/**
 * render.js — Dibuja la pantalla a partir de `state`. No modifica el estado ni
 * habla con el audio. Cada zona se redibuja con updateZone() solo si cambió.
 *
 * Todo texto escrito por una persona (los nombres de los adultos) pasa por
 * escapeHTML(); lo demás sale de config.js y copy.js.
 */

import { ADULT_COUNTS, CARDS_BY_LEVEL, CONFIG, LEVEL_ICONS, LEVEL_IDS } from './config.js';
import { COPY } from './copy.js';
import { escapeHTML, updateZone } from './dom.js';
import { icon } from './icons.js';
import { formatClock, remainingMs, teamStars } from './rules.js';

/** @param {string} id */
function $(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Falta #${id} en index.html`);
  return element;
}

/** @param {string} id */
const card = (id) => COPY.cards[/** @type {keyof typeof COPY.cards} */ (id)];
/** @param {string} id */
const emotionCopy = (id) => COPY.emotions[/** @type {keyof typeof COPY.emotions} */ (id)];
/** @param {string} cardId */
function iconOf(cardId) {
  const found = Object.values(CARDS_BY_LEVEL)
    .flat()
    .find((entry) => entry.id === cardId);
  if (!found) throw new Error(`Tarjeta desconocida: ${cardId}`);
  return found.icon;
}

// --- Inicio ----------------------------------------------------------------

/** @param {import('./game.js').GameState} state */
function renderHome(state) {
  const { settings } = state;

  updateZone(
    $('level-picker'),
    LEVEL_IDS.map((level) => {
      const text = COPY.levels[level];
      return `<button type="button" class="choice" data-action="choose-level" data-level="${level}" aria-pressed="${settings.level === level}">
        ${icon(LEVEL_ICONS[level], { size: 26, strokeWidth: 3 })}
        <span class="choice__name">${text.name}</span><span class="choice__topic">${text.topic}</span></button>`;
    }).join(''),
  );
  $('level-hint').textContent = COPY.levels[settings.level].hint;

  updateZone(
    $('adult-picker'),
    ADULT_COUNTS.map(
      (count) =>
        `<button type="button" class="choice choice--small" data-action="choose-adults" data-count="${count}" aria-pressed="${settings.adults === count}">${count}</button>`,
    ).join(''),
  );

  document.querySelectorAll('.name-row').forEach((row, index) => {
    if (!(row instanceof HTMLElement)) return;
    row.hidden = index >= settings.adults;
    const input = row.querySelector('input');
    if (input && document.activeElement !== input && input.value !== settings.names[index]) {
      input.value = settings.names[index];
    }
  });

  /** @type {HTMLInputElement} */ ($('setting-voice')).checked = settings.voice;
  /** @type {HTMLInputElement} */ ($('setting-sound')).checked = settings.sound;
}

// --- Ronda -----------------------------------------------------------------

/** @param {import('./game.js').GameState} state */
function stageHTML(state) {
  const { phase, cardId, settings } = state;
  const text = card(cardId);

  if (phase === 'looked') {
    const message = settings.level === 2 ? COPY.round.faceReward : COPY.round.giveReward;
    return `<p class="stage__big">${message}</p>`;
  }
  if (phase === 'turn') return `<p class="stage__big">${COPY.round.turnScreen}</p>`;
  if (phase === 'choose') return `<p class="stage__big">${COPY.voice.howIs}</p>`;
  if (phase === 'modeled') {
    const emotion = emotionCopy(cardId);
    return `<p class="stage__big">${state.chosenId === cardId ? emotion.cheer : emotion.model}</p>`;
  }
  return `<span class="stage__icon">${icon(iconOf(cardId), { size: 88, strokeWidth: 2 })}</span>
    <h2 class="stage__title">${text.title}</h2>
    <p class="stage__text">${text.instruction}</p>`;
}

/**
 * Las dos opciones del nivel 3. En "modeled" ya no se tocan: la correcta se resalta
 * (sin rojo ni cruces para la otra) y la voz ya dijo la palabra.
 * @param {import('./game.js').GameState} state
 */
function optionsHTML(state) {
  const interactive = state.phase === 'choose';
  const options = state.options
    .map((id) => {
      const emotion = emotionCopy(id);
      const iconName = iconOf(id);
      const model = !interactive && id === state.cardId ? ' is-model' : '';
      const body = `${icon(iconName, { size: 72, strokeWidth: 2 })}<span class="option__word">${emotion.word}</span>`;
      return interactive
        ? `<button type="button" class="option" data-action="choose-emotion" data-value="${id}">${body}</button>`
        : `<div class="option${model}">${body}</div>`;
    })
    .join('');
  return `<div class="options">${options}</div>`;
}

/**
 * Botón grande estilo tarjeta (texto abajo, ícono en disco blanco, burbujas de adorno).
 * @param {{ action: string, label: string, iconName: string, className: string, name?: string, attrs?: string }} options
 */
function cardButton({ action, label, iconName, className, name = '', attrs = '' }) {
  const nameLine = name ? `<span class="cardbtn__name">${name}</span>` : '';
  return `<button type="button" class="cardbtn ${className}" data-action="${action}" ${attrs}>
    <span class="cardbtn__deco" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="cardbtn__icon">${icon(iconName, { size: 32, strokeWidth: 3 })}</span>
    <span class="cardbtn__text">${nameLine}<span>${label}</span></span>
  </button>`;
}

/** @param {import('./game.js').GameState} state */
function actionHTML(state) {
  const { phase, settings } = state;
  switch (phase) {
    case 'card':
      return cardButton({ action: 'count', label: COPY.round.count, iconName: 'play', className: 'cardbtn--theme' });
    case 'counting':
      return `<p class="action__wait">${COPY.round.counting}</p>`;
    case 'waiting': {
      const buttons = Array.from({ length: settings.adults }, (_, index) => {
        const name = escapeHTML(settings.names[index]);
        return cardButton({
          action: 'looked',
          label: COPY.round.looked,
          name: settings.adults === 1 ? '' : name,
          iconName: 'eye',
          className: `cardbtn--adult adult-${index + 1}`,
          attrs: `data-adult="${index}"`,
        });
      }).join('');
      return `<div class="action__stack">${buttons}</div>`;
    }
    case 'looked':
      return cardButton({
        action: 'next',
        label: COPY.round.next,
        iconName: 'arrow-right',
        className: 'cardbtn--theme',
      });
    case 'turn':
      return cardButton({ action: 'ready', label: COPY.round.ready, iconName: 'check', className: 'cardbtn--theme' });
    case 'choose':
      return optionsHTML(state);
    case 'modeled':
      return `${optionsHTML(state)}<button type="button" class="button button--theme" data-action="next">${COPY.round.next}</button>`;
    default:
      return ''; // "missed": la ronda pasa sola, sin ningún mensaje
  }
}

/** Frase para el lector de pantalla. @param {import('./game.js').GameState} state */
function statusText(state) {
  const { phase, cardId, settings } = state;
  if (phase === 'card') return `${card(cardId).title}. ${card(cardId).instruction}`;
  if (phase === 'looked')
    return `${COPY.status.looked}. ${settings.level === 2 ? COPY.round.faceReward : COPY.round.giveReward}`;
  if (phase === 'modeled') return emotionCopy(cardId).model;
  return COPY.status[/** @type {keyof typeof COPY.status} */ (phase)] ?? '';
}

/** @param {import('./game.js').GameState} state */
function renderRound(state) {
  $('stars').textContent = String(teamStars(state.stars));
  $('clock').textContent = formatClock(remainingMs(state.elapsedMs, CONFIG.session.durationMs));
  updateZone($('stage'), stageHTML(state));
  const action = $('action');
  updateZone(action, actionHTML(state));
  // Si el botón que tenía el foco desapareció (p. ej. "Contar"), el foco pasa al
  // primer botón nuevo: quien usa teclado no pierde el lugar.
  const active = document.activeElement;
  const firstButton = action.querySelector('button');
  if (firstButton && (active === document.body || active === null)) firstButton.focus();
  $('status').textContent = statusText(state);
  $('round-phase').dataset.phase = state.phase;
  $('screen-round').dataset.level = String(state.settings.level);
}

// --- Final -----------------------------------------------------------------

/** @param {import('./game.js').GameState} state */
function renderEnd(state) {
  const total = teamStars(state.stars);
  // Cada adulto en su orden fijo; sin ordenar por estrellas ni resaltar a nadie.
  const perAdult =
    state.settings.adults > 1
      ? `<h3 class="end__subtitle">${COPY.end.perAdult}</h3><ul class="end__list">${state.stars
          .slice(0, state.settings.adults)
          .map(
            (count, index) =>
              `<li class="end__item adult-${index + 1}"><span>${escapeHTML(state.settings.names[index])}</span><span>${icon('star', { size: 20, fill: 'currentColor' })} ${count}</span></li>`,
          )
          .join('')}</ul>`
      : '';
  updateZone(
    $('end-body'),
    `<p class="end__total">${icon('star', { size: 56, strokeWidth: 2, fill: 'currentColor' })}<span class="end__number">${total}</span></p>
     <p class="end__caption">${COPY.end.teamTotal(total)}</p>${perAdult}`,
  );
}

// --- Progreso --------------------------------------------------------------

const dateFormat = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** @param {number | null} seconds */
const lookText = (seconds) => (seconds === null ? COPY.progress.noLooks : `${String(seconds).replace('.', ',')} s`);

/** @param {import('./game.js').GameState} state */
function renderProgress(state) {
  const { sessions } = state;
  $('clear-data').hidden = sessions.length === 0;
  if (sessions.length === 0) {
    updateZone($('progress-body'), `<p class="progress__empty">${COPY.progress.empty}</p>`);
    return;
  }
  const recent = sessions.slice(-12);
  const maxLook = Math.max(1, ...recent.map((session) => session.avgLook ?? 0));
  const bars = recent
    .map((session) => {
      const height = session.avgLook === null ? 0 : Math.max(4, Math.round((session.avgLook / maxLook) * 100));
      return `<li class="chart__col"><span class="chart__value">${session.avgLook === null ? '–' : String(session.avgLook).replace('.', ',')}</span><span class="chart__bar" data-vars="--h:${height}%"></span></li>`;
    })
    .join('');
  // La lista es la fuente accesible; el gráfico repite lo mismo y se oculta al lector de pantalla.
  const rows = [...sessions]
    .reverse()
    .map(
      (session) =>
        `<li class="session"><span class="session__date">${dateFormat.format(new Date(session.date))}</span>
         <span>${COPY.levels[session.level].name}</span>
         <span>${icon('star', { size: 16, fill: 'currentColor' })} ${session.stars}</span>
         <span>${COPY.progress.avgLook}: ${lookText(session.avgLook)}</span></li>`,
    )
    .join('');
  updateZone(
    $('progress-body'),
    `<section class="chart" aria-hidden="true"><h3 class="chart__title">${COPY.progress.chartTitle}</h3><ol class="chart__cols">${bars}</ol></section>
     <ul class="sessions">${rows}</ul>`,
  );
}

// --- Pantallas -------------------------------------------------------------

/** @type {string | null} */
let shownScreen = null;

/** Muestra una sola pantalla y mueve el foco a ella cuando cambia. @param {string} screen */
function showScreen(screen) {
  if (screen === shownScreen) return;
  document.querySelectorAll('.screen').forEach((element) => {
    if (element instanceof HTMLElement) element.hidden = element.id !== `screen-${screen}`;
  });
  const target = $(`screen-${screen}`);
  if (shownScreen !== null) target.focus();
  shownScreen = screen;
}

/** @param {import('./game.js').GameState} state */
export function render(state) {
  showScreen(state.screen);
  if (state.screen === 'home') renderHome(state);
  else if (state.screen === 'round') renderRound(state);
  else if (state.screen === 'end') renderEnd(state);
  else renderProgress(state);
}
