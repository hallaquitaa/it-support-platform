
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Check,
  MapPin,
  ShieldCheck,
  User,
  Briefcase,
  Contact,
  Mail,
  Building2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuraPageBackground from '../components/common/AuraPageBackground';

const STORAGE_KEY = 'it-support-user-profile';

const emptyProfile = {
  firstName: '',
  lastName: '',
  cedula: '',
  branch: '',
  jobTitle: 'Soporte IT',
  email: '',
  photo: '',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(emptyProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let stored = {};

    try {
      stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '{}'
      );
    } catch {
      stored = {};
    }

    const parts = String(user?.full_name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    setProfile({
      ...emptyProfile,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' '),
      email: user?.email || '',
      ...stored,
    });
  }, [user]);

  const update = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  const onPhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Selecciona un archivo de imagen válido.');
      event.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      window.alert('La imagen debe pesar menos de 3 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      update('photo', String(reader.result || ''));
    };

    reader.onerror = () => {
      window.alert('No se pudo leer la imagen seleccionada.');
      event.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const save = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(profile)
      );
      setSaved(true);
    } catch {
      window.alert(
        'No se pudo guardar el perfil. Prueba con una imagen más pequeña.'
      );
    }
  };

  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() ||
    user?.full_name ||
    'Nuevo usuario';

  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  const fieldClass =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-100 dark:placeholder:text-slate-500';

  const labelClass =
    'text-xs font-medium text-slate-600 dark:text-slate-300';

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#f5f7fc] text-slate-900 dark:bg-[#080d18] dark:text-slate-100">
      <AuraPageBackground />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Regresar al Centro de Mando */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition hover:bg-white/70 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-indigo-300"
        >
          <ArrowLeft size={16} />
          Volver al Centro de Mando
        </button>

        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/80 shadow-[0_12px_36px_rgba(25,35,60,0.06)] backdrop-blur-xl dark:border-white/[0.09] dark:bg-[#11151d]/90">
          {/* CABECERA AZUL: foto y textos dentro del mismo contenedor */}
          <div className="relative min-h-[210px] bg-gradient-to-r from-slate-900 via-[#202943] to-indigo-900 sm:min-h-[230px]">
            {/* Cuadrícula decorativa */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative z-10 flex min-h-[210px] flex-col justify-center gap-5 px-5 py-7 sm:min-h-[230px] sm:flex-row sm:items-center sm:gap-7 sm:px-8">
              {/* Foto del usuario */}
              <div className="flex shrink-0 items-center gap-4">
                <div className="relative shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/90 bg-slate-800 text-2xl font-semibold text-indigo-200 shadow-xl sm:h-28 sm:w-28">
                    {profile.photo ? (
                      <img
                        src={profile.photo}
                        alt="Foto de perfil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Cambiar foto de perfil"
                    title="Cambiar foto de perfil"
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#202943] bg-indigo-600 text-white shadow-md transition hover:bg-indigo-500"
                  >
                    <Camera size={16} />
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onPhoto}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Nombre y descripción: siempre dentro del azul */}
              <div className="min-w-0 flex-1 text-white">
                <div className="mb-2 flex items-center gap-2 text-indigo-200">
                  <ShieldCheck size={15} className="shrink-0" />
                  <span className="font-mono text-[9px] font-semibold tracking-[0.18em]">
                    IT SUPPORT PLATFORM
                  </span>
                </div>

                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
                  Identidad profesional
                </p>

                <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                  {fullName}
                </h1>

                <div className="mt-2 flex items-center gap-2 text-sm text-indigo-100">
                  <Briefcase size={15} className="shrink-0" />
                  <span>
                    {profile.jobTitle || 'Profesional IT'}
                  </span>
                </div>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Gestiona tu información personal y los datos que
                  identifican tu perfil dentro de la plataforma.
                </p>
              </div>

              {/* Indicador de estado */}
              <div className="flex shrink-0 sm:self-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Perfil local
                </span>
              </div>
            </div>
          </div>

          {/* FORMULARIO: permanece en el área blanca */}
          <form onSubmit={save}>
            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Datos personales y profesionales
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Mantén actualizada tu información dentro de la plataforma.
                </p>
              </div>

              <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
                {/* Nombre */}
                <div>
                  <label className={labelClass} htmlFor="firstName">
                    Nombre
                  </label>

                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) =>
                        update('firstName', e.target.value)
                      }
                      className={`${fieldClass} pl-9`}
                      placeholder="Tu nombre"
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                {/* Apellido */}
                <div>
                  <label className={labelClass} htmlFor="lastName">
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) =>
                      update('lastName', e.target.value)
                    }
                    className={fieldClass}
                    placeholder="Tu apellido"
                    autoComplete="family-name"
                  />
                </div>

                {/* Cédula */}
                <div>
                  <label className={labelClass} htmlFor="cedula">
                    Cédula / identificación
                  </label>

                  <div className="relative">
                    <Contact
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="cedula"
                      value={profile.cedula}
                      onChange={(e) =>
                        update('cedula', e.target.value)
                      }
                      className={`${fieldClass} pl-9`}
                      placeholder="Número de identificación"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Sede */}
                <div>
                  <label className={labelClass} htmlFor="branch">
                    Sede / sucursal
                  </label>

                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="branch"
                      value={profile.branch}
                      onChange={(e) =>
                        update('branch', e.target.value)
                      }
                      className={`${fieldClass} pl-9`}
                      placeholder="Sede asignada"
                    />
                  </div>
                </div>

                {/* Cargo */}
                <div>
                  <label className={labelClass} htmlFor="jobTitle">
                    Cargo profesional
                  </label>

                  <div className="relative">
                    <Briefcase
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="jobTitle"
                      value={profile.jobTitle}
                      onChange={(e) =>
                        update('jobTitle', e.target.value)
                      }
                      className={`${fieldClass} pl-9`}
                      placeholder="Ej. Técnico de soporte IT"
                    />
                  </div>
                </div>

                {/* Correo */}
                <div>
                  <label className={labelClass} htmlFor="email">
                    Correo electrónico
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        update('email', e.target.value)
                      }
                      className={`${fieldClass} pl-9`}
                      placeholder="usuario@empresa.com"
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              {/* Información y botón de guardar */}
              <div className="mt-7 flex flex-col justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.025] sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-400/[0.08] dark:text-indigo-300">
                    <Building2 size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      Identidad profesional
                    </p>
                    <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Tu foto y estos campos se guardan en este
                      navegador y no se sincronizan automáticamente
                      con el servidor.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#11151d]"
                >
                  {saved ? (
                    <>
                      <Check size={16} />
                      Guardado
                    </>
                  ) : (
                    'Guardar perfil'
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
