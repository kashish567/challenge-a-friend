"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
var react_1 = require("react");
var socket_1 = require("@/socket");
function Home() {
    var _a = (0, react_1.useState)(false), isConnected = _a[0], setIsConnected = _a[1];
    var _b = (0, react_1.useState)("N/A"), transport = _b[0], setTransport = _b[1];
    (0, react_1.useEffect)(function () {
        if (socket_1.socket.connected) {
            onConnect();
        }
        function onConnect() {
            setIsConnected(true);
            setTransport(socket_1.socket.io.engine.transport.name);
            socket_1.socket.io.engine.on("upgrade", function (transport) {
                setTransport(transport.name);
            });
        }
        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }
        socket_1.socket.on("connect", onConnect);
        socket_1.socket.on("disconnect", onDisconnect);
        return function () {
            socket_1.socket.off("connect", onConnect);
            socket_1.socket.off("disconnect", onDisconnect);
        };
    }, []);
    return (<div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
    </div>);
}
