import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

export default function TaskCompletionButton({
  completed = false,
  onClick,
  darkMode = true,
  size = 23,
}) {
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (completed) {
      setAnimating(false);
    }
  }, [completed]);

  const handleClick = (event) => {
    event.stopPropagation();

    if (completed || animating) return;

    setAnimating(true);

    setTimeout(() => {
      onClick?.();
    }, 260);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="
        relative
        flex
        items-center
        justify-center
        w-7
        h-7
        flex-shrink-0
        rounded-full
        outline-none
        focus:outline-none
      "
      title={
        completed
          ? 'Restaurar tarea'
          : 'Completar tarea'
      }
      aria-label={
        completed
          ? 'Restaurar tarea'
          : 'Completar tarea'
      }
    >
      {!completed && (
        <>
          <span
            className={`
              absolute
              inset-0
              rounded-full
              border
              transition-all
              duration-200
              ${
                animating
                  ? 'scale-150 opacity-0 border-emerald-400'
                  : hovered
                  ? 'scale-125 opacity-100 border-indigo-400/40'
                  : 'scale-100 opacity-0 border-transparent'
              }
            `}
          />

          <span
            className={`
              absolute
              rounded-full
              transition-all
              duration-200
              ${
                animating
                  ? 'scale-90 bg-emerald-500/20'
                  : hovered
                  ? 'scale-100 bg-indigo-500/10'
                  : 'scale-75 bg-transparent'
              }
            `}
            style={{
              width: size + 8,
              height: size + 8,
            }}
          />

          <span
            className={`
              absolute
              rounded-full
              border-2
              transition-all
              duration-200
              ${
                animating
                  ? 'border-emerald-500 scale-90'
                  : hovered
                  ? 'border-indigo-400 scale-100'
                  : darkMode
                  ? 'border-gray-500 scale-100'
                  : 'border-gray-300 scale-100'
              }
            `}
            style={{
              width: size,
              height: size,
            }}
          />

          <Check
            size={size * 0.58}
            className={`
              absolute
              transition-all
              duration-200
              ${
                animating
                  ? 'text-emerald-500 scale-100 opacity-100'
                  : hovered
                  ? darkMode
                    ? 'text-indigo-400 scale-100 opacity-100'
                    : 'text-indigo-500 scale-100 opacity-100'
                  : 'opacity-0 scale-50'
              }
            `}
            strokeWidth={3}
          />

          {animating && (
            <>
              <span className="absolute w-1 h-1 rounded-full bg-emerald-400 -top-0.5 left-1 animate-ping" />
              <span className="absolute w-1 h-1 rounded-full bg-emerald-400 top-1 -right-0.5 animate-ping" />
              <span className="absolute w-1 h-1 rounded-full bg-emerald-400 -bottom-0.5 right-2 animate-ping" />
            </>
          )}
        </>
      )}

      {completed && (
        <span
          className="
            relative
            flex
            items-center
            justify-center
            rounded-full
            bg-emerald-500
            text-white
            shadow-sm
            animate-[taskCheckPop_280ms_ease-out]
          "
          style={{
            width: size,
            height: size,
          }}
        >
          <Check
            size={size * 0.62}
            strokeWidth={3}
            className="animate-[taskCheckDraw_300ms_ease-out]"
          />
        </span>
      )}

      <style>{`
        @keyframes taskCheckPop {
          0% {
            transform: scale(0.65);
            opacity: 0.4;
          }

          55% {
            transform: scale(1.16);
            opacity: 1;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes taskCheckDraw {
          0% {
            transform: scale(0.4) rotate(-8deg);
            opacity: 0;
          }

          60% {
            transform: scale(1.15) rotate(2deg);
            opacity: 1;
          }

          100% {
            transform: scale(1) rotate(0);
            opacity: 1;
          }
        }
      `}</style>
    </button>
  );
}