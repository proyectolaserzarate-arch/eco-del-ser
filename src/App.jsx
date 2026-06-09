import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, History, Home, Sparkles, X } from "lucide-react";
import "./App.css";

import logoEco from "./assets/logo-eco.jpeg";

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

const APP_VERSION = "0.3.0-correccion";
const STORAGE_KEY = "eco-del-ser-reservas-v2";

const EXPERIENCES = [
  {
    id: "presencia",
    title: "PRESENCIA",
    guide: "Eze",
    accent: "#4e7c59",
    frontImage: presenciaFront,
    backImage: presenciaBack,
    phrase: "Estar acá, ahora, con lo que hay.",
    backTitle: "Un espacio para volver al presente",
    description:
      "Una dinámica breve para registrar cómo estás, bajar el ruido mental y reconectar con tu centro desde preguntas simples y presencia compartida.",
  },
  {
    id: "bajar-a-tierra",
    title: "BAJAR A TIERRA",
    guide: "Romi",
    accent: "#8b6d35",
    frontImage: bajarATierraFront,
    backImage: bajarATierraBack,
    phrase: "Ordenar, respirar, hacer concreto.",
    backTitle: "Un espacio para ordenar lo interno",
    description:
      "Una experiencia para convertir sensaciones, ideas o preocupaciones en algo más claro, simple y accionable.",
  },
  {
    id: "abrazar",
    title: "ABRAZAR",
    guide: "Clau",
    accent: "#a74f72",
    frontImage: abrazarFront,
    backImage: abrazarBack,
    phrase: "Reconocer y abrazar lo que aparece.",
    backTitle: "Un espacio de aceptación y cuidado",
    description:
      "Una dinámica para mirar con ternura aquello que estás transitando y encontrar una forma amable de acompañarlo.",
  },
  {
    id: "incomodar",
    title: "INCOMODAR",
    guide: "Ely",
    accent: "#654f9d",
    frontImage: incomodarFront,
    backImage: incomodarBack,
    phrase: "Preguntas que abren movimiento.",
    backTitle: "Un espacio para mover lo establecido",
    description:
      "Una experiencia con preguntas que invitan a revisar creencias, tensiones o decisiones desde otro lugar.",
  },
  {
    id: "expandir",
    title: "EXPANDIR",
    guide: "Lu",
    accent: "#9b7814",
    frontImage: expandirFront,
    backImage: expandirBack,
    phrase: "Abrir posibilidades nuevas.",
    backTitle: "Un espacio para ampliar mirada",
    description:
      "Una dinámica para explorar recursos, posibilidades y nuevas formas de mirar una situación personal o grupal.",
  },
];

const TIME_SLOTS = [
  { id: "11-00", label: "11:00 - 11:30" },
  { id: "13-00", label: "13:00 - 14:30" },
  { id: "16-00", label: "16:00 - 16:30" },
];

