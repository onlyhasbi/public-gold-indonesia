import React from 'react';

type Props = {
  text: string;
  highlight: string;
};

export default function GradientHighlight({ text, highlight }: Props) {
  if (!text || !highlight || !text.includes(highlight)) {
    return <>{text}</>;
  }

  const parts = text.split(highlight);

  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent drop-shadow-sm">
              {highlight}
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
