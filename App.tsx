import React, { useReducer, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/Sidebar';
import { FeedbackDialog } from './components/FeedbackDialog';
import { FlowchartTracker } from './components/FlowchartTracker';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/Sheet';
import { getAiResponse, getFeedbackAnalysis, getInstantFeedback } from './services/geminiService';
import { Difficulty, Message, Role, Feedback, HistoryEntry } from './types';
import { getFlowchart } from './constants';

// Define the shape of the state
interface AppState {
  messages: Message[];
  difficulty: Difficulty;
  isLoading: boolean;
  isConversationStarted: boolean;
  isMenuOpen: boolean;
  feedback: Feedback | null;
  isFeedbackLoading: boolean;
  isFeedbackDialogOpen: boolean;
  history: HistoryEntry[];
  currentStep: number;
}

// Define action types for the reducer
type Action =
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_MENU_OPEN'; payload: boolean }
  | { type: 'LOAD_HISTORY'; payload: HistoryEntry[] }
  | { type: 'RESTART_CONVERSATION'; payload: Message }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INCREMENT_STEP' }
  | { type: 'START_FEEDBACK_ANALYSIS' }
  | { type: 'SHOW_FEEDBACK'; payload: { feedback: Feedback; newHistoryEntry: HistoryEntry } }
  | { type: 'CLOSE_FEEDBACK' }
  | { type: 'END_FEEDBACK_ANALYSIS_WITH_ERROR' };

// Define the initial state
const initialState: AppState = {
  messages: [],
  difficulty: Difficulty.MEDIUM,
  isLoading: false,
  isConversationStarted: false,
  isMenuOpen: false,
  feedback: null,
  isFeedbackLoading: false,
  isFeedbackDialogOpen: false,
  history: [],
  currentStep: 0,
};

// Create the reducer function
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    case 'SET_MENU_OPEN':
      return { ...state, isMenuOpen: action.payload };
    case 'LOAD_HISTORY':
      return { ...state, history: action.payload };
    case 'RESTART_CONVERSATION':
      return {
        ...state,
        messages: [action.payload],
        currentStep: 0,
        isConversationStarted: true,
        feedback: null,
        isFeedbackDialogOpen: false,
        isMenuOpen: false,
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INCREMENT_STEP':
      const flowchart = getFlowchart();
      if (state.currentStep < flowchart.length) {
        return { ...state, currentStep: state.currentStep + 1 };
      }
      return state;
    case 'START_FEEDBACK_ANALYSIS':
      return { ...state, isFeedbackLoading: true };
    case 'SHOW_FEEDBACK':
      return {
        ...state,
        feedback: action.payload.feedback,
        history: [...state.history, action.payload.newHistoryEntry],
        isFeedbackDialogOpen: true,
        isFeedbackLoading: false,
        isConversationStarted: false,
      };
    case 'CLOSE_FEEDBACK':
      return { ...state, isFeedbackDialogOpen: false };
    case 'END_FEEDBACK_ANALYSIS_WITH_ERROR':
        return { ...state, isFeedbackLoading: false, isConversationStarted: false };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    messages,
    difficulty,
    isLoading,
    isConversationStarted,
    isMenuOpen,
    feedback,
    isFeedbackLoading,
    isFeedbackDialogOpen,
    history,
    currentStep,
  } = state;
  
  const flowchart = getFlowchart();

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('advocacy-trainer-history');
      if (savedHistory) {
        const parsedHistory: HistoryEntry[] = JSON.parse(savedHistory).map((entry: any) => ({
          ...entry,
          id: entry.id?.toString() || new Date(entry.date).getTime().toString(), // Backwards compatibility
          date: new Date(entry.date),
        }));
        dispatch({ type: 'LOAD_HISTORY', payload: parsedHistory });
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (history.length > 0) {
        localStorage.setItem('advocacy-trainer-history', JSON.stringify(history));
      }
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const handleRestart = useCallback(() => {
    const initialMessage: Message = {
      role: Role.AI,
      content: "Hey, what's up?"
    };
    dispatch({ type: 'RESTART_CONVERSATION', payload: initialMessage });
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (isLoading || !isConversationStarted) return;

    const newUserMessage: Message = { role: Role.USER, content: message };
    const currentHistoryWithUserMsg = [...messages, newUserMessage];
    
    dispatch({ type: 'ADD_MESSAGE', payload: newUserMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const [feedbackContent, aiResponseContent] = await Promise.all([
        getInstantFeedback(currentHistoryWithUserMsg, flowchart, currentStep),
        getAiResponse(currentHistoryWithUserMsg, difficulty)
      ]);

      const feedbackMessage: Message = { role: Role.COACH, content: feedbackContent };
      dispatch({ type: 'ADD_MESSAGE', payload: feedbackMessage });

      const aiMessage: Message = { role: Role.AI, content: aiResponseContent };
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });

      dispatch({ type: 'INCREMENT_STEP' });

    } catch (error) {
      console.error("Error getting AI response:", error);
      dispatch({ type: 'ADD_MESSAGE', payload: { role: Role.SYSTEM, content: "Sorry, an error occurred. Please try again." } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isLoading, isConversationStarted, messages, flowchart, currentStep, difficulty]);

  const handleEndConversation = useCallback(async () => {
    if (messages.length === 0) return;
    dispatch({ type: 'START_FEEDBACK_ANALYSIS' });
    try {
      const analysis = await getFeedbackAnalysis(messages, flowchart);
      const newHistoryEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        transcript: messages.filter(m => m.role !== Role.SYSTEM && m.role !== Role.COACH),
        feedback: analysis,
        date: new Date(),
      };
      dispatch({ type: 'SHOW_FEEDBACK', payload: { feedback: analysis, newHistoryEntry } });
    } catch (error) {
      console.error("Failed to get feedback analysis:", error);
      dispatch({ type: 'END_FEEDBACK_ANALYSIS_WITH_ERROR' });
    }
  }, [messages, flowchart]);

  const showFeedbackButton = isConversationStarted && currentStep >= flowchart.length;

  const sidebarProps = {
    difficulty,
    setDifficulty: (d: Difficulty) => dispatch({ type: 'SET_DIFFICULTY', payload: d }),
    onRestart: handleRestart,
    isConversationStarted,
    history,
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <Header onMenuClick={() => dispatch({ type: 'SET_MENU_OPEN', payload: true })} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex flex-col md:w-1/3 lg:w-1/4 max-w-sm border-r border-border bg-card flex-shrink-0">
          <Sidebar {...sidebarProps} />
        </aside>

        <Sheet open={isMenuOpen} onOpenChange={(open) => dispatch({ type: 'SET_MENU_OPEN', payload: open })}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="p-6 border-b border-border flex-shrink-0">
                <SheetTitle>Trainer Options</SheetTitle>
                <SheetDescription>Configure the AI or review past sessions.</SheetDescription>
            </SheetHeader>
            <Sidebar {...sidebarProps} isSheet={true} />
          </SheetContent>
        </Sheet>

        <main className="flex-grow flex-shrink overflow-hidden flex flex-col">
          <ChatInterface
            messages={messages.filter(m => m.role !== Role.SYSTEM)}
            onSendMessage={handleSendMessage}
            onEndConversation={handleEndConversation}
            isLoading={isLoading}
            isFeedbackLoading={isFeedbackLoading}
            isConversationStarted={isConversationStarted}
            showFeedbackButton={showFeedbackButton}
            onRestart={handleRestart}
          />
        </main>

        <FlowchartTracker flowchart={flowchart} currentStep={currentStep} />
      </div>

      {feedback && (
        <FeedbackDialog
          feedback={feedback}
          isOpen={isFeedbackDialogOpen}
          onClose={() => dispatch({ type: 'CLOSE_FEEDBACK' })}
        />
      )}
    </div>
  );
}

export default App;