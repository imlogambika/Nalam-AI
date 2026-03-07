import React, { createContext, useContext, useState, ReactNode } from "react";

export type AvatarStyle = "minimalist" | "geometric" | "abstract" | "emoji";
export type Language = "en" | "hi" | "ta" | "te" | "bn" | "kn" | "ml";
export type MoodDefault = "happy" | "neutral" | "sad";

interface AppState {
  sessionId: string;
  avatarId: string;
  avatarStyle: AvatarStyle;
  skinTone: number;
  defaultMood: MoodDefault;
  language: Language;
  onboarded: boolean;
  phqScore: number;
  gadScore: number;
  severity: string;
  avatarState: string;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  completeOnboarding: () => void;
  updateScores: (phq: number, gad: number, severity: string) => void;
}

const defaultState: AppState = {
  sessionId: `sess_${Math.random().toString(36).substring(2, 9)}`,
  avatarId: "",
  avatarStyle: "geometric",
  skinTone: 2,
  defaultMood: "neutral",
  language: "en",
  onboarded: false,
  phqScore: 0,
  gadScore: 0,
  severity: "minimal",
  avatarState: "calm",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const completeOnboarding = () => {
    setState((prev) => ({ ...prev, onboarded: true }));
  };

  const updateScores = (phq: number, gad: number, severity: string) => {
    setState((prev) => ({ ...prev, phqScore: phq, gadScore: gad, severity }));
  };

  return (
    <AppContext.Provider value={{ state, setState, completeOnboarding, updateScores }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