function getNextSaturdays(count = 5) {
  const dates = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dates.length < count) {
    if (cursor.getDay() === 6) dates.push(new Date(cursor));
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
  return (
    <div
      className={
        "rounded-[1.8rem] border border-[#d7c4a7] bg-[#fff8ed]/82 shadow-xl backdrop-blur " +
        className
      }
    >
      {children}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedExperienceId, setSelectedExperienceId] = useState(EXPERIENCES[0].id);
  const [fullscreenCardId, setFullscreenCardId] = useState(null);
  const [fullscreenSide, setFullscreenSide] = useState("front");
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(getNextSaturdays(1)[0]));
  const [selectedSlotId, setSelectedSlotId] = useState(TIME_SLOTS[0].id);
  const [guestName, setGuestName] = useState("");
  const [reservations, setReservations] = useState(loadReservations);

  const saturdays = useMemo(() => getNextSaturdays(5), []);
  const selectedExperience =
    EXPERIENCES.find((item) => item.id === selectedExperienceId) || EXPERIENCES[0];
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

  function openCard(experience) {
    setSelectedExperienceId(experience.id);
    setFullscreenSide("front");
    setFullscreenCardId(experience.id);
  }

  function createReservation() {
    if (isSlotTaken(selectedExperience, selectedDateKey, selectedSlotId)) return;

    if (!guestName.trim()) {
      alert("Escribí el nombre de la persona interesada.");
      return;
    }

    const slot = TIME_SLOTS.find((item) => item.id === selectedSlotId);

    const reservation = {
      id: crypto.randomUUID(),
      experienceId: selectedExperience.id,
      title: selectedExperience.title,
      guide: selectedExperience.guide,
      guestName: guestName.trim(),
      dateKey: selectedDateKey,
      dateLabel: formatDate(new Date(`${selectedDateKey}T12:00:00`)),
      slotId: selectedSlotId,
      slotLabel: slot?.label || "",
      createdAt: new Date().toISOString(),
    };

    setReservations((previous) => [reservation, ...previous]);
    setGuestName("");
    setScreen("history");
  }

  function removeReservation(id) {
    setReservations((previous) => previous.filter((reservation) => reservation.id !== id));
  }

  function sendReservationWhatsApp(reservation) {
    const message = [
      "Hola, quiero confirmar una reserva de Eco del Ser.",
      "",
      `Nombre: ${reservation.guestName || "Sin nombre"}`,
      `Experiencia: ${reservation.title}`,
      `Facilitador/a: ${reservation.guide}`,
      `Fecha: ${reservation.dateLabel}`,
      `Horario: ${reservation.slotLabel}`,
    ].join("\n");

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  function ExperienceCard({ experience, index }) {
    const isSelected = selectedExperienceId === experience.id;

    return (
      <motion.div
        role="button"
        tabIndex={0}
        onClick={() => openCard(experience)}
        onKeyDown={(event) => {
          if (event.key === "Enter") openCard(experience);
        }}
        whileTap={{ scale: 0.97 }}
        animate={{
          scale: isSelected ? 1 : 0.84,
          y: isSelected ? -10 : 0,
          opacity: isSelected ? 1 : 0.5,
          rotate: isSelected ? 0 : index % 2 === 0 ? -2 : 2,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className={
          "relative h-[390px] min-w-[82vw] max-w-[350px] snap-center rounded-[2rem] border-[5px] bg-[#f7efe1] p-2 text-left " +
          (isSelected ? "shadow-[0_24px_55px_rgba(92,70,52,0.38)]" : "shadow-md")
        }
        style={{
          borderColor: isSelected ? experience.accent : "#cdb899",
        }}
      >
        <img
          src={experience.frontImage}
          alt={experience.title}
          className="h-full w-full rounded-[1.45rem] object-contain bg-[#f7efe1]"
        />

        <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-[#5c4634]/88 px-4 py-3 text-center text-white shadow-xl backdrop-blur">
          <div className="text-xs font-black uppercase tracking-[0.18em]">
            Tocar para abrir
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-[#efe7d8] text-[#5c4634]"
      style={{ fontFamily: "Nunito, ui-sans-serif, system-ui" }}
    >
      <div className="pointer-events-none fixed left-3 top-3 z-[70] rounded-full bg-[#fff8ed]/85 px-3 py-1 text-[10px] font-bold text-[#5c4634]/70 shadow-sm">
        Eco del Ser v{APP_VERSION}
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,#fff8ed_0%,#efe7d8_52%,#d8c4a8_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center px-4 py-5 text-center">
        <nav className="mb-5 flex w-full max-w-md items-center justify-between rounded-full border border-[#d7c4a7] bg-[#fff8ed]/75 px-3 py-2 shadow-md backdrop-blur">
          <button type="button" onClick={() => setScreen("home")} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-[#5c4634]">
            <Home className="h-4 w-4" /> Inicio
          </button>
          <button type="button" onClick={() => setScreen("tarot")} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-[#5c4634]">
            <Sparkles className="h-4 w-4" /> Cartas
          </button>
          <button type="button" onClick={() => setScreen("history")} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-[#5c4634]">
            <History className="h-4 w-4" /> Historial
          </button>
        </nav>

        <AnimatePresence mode="wait">
          {screen === "home" ? (
            <motion.main
              key="home"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <img
                src={logoEco}
                alt="Eco del Ser"
                className="mb-6 h-28 w-28 rounded-full object-contain shadow-2xl"
              />

              <h1 className="text-5xl font-black tracking-tight text-[#5c4634]">
                Eco del Ser
              </h1>

              <p className="mt-5 max-w-md text-lg font-semibold leading-relaxed text-[#5c4634]/80">
                Espacios breves de reflexión, presencia y crecimiento personal. Elegí una carta y descubrí una experiencia.
              </p>

              <button
                type="button"
                onClick={() => setScreen("tarot")}
                className="mt-8 rounded-full bg-[#8c6b4f] px-8 py-4 text-base font-black text-white shadow-2xl"
              >
                Comenzar experiencia
              </button>
            </motion.main>
          ) : null}

          {screen === "tarot" ? (
            <motion.main
              key="tarot"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex min-h-0 w-full flex-1 flex-col"
            >
              <div className="mb-2">
                <h2 className="text-3xl font-black text-[#5c4634]">Elegí tu carta</h2>
                <p className="mt-1 text-sm font-semibold text-[#5c4634]/70">
                  Deslizá hacia los lados. Tocá una carta para verla completa.
                </p>
              </div>

              <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[9vw] pb-5 pt-5">
                {EXPERIENCES.map((experience, index) => (
                  <ExperienceCard key={experience.id} experience={experience} index={index} />
                ))}
              </div>

              <CardShell className="mt-auto p-5">
                <div className="text-center">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-[#5c4634]/55">
                    Experiencia seleccionada
                  </div>

                  <h3 className="mt-2 text-3xl font-black text-[#5c4634]">
                    {selectedExperience.title}
                  </h3>

                  <p className="mt-1 text-sm font-black text-[#5c4634]/70">
                    Facilitador/a: {selectedExperience.guide}
                  </p>

                  <p className="mt-4 text-lg font-black leading-snug text-[#8c6b4f]">
                    {selectedExperience.phrase}
                  </p>

                  <div className="mx-auto my-4 h-px w-20 bg-[#cdb899]" />

                  <h4 className="text-base font-black text-[#5c4634]">
                    {selectedExperience.backTitle}
                  </h4>

                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5c4634]/75">
                    {selectedExperience.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => openCard(selectedExperience)}
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
            <motion.main
              key="booking"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex w-full max-w-md flex-1 flex-col gap-4"
            >
              <CardShell className="p-5">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-[#5c4634]/55">
                  Reservar experiencia
                </div>
                <h2 className="mt-2 text-3xl font-black text-[#5c4634]">
                  {selectedExperience.title}
                </h2>
                <p className="mt-1 font-semibold text-[#5c4634]/70">
                  Con {selectedExperience.guide}. Turnos disponibles solo los sábados.
                </p>
              </CardShell>

              <CardShell className="p-5">
                <div className="mb-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#5c4634]/65">
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
                        className={
                          "rounded-2xl border px-4 py-3 text-center text-sm font-black shadow-sm " +
                          (isSelected
                            ? "border-[#8c6b4f] bg-[#8c6b4f] text-white"
                            : "border-[#d7c4a7] bg-[#fff8ed] text-[#5c4634]")
                        }
                      >
                        {formatDate(date)}
                      </button>
                    );
                  })}
                </div>
              </CardShell>

              <CardShell className="p-5">
                <div className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#5c4634]/65">
                  Elegí turno
                </div>

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
                        className={
                          "rounded-2xl border px-4 py-3 text-center text-sm font-black shadow-sm " +
                          (taken
                            ? "border-[#d7c4a7] bg-[#efe4d4] text-[#5c4634]/35"
                            : isSelected
                              ? "border-[#8c6b4f] bg-[#8c6b4f] text-white"
                              : "border-[#d7c4a7] bg-[#fff8ed] text-[#5c4634]")
                        }
                      >
                        {slot.label} {taken ? "· Completo" : ""}
                      </button>
                    );
                  })}
                </div>
              </CardShell>

              <CardShell className="p-5">
                <div className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#5c4634]/65">
                  Nombre de la persona interesada
                </div>

                <input
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Ej: María"
                  className="w-full rounded-2xl border border-[#cdb899] bg-[#fff8ed] px-4 py-3 text-center text-base font-bold text-[#5c4634] outline-none"
                />
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
            <motion.main
              key="history"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex w-full max-w-md flex-1 flex-col"
            >
              <h2 className="text-3xl font-black text-[#5c4634]">Mis experiencias</h2>
              <p className="mt-1 text-sm font-semibold text-[#5c4634]/70">
                Reservas guardadas localmente en este dispositivo.
              </p>

              <div className="mt-5 space-y-3 overflow-y-auto pb-6">
                {reservations.length === 0 ? (
                  <CardShell className="p-5 text-center font-semibold text-[#5c4634]/70">
                    Todavía no tenés reservas guardadas.
                  </CardShell>
                ) : null}

                {reservations.map((reservation) => (
                  <CardShell key={reservation.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-left">
                        <h3 className="text-xl font-black text-[#5c4634]">
                          {reservation.title}
                        </h3>
                        <p className="text-sm font-black text-[#8c6b4f]">
                          {reservation.guestName || "Sin nombre"}
                        </p>
                        <p className="text-sm font-semibold text-[#5c4634]/70">
                          Con {reservation.guide}
                        </p>
                        <p className="mt-2 text-sm font-black text-[#5c4634]">
                          {reservation.dateLabel}
                        </p>
                        <p className="text-sm font-semibold text-[#5c4634]/70">
                          {reservation.slotLabel}
                        </p>

                        <button
                          type="button"
                          onClick={() => sendReservationWhatsApp(reservation)}
                          className="mt-3 rounded-full bg-[#25D366] px-4 py-2 text-sm font-black text-white shadow-md"
                        >
                          Enviar por WhatsApp
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeReservation(reservation.id)}
                        className="rounded-full bg-[#8c6b4f]/15 p-2 text-[#5c4634]"
                      >
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
            <motion.div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-[#3b2b20]/78 p-3 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFullscreenCardId(null)}
            >
              <motion.div
                initial={{ scale: 0.92, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 30 }}
                className="relative flex h-[94vh] w-full max-w-[430px] flex-col rounded-[2rem] bg-[#f8efe2] p-3 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setFullscreenCardId(null)}
                  className="absolute right-4 top-4 z-20 rounded-full bg-[#5c4634]/90 p-3 text-white shadow-lg"
                >
                  <X className="h-5 w-5" />
                </button>

                <img
                  src={
                    fullscreenSide === "back"
                      ? fullscreenExperience.backImage
                      : fullscreenExperience.frontImage
                  }
                  alt={fullscreenExperience.title}
                  className="min-h-0 flex-1 rounded-[1.5rem] object-contain"
                />

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFullscreenSide((current) => (current === "back" ? "front" : "back"))
                    }
                    className="rounded-full bg-[#e8ddcb] px-4 py-3 text-sm font-black text-[#5c4634] shadow-md"
                  >
                    Girar carta
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExperienceId(fullscreenExperience.id);
                      setFullscreenCardId(null);
                      setScreen("booking");
                    }}
                    className="rounded-full bg-[#8c6b4f] px-4 py-3 text-sm font-black text-white shadow-lg"
                  >
                    Reservar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
