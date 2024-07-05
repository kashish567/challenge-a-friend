"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var socket_io_client_1 = require("socket.io-client");
var data_json_1 = __importDefault(require("@/data.json")); // Assuming this is correctly mapped in your Next.js config
var CustomButton_1 = __importDefault(require("@/components/CustomButton"));
var pi_1 = require("react-icons/pi");
var socket;
var Home = function () {
    var _a = (0, react_1.useState)([]), questions = _a[0], setQuestions = _a[1];
    var _b = (0, react_1.useState)(0), currentQuestionIndex = _b[0], setCurrentQuestionIndex = _b[1];
    var _c = (0, react_1.useState)(null), selectedAnswer = _c[0], setSelectedAnswer = _c[1];
    var _d = (0, react_1.useState)(0), score = _d[0], setScore = _d[1];
    var _e = (0, react_1.useState)(15), timer = _e[0], setTimer = _e[1];
    var _f = (0, react_1.useState)(false), showResult = _f[0], setShowResult = _f[1];
    var _g = (0, react_1.useState)(Array(5).fill(null)), questionStatus = _g[0], setQuestionStatus = _g[1];
    var _h = (0, react_1.useState)(false), quizStarted = _h[0], setQuizStarted = _h[1];
    (0, react_1.useEffect)(function () {
        // Connect to the socket.io server on the same port as Next.js development server
        socket = (0, socket_io_client_1.io)('http://localhost:3000/api/socket'); // Adjust the URL based on your server setup
        // Socket event listeners
        socket.on('startQuiz', handleStartQuiz);
        socket.on('resetQuiz', handleResetQuiz);
        return function () {
            // Clean up socket connection when component unmounts
            socket.disconnect();
        };
    }, []);
    (0, react_1.useEffect)(function () {
        // Timer logic for the quiz
        var timerId;
        if (quizStarted && timer > 0) {
            timerId = setTimeout(function () { return setTimer(timer - 1); }, 1000);
        }
        else if (quizStarted && timer === 0) {
            handleTimeUp();
        }
        return function () { return clearTimeout(timerId); };
    }, [timer, quizStarted]);
    // Function to handle quiz start event
    var handleStartQuiz = function () {
        setQuizStarted(true);
        var shuffledQuestions = __spreadArray([], data_json_1.default.questions, true).sort(function () { return 0.5 - Math.random(); });
        setQuestions(shuffledQuestions.slice(0, 5));
        setTimer(15);
    };
    // Function to handle quiz reset event
    var handleResetQuiz = function () {
        setQuizStarted(false);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setScore(0);
        setTimer(15);
        setShowResult(false);
        setQuestionStatus(Array(5).fill(null));
    };
    // Function to handle user's answer click
    var handleAnswerClick = function (answer) {
        setSelectedAnswer(answer);
        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 10);
            updateQuestionStatus('correct');
        }
        else {
            updateQuestionStatus('wrong');
        }
        setTimeout(goToNextQuestion, 1000);
    };
    // Function to handle time up
    var handleTimeUp = function () {
        updateQuestionStatus('unanswered');
        setTimeout(goToNextQuestion, 1000);
    };
    // Function to update question status
    var updateQuestionStatus = function (status) {
        var updatedStatus = __spreadArray([], questionStatus, true);
        updatedStatus[currentQuestionIndex] = status;
        setQuestionStatus(updatedStatus);
    };
    // Function to move to the next question or show result
    var goToNextQuestion = function () {
        if (currentQuestionIndex < 4) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setTimer(15);
        }
        else {
            setShowResult(true);
        }
    };
    // Conditional rendering based on quiz state
    if (!quizStarted) {
        return <div>Waiting for another player to join...</div>;
    }
    if (showResult) {
        return (<main className="bg-[#dbd9e3] flex min-h-screen flex-col items-center justify-center p-24">
        <div className="bg-[#f0bf4c] rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold">Quiz Completed!!</h1>
          <p className="text-lg">
            Your score: {score} ed coins
            <pi_1.PiCoins className="inline-block ml-2"/>{' '}
          </p>
        </div>
      </main>);
    }
    if (questions.length === 0) {
        return <div>Loading...</div>;
    }
    var question = questions[currentQuestionIndex];
    // Render quiz UI
    return (<main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
      <div className="relative w-full max-w-[40rem]">
        <div className="bg-[#f0bf4c] rounded-3xl border-2 border-gray-600 w-full h-full absolute top-0 left-0 transform rotate-6"></div>
        <div className="bg-[#dbd9e3] rounded-3xl border-2 flex flex-col items-center justify-center border-black p-8 w-full relative z-10">
          <div className="flex justify-center mb-4">
            {questionStatus.map(function (status, index) { return (<div key={index} className={"w-10 h-10 flex items-center justify-center rounded-full border-2 border-black mx-2 ".concat(index === currentQuestionIndex ? 'bg-yellow-500' : 'bg-gray-300')}>
                {index + 1}
              </div>); })}
          </div>
          <div className="relative text-center mb-8 border-2 border-black w-full bg-white p-5 rounded-2xl">
            <h2 className="text-lg font-medium">{question.question}</h2>
            <div className="absolute bottom-2 right-4 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center bg-red-200 translate-y-8">
              {timer}s
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            {question.options.map(function (option, index) { return (<CustomButton_1.default key={index} text={option} onClick={function () { return handleAnswerClick(option); }}/>); })}
          </div>
          <div className="flex text-lg font-medium w-full items-center justify-center mt-3 mb-10">
            ---------------------- <pi_1.PiCoins className="inline-block mr-2 ml-2"/> 10 ed coins ----------------------
          </div>
        </div>
      </div>
    </main>);
};
exports.default = Home;
