
var utils   = require("utils");
var logs    = require("JsLog");
var scene   = require("JsBaseSceneComponent");
var windows  = require("JsBaseWindowComponent");

/*
* 全局处理
* */

window.Engine =  {
    GameUtils: utils,
    GameLogs: logs,
    GameBaseScene: scene,
    GameBaseWindow: windows,
};

// return true 在for循环里是等同于continue