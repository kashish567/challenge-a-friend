"use client";

import React, { useState, useEffect } from "react";
import data from "../data.json";
import CustomButton from "@/components/CustomButton";
import { PiCoins } from "react-icons/pi";

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [showResult, setShowResult] = useState(false);
  const [questionStatus, setQuestionStatus] = useState(Array(5).fill(null));

  useEffect(() => {
    // Shuffle and pick 5 questions
    const shuffledQuestions = [...data.questions].sort(
      () => 0.5 - Math.random()
    );
    setQuestions(shuffledQuestions.slice(0, 5));
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      handleTimeUp();
    }
  }, [timer]);

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 10);
      updateQuestionStatus("correct");
    } else {
      updateQuestionStatus("wrong");
    }
    setTimeout(() => goToNextQuestion(), 1000);
  };

  const handleTimeUp = () => {
    updateQuestionStatus("unanswered");
    setTimeout(() => goToNextQuestion(), 1000);
  };

  const updateQuestionStatus = (status: string) => {
    const updatedStatus = [...questionStatus];
    updatedStatus[currentQuestionIndex] = status;
    setQuestionStatus(updatedStatus);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimer(15);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <main className="bg-[#dbd9e3] flex min-h-screen flex-col items-center justify-center p-24">
        <div className="bg-[#f0bf4c] rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold">Quiz Completed!!</h1>
          <p className="text-lg">
            Your score: {score} ed coins
            <PiCoins className="inline-block ml-2" />{" "}
          </p>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const question = questions[currentQuestionIndex];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
      <div className="relative w-full max-w-[40rem]">
        <div className="bg-[#f0bf4c] rounded-3xl border-2 border-gray-600 w-full h-full absolute top-0 left-0 transform rotate-6"></div>
        <div className="bg-[#dbd9e3] rounded-3xl border-2 flex flex-col items-center justify-center border-black p-8 w-full relative z-10">
          <div className="flex justify-center mb-4">
            {questionStatus.map((status, index) => (
              <div
                key={index}
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 border-black mx-2 ${
                  index === currentQuestionIndex
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="relative text-center mb-8 border-2 border-black w-full bg-white p-5 rounded-2xl">
            <h2 className="text-lg font-medium">{question.question}</h2>
            <div className="absolute bottom-2 right-4 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center bg-red-200 translate-y-8">
              {timer}s
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            {question.options.map((option, index) => (
              <CustomButton
                key={index}
                text={option}
                onClick={() => handleAnswerClick(option)}
              />
            ))}
          </div>
          <div className="flex text-lg font-medium w-full items-center justify-center mt-3 mb-10">
            ----------------------{" "}
            <PiCoins className="inline-block mr-2 ml-2" /> 10 ed coins
            ----------------------
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
