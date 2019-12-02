// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: Engine.GameBaseScene,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // Engine.GameLogs.log( "Scene Keys: " + this.sceneKeys );
        this._super();
        // cc.dynamicAtlasManager.enabled = false;          //动态图集
        // cc.macro.CLEANUP_IMAGE_CACHE = false;            //禁止清理 Image 缓存
    },

    start () {

    },

    // update (dt) {},
});
