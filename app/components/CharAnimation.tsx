interface CharAnimationProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CharAnimation({ text, className = "", style }: CharAnimationProps) {
  const chars = text.split("");

  const renderChars = () =>
    chars.map((ch, i) => (
      <span
        key={i}
        style={{
          display: "inline-block",
          transitionDelay: `${i * 0.015}s`,
          ...(ch === " " ? { whiteSpace: "pre" as const } : {}),
        }}
      >
        {ch}
      </span>
    ));

  return (
    <span
      className={className}
      style={{ position: "relative", display: "inline-flex", alignItems: "center", lineHeight: 1, ...style }}
    >
      {/* layer A — visible at rest, slides up on hover */}
      <span className="char-anim-a" style={{ display: "inline-flex", alignItems: "center", overflow: "hidden", lineHeight: 1 }}>
        {renderChars()}
      </span>
      {/* layer B — hidden below, slides in on hover */}
      <span
        className="char-anim-b"
        aria-hidden
        style={{ position: "absolute", inset: 0, display: "inline-flex", alignItems: "center", overflow: "hidden", lineHeight: 1 }}
      >
        {renderChars()}
      </span>
    </span>
  );
}
