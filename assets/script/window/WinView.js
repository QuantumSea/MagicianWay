
cc.Class({
    extends: Engine.GameBaseWindow,
    properties: {
        btnRefresh: cc.Button,
    },

    onLoad () {

    },

    btnNextCb: function (event, eventData) {

        if(eventData == "btnNextCb"){
            this.node.dispatchEvent( new cc.Event.EventCustom('NextLvCb', true) );
            this.windowDestroy();
        }

    },
});
