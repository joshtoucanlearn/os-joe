"use client";

import { useEffect, useState } from "react";

const BOOT_MESSAGE = "welcome to OS_JOE";

export function BootTerminal() {
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleCharacters((current) => {
        if (current >= BOOT_MESSAGE.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 72);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="os-terminal-cell" aria-label="OS Joe welcome terminal">
      <header>
        <span>OS_JOE // WELCOME_TERMINAL</span>
        <span className="terminal-lights" aria-hidden="true"><i /><i /><i /></span>
      </header>
      <div className="terminal-screen" aria-live="polite">
        <span className="terminal-prompt" aria-hidden="true">C:\JOE&gt;</span>
        <strong>{BOOT_MESSAGE.slice(0, visibleCharacters)}</strong>
        <span className="terminal-cursor" aria-hidden="true">█</span>
      </div>
    </section>
  );
}
