
cc.Class({
    extends: Engine.GameBaseWindow,
    properties: {
        btnRefresh: cc.Button,
    },

    onLoad () {

    },

    btnRefreshCb: function (event, eventData) {

        if(eventData == "btnRefreshCb"){
            this.node.dispatchEvent( new cc.Event.EventCustom('GuanQiaRefresh', true) );
            this.windowDestroy();
        }

    },
});
