import React, { createContext, useContext, useState, ReactNode } from "react";

export type AvatarStyle = "minimalist" | "geometric" | "abstract" | "emoji";
export type Language = "en" | "hi" | "ta" | "te" | "bn" | "kn" | "ml";
export type MoodDefault = "happy" | "neutral" | "sad";

interface AppState {
  sessionId: string;
  avatarStyle: AvatarStyle;
  skinTone: number;
  defaultMood: MoodDefault;
  language: Language;
  onboarded: boolean;
  phqScore: number;
  gadScore: number;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  completeOnboarding: () => void;
}

const defaultState: AppState = {
  sessionId: `sess_${Math.random().toString(36).substring(2, 9)}`,
  avatarStyle: "geometric",
  skinTone: 2,
  defaultMood: "neutral",
  language: "en",
  onboarded: false,
  phqScore: 0,
  gadScore: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const completeOnboarding = () => {
    setState((prev) => ({ ...prev, onboarded: true }));
  };

  return (
    <AppContext.Provider value={{ state, setState, completeOnboarding }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
