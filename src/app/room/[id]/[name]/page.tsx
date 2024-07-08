"use client";
import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import CustomButton from "@/components/CustomButton";
import { PiCoins } from "react-icons/pi";

let socket: Socket;

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface HomeProps {
  params: {
    name: string;
  };
}

const Home: React.FC<HomeProps> = ({ params }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(15);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [questionStatus, setQuestionStatus] = useState<(string | null)[]>(
    Array(5).fill(null)
  );
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ [key: string]: string }>({});
  // const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [scores, setScores] = useState<any>();

  useEffect(() => {
    socket = io("http://localhost:3000");

    socket.on("connect", () => {
      const id = socket.id;
      if (id) {
        setPlayerId(id);
        socket.emit("requestOpponentScore"); // Request the opponent's score
      }
    });

    socket.on("startQuiz", handleStartQuiz);
    socket.on("resetQuiz", handleResetQuiz);
    socket.on("scoreUpdate", handleScoreUpdate);
    socket.on("gameOver", handleGameOver);
    socket.on("players", handlePlayers);
    socket.on("quizEnd", handleQuizEnd);

    socket.on("opponentScore", (opponentScore) => {
      setOpponentScore(opponentScore);
      console.log("Opponent score received:", opponentScore);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (quizStarted && timer > 0) {
      timerId = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (quizStarted && timer === 0) {
      handleTimeUp();
    }
    return () => clearTimeout(timerId);
  }, [timer, quizStarted]);

  const handlePlayers = (playersData: { [key: string]: string }) => {
    setPlayers(playersData);
  };

  const handleStartQuiz = (questions: Question[]) => {
    setQuizStarted(true);
    setQuestions(questions);
    setTimer(15);
  };

  const handleResetQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimer(15);
    setShowResult(false);
    setQuestionStatus(Array(5).fill(null));
    setGameOver(null);
    setOpponentScore(0);
    setScores({}); // Reset scores
  };

  console.log("=====SCore", scores);

  const handleScoreUpdate = (scoresData: { [key: string]: number }) => {
    setScores(scoresData);
    console.log("Score update received:", scoresData);
    if (playerId) {
      const playerScore = scoresData[playerId] || 0;
      const opponentPlayerId = Object.keys(scoresData).find(
        (id) => id !== playerId
      );
      const opponentPlayerScore = opponentPlayerId
        ? scoresData[opponentPlayerId] || 0
        : 0;
      setScore(playerScore);
      setOpponentScore(opponentPlayerScore);
    }
  };

  const handleGameOver = (message: string) => {
    setGameOver(message);
    socket.emit("quizEnd"); // Notify server that this client has finished the quiz
  };

  const handleQuizEnd = () => {
    // Calculate results and show them after both players have finished
    setShowResult(true);
    setQuizStarted(false);
  };

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestionIndex].correctAnswer;
    if (correct) {
      const newScore = score + 10;
      setScore(newScore);
      socket.emit("updateScore", newScore);
      updateQuestionStatus("correct");
    } else {
      updateQuestionStatus("wrong");
    }
    setTimeout(goToNextQuestion, 1000);
  };

  const handleTimeUp = () => {
    updateQuestionStatus("unanswered");
    setTimeout(goToNextQuestion, 1000);
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
      socket.emit("quizEnd"); // Notify server that this client has finished the quiz
    }
  };

  if (!quizStarted) {
    return <div>Waiting for another player to join...</div>;
  }

  if (gameOver) {
    return (
      <main className="bg-[#dbd9e3] flex min-h-screen flex-col items-center justify-center p-24">
        <div className="bg-[#f0bf4c] rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold">Game Over</h1>
          <p className="text-lg">{gameOver}</p>
        </div>
      </main>
    );
  }

  if (showResult) {
    const winner = score > opponentScore ? "You" : "Opponent";
    return (
      <main className="bg-[#dbd9e3] flex min-h-screen flex-col items-center justify-center p-24">
        <div className="bg-[#f0bf4c] rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold">Quiz Completed!!</h1>
          <p className="text-lg">
            Your score: {score} ed coins
            <PiCoins className="inline-block ml-2" />
          </p>
          <p className="text-lg">
            {winner}'s score: {scores && scores.player2} ed coins
            <PiCoins className="inline-block ml-2" />
          </p>
          <p className="text-lg">
            {score > opponentScore ? "You win!" : "You lose!"}
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
            ---------------------- <PiCoins className="inline-block mx-2" />
            ----------------------
          </div>
          <div className="flex w-full justify-between mt-4">
            <div className="w-1/2 text-left">
              You: {score} ed coins
              <PiCoins className="inline-block ml-2" />
            </div>
            <div className="w-1/2 text-right">
              Opponent: {scores && scores.player2} ed coins
              <PiCoins className="inline-block ml-2" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
