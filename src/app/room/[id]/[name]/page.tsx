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
    id: string;
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
  // const [players, setPlayers] = useState<{ [key: string]: string }>({});
  const [scores, setScores] = useState<{ [key: string]: number }>();
  const [waitingForOpponent, setWaitingForOpponent] = useState<boolean>(false);

  useEffect(() => {
    socket = io("http://localhost:3000");

    socket.emit("userJoinedQuizRoom", params.id, params.name);

    socket.on("connect", () => {
      const id = socket.id;
      if (id) {
        setPlayerId(id);
        socket.emit("requestOpponentScore");
      }
    });

    socket.on("roomState", (roomState) => {
      // Check if both players are in the room and waiting for opponent
      console.log("count", roomState.playerCount);
      if (roomState.playerCount < 2) {
        setWaitingForOpponent(true);
      } else {
        setWaitingForOpponent(false);
      }
    });

    socket.on("startQuiz", (questions) => {
      console.log("Start Quiz event received with questions:", questions);
      handleStartQuiz(questions);
    });

    socket.on("resetQuiz", handleResetQuiz);
    socket.on("scoreUpdate", handleScoreUpdate);
    socket.on("gameOver", handleGameOver);
    socket.on("quizEnd", handleQuizEnd);
    socket.on("showResults", (finalScores) => {
      console.log("showResults event received", finalScores);
      handleShowResults(finalScores);
    });

    socket.on("quiz-started", (data) => {
      console.log(data); // Log received data
      setQuizStarted(data.quizStarted);
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

  const handleStartQuiz = (questions: Question[]) => {
    console.log("handleStartQuiz");
    setQuizStarted(true);
    setQuestions(questions);
    setTimer(15);
  };

  const handleResetQuiz = () => {
    console.log("handleResetQuiz");
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
    setScores({});
  };

  const handleScoreUpdate = (scoresData: { [key: string]: number }) => {
    console.log("handleScoreUpdate");
    setScores(scoresData);
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
    console.log("handleGameOver");
    setGameOver(message);
    socket.emit("quizEnd");
  };

  const handleQuizEnd = () => {
    console.log("handleQuizEnd");
    socket.emit("quizEnd");
  };

  const handleShowResults = (finalScores: { [key: string]: number }) => {
    console.log("handleShowResults");
    setScores(finalScores);
    setShowResult(true);
    setWaitingForOpponent(false);
  };

  useEffect(() => {
    socket.on("waitingForOpponent", () => setWaitingForOpponent(true));
    return () => {
      socket.off("waitingForOpponent");
    };
  }, []);

  const handleAnswerClick = (answer: string) => {
    console.log("handleAnswerClick");
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
    console.log("handleTimeUp");
    updateQuestionStatus("unanswered");
    setTimeout(goToNextQuestion, 1000);
  };

  const updateQuestionStatus = (status: string) => {
    console.log("updateQuestionStatus");
    const updatedStatus = [...questionStatus];
    updatedStatus[currentQuestionIndex] = status;
    setQuestionStatus(updatedStatus);
  };

  const goToNextQuestion = () => {
    console.log("goToNextQuestion");
    setSelectedAnswer(null);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimer(15);
    } else {
      handleQuizEnd();
    }
  };

  console.log({ quizStarted });
  if (!quizStarted) {
    return <div>Waiting for another player to join...</div>;
  }

  console.log({ waitingForOpponent });
  if (waitingForOpponent) {
    return (
      <main className="bg-[#dbd9e3] flex min-h-screen flex-col items-center justify-center p-24">
        <div className="bg-[#f0bf4c] rounded-sm shadow-md p-6 px-16 text-center">
          <h1 className="text-2xl font-bold">
            Waiting for opponent to finish...
          </h1>
        </div>
      </main>
    );
  }

  console.log({ gameOver });
  if (gameOver) {
    return (
      <main className="bg-[#dbd9e3] flex min-h-screen flex-col items-center justify-center p-24">
        <div className="bg-[#f0bf4c] rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold">Game Over</h1>
          <p>{gameOver}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#dbd9e3] flex min-h-screen flex-col items-center justify-center p-24">
      <div className="bg-[#f0bf4c] rounded-sm shadow-md p-6 px-16 text-center">
        <h1 className="text-2xl font-bold">
          {questions[currentQuestionIndex]?.question}
        </h1>
        <div>
          {questions[currentQuestionIndex]?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              className="m-2 p-2 bg-white rounded-lg shadow-md"
            >
              {option}
            </button>
          ))}
        </div>
        <p>Time left: {timer}s</p>
      </div>
    </main>
  );
};

export default Home;
