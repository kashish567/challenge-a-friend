"use strict";
'use client';
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var button_1 = require("@/components/ui/button");
var link_1 = __importDefault(require("next/link"));
var Room = function (_a) {
    var params = _a.params;
    var _b = (0, react_1.useState)(""), username = _b[0], setUsername = _b[1];
    return (<div className="h-screen w-screen bg-[#dbd9e3] flex flex-col justify-center items-center">
      <div className="p-6 bg-[#f0bf4c] rounded-md shadow-md shadow-black ">
        <div className="flex flex-col font-semibold">
          <label htmlFor="username">Username</label>
          <input type="text" name="username" className="mb-2 rounded-sm h-8 p-2" value={username} onChange={function (e) { var _a; return setUsername((_a = e.target) === null || _a === void 0 ? void 0 : _a.value); }}/>
          <link_1.default href={"/room/".concat(params.id, "/").concat(username)} className='flex items-center justify-center'><button_1.Button className="mt-4">
            Join Room
          </button_1.Button>
          </link_1.default>
        </div>
      </div>

      
    </div>);
};
exports.default = Room;
