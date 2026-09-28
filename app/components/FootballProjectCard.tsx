export function FootballProjectCard() {
  return (
    <section className="joe-card featured" aria-label="Joe's football game project">
      <span>DARTY</span>
      <h2>Your football game.</h2>
      <p>Play football, land two big tackles, and watch the toy parts pop off. Then choose what to change next.</p>
      <div className="joe-actions">
        <a
          href="https://joshtoucanlearn.github.io/darty/darty.html"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Play DARTY (opens in a new tab)"
        >
          Play DARTY ↗
        </a>
        <a href="/os-joe/write/?project=My%20football%20game">Save a game idea</a>
      </div>
      <p><small>The game opens in a new tab, so your ideas can stay here.</small></p>
    </section>
  );
}
