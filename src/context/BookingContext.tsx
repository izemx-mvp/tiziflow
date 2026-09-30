import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { motos } from "@/data/motos";
import { circuits } from "@/data/circuits";
import { activities } from "@/data/activities";

export type BookingType = "moto" | "circuit";
export type BookingSlot = "matin" | "apres-midi" | "journee";
export type MotoDuration = "demi-journee" | "journee" | "plusieurs-jours";

export type BookingState = {
  step: number;
  type: BookingType;
  motoSlug?: string;
  circuitSlug?: string;
  motoDuration: MotoDuration;
  days: number;
  quantity: number;
  people: number;
  addMotoPerParticipant: boolean;
  date?: string;
  slot?: BookingSlot;
  addons: string[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phonePrefix: string;
    phone: string;
    nationality: string;
    experience: string;
    notes: string;
    terms: boolean;
  };
};

const initial: BookingState = {
  step: 1,
  type: "circuit",
  motoDuration: "journee",
  days: 2,
  quantity: 1,
  people: 2,
  addMotoPerParticipant: false,
  addons: [],
  customer: {
    firstName: "",
    lastName: "",
    email: "",
    phonePrefix: "+212",
    phone: "",
    nationality: "",
    experience: "",
    notes: "",
    terms: false,
  },
};

type Action =
  | { type: "patch"; patch: Partial<BookingState> }
  | { type: "customer"; patch: Partial<BookingState["customer"]> }
  | { type: "toggleAddon"; slug: string }
  | { type: "step"; step: number }
  | { type: "reset" };

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "customer":
      return { ...state, customer: { ...state.customer, ...action.patch } };
    case "toggleAddon":
      return {
        ...state,
        addons: state.addons.includes(action.slug)
          ? state.addons.filter((a) => a !== action.slug)
          : [...state.addons, action.slug],
      };
    case "step":
      return { ...state, step: Math.min(5, Math.max(1, action.step)) };
    case "reset":
      return initial;
  }
}

const KEY = "tiziflow.booking";

type Ctx = {
  state: BookingState;
  dispatch: React.Dispatch<Action>;
  total: number;
  itemName: string;
};

const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // restore from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) dispatch({ type: "patch", patch: JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const { total, itemName } = useMemo(() => computeTotal(state), [state]);

  return (
    <BookingContext.Provider value={{ state, dispatch, total, itemName }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

export function computeTotal(state: BookingState) {
  let total = 0;
  let itemName = "";

  if (state.type === "moto") {
    const moto = motos.find((m) => m.slug === state.motoSlug) ?? motos[0];
    itemName = moto.name;
    const unit =
      state.motoDuration === "demi-journee"
        ? moto.pricePerHalfDay
        : state.motoDuration === "journee"
          ? moto.pricePerDay
          : moto.pricePerDay * Math.max(1, state.days);
    total += unit * Math.max(1, state.quantity);
  } else {
    const circuit = circuits.find((c) => c.slug === state.circuitSlug) ?? circuits[0];
    itemName = circuit.title.fr;
    total += circuit.pricePerPerson * Math.max(1, state.people);
    if (state.addMotoPerParticipant) {
      const moto = motos.find((m) => m.slug === state.motoSlug) ?? motos[0];
      total += moto.pricePerDay * Math.max(1, state.people);
    }
  }

  const persons = state.type === "circuit" ? Math.max(1, state.people) : Math.max(1, state.quantity);
  for (const slug of state.addons) {
    const a = activities.find((x) => x.slug === slug);
    if (a) total += a.price * persons;
  }

  return { total, itemName };
}
