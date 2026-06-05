import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, History, Home, Sparkles, X } from "lucide-react";
import "./App.css";

import presenciaFront from "./assets/cards/presencia-front.png";
import presenciaBack from "./assets/cards/presencia-back.png";
import bajarATierraFront from "./assets/cards/bajar-a-tierra-front.png";
import bajarATierraBack from "./assets/cards/bajar-a-tierra-back.png";
import abrazarFront from "./assets/cards/abrazar-front.png";
import abrazarBack from "./assets/cards/abrazar-back.png";
import incomodarFront from "./assets/cards/incomodar-front.png";
import incomodarBack from "./assets/cards/incomodar-back.png";
import expandirFront from "./assets/cards/expandir-front.png";
import expandirBack from "./assets/cards/expandir-back.png";

const APP_VERSION = "0.2.0-sepia";
const STORAGE_KEY = "eco-del-ser-reservas-v1";

const EXPERIENCES = [
  {
    id: "presencia",
    title: "PRESENCIA",
    guide: "Eze",
    color: "#b8d8c0",
    accent: "#4e7c59",
    frontImage: presenciaFront,
    backImage: presenciaBack,
    phrase: "Estar acá, ahora, con lo que hay.",
    front: "PRESENCIA",
    backTitle: "Un espacio para volver al presente",
    description:
      "Una dinámica breve para registrar cómo estás, bajar el ruido mental y reconectar con tu centro desde preguntas simples y presencia compartida.",
  },
  {
    id: "bajar-a-tierra",
    title: "BAJAR A TIERRA",
    guide: "Romi",
    color: "#d8c49a",
    accent: "#8b6d35",
    frontImage: bajarATierraFront,
    backImage: bajarATierraBack,
    phrase: "Ordenar, respirar, hacer concreto.",
    front: "BAJAR A TIERRA",
    backTitle: "Un espacio para ordenar lo interno",
    description:
      "Una experiencia para convertir sensaciones, ideas o preocupaciones en algo más claro, simple y accionable.",
  },
  {
    id: "abrazar",
    title: "ABRAZAR",
    guide: "Clau",
    color: "#e8b6c8",
    accent: "#a74f72",
    frontImage: abrazarFront,
    backImage: abrazarBack,
    phrase: "Reconocer y abrazar lo que aparece.",
    front: "ABRAZAR",
    backTitle: "Un espacio de aceptación y cuidado",
    description:
      "Una dinámica para mirar con ternura aquello que estás transitando y encontrar una forma amable de acompañarlo.",
  },
  {
    id: "incomodar",
    title: "INCOMODAR",
    guide: "Ely",
    color: "#b6a5d8",
    accent: "#654f9d",
    frontImage: incomodarFront,
    backImage: incomodarBack,
    phrase: "Preguntas que abren movimiento.",
    front: "INCOMODAR",
    backTitle: "Un espacio para mover lo establecido",
    description:
      "Una experiencia con preguntas que invitan a revisar creencias, tensiones o decisiones desde otro lugar.",
  },
  {
    id: "expandir",
    title: "EXPANDIR",
    guide: "Lu",
    color: "#f2d36b",
    accent: "#9b7814",
    frontImage: expandirFront,
    backImage: expandirBack,
    phrase: "Abrir posibilidades nuevas.",
    front: "EXPANDIR",
    backTitle: "Un espacio para ampliar mirada",
    description:
      "Una dinámica para explorar recursos, posibilidades y nuevas formas de mirar una situación personal o grupal.",
  },
];

const TIME_SLOTS = [
  { id: "11-00", label: "11:00 – 11:30" },
  { id: "13-00", label: "13:00 – 14:30" },
  { id: "16-00", label: "16:00 – 16:30" },
];

