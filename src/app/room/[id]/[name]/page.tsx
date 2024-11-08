"use client";
import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import CustomButton from "@/components/CustomButton";
import { PiCoins } from "react-icons/pi";
import axios from "axios";

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
  const [players, setPlayers] = useState<{ [key: string]: string }>({});
  const [scores, setScores] = useState<{ [key: string]: number }>();
  const [waitingForOpponent, setWaitingForOpponent] = useState<boolean>(false);
  const [isPlayer1, setIsPlayer1] = useState<boolean>(false);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [room, setRoom] = useState();
  const [roomCodeState, setRoomCodeState] = useState();

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

    socket.on("roomState", (roomState, roomCode) => {
      console.log("roomState", roomState);
      setRoom(roomState);
      setRoomCodeState(roomCode);
      console.log("count", roomState.playerCount);
      if (roomState.playerCount < 2) {
        setIsPlayer1(true);
        setWaitingForOpponent(true);
      } else {
        setWaitingForOpponent(false);
        setPlayer1(roomState.playerName?.user1 || "Player2");
        setPlayer2(roomState.playerName?.user2 || "Player2");
      }
    });

    socket.on("startQuiz", (questions) => {
      console.log("Start Quiz event received with questions:", questions);
      handleStartQuiz(questions);
    });

    socket.on("resetQuiz", handleResetQuiz);
    socket.on("scoreUpdate", handleScoreUpdate);
    socket.on("gameOver", handleGameOver);
    socket.on("players", handlePlayers);
    socket.on("quizEnd", handleQuizEnd);
    socket.on("showResults", (finalScores) => {
      console.log("showResults event received", finalScores);
      handleShowResults(finalScores);
    });

    socket.on("quiz-started", (data) => {
      console.log(data); // Log received data
      setQuizStarted(data.quizStarted);
    });

    socket.on("waitingForOpponent", () => {
      setWaitingForOpponent(true);
    });

    return () => {
      // Clean up socket connection on unmount
      if (socket) {
        socket.disconnect();
      }
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
    console.log("handleGameOver");
    setGameOver(message);
    socket.emit("quizEnd", params.id, isPlayer1 ? "player1" : "player2");
  };

  const handleQuizEnd = () => {
    console.log("handleQuizEnd");
    socket.emit("quizEnd", params.id, isPlayer1 ? "player1" : "player2");
  };

  const handleShowResults = (finalScores: { [key: string]: number }) => {
    console.log("handleShowResults");
    setScores(finalScores);
    setShowResult(true);
    setWaitingForOpponent(false);
  };

  useEffect(() => {
    if (scores && showResult) {
      let winnerMessage;

      if (scores.player1 > scores.player2) {
        winnerMessage = `${player1} Wins!`;
        updateEdcoins(player1); // Update coins for the winner
      } else if (scores.player2 > scores.player1) {
        winnerMessage = `${player2} Wins!`;
        updateEdcoins(player2); // Update coins for the winner
      } else {
        winnerMessage = "It's a Tie!";
      }
      console.log("Final Results:", winnerMessage);
    }
  }, [scores, player1, player2]);

  const updateEdcoins = async (playerName: string) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/user`,
        {
          username1: player1,
          username2: player2,
          entryCost: false,
          winnerUsername: playerName,
          winnerPrize: true,
        }
      );
      const responseRoom = await axios.put(`http://localhost:3000/api/room`, {
        roomCode: roomCodeState,
        winner: playerName,
      });
      console.log(`User updated for ${playerName}: ${response.data}`);
      if(response.data.success){
        console.log("Room updated with winner successfully:", responseRoom.data);
      }
    } catch (error) {
      console.error(`Error updating user for ${playerName}: ${error}`);
    }
  };

  const handleAnswerClick = (answer: string) => {
    console.log("handleAnswerClick");
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestionIndex].correctAnswer;
    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      socket.emit(
        "updateScore",
        newScore,
        params.id,
        isPlayer1 ? "player1" : "player2"
      );
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
    return (
      <div className="bg-greybg h-screen flex justify-center items-center text-3xl">
        Waiting for another player to join...
      </div>
    );
  }

  console.log({ waitingForOpponent });
  if (waitingForOpponent) {
    return (
      <main className="bg-greybg flex min-h-screen flex-col items-center justify-center p-24">
        <div className="bg-yellowbg rounded-3xl border-[2px] border-black p-6 px-16 text-center">
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
      <main className="bg-greybg flex min-h-screen flex-col items-center justify-center p-24">
        <div className="bg-yellowbg rounded-3xl border-[2px] border-black text-center">
          <h1 className="text-2xl font-bold">Game Over</h1>
          <p>{gameOver}</p>
        </div>
      </main>
    );
  }

  console.log({ showResult });
  if (showResult && scores) {
    let winnerMessage;

    if (scores.player1 > scores.player2) {
      winnerMessage = player1 + " Wins!";
    } else if (scores.player2 > scores.player1) {
      winnerMessage = player2 + " Wins!";
    } else {
      winnerMessage = "It's a Tie!";
    }
    return (
      <main className="bg-greybg flex min-h-screen flex-col items-center justify-center p-24">
        <div className="bg-yellowbg rounded-3xl border-[2px] border-black p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-lg">
            {player1} Score: {scores.player1 ? scores.player1: 0} correct answers
            <PiCoins className="inline-block ml-2" />
          </p>
          <p className="text-lg mb-2">
            {player2} Score: {scores.player2 ? scores.player2: 0} correct answers
            <PiCoins className="inline-block ml-2" />
          </p>
          <p className="text-lg font-bold">{winnerMessage}</p>
          <p className="text-lg font-bold">+ 200 edcoins</p>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-greybg h-screen flex justify-center items-center text-3xl">
        Loading...
      </div>
    );
  }

  console.log({ questions });
  const question = questions[currentQuestionIndex];
  const playerMessage = isPlayer1 ? player1 : player2;
  // console.log("Player Message", playerMessage);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10 bg-white">
      <div className="w-full max-w-md text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Quiz Time!</h1>
        <p className="text-lg font-bold">{playerMessage}</p>
      </div>
      <div className="w-1/2 max-w-full">
        <div className="bg-yellowbg rounded-3xl border-2 border-gray-600 w-full h-full -rotate-6">
          <div className="bg-greybg rounded-3xl border-2 flex flex-col items-center justify-center border-black p-6 w-full rotate-6">
            <div className="flex justify-center mb-4">
              {questionStatus.map((status, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 border-black mx-2 ${
                    index === currentQuestionIndex ? "bg-yellowbg" : "bg-greybg"
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="relative text-center mb-6 border-2 border-black w-full bg-white p-5 rounded-2xl">
              <h2 className="text-lg font-medium">{question.question}</h2>
              <div className="absolute bottom-2 right-4 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center bg-red-200 translate-y-8">
                {timer}s
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mb-2">
              {question.options.map((option, index) => (
                <CustomButton
                  key={index}
                  text={option}
                  className={`mb-2 cursor-pointer ${
                    selectedAnswer === option ? "bg-yellowbg" : "bg-white"
                  }`}
                  onClick={() => handleAnswerClick(option)}
                />
              ))}
            </div>
            {/* <div className="flex text-lg font-medium w-full items-center justify-center mt-3 mb-4">
              ---------------------- <PiCoins className="inline-block mx-2" />{" "}
              10 ed coins ----------------------
            </div> */}
            <div className="flex w-full justify-between">
              <div className="w-1/2 text-left">
                {player1} : {scores ? scores.player1 : 0} correct answers
                {/* <PiCoins className="inline-block ml-2" /> */}
              </div>
              <div className="w-1/2 text-right">
                {player2} : {scores ? scores.player2 : 0} correct answers
                {/* <PiCoins className="inline-block ml-2" /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
