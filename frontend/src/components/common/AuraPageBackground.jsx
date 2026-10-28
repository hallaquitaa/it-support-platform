import { useTheme } from '../../contexts/ThemeContext';

/**
 * Subtle AURA atmosphere based on Login.jsx's blue/violet glow and 42px grid.
 * Animated orbs are deliberately low contrast so content remains the focus.
 */
export default function AuraPageBackground() {
  const { darkMode } = useTheme();

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${darkMode ? 'bg-[#080D18]' : 'bg-[#F5F7FC']}`}>
      <div className={`absolute -right-32 -top-40 h-[27rem] w-[27rem] rounded-full blur-3xl ${darkMode ? 'bg-blue-500/[0.12]' : 'bg-blue-500/[0.10]'} animate-[auraOrbBlue_18s_ease-in-out_infinite_alternate]`} />
      <div className={`absolute -bottom-48 -left-32 h-[30rem] w-[30rem] rounded-full blur-3xl ${darkMode ? 'bg-violet-500/[0.11]' : 'bg-violet-500/[0.09]'} animate-[auraOrbViolet_22s_ease-in-out_infinite_alternate]`} />
      <div className={`absolute inset-0 ${darkMode ? 'opacity-[0.035]' : 'opacity-[0.04]'}`} style={{ backgroundImage: 'linear-gradient(rgba(100,116,139,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.7) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
    </div>
  );
}
