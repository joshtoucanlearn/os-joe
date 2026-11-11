import { createDrinkSpin, renderDrinkInfo } from './drink-spin.js';

const DARTY_URL = 'https://joshtoucanlearn.github.io/darty/';

export function mountDarty(container) {
  const root = document.createElement('div');
  root.className = 'darty-machine';
  root.innerHTML = `
    <iframe class="darty-frame" src="${DARTY_URL}" title="DARTY football game"
      allow="autoplay; fullscreen; gamepad" allowfullscreen></iframe>
    <div class="darty-bar">
      <span>Keyboard or controller.</span>
      <a href="${DARTY_URL}" target="_blank" rel="noopener">Full screen ↗</a>
    </div>`;
  container.append(root);
  const frame = root.querySelector('iframe');
  return () => { frame.src = 'about:blank'; };
}

const DRINKS = [
  { id: 'fizzy', original: '../assets/originals/fizzy.png', name: 'Fizzy', lines: ['Light, bright red. Fizzy Extreme.'] },
  { id: 'skids', original: '../assets/originals/skids.png', name: 'Skids', lines: ["When you're in a rush, have some Skids."] },
  { id: 'ground-pinch', original: '../assets/originals/ground-pinch.png', name: 'Ground Pinch', lines: ['It’s sweet, fast, cheap, and will help you destroy your enemies.'] },
];

export function mountDrinks(container) {
  const root = document.createElement('div');
  root.className = 'drinks-machine';
  root.innerHTML = `
    <div class="drink-picker" role="group" aria-label="Choose a drink">
      ${DRINKS.map(drink => `<button type="button" data-drink="${drink.id}" aria-pressed="false">${drink.name}</button>`).join('')}
    </div>
    <div class="drink-stage"><div class="drink-screen"></div><p class="drink-help">Drag to spin</p></div>
    <div class="drink-info"></div>`;
  container.append(root);
  const screen = root.querySelector('.drink-screen');
  const info = root.querySelector('.drink-info');
  const buttons = [...root.querySelectorAll('[data-drink]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let viewer = null;
  function choose(id) {
    const drink = DRINKS.find(item => item.id === id);
    viewer?.destroy();
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.drink === id)));
    renderDrinkInfo(info, drink);
    viewer = createDrinkSpin(screen, drink, { reduced: motion.matches });
    viewer.setActive(!document.hidden);
  }
  const visibility = () => viewer?.setActive(!document.hidden);
  const reduced = () => viewer?.setReduced(motion.matches);
  document.addEventListener('visibilitychange', visibility);
  motion.addEventListener('change', reduced);
  buttons.forEach(button => button.addEventListener('click', () => choose(button.dataset.drink)));
  choose(DRINKS[0].id);
  return () => {
    viewer?.destroy();
    document.removeEventListener('visibilitychange', visibility);
    motion.removeEventListener('change', reduced);
  };
}
