import { useState, useRef, useCallback } from 'react';

export interface AdaptiveLogicResult {
  level: number;
  winStreak: number;
  wrongStreak: number;
  message: string | null;
}

export function useAdaptiveLogic(initialLevel: number = 1) {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [winStreak, setWinStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  
  // Track the last up to 5 response times in seconds
  const responseTimesRef = useRef<number[]>([]);
  
  // Track when the current question was shown
  const questionStartTimeRef = useRef<number>(Date.now());

  // Call this right when a new question is displayed to the user
  const startQuestionTimer = useCallback(() => {
    questionStartTimeRef.current = Date.now();
  }, []);

  const reset = useCallback(() => {
    setCurrentLevel(initialLevel);
    setWinStreak(0);
    setWrongStreak(0);
    responseTimesRef.current = [];
    questionStartTimeRef.current = Date.now();
  }, [initialLevel]);

  // Call this when the user submits their answer
  const evaluateAnswer = useCallback((isCorrect: boolean): AdaptiveLogicResult => {
    const timeToAnswerInSeconds = (Date.now() - questionStartTimeRef.current) / 1000;
    
    let newLevel = currentLevel;
    let newWinStreak = winStreak;
    let newWrongStreak = wrongStreak;
    let message: string | null = isCorrect ? "Correct!" : "Incorrect!";

    if (isCorrect) {
      // Increase win streak, reset wrong streak
      newWinStreak += 1;
      newWrongStreak = 0;
      
      // Update response times queue (keep only the last 5)
      const updatedResponseTimes = [...responseTimesRef.current, timeToAnswerInSeconds].slice(-5);
      responseTimesRef.current = updatedResponseTimes;

      // Rule 1: Level Up
      if (newWinStreak >= 5 && updatedResponseTimes.length === 5) {
        const averageSpeed = updatedResponseTimes.reduce((sum, time) => sum + time, 0) / 5;
        
        if (averageSpeed < 3.0) {
          newLevel += 1;
          newWinStreak = 0; // Reset streak
          responseTimesRef.current = []; // Reset response times tracking
          message = "LEVEL UP! You are too fast!";
        }
      }
    } else {
      // Rule 2: Level Down
      newWrongStreak += 1;
      newWinStreak = 0;
      
      // Reset speed tracking since they got one wrong
      responseTimesRef.current = [];
      
      if (newWrongStreak >= 2) {
        newLevel = Math.max(1, newLevel - 1); // Minimum level 1
        newWrongStreak = 0; // Reset wrong streak after adjusting difficulty
        message = "Difficulty Adjusted";
      }
    }

    // Update state
    setCurrentLevel(newLevel);
    setWinStreak(newWinStreak);
    setWrongStreak(newWrongStreak);
    
    return {
      level: newLevel,
      winStreak: newWinStreak,
      wrongStreak: newWrongStreak,
      message
    };
  }, [currentLevel, winStreak, wrongStreak]);

  return {
    currentLevel,
    winStreak,
    wrongStreak,
    evaluateAnswer,
    startQuestionTimer,
    setCurrentLevel,
    reset
  };
}
