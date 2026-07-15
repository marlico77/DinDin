import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useMonthlyRecap } from '../../hooks/api/useTransactions';
import { useI18n } from '../../context/I18nContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useConfetti } from '../../context/ConfettiContext';
import { formatCurrency } from '../../utils/format';
import { format } from 'date-fns';
import { ptBR, enUS, es, ja, ru, zhCN, fr, ar, type Locale as DateFnsLocale } from 'date-fns/locale';
import { getCategoryDisplayName } from '../../lib/enums';
import { useCategories } from '../../hooks/api/useCategories';
import { analyticsHelpers } from '../../utils/analytics';

interface MonthlyRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  householdId: string;
  month?: string;
}

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export function MonthlyRecapModal({ isOpen, onClose, householdId, month }: MonthlyRecapModalProps) {
  const { data: recap, isLoading } = useMonthlyRecap({ householdId, month });
  const { baseCurrency } = useCurrency();
  const { t, locale } = useI18n();
  const { showConfetti } = useConfetti();
  const { data: categoriesData = [] } = useCategories({ householdId });
  const hasTrackedView = useRef(false);
  
  const formatCurrencyValue = useCallback((value: number) => formatCurrency(value, baseCurrency), [baseCurrency]);

  // Track analytics when modal opens
  useEffect(() => {
    if (isOpen && !hasTrackedView.current) {
      analyticsHelpers.logMonthlyRecapViewed();
      hasTrackedView.current = true;
    }
    // Reset when modal closes
    if (!isOpen) {
      hasTrackedView.current = false;
    }
  }, [isOpen]);

  // Helper function to translate category names
  const translateCategoryName = useCallback((categoryName: string, _categoryDisplayName: string): string => {
    // Get custom categories for resolution
    const customCategories = categoriesData
      .filter((c) => !c.isSystem)
      .map((c) => ({ id: c.id, name: c.name, type: c.type, color: c.color, icon: c.icon }));
    
    // Use getCategoryDisplayName to translate the category
    return getCategoryDisplayName(categoryName, t as unknown as Record<string, string>, customCategories);
  }, [categoriesData, t]);

  // Map locale to date-fns locale
  const getDateLocale = useCallback((): DateFnsLocale => {
    const localeMap: Record<string, DateFnsLocale> = {
      'pt-BR': ptBR,
      'en-US': enUS,
      'es-ES': es,
      'ja-JP': ja,
      'ru-RU': ru,
      'zh-CN': zhCN,
      'fr-FR': fr,
      'ar-SA': ar,
    };
    return localeMap[locale] || enUS;
  }, [locale]);

  // Função para embaralhar array (Fisher-Yates shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Generate quiz questions (stable, doesn't depend on answers)
  const quizQuestions = useMemo(() => {
    if (!recap) return [];
    
    const questions: QuizQuestion[] = [];
    
    if (recap.topCategory) {
      // Translate category names
      const translatedTopCategory = translateCategoryName(recap.topCategory.categoryName, recap.topCategory.categoryDisplayName);
      const otherCategories = recap.categoryBreakdown
        .filter(c => c.categoryName !== recap.topCategory!.categoryName)
        .slice(0, 2)
        .map(c => translateCategoryName(c.categoryName, c.categoryDisplayName));
      
      const options = [
        translatedTopCategory,
        ...otherCategories,
        t.monthlyRecapQuizOtherCategory,
      ];
      
      // Shuffle options and track correct answer index
      const shuffledOptions = shuffleArray(options);
      const correctAnswerIndex = shuffledOptions.findIndex(opt => opt === translatedTopCategory);
      
      questions.push({
        question: t.monthlyRecapQuizTopCategoryQuestion,
        options: shuffledOptions,
        correctAnswer: correctAnswerIndex,
        explanation: `${t.monthlyRecapQuizCorrect} ${t.monthlyRecapQuizTopCategoryExplanation} ${formatCurrencyValue(recap.topCategory.total)} ${t.monthlyRecapQuizIn} ${translatedTopCategory}.`,
      });
    }

    if (recap.largestExpense) {
      const options = [
        formatCurrencyValue(recap.largestExpense.amount),
        formatCurrencyValue(recap.largestExpense.amount * 0.7),
        formatCurrencyValue(recap.largestExpense.amount * 1.3),
        formatCurrencyValue(recap.largestExpense.amount * 0.5),
      ];
      
      // Shuffle options and track correct answer
      const shuffledOptions = shuffleArray(options);
      const correctAnswerIndex = shuffledOptions.findIndex(opt => opt === formatCurrencyValue(recap.largestExpense!.amount));
      
      questions.push({
        question: t.monthlyRecapQuizLargestExpenseQuestion,
        options: shuffledOptions,
        correctAnswer: correctAnswerIndex,
        explanation: `${t.monthlyRecapQuizCorrect} ${t.monthlyRecapQuizLargestExpenseExplanation} ${formatCurrencyValue(recap.largestExpense.amount)} ${t.monthlyRecapQuizIn} "${recap.largestExpense.description}".`,
      });
    }

    if (recap.summary.balance !== 0) {
      const options = [
        formatCurrencyValue(recap.summary.balance),
        formatCurrencyValue(recap.summary.balance * 1.2),
        formatCurrencyValue(recap.summary.balance * 0.8),
        formatCurrencyValue(recap.summary.balance * -1),
      ];
      
      // Shuffle options and track correct answer
      const shuffledOptions = shuffleArray(options);
      const correctAnswerIndex = shuffledOptions.findIndex(opt => opt === formatCurrencyValue(recap.summary.balance));
      
      questions.push({
        question: t.monthlyRecapQuizBalanceQuestion,
        options: shuffledOptions,
        correctAnswer: correctAnswerIndex,
        explanation: `${t.monthlyRecapQuizCorrect} ${t.monthlyRecapQuizBalanceExplanation} ${formatCurrencyValue(recap.summary.balance)}.`,
      });
    }

    return questions;
  }, [recap, formatCurrencyValue, t, translateCategoryName]);

  // Generate slides based on recap data
  const slides = useMemo(() => {
    if (!recap) return [];

    const slidesArray: Array<{
      type: 'summary' | 'category' | 'expense' | 'comparison' | 'quiz';
      title: string;
      content: React.ReactNode;
      gradient: string;
    }> = [];

    // Slide 1: Welcome
    const monthFormatted = format(new Date(recap.month + '-01'), 'MMMM yyyy', { locale: getDateLocale() });
    const titleWithMonth = t.monthlyRecapTitle.includes('{month}') 
      ? t.monthlyRecapTitle.replace('{month}', monthFormatted)
      : `${t.monthlyRecapTitle} ${monthFormatted}`;
    slidesArray.push({
      type: 'summary',
      title: titleWithMonth,
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-3xl font-bold mb-2">{t.monthlyRecapWelcome}</h2>
          <p className="text-lg opacity-90">{t.monthlyRecapSubtitle}</p>
        </div>
      ),
      gradient: 'from-purple-500 to-pink-500',
    });

    // Slide 2: Summary
    slidesArray.push({
      type: 'summary',
      title: t.monthlyRecapSummaryTitle,
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm opacity-80 mb-1">{t.income}</div>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrencyValue(recap.summary.income)}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm opacity-80 mb-1">{t.expense}</div>
              <div className="text-2xl font-bold text-red-400">
                {formatCurrencyValue(recap.summary.expenses)}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm col-span-2">
              <div className="text-sm opacity-80 mb-1">{t.balance}</div>
              <div className={`text-3xl font-bold ${recap.summary.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrencyValue(recap.summary.balance)}
              </div>
            </div>
          </div>
          <div className="text-sm opacity-80">
            {recap.summary.transactionCount} {t.monthlyRecapTransactionsCount}
          </div>
        </div>
      ),
      gradient: 'from-blue-500 to-cyan-500',
    });

    // Slide 3: Top Category
    if (recap.topCategory) {
      const translatedCategoryName = translateCategoryName(recap.topCategory.categoryName, recap.topCategory.categoryDisplayName);
      slidesArray.push({
        type: 'category',
        title: t.monthlyRecapTopCategoryTitle,
        content: (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{translatedCategoryName}</div>
              <div className="text-4xl font-bold mb-4" style={{ color: recap.topCategory.color }}>
                {formatCurrencyValue(recap.topCategory.total)}
              </div>
              <div className="text-sm opacity-80">
                {recap.topCategory.count} {t.monthlyRecapTransactions}
              </div>
            </div>
          </div>
        ),
        gradient: 'from-yellow-500 to-orange-500',
      });
    }

    // Slide 4: Largest Expense
    if (recap.largestExpense) {
      const translatedExpenseCategory = recap.largestExpense.categoryName 
        ? translateCategoryName(recap.largestExpense.categoryName, recap.largestExpense.categoryName)
        : null;
      slidesArray.push({
        type: 'expense',
        title: t.monthlyRecapLargestExpenseTitle,
        content: (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-6xl mb-4">💸</div>
            <div className="text-center">
              <div className="text-xl font-bold mb-2">{recap.largestExpense.description}</div>
              {translatedExpenseCategory && (
                <div className="text-sm opacity-80 mb-4">{translatedExpenseCategory}</div>
              )}
              <div className="text-4xl font-bold text-red-400">
                {formatCurrencyValue(recap.largestExpense.amount)}
              </div>
            </div>
          </div>
        ),
        gradient: 'from-red-500 to-pink-500',
      });
    }

    // Slide 5: Comparison
    if (recap.comparison.prevIncome > 0 || recap.comparison.prevExpenses > 0) {
      slidesArray.push({
        type: 'comparison',
        title: t.monthlyRecapComparisonTitle,
        content: (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-sm opacity-80 mb-2">{t.income}</div>
                <div className="flex items-center gap-2">
                  {recap.comparison.incomeChange >= 0 ? (
                    <TrendingUp className="text-green-400" size={20} />
                  ) : (
                    <TrendingDown className="text-red-400" size={20} />
                  )}
                  <span className={`text-xl font-bold ${recap.comparison.incomeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {recap.comparison.incomeChange >= 0 ? '+' : ''}{recap.comparison.incomeChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-sm opacity-80 mb-2">{t.expense}</div>
                <div className="flex items-center gap-2">
                  {recap.comparison.expenseChange <= 0 ? (
                    <TrendingDown className="text-green-400" size={20} />
                  ) : (
                    <TrendingUp className="text-red-400" size={20} />
                  )}
                  <span className={`text-xl font-bold ${recap.comparison.expenseChange <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {recap.comparison.expenseChange >= 0 ? '+' : ''}{recap.comparison.expenseChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        gradient: 'from-indigo-500 to-purple-500',
      });
    }

    // Slide 6: Quiz - use the stable quizQuestions from separate useMemo
    // Add quiz questions as separate slides
    quizQuestions.forEach((question, idx) => {
      slidesArray.push({
        type: 'quiz',
        title: `${t.monthlyRecapQuiz} ${idx + 1}/${quizQuestions.length}`,
        content: (
          <QuizQuestionSlide
            question={question}
            questionIndex={idx}
            answer={quizAnswers[idx]}
            onAnswer={(answerIndex) => {
              setQuizAnswers(prev => ({ ...prev, [idx]: answerIndex }));
            }}
          />
        ),
        gradient: 'from-green-500 to-emerald-500',
      });
    });

    // Add quiz result slide
    if (quizQuestions.length > 0) {
      slidesArray.push({
        type: 'quiz',
        title: t.monthlyRecapQuizResultTitle,
        content: (
          <QuizResultSlide
            questions={quizQuestions}
            answers={quizAnswers}
            t={t}
          />
        ),
        gradient: 'from-purple-500 to-pink-500',
      });
    }

    // Add final slide with "next month" message
    slidesArray.push({
      type: 'summary',
      title: t.monthlyRecapNextMonthTitle,
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">{t.monthlyRecapNextMonthMessage}</h2>
          <p className="text-lg opacity-90">{t.monthlyRecapNextMonthSubtitle}</p>
        </div>
      ),
      gradient: 'from-indigo-500 to-purple-500',
    });

    return slidesArray;
  }, [recap, formatCurrencyValue, t, getDateLocale, translateCategoryName, quizQuestions, quizAnswers]);

  const handleNext = useCallback(() => {
    setCurrentSlide(prev => {
      if (prev < slides.length - 1) {
        return prev + 1;
      } else {
        // Se estiver no último slide, fecha o modal e mostra confetti
        setTimeout(() => {
          showConfetti();
          onClose();
        }, 100);
        return prev;
      }
    });
  }, [slides.length, onClose, showConfetti]);

  const handlePrev = useCallback(() => {
    setCurrentSlide(prev => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Progress bar
  const progress = ((currentSlide + 1) / slides.length) * 100;

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-white text-xl">{t.monthlyRecapLoading || t.loading}</div>
      </div>
    );
  }

  if (!recap || slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        // Fechar ao clicar fora do modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md h-[90vh] max-h-[800px] mx-4 sm:mx-auto">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            showConfetti();
            onClose();
          }}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all active:scale-95"
          aria-label={t.close}
        >
          <X size={20} className="text-white" />
        </button>

        {/* Slide counter */}
        <div className="absolute top-4 left-4 z-30 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-white text-sm">
          {currentSlide + 1} / {slides.length}
        </div>

        {/* Slide content */}
        <div
          className={`h-full bg-gradient-to-br ${currentSlideData.gradient} p-6 sm:p-8 flex flex-col items-center justify-center text-white relative overflow-hidden transition-all duration-300`}
          onClick={(e) => {
            // Click na área direita avança, esquerda volta
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            
            if (clickX > width * 0.7 && currentSlide < slides.length - 1) {
              handleNext();
            } else if (clickX < width * 0.3 && currentSlide > 0) {
              handlePrev();
            }
          }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-6 text-center">{currentSlideData.title}</h1>
            <div className="flex-1 flex items-center justify-center">
              {currentSlideData.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="absolute bottom-6 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between gap-4 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              disabled={currentSlide === 0}
              className="p-3 sm:p-4 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg backdrop-blur-sm border border-white/20"
              aria-label="Slide anterior"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>

            <div className="flex gap-2 items-center flex-1 justify-center max-w-xs overflow-x-auto px-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide 
                      ? 'w-8 bg-white shadow-lg' 
                      : 'w-2 bg-white/50 hover:bg-white/70'
                  } cursor-pointer`}
                  aria-label={`Ir para slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="p-3 sm:p-4 rounded-full bg-white/20 hover:bg-white/30 transition-all active:scale-95 shadow-lg backdrop-blur-sm border border-white/20"
              aria-label={currentSlide === slides.length - 1 ? "Fechar" : "Próximo slide"}
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>

          {/* Hint text for first-time users */}
          {currentSlide === 0 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
                {t.monthlyRecapNavigationHint}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quiz question component
interface QuizQuestionSlideProps {
  question: QuizQuestion;
  questionIndex: number;
  answer: number | undefined;
  onAnswer: (answerIndex: number) => void;
}

function QuizQuestionSlide({ question, answer, onAnswer }: QuizQuestionSlideProps) {
  const { t } = useI18n();
  const hasAnswered = answer !== undefined;
  const isCorrect = hasAnswered && answer === question.correctAnswer;

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 w-full">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
      </div>

      <div className="w-full space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = answer === idx;
          const isCorrectOption = idx === question.correctAnswer;

          return (
            <button
              key={idx}
              onClick={() => {
                if (!hasAnswered) {
                  onAnswer(idx);
                }
              }}
              disabled={hasAnswered}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                hasAnswered
                  ? isSelected
                    ? isCorrectOption
                      ? 'bg-green-500/30 border-2 border-green-400'
                      : 'bg-red-500/30 border-2 border-red-400'
                    : isCorrectOption
                    ? 'bg-green-500/20 border-2 border-green-400'
                    : 'bg-white/10 border-2 border-transparent'
                  : 'bg-white/10 hover:bg-white/20 border-2 border-transparent'
              } ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {hasAnswered && (
                  <span className="text-xl">
                    {isCorrectOption ? '✓' : isSelected ? '✗' : ''}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
          <p className={`text-sm ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
            {isCorrect 
              ? question.explanation 
              : (() => {
                  // Remove "Correto! " or "Correto!" from the beginning of explanation when answer is wrong
                  let explanationWithoutCorrect = question.explanation.trim();
                  // Try to remove "Correto! " or "Correto!" at the start (case-insensitive)
                  const correctPrefix = t.monthlyRecapQuizCorrect.trim();
                  if (explanationWithoutCorrect.toLowerCase().startsWith(correctPrefix.toLowerCase())) {
                    explanationWithoutCorrect = explanationWithoutCorrect.substring(correctPrefix.length).trim();
                    // Also remove any trailing punctuation/space after "Correto!"
                    if (explanationWithoutCorrect.startsWith('!') || explanationWithoutCorrect.startsWith(' ')) {
                      explanationWithoutCorrect = explanationWithoutCorrect.substring(1).trim();
                    }
                  }
                  return `${t.monthlyRecapQuizIncorrect} ${explanationWithoutCorrect}`;
                })()}
          </p>
        </div>
      )}
    </div>
  );
}

// Quiz result component
interface QuizResultSlideProps {
  questions: QuizQuestion[];
  answers: Record<number, number>;
  t: any;
}

function QuizResultSlide({ questions, answers, t }: QuizResultSlideProps) {
  const score = questions.reduce((acc, q, idx) => {
    const userAnswer = answers[idx];
    // Check if answer exists and matches the correct answer
    if (userAnswer !== undefined && userAnswer === q.correctAnswer) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-3xl font-bold mb-2">{t.monthlyRecapQuizCompleted}</h2>
      <div className="text-4xl font-bold mb-4">
        {score}/{questions.length}
      </div>
      <p className="text-lg opacity-90">
        {score === questions.length
          ? t.monthlyRecapQuizPerfect
          : score >= questions.length / 2
          ? t.monthlyRecapQuizGood
          : t.monthlyRecapQuizKeepGoing}
      </p>
    </div>
  );
}
