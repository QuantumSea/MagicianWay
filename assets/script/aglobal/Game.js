
var PlayerDB   = require("PlayerDB");

/*
* 全局处理
* */

window.Game =  {

    initData: function () {
        this.Data = {
            Player: new PlayerDB()
        }
    },

    SceneBaseRoot: null,
};