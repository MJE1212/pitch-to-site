'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/lib/ProjectContext';

interface Question {
  id: string;
  question: string;
  context: string;
}

export default function Step4FillGaps() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>(project.contentGaps?.answers || {});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Find gaps from deck analysis
      const gaps = project.deckAnalysis?.elements
        ? Object.entries(project.deckAnalysis.elements)
            .filter(([_, element]) => element.status === 'missing' || element.status === 'partial')
            .map(([key, element]) => ({ key, status: element.status }))
        : [];

      if (gaps.length === 0) {
        // No gaps - can skip this step
        setQuestions([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gaps,
          deckAnalysis: project.deckAnalysis,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
      // Provide fallback questions
      setQuestions([
        { id: 'q1', question: 'What specific problem does your solution address that existing solutions cannot?', context: 'This helps define your unique value proposition' },
        { id: 'q2', question: 'What credentials or experience make your team uniquely qualified to solve this problem?', context: 'Builds trust with investors and partners' },
        { id: 'q3', question: 'Do you have any early traction, pilots, or technical validation?', context: 'Provides credibility signals' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleContinue = () => {
    updateProject({ contentGaps: { answers } });
    nextStep();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = questions.every(q => answers[q.id]?.trim());

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#e31837] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-700">Analyzing your content gaps...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-3">Step 4: Fill Content Gaps</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Great news! Your pitch deck contains all the key information we need.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-700">No gaps to fill! Your deck is comprehensive.</p>
        </div>

        <div className="flex justify-between">
          <button onClick={prevStep} className="px-6 py-3 text-neutral-500 hover:text-black transition-colors">
            Back
          </button>
          <button onClick={handleContinue} className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors">
            Continue to Step 5
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Step 4: Fill Content Gaps</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Answer these questions to fill in the missing information from your deck.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        <span>{Object.keys(answers).filter(k => answers[k]?.trim()).length} answered</span>
      </div>

      {/* Question Card */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-black mb-2">{currentQuestion.question}</h2>
          <p className="text-sm text-neutral-500">{currentQuestion.context}</p>
        </div>
        <textarea
          value={answers[currentQuestion.id] || ''}
          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
          placeholder="Type your answer here... speak naturally, we'll help polish it later."
          rows={5}
          className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none resize-none"
        />
      </div>

      {/* Question Navigation */}
      <div className="flex gap-2 justify-center">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`
              w-8 h-8 rounded-full text-sm font-medium transition-all
              ${index === currentQuestionIndex ? 'bg-[#e31837] text-white' : ''}
              ${answers[q.id]?.trim() && index !== currentQuestionIndex ? 'bg-green-100 text-green-700' : ''}
              ${!answers[q.id]?.trim() && index !== currentQuestionIndex ? 'bg-neutral-200 text-neutral-500' : ''}
            `}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <button onClick={prevStep} className="px-6 py-3 text-neutral-500 hover:text-black transition-colors">
            Back to Step 3
          </button>
          {currentQuestionIndex > 0 && (
            <button onClick={handlePrev} className="px-4 py-3 text-neutral-500 hover:text-black transition-colors">
              ← Previous
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-black font-semibold rounded-lg transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
            >
              Continue to Step 5
            </button>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-neutral-100 rounded-lg p-4 text-center">
        <p className="text-sm text-neutral-500">
          Don't overthink your answers. Speak naturally like you would to a friend asking about your startup.
        </p>
      </div>
    </div>
  );
}
