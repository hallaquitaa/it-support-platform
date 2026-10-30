import { useTheme } from '../../contexts/ThemeContext';

/**
 * Fondo ambiental compartido de Hall-IT.
 * Usa gradientes radiales (sin filtros blur gigantes) y movimiento por transform.
 * Se desactiva la animación en pantallas pequeñas y con reduced-motion.
 */
export default function AuraPageBackground({ className = '' }) {
  const { darkMode } = useTheme();

  return (
    <div
      aria-hidden="true"
      className={`aura-background ${darkMode ? 'dark' : ''} ${className}`}
    >
      <span className="aura-background__orb aura-background__orb--blue" />
      <span className="aura-background__orb aura-background__orb--violet" />
      <span className="aura-background__grid" />
    </div>
  );
}
