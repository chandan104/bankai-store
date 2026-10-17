import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, HelpCircle, CheckCircle2, XCircle, RotateCcw, X, Sparkles, Award } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!isOpen || !questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-card border border-primary/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">The Ultimate Otaku Challenge</h3>
              <p className="text-xs text-muted-foreground">Test your anime knowledge across 20 questions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-card border border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-border/40 h-1.5">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto">
          {quizFinished ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 ring-8 ring-primary/10 flex items-center justify-center mx-auto text-primary">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-3xl font-black text-white mb-2">Quiz Completed!</h4>
                <p className="text-muted-foreground text-sm">
                  {score >= 16
                    ? '🎌 God Tier Otaku! Your anime knowledge is legendary!'
                    : score >= 10
                    ? '✨ Great job! You truly know your anime classics!'
                    : '⛩️ Decent attempt! Time to binge some more episodes!'}
                </p>
              </div>

              <div className="py-4 px-6 rounded-2xl bg-card border border-primary/20 max-w-xs mx-auto">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Your Score</span>
                <div className="text-4xl font-black text-primary mt-1">
                  {score} <span className="text-xl text-muted-foreground font-normal">/ {questions.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 rounded-xl bg-card border border-border text-foreground hover:border-primary/40 text-sm font-bold flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  Close Quiz
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Question metadata */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-mono font-bold">
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                    currentQ.difficulty === 'easy'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : currentQ.difficulty === 'medium'
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      : 'bg-red-950/60 text-red-400 border border-red-800'
                  }`}
                >
                  {currentQ.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <h4 className="text-xl md:text-2xl font-bold text-white leading-snug">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optionStyle =
                    'bg-card/70 border-border/80 text-foreground hover:border-primary/50 hover:bg-card';

                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200';
                    } else if (isSelected) {
                      optionStyle = 'bg-red-950/70 border-red-500 text-red-200';
                    } else {
                      optionStyle = 'bg-card/30 border-border/40 text-muted-foreground opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-xl border text-left text-sm md:text-base font-medium transition-all duration-200 flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && (
                        <span>
                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                          {!isCorrect && isSelected && <XCircle className="w-5 h-5 text-red-400" />}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              {isAnswered && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
