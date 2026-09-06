"use client";


import { useState } from "react";

type DoorPosition = "left" | "middle" | "right";
type DoorTransition = "next" | "retry" | "finish";

type DoorChoice = {
  door: DoorPosition;
  label: string;
  consequenceTitle: string;
  sequence: readonly string[];
  transition: DoorTransition;
};

type DoorLevel = {
  code: string;
  title: string;
  atmosphere: string;
  scene: string;
  question: string;
  choices: readonly [DoorChoice, DoorChoice, DoorChoice];
};

const doorArt: Record<DoorPosition, string> = {
  left: "/os-joe/three-doors-left.png",
  middle: "/os-joe/three-doors-middle.png",
  right: "/os-joe/three-doors-right.png",
};

// STORY TEMPLATE: duplicate a level, then replace its scene, question and three
// consequences. The game engine handles the doors, sequence beats and progress.
export const DOOR_GAME_LEVELS: readonly DoorLevel[] = [
  {
    code: "LEVEL_01",
    title: "The Empty Corridor",
    atmosphere: "LIGHTS: FLICKERING · SOUND: DISTANT WHIMPER",
    scene:
      "The lights click on one at a time. Somewhere behind the walls, a puppy whimpers. Three doors wait at the end of the corridor.",
    question: "What do you do?",
    choices: [
      {
        door: "left",
        label: "Follow the muddy pawprints",
        consequenceTitle: "THE PRINTS KEEP GOING",
        sequence: [
          "The pawprints lead neatly beneath the left door.",
          "On the other side, they continue straight up the wall.",
          "Something above you scratches twice. You keep moving.",
        ],
        transition: "next",
      },
      {
        door: "middle",
        label: "Knock before entering",
        consequenceTitle: "IT KNOCKS BACK",
        sequence: [
          "You knock three times.",
          "A much larger hand knocks three times from your side of the door.",
          "The corridor blinks. You are standing where you started.",
        ],
        transition: "retry",
      },
      {
        door: "right",
        label: "Call out for the puppy",
        consequenceTitle: "SOMETHING HEARD YOU",
        sequence: [
          "You call. The whining stops.",
          "A tiny bark answers from far ahead.",
          "A long finger points through the right doorway. Helpful. Probably.",
        ],
        transition: "next",
      },
    ],
  },
  {
    code: "LEVEL_02",
    title: "The Hands Below",
    atmosphere: "FLOOR: BREATHING · EXIT: UNKNOWN",
    scene:
      "The next room is too quiet. Fingers curl up through cracks in the floor while a huge arm searches along the ceiling.",
    question: "How do you cross the room?",
    choices: [
      {
        door: "left",
        label: "Offer the hand a biscuit",
        consequenceTitle: "A FAIR TRADE",
        sequence: [
          "The fingers stop searching.",
          "They accept the biscuit very politely.",
          "The hand points towards a lift and gives you a thumbs-up.",
        ],
        transition: "next",
      },
      {
        door: "middle",
        label: "Sprint between the fingers",
        consequenceTitle: "ABSOLUTELY NOT",
        sequence: [
          "For one glorious second, the plan works.",
          "Then the floor applauds.",
          "You are gently—but firmly—placed back at the entrance.",
        ],
        transition: "retry",
      },
      {
        door: "right",
        label: "Ask where the puppy went",
        consequenceTitle: "DIRECTIONS, SORT OF",
        sequence: [
          "Every hand freezes.",
          "One finger points right. Another points left. The ceiling hand points down.",
          "A bark comes from the lift. You trust the bark.",
        ],
        transition: "next",
      },
    ],
  },
  {
    code: "LEVEL_03",
    title: "The Last Lift",
    atmosphere: "PUPPY: FOUND · LIFT: WAITING",
    scene:
      "The missing puppy sits inside the open lift, holding something that looks suspiciously like a human finger. The doors begin to close.",
    question: "How does this story end?",
    choices: [
      {
        door: "left",
        label: "Grab the puppy and run",
        consequenceTitle: "ESCAPE ENDING",
        sequence: [
          "You scoop up the puppy.",
          "A forest of hands waves as you leap into the lift.",
          "The doors close. Something knocks once from the other side.",
        ],
        transition: "finish",
      },
      {
        door: "middle",
        label: "Let the puppy choose",
        consequenceTitle: "PUPPY ENDING",
        sequence: [
          "The puppy presses the middle button with one paw.",
          "The lift travels sideways.",
          "Nobody explains this. The puppy seems pleased.",
        ],
        transition: "finish",
      },
      {
        door: "right",
        label: "Wait for the giant hand",
        consequenceTitle: "TOO POLITE ENDING",
        sequence: [
          "You hold the lift for the hand.",
          "It reaches for the button. Then for you.",
          "The puppy sighs. You are back outside the lift.",
        ],
        transition: "retry",
      },
    ],
  },
];

