"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_http_1 = require("node:http");
var next_1 = __importDefault(require("next"));
var socket_io_1 = require("socket.io");
var dev = process.env.NODE_ENV !== "production";
var hostname = "localhost";
var port = 3000;
// when using middleware `hostname` and `port` must be provided below
var app = (0, next_1.default)({ dev: dev, hostname: hostname, port: port });
var handler = app.getRequestHandler();
app.prepare().then(function () {
    var httpServer = (0, node_http_1.createServer)(handler);
    var io = new socket_io_1.Server(httpServer);
    io.on("connection", function (socket) {
        // ...
    });
    httpServer
        .once("error", function (err) {
        console.error(err);
        process.exit(1);
    })
        .listen(port, function () {
        console.log("> Ready on http://".concat(hostname, ":").concat(port));
    });
});
