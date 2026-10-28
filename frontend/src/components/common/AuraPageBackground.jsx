import { useTheme } from '../../contexts/ThemeContext';

/**
 * Fondo ambiental AURA basado en los tonos azul/violeta
 * y la cuadrícula de 42px de Login.jsx.
 */
export default function AuraPageBackground() {
  const { darkMode } = useTheme();

  const backgroundColor = darkMode
    ? 'bg-[#080D18]'
    : 'bg-[#F5F7FC]';

  const blueGlow = darkMode
    ? 'bg-blue-500/[0.12]'
    : 'bg-blue-500/[0.10]';

  const violetGlow = darkMode
    ? 'bg-violet-500/[0.11]'
    : 'bg-violet-500/[0.09]';

  const gridOpacity = darkMode
    ? 'opacity-[0.035]'
    : 'opacity-[0.04]';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${backgroundColor}`}
    >
      <div
        className={`absolute -right-32 -top-40 h-[27rem] w-[27rem] rounded-full blur-3xl ${blueGlow} animate-[auraOrbBlue_18s_ease-in-out_infinite_alternate]`}
      />
      <div
        className={`absolute -bottom-48 -left-32 h-[30rem] w-[30rem] rounded-full blur-3xl ${violetGlow} animate-[auraOrbViolet_22s_ease-in-out_infinite_alternate]`}
      />
      <div
        className={`absolute inset-0 ${gridOpacity}`}
        style={{
          backgroundImage:
            'linear-gradient(rgba(100,116,139,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.7) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
    </div>
  );
}
