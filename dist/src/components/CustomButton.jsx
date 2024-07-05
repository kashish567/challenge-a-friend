"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
var button_1 = require("@/components/ui/button");
var CustomButton = function (_a) {
    var text = _a.text, onClick = _a.onClick;
    return (<button_1.Button variant="outline" onClick={onClick} className="border-2 border-black p-8 rounded-2xl">
      {text}
    </button_1.Button>);
};
exports.default = CustomButton;
