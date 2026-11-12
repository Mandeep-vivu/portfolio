/**
 * The page's signature figure: a monitored signal with one abnormal stretch
 * flagged. It stands for both research projects — locating faults on a power
 * grid and reading disease from an ECG are the same job of spotting what
 * does not belong in a signal.
 */

const WIDTH = 1200;
const BASELINE = 96;
const BEAT = 86;
const ANOMALY_BEAT = 9;

/** One regular beat: small rise, sharp spike, dip, slow recovery wave. */
function beat(x: number): string {
  return [
    `L${x + 14} ${BASELINE}`,
    `Q${x + 20} ${BASELINE - 10} ${x + 26} ${BASELINE}`,
    `L${x + 34} ${BASELINE}`,
    `L${x + 38} ${BASELINE + 8}`,
    `L${x + 44} ${BASELINE - 52}`,
    `L${x + 50} ${BASELINE + 16}`,
    `L${x + 54} ${BASELINE}`,
    `L${x + 62} ${BASELINE}`,
    `Q${x + 70} ${BASELINE - 16} ${x + 78} ${BASELINE}`,
    `L${x + BEAT} ${BASELINE}`,
  ].join(" ");
}

/** The abnormal stretch: wider, taller and irregular. */
function fault(x: number): string {
  return [
    `L${x + 8} ${BASELINE - 6}`,
    `L${x + 16} ${BASELINE + 22}`,
    `L${x + 26} ${BASELINE - 84}`,
    `L${x + 36} ${BASELINE + 44}`,
    `L${x + 46} ${BASELINE - 38}`,
    `L${x + 56} ${BASELINE + 30}`,
    `L${x + 66} ${BASELINE - 70}`,
    `L${x + 76} ${BASELINE + 18}`,
    `L${x + BEAT} ${BASELINE}`,
  ].join(" ");
}

const beats = Math.ceil(WIDTH / BEAT);
const faultStart = ANOMALY_BEAT * BEAT;

const before = `M0 ${BASELINE} ${Array.from({ length: ANOMALY_BEAT }, (_, i) => beat(i * BEAT)).join(" ")}`;
const flagged = `M${faultStart} ${BASELINE} ${fault(faultStart)}`;
const after = `M${faultStart + BEAT} ${BASELINE} ${Array.from(
  { length: beats - ANOMALY_BEAT - 1 },
  (_, i) => beat(faultStart + BEAT + i * BEAT),
).join(" ")}`;

export default function SignalTrace() {
  return (
    <figure className="m-0 overflow-hidden">
      {/* On narrow screens the figure keeps a readable size and is cropped
          around the flagged stretch instead of shrinking to a hairline. */}
      <svg
        viewBox={`0 0 ${WIDTH} 190`}
        className="ml-[calc(50%-612px)] block h-auto w-[900px] max-w-none md:ml-0 md:w-full"
        role="img"
        aria-label="A signal trace with regular beats and one abnormal stretch highlighted and marked as flagged."
      >
        <line x1="0" y1={BASELINE} x2={WIDTH} y2={BASELINE} stroke="var(--color-rule)" strokeWidth="1" />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
          <path className="trace-line" pathLength={1} d={before} stroke="var(--color-cobalt)" />
          <path
            className="trace-line"
            pathLength={1}
            d={after}
            stroke="var(--color-cobalt)"
            style={{ animationDelay: "1.6s", animationDuration: "0.9s" }}
          />
          <g className="trace-flag">
            <rect
              x={faultStart - 6}
              y="4"
              width={BEAT + 12}
              height="160"
              fill="var(--color-amber)"
              fillOpacity="0.14"
            />
            <path d={flagged} stroke="var(--color-amber)" strokeWidth="3" />
            <line
              x1={faultStart - 6}
              y1="164"
              x2={faultStart + BEAT + 6}
              y2="164"
              stroke="var(--color-amber)"
              strokeWidth="3"
            />
            <text
              x={faultStart + BEAT / 2}
              y="184"
              textAnchor="middle"
              fontSize="15"
              fontWeight="700"
              fill="var(--color-ink)"
            >
              flagged
            </text>
          </g>
        </g>
      </svg>
    </figure>
  );
}