function getNextSaturdays(count = 4) {
  const dates = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dates.length < count) {
    if (cursor.getDay() === 6) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function formatDate(date) {
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function loadReservations() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function CardShell({ children, className = "" }) {
  return <div className={`rounded-[2rem] border border-white/40 bg-white/30 shadow-xl backdrop-blur ${className}`}>{children}</div>;
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedExperienceId, setSelectedExperienceId] = useState(EXPERIENCES[0].id);
  const [fullscreenCardId, setFullscreenCardId] = useState(null);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(getNextSaturdays(1)[0]));
  const [selectedSlotId, setSelectedSlotId] = useState(TIME_SLOTS[0].id);
  const [reservations, setReservations] = useState(loadReservations);

  const saturdays = useMemo(() => getNextSaturdays(5), []);
  const selectedExperience = EXPERIENCES.find((item) => item.id === selectedExperienceId) || EXPERIENCES[0];
  const fullscreenExperience = EXPERIENCES.find((item) => item.id === fullscreenCardId);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  }, [reservations]);

  function isSlotTaken(experience, dateKey, slotId) {
    return reservations.some(
      (reservation) =>
        reservation.experienceId === experience.id &&
        reservation.guide === experience.guide &&
        reservation.dateKey === dateKey &&
        reservation.slotId === slotId
    );
  }

  function createReservation() {
    if (isSlotTaken(selectedExperience, selectedDateKey, selectedSlotId)) return;

    const slot = TIME_SLOTS.find((item) => item.id === selectedSlotId);
    const reservation = {
      id: crypto.randomUUID(),
      experienceId: selectedExperience.id,
      title: selectedExperience.title,
      guide: selectedExperience.guide,
      dateKey: selectedDateKey,
      dateLabel: formatDate(new Date(`${selectedDateKey}T12:00:00`)),
      slotId: selectedSlotId,
      slotLabel: slot?.label || "",
      createdAt: new Date().toISOString(),
    };

    setReservations((previous) => [reservation, ...previous]);
    setScreen("history");
  }

  function removeReservation(id) {
    setReservations((previous) => previous.filter((reservation) => reservation.id !== id));
  }

  function ExperienceCard({ experience, index }) {
  const isSelected = selectedExperienceId === experience.id;
  const isFlipped = flippedCardId === experience.id;

  return (
    <motion.button
      type="button"
      layout
      onClick={() => setSelectedExperienceId(experience.id)}
      onDoubleClick={() => setFullscreenCardId(experience.id)}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: isSelected ? 1.06 : 0.94, y: isSelected ? -12 : 0, rotate: index % 2 === 0 ? -2 : 2 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="relative h-[420px] min-w-[78vw] max-w-[360px] snap-center rounded-[2rem] border-4 bg-[#f7efe1] p-1.5 text-left shadow-2xl"
      style={{ borderColor: experience.accent }}
    >
      <div className="absolute left-1/2 top-3 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black/10" />

      <div className="relative h-full overflow-hidden rounded-[1.5rem] bg-black">
        <img
          src={isFlipped ? experience.backImage : experience.frontImage}
          alt={experience.title}
          className="h-full w-full object-contain bg-[#f7efe1]"
        />

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-full bg-black/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
          <span>{isSelected ? "Seleccionada" : experience.guide}</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setFlippedCardId(isFlipped ? null : experience.id);
            }}
            className="rounded-full bg-white/25 px-3 py-1"
          >
            Girar
          </button>
        </div>
      </div>
    </motion.button>
  );
}

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#efe7d8] text-[#5c4634]" style={{ fontFamily: "Nunito, ui-sans-serif, system-ui" }}>
      <div className="pointer-events-none fixed left-3 top-3 z-[70] rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white/70">
        Eco del Ser v{APP_VERSION}
      </div>

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,#fff8ed_0%,#efe7d8_48%,#d8c4a8_100%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-5">
        <nav className="mb-5 flex items-center justify-between rounded-full border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
          <button type="button" onClick={() => setScreen("home")} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold">
            <Home className="h-4 w-4" /> Inicio
          </button>
          <button type="button" onClick={() => setScreen("tarot")} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold">
            <Sparkles className="h-4 w-4" /> Cartas
          </button>
          <button type="button" onClick={() => setScreen("history")} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold">
            <History className="h-4 w-4" /> Historial
          </button>
        </nav>

        <AnimatePresence mode="wait">
          {screen === "home" ? (
            <motion.main key="home" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 text-5xl shadow-2xl">
                ✺
              </div>
              <h1 className="text-5xl font-black tracking-tight">Eco del Ser</h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-[#f8ead4]/80">
                Espacios breves de reflexión, presencia y crecimiento personal. Elegí una carta y descubrí una experiencia.
              </p>
              <button
                type="button"
                onClick={() => setScreen("tarot")}
                className="mt-8 rounded-full bg-[#f8ead4] px-8 py-4 text-base font-black text-[#2a1b12] shadow-2xl"
              >
                Comenzar experiencia
              </button>
            </motion.main>
          ) : null}

          {screen === "tarot" ? (
            <motion.main key="tarot" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex min-h-0 flex-1 flex-col">
              <div className="mb-4">
                <h2 className="text-3xl font-black">Elegí tu carta</h2>
                <p className="mt-1 text-sm text-[#f8ead4]/70">Deslizá hacia los lados. Doble toque para abrir en pantalla completa.</p>
              </div>

              <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[10vw] pb-8 pt-5">
                {EXPERIENCES.map((experience, index) => (
                  <ExperienceCard key={experience.id} experience={experience} index={index} />
                ))}
              </div>

              <CardShell className="mt-auto p-5">
  <div className="text-center">
    <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">
      Experiencia seleccionada
    </div>

    <h3 className="mt-2 text-3xl font-black">{selectedExperience.title}</h3>
    <p className="mt-1 text-sm font-bold text-white/70">
      Facilitador/a: {selectedExperience.guide}
    </p>

    <p className="mt-4 text-lg font-bold leading-snug text-[#f8ead4]">
      {selectedExperience.phrase}
    </p>

    <div className="mx-auto my-4 h-px w-20 bg-white/20" />

    <h4 className="text-base font-black text-white/90">
      {selectedExperience.backTitle}
    </h4>

    <p className="mt-2 text-sm leading-relaxed text-white/70">
      {selectedExperience.description}
    </p>

    <div className="mt-5 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => setFullscreenCardId(selectedExperience.id)}
        className="rounded-full bg-[#e8ddcb] px-4 py-3 text-sm font-black text-[#5c4634] shadow-md"
      >
        Ver carta
      </button>

      <button
        type="button"
        onClick={() => setScreen("booking")}
        className="rounded-full bg-[#8c6b4f] px-4 py-3 text-sm font-black text-white shadow-lg"
      >
        Reservar
      </button>
    </div>
  </div>
</CardShell>
            </motion.main>
          ) : null}

          {screen === "booking" ? (
            <motion.main key="booking" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex flex-1 flex-col gap-4">
              <button type="button" onClick={() => setScreen("tarot")} className="flex items-center gap-2 self-start text-sm font-bold text-white/70">
                <ChevronLeft className="h-4 w-4" /> Volver a cartas
              </button>

              <CardShell className="p-5">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Reservar experiencia</div>
                <h2 className="mt-2 text-3xl font-black">{selectedExperience.title}</h2>
                <p className="mt-1 text-white/70">Con {selectedExperience.guide}. Turnos disponibles solo los sábados.</p>
              </CardShell>

              <CardShell className="p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white/60">
                  <CalendarDays className="h-4 w-4" /> Elegí sábado
                </div>
                <div className="grid gap-2">
                  {saturdays.map((date) => {
                    const dateKey = toDateKey(date);
                    const isSelected = selectedDateKey === dateKey;
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => setSelectedDateKey(dateKey)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold ${isSelected ? "border-[#f8ead4] bg-[#f8ead4] text-[#2a1b12]" : "border-white/15 bg-white/5 text-white/75"}`}
                      >
                        {formatDate(date)}
                      </button>
                    );
                  })}
                </div>
              </CardShell>

              <CardShell className="p-5">
                <div className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-white/60">Elegí turno</div>
                <div className="grid gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const taken = isSlotTaken(selectedExperience, selectedDateKey, slot.id);
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={taken}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-black ${taken ? "border-white/10 bg-white/5 text-white/30" : isSelected ? "border-[#f8ead4] bg-[#f8ead4] text-[#2a1b12]" : "border-white/15 bg-white/5 text-white/75"}`}
                      >
                        {slot.label} {taken ? "· Completo" : ""}
                      </button>
                    );
                  })}
                </div>
              </CardShell>

              <button
                type="button"
                onClick={createReservation}
                disabled={isSlotTaken(selectedExperience, selectedDateKey, selectedSlotId)}
                className="mt-auto rounded-full bg-[#8c6b4f] px-8 py-4 text-base font-black text-white shadow-xl disabled:opacity-40"
              >
                Confirmar reserva
              </button>
            </motion.main>
          ) : null}

          {screen === "history" ? (
            <motion.main key="history" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex flex-1 flex-col">
              <h2 className="text-3xl font-black">Mis experiencias</h2>
              <p className="mt-1 text-sm text-[#f8ead4]/70">Reservas guardadas localmente en este dispositivo.</p>

              <div className="mt-5 space-y-3 overflow-y-auto pb-6">
                {reservations.length === 0 ? (
                  <CardShell className="p-5 text-center text-white/70">Todavía no tenés reservas guardadas.</CardShell>
                ) : null}

                {reservations.map((reservation) => (
                  <CardShell key={reservation.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black">{reservation.title}</h3>
                        <p className="text-sm text-white/70">Con {reservation.guide}</p>
                        <p className="mt-2 text-sm font-bold text-white/85">{reservation.dateLabel}</p>
                        <p className="text-sm text-white/70">{reservation.slotLabel}</p>
                      </div>
                      <button type="button" onClick={() => removeReservation(reservation.id)} className="rounded-full bg-white/10 p-2">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </CardShell>
                ))}
              </div>
            </motion.main>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {fullscreenExperience ? (
            <motion.div className="fixed inset-0 z-[90] bg-[#160f0b]/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFullscreenCardId(null)}>
              <motion.div
                initial={{ scale: 0.92, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 30 }}
                className="mx-auto flex h-full max-w-md flex-col rounded-[2.5rem] border-4 bg-[#f7efe1] p-4 text-[#2d2520] shadow-2xl"
                style={{ borderColor: fullscreenExperience.accent }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-black/45">{fullscreenExperience.guide}</div>
                  <button type="button" onClick={() => setFullscreenCardId(null)} className="rounded-full bg-black/10 p-3">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 flex flex-1 flex-col justify-between rounded-[2rem] p-6" style={{ backgroundColor: fullscreenExperience.color }}>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.24em] text-black/45">Eco del Ser</div>
                    <h2 className="mt-6 text-5xl font-black leading-none">{fullscreenExperience.title}</h2>
                    <p className="mt-5 text-lg font-bold leading-relaxed text-black/60">{fullscreenExperience.phrase}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-black">{fullscreenExperience.backTitle}</h3>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-black/65">{fullscreenExperience.description}</p>
                    <button type="button" onClick={() => { setSelectedExperienceId(fullscreenExperience.id); setFullscreenCardId(null); setScreen("booking"); }} className="mt-6 w-full rounded-full bg-[#2d2520] px-6 py-4 font-black text-[#f8ead4]">
                      Quiero vivir esta experiencia
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
