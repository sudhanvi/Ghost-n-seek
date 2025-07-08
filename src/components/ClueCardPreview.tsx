'use client';

import { forwardRef } from 'react';

export interface Clue {
  text: string;
}

export interface ClueCardPreviewProps {
  /** The list of clue snippets to render */
  clues: Clue[];
  /** Optional generated image URL */
  imageUrl: string | null;
  /** Called when user removes a clue */
  onRemoveClue: (index: number) => void;
  /** Called when user clicks “Share” */
  onShare: (imageUrl: string | null) => void;
  /** If true, show remove/share buttons */
  isInteractive: boolean;
  /** When this card was created (for display) */
  createdAt?: Date;
  /** Ghost‐y tint to use on the card */
  colorPreference: string;
}

const ClueCardPreview = forwardRef<HTMLDivElement, ClueCardPreviewProps>(
  (
    {
      clues,
      imageUrl,
      onRemoveClue,
      onShare,
      isInteractive,
      createdAt,
      colorPreference,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`p-6 rounded-lg border-2 ${
          colorPreference === 'purple'
            ? 'border-purple-500'
            : 'border-indigo-500'
        } bg-white/10 backdrop-blur-sm max-w-md mx-auto`}
      >
        <h3 className="text-xl font-semibold mb-2">Your Clue Card</h3>
        {createdAt && (
          <p className="text-sm font-mono mb-4">
            {createdAt.toLocaleString()}
          </p>
        )}

        <ul className="list-disc list-inside space-y-1 mb-4">
          {clues.map((c, i) => (
            <li key={i} className="flex justify-between items-center">
              <span>{c.text}</span>
              {isInteractive && (
                <button
                  className="text-red-400 hover:text-red-600 text-sm"
                  onClick={() => onRemoveClue(i)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Generated artwork"
            className="w-full rounded mb-4"
          />
        )}

        {isInteractive ? (
          <button
            className="w-full py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            onClick={() => onShare(imageUrl)}
          >
            Share to Socials
          </button>
        ) : null}
      </div>
    );
  }
);

ClueCardPreview.displayName = 'ClueCardPreview';

export default ClueCardPreview;