type GamePhase = "blueprint" | "playing" | "sequence" | "complete";

export function DoorChoiceGame() {
  const [phase, setPhase] = useState<GamePhase>("blueprint");
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<DoorChoice | null>(null);
  const [beatIndex, setBeatIndex] = useState(0);

  const level = DOOR_GAME_LEVELS[levelIndex];
  const finalBeat = selectedChoice ? beatIndex === selectedChoice.sequence.length - 1 : false;

  function startGame() {
    setLevelIndex(0);
    setSelectedChoice(null);
    setBeatIndex(0);
    setPhase("playing");
  }

  function chooseDoor(choice: DoorChoice) {
    setSelectedChoice(choice);
    setBeatIndex(0);
    setPhase("sequence");
  }

  function continueSequence() {
    if (!selectedChoice) return;

    if (!finalBeat) {
      setBeatIndex((current) => current + 1);
      return;
    }

    if (selectedChoice.transition === "finish") {
      setPhase("complete");
      return;
    }

    if (selectedChoice.transition === "next") {
      setLevelIndex((current) => Math.min(current + 1, DOOR_GAME_LEVELS.length - 1));
    }

    setSelectedChoice(null);
    setBeatIndex(0);
    setPhase("playing");
  }

  function nextButtonLabel() {
    if (!selectedChoice || !finalBeat) return "NEXT BEAT";
    if (selectedChoice.transition === "retry") return "TRY THIS LEVEL AGAIN";
    if (selectedChoice.transition === "finish") return "SEE ENDING";
    return "ENTER NEXT LEVEL";
  }

  if (phase === "blueprint") {
    return (
      <div className="door-game door-game-blueprint">
        <div className="door-game-readout">
          <span>GAME_03 // BASE_TEMPLATE</span>
          <strong>READY TO BUILD</strong>
        </div>

        <div className="blueprint-gallery" aria-label="Original game sketches">
          <figure>
            <img
              src="/os-joe/three-doors-blueprint-sequence.jpg"
              width={2048}
              height={1152}
              alt="Original notebook sketch showing three doors and giant hands entering each scene"
              loading="eager"
            />
            <figcaption>ORIGINAL BLUEPRINT // PLAY OUTCOME</figcaption>
          </figure>
          <figure>
            <img
              src="/os-joe/three-doors-blueprint-flow.jpg"
              width={2048}
              height={1152}
              alt="Original notebook sketch showing the start-to-end game flow and puppy scene"
              loading="eager"
            />
            <figcaption>ORIGINAL BLUEPRINT // LEVEL FLOW</figcaption>
          </figure>
        </div>

        <div className="door-template-intro">
          <span className="door-template-tag">WORKING TITLE</span>
          <h2>THREE DOORS</h2>
          <p>
            Every level is its own scene. Every door is a choice inside that scene.
            Pick one, watch the consequence unfold, then continue—or try again.
          </p>
          <div className="door-template-rule" aria-label="Story template structure">
            <span><b>01</b> SCENE</span>
            <span><b>02</b> THREE CHOICES</span>
            <span><b>03</b> CONSEQUENCE</span>
          </div>
          <button type="button" className="game-button" onClick={startGame}>PLAY THE DEMO</button>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="door-game door-game-complete">
        <div className="door-game-readout">
          <span>DEMO_ROUTE // COMPLETE</span>
          <strong>PUPPY FOUND</strong>
        </div>
        <div className="door-ending-card">
          <img
            src="/os-joe/three-doors-blueprint-flow.jpg"
            width={2048}
            height={1152}
            alt="Original game flow sketch"
          />
          <div>
            <span>END_01</span>
            <h2>The lift doors close.</h2>
            <p>The puppy is safe. The hand waves goodbye. For now.</p>
            <button type="button" className="game-button" onClick={startGame}>PLAY AGAIN</button>
            <button type="button" className="ghost-button" onClick={() => setPhase("blueprint")}>VIEW BLUEPRINTS</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "sequence" && selectedChoice) {
    return (
      <div className="door-game door-game-sequence" aria-live="polite">
        <div className="door-game-readout">
          <span>{level.code} // {selectedChoice.door.toUpperCase()} DOOR</span>
          <strong>BEAT {beatIndex + 1}/{selectedChoice.sequence.length}</strong>
        </div>

        <article className="door-outcome-card">
          <img
            src="/os-joe/three-doors-blueprint-sequence.jpg"
            width={2048}
            height={1152}
            alt="Original sequence sketch with giant hands and doors"
          />
          <div className="door-outcome-copy">
            <span>{selectedChoice.consequenceTitle}</span>
            <p key={`${levelIndex}-${selectedChoice.door}-${beatIndex}`}>
              {selectedChoice.sequence[beatIndex]}
            </p>
            <div className="sequence-pips" aria-label={`Story beat ${beatIndex + 1} of ${selectedChoice.sequence.length}`}>
              {selectedChoice.sequence.map((_, index) => (
                <i key={index} className={index <= beatIndex ? "seen" : ""} />
              ))}
            </div>
            <button type="button" className="game-button" onClick={continueSequence}>{nextButtonLabel()}</button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="door-game door-game-playing">
      <div className="door-game-readout">
        <span>{level.code} // {String(levelIndex + 1).padStart(2, "0")}/{String(DOOR_GAME_LEVELS.length).padStart(2, "0")}</span>
        <strong>CHOOSE A DOOR</strong>
      </div>

      <section className="door-level-scene">
        <div className="door-level-progress" aria-label={`Level ${levelIndex + 1} of ${DOOR_GAME_LEVELS.length}`}>
          {DOOR_GAME_LEVELS.map((item, index) => (
            <span key={item.code} className={index <= levelIndex ? "active" : ""}>{String(index + 1).padStart(2, "0")}</span>
          ))}
        </div>
        <span className="door-atmosphere">{level.atmosphere}</span>
        <h2>{level.title}</h2>
        <p>{level.scene}</p>
        <strong className="door-question">{level.question}</strong>
      </section>

      <div className="door-choice-grid" aria-label="Choose one of three doors">
        {level.choices.map((choice, index) => (
          <button type="button" key={choice.door} onClick={() => chooseDoor(choice)}>
            <span className="door-number">0{index + 1} // {choice.door.toUpperCase()}</span>
            <span className="door-sketch">
              <img src={doorArt[choice.door]} width={420} height={500} alt={`${choice.door} door from the original notebook sketch`} />
            </span>
            <strong>{choice.label}</strong>
            <small>OPEN DOOR →</small>
          </button>
        ))}
      </div>

      <button type="button" className="ghost-button small door-exit-button" onClick={() => setPhase("blueprint")}>EXIT TO BLUEPRINTS</button>
    </div>
  );
}
