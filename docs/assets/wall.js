// Joe's shared sticky-note wall (from OS_Joe app/write), as plain JS.
// Same D1-backed service, payloads, version checks and positions as before.
const API = 'https://joe-shared-wall.hotoffthepresspig.chatgpt.site/api/wall';
const COLOURS = [['Lemon', '#f7e777'], ['Lime', '#c9eb87'], ['Orange', '#ffc28b'], ['Blue', '#acd7f6'], ['Pink', '#f8b7cf']];

export function mountWall(container) {
  const root = document.createElement('div');
  root.className = 'wall-machine';
  root.innerHTML = `
    <form class="note-composer">
      <label for="note-title">Give it a name</label>
      <input id="note-title" maxlength="120" placeholder="My next idea" autocomplete="off">
      <label for="note-body">Your note</label>
      <textarea id="note-body" maxlength="4000" placeholder="My drink is… / I want to try…"></textarea>
      <fieldset class="note-colours"><legend>Pick a colour</legend>
        ${COLOURS.map(([name, value], i) => `<button type="button" data-colour="${value}" title="${name}" aria-label="${name}" aria-pressed="${i === 0}" style="background:${value}"></button>`).join('')}
      </fieldset>
      <button class="game-button" type="submit" data-pin>Stick it on the wall</button>
      <button class="ghost-button" type="button" data-cancel hidden>Cancel edit</button>
      <button class="ghost-button" type="button" data-retry-move hidden>Retry saving position</button>
      <button class="ghost-button" type="button" data-undo hidden>Undo remove</button>
      <button class="ghost-button" type="button" data-download>Download my notes</button>
      <p class="note-status" role="status"></p>
    </form>
    <section class="note-area" aria-label="Joe's sticky note wall">
      <p class="note-caption">Drag the top of a note to move it.</p>
      <div class="note-wall"></div>
    </section>`;
  container.append(root);

  const $ = selector => root.querySelector(selector);
  const form = $('form'), title = $('#note-title'), body = $('#note-body'), wall = $('.note-wall'), status = $('.note-status');
  const pinButton = $('[data-pin]'), cancelButton = $('[data-cancel]'), retryButton = $('[data-retry-move]'), undoButton = $('[data-undo]'), downloadButton = $('[data-download]');
  const colourButtons = [...root.querySelectorAll('[data-colour]')];

  let notes = [], loaded = false, busy = false, pending = false, generation = 0, alive = true;
  let colour = COLOURS[0][1], editing = null, editingVersion = null, createId = null, removed = null;
  let drag = null, moveBase = null, moveTimer = 0, pollTimer = 0;

  const say = text => { status.textContent = text; };
  const setColour = value => { colour = value; colourButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.colour === value))); };
  colourButtons.forEach(b => b.addEventListener('click', () => setColour(b.dataset.colour)));

  function refreshControls() {
    const empty = !title.value.trim() && !body.value.trim();
    [title, body, ...colourButtons].forEach(el => { el.disabled = busy || !loaded; });
    pinButton.disabled = busy || !loaded || Boolean(moveBase) || empty;
    pinButton.textContent = editing ? 'Save changes' : 'Stick it on the wall';
    cancelButton.hidden = !editing; cancelButton.disabled = busy;
    retryButton.hidden = !(moveBase && !busy && !drag);
    undoButton.hidden = !removed; undoButton.disabled = busy;
    downloadButton.disabled = !notes.length;
    wall.querySelectorAll('button').forEach(b => { b.disabled = busy || (b.dataset.tool && Boolean(moveBase)); });
  }
  [title, body].forEach(el => el.addEventListener('input', refreshControls));

  function render() {
    wall.style.minHeight = `${Math.max(420, ...notes.map(n => n.y + 450))}px`;
    if (!notes.length) {
      wall.innerHTML = loaded ? '<div class="wall-empty"><h2>Your wall starts here.</h2><p>Write an idea and stick it up.</p></div>' : '';
      refreshControls();
      return;
    }
    wall.replaceChildren(...notes.map(note => {
      const card = document.createElement('article');
      card.className = 'sticky-note';
      card.dataset.id = note.id;
      card.style.background = note.colour;
      card.style.left = `calc(${note.x}% - ${note.x / 100} * var(--note-width, 220px))`;
      card.style.top = `${note.y}px`;
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'note-handle';
      handle.textContent = '⠿ Move';
      handle.setAttribute('aria-label', `Move ${note.title || 'note'}`);
      bindHandle(handle, note.id);
      card.append(handle);
      if (note.title) { const h = document.createElement('h2'); h.textContent = note.title; card.append(h); }
      const p = document.createElement('p'); p.textContent = note.body; card.append(p);
      const tools = document.createElement('div');
      tools.className = 'note-tools';
      const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Edit'; edit.dataset.tool = 'edit';
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.dataset.tool = 'remove';
      edit.addEventListener('click', () => startEdit(note.id));
      remove.addEventListener('click', () => removeNote(note.id));
      tools.append(edit, remove);
      card.append(tools);
      return card;
    }));
    refreshControls();
  }
  function placeNote(note) {
    const card = wall.querySelector(`[data-id="${CSS.escape(note.id)}"]`);
    if (!card) return;
    card.style.left = `calc(${note.x}% - ${note.x / 100} * var(--note-width, 220px))`;
    card.style.top = `${note.y}px`;
  }
  const setNotes = list => { notes = list; render(); };

  async function call(method, payload) {
    const response = await fetch(API, { method, headers: { 'Content-Type': 'application/json' },
      ...(payload ? { body: JSON.stringify(payload) } : {}), signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 409) moveBase = null;
      if (data.notes) setNotes(data.notes);
      throw new Error(data.error || 'The wall could not save. Please try again.');
    }
    return data;
  }
  async function loadWall() {
    if (pending) return;
    pending = true; busy = true; say('Loading the shared wall…'); refreshControls();
    try {
      const data = await call('GET');
      if (!alive) return;
      loaded = true; setNotes(data.notes); say('All notes are saved on the shared wall.');
      startPolling();
    } catch {
      say('Could not open the wall. Tap the Notes tab to try again.');
    } finally { pending = false; busy = false; if (alive) refreshControls(); }
  }
  async function refresh() {
    if (!loaded || pending || drag || moveBase) return;
    const started = generation;
    try {
      const data = await call('GET');
      if (alive && started === generation && !pending && !drag && !moveBase) setNotes(data.notes);
    } catch { if (alive) say('Connection lost. Your notes are still saved online. Reconnect before making changes.'); }
  }
  function startPolling() { clearInterval(pollTimer); pollTimer = setInterval(refresh, 8000); }
  addEventListener('focus', refresh);

  async function save(method, payload) {
    if (pending) return null;
    pending = true; generation++; busy = true; say('Saving…'); refreshControls();
    try {
      const data = await call(method, payload);
      setNotes(data.notes);
      say('Saved. Everyone can see this on the shared wall.');
      return data;
    } catch (error) {
      say(error instanceof Error ? error.message : 'Not saved yet. Your words are still here; try again.');
      return null;
    } finally { generation++; pending = false; busy = false; if (alive) refreshControls(); }
  }

  function resetDraft() { title.value = ''; body.value = ''; setColour(COLOURS[0][1]); editing = null; editingVersion = null; createId = null; }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const draft = { title: title.value, body: body.value, colour };
    if (!draft.title.trim() && !draft.body.trim()) return;
    const existing = notes.find(n => n.id === editing);
    if (editing && !existing) { say('That note was removed on another device. Cancel the edit to write a new note.'); return; }
    const id = editing || (createId ??= crypto.randomUUID());
    const result = await save(editing ? 'PATCH' : 'POST', { ...draft, id,
      x: existing?.x ?? Math.min(65, (notes.length % 3) * 28 + 4),
      y: existing?.y ?? 28 + Math.floor(notes.length / 3) * 290,
      version: editingVersion });
    if (result) { resetDraft(); refreshControls(); title.focus(); }
  });
  cancelButton.addEventListener('click', () => { resetDraft(); refreshControls(); });
  function startEdit(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    editing = note.id; editingVersion = note.version;
    title.value = note.title; body.value = note.body; setColour(note.colour);
    refreshControls(); title.focus();
  }
  async function removeNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const data = await save('DELETE', { id: note.id, version: note.version });
    if (data?.note) {
      removed = data.note;
      if (editing === note.id) resetDraft();
      refreshControls();
    }
  }
  undoButton.addEventListener('click', async () => {
    if (removed && await save('PATCH', { id: removed.id, version: removed.version, action: 'restore' })) { removed = null; refreshControls(); }
  });
  downloadButton.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([notes.map(n => n.title + '\n' + n.body).join('\n\n---\n\n')], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = 'joe-sticky-notes.txt'; a.click(); URL.revokeObjectURL(url);
  });

  function move(id, x, y) {
    if (pending) return;
    const current = notes.find(n => n.id === id);
    if (!current) return;
    moveBase ??= { id, version: current.version };
    current.x = Math.max(0, Math.min(100, x));
    current.y = Math.max(0, Math.min(50000, y));
    placeNote(current);
  }
  async function finishMove() {
    clearTimeout(moveTimer);
    const base = moveBase;
    if (!base) return;
    const note = notes.find(n => n.id === base.id);
    if (!note) return;
    const result = await save('PATCH', { id: note.id, version: base.version, action: 'move', x: note.x, y: note.y });
    if (result) { moveBase = null; say('Position saved on the shared wall.'); refreshControls(); }
  }
  retryButton.addEventListener('click', finishMove);
  function bindHandle(handle, id) {
    handle.addEventListener('pointerdown', event => {
      if (pending) return;
      const note = notes.find(n => n.id === id);
      if (!note) return;
      handle.setPointerCapture(event.pointerId);
      drag = { id, startX: event.clientX, startY: event.clientY, x: note.x, y: note.y };
    });
    handle.addEventListener('pointermove', event => {
      if (!drag || drag.id !== id) return;
      const width = wall.clientWidth - handle.parentElement.clientWidth;
      move(id, drag.x + (event.clientX - drag.startX) / Math.max(1, width) * 100, drag.y + event.clientY - drag.startY);
    });
    const end = () => { if (!drag || drag.id !== id) return; drag = null; void finishMove(); };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', event => {
      const delta = event.shiftKey ? 10 : 3;
      const k = event.key;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) return;
      event.preventDefault();
      const note = notes.find(n => n.id === id);
      if (!note) return;
      move(id, note.x + (k === 'ArrowRight' ? delta : k === 'ArrowLeft' ? -delta : 0), note.y + (k === 'ArrowDown' ? delta * 4 : k === 'ArrowUp' ? -delta * 4 : 0));
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => void finishMove(), 400);
    });
  }

  render();
  void loadWall();
  return () => {
    alive = false;
    clearInterval(pollTimer); clearTimeout(moveTimer);
    removeEventListener('focus', refresh);
    if (moveBase) void finishMove();
  };
}
