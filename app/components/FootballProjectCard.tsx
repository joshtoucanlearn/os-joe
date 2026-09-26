export function FootballProjectCard() {
  return (
    <section className="joe-card featured" aria-label="Joe's football game project">
      <span>FOOTBALL LEGACY</span>
      <h2>Your football game project.</h2>
      <p>Play a match, then choose what you would like to change.</p>
      <div className="joe-actions">
        <a
          href="https://footballlegacy.github.io/football-legacy/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Play Football Legacy (opens in a new tab)"
        >
          Play Football Legacy ↗
        </a>
        <a href="/os-joe/write/?project=My%20football%20game">Save a game idea</a>
      </div>
      <p><small>The game opens in a new tab, so your ideas can stay here.</small></p>
    </section>
  );
}
