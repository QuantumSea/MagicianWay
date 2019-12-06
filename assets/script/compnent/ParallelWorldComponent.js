
cc.Class({
    extends: cc.Component,

    properties: {

    },
    
    ctor: function () {

    },

    onLoad: function  () {
    },

    setTarget: function ( target ) {
        this.target = target;
        let curx = this.target.getComponent("CircleComponent").centerPos.x + (this.target.getComponent("CircleComponent").circleRadius+50) * Math.cos( this.target.getComponent("CircleComponent").angle * Math.PI / 180 );
        let cury = this.target.getComponent("CircleComponent").centerPos.y + (this.target.getComponent("CircleComponent").circleRadius+50) * Math.sin( this.target.getComponent("CircleComponent").angle * Math.PI / 180 );
        this.node.setPosition( curx, cury );
    },

    update( dt ) {
        if (this.target) {
            let curx = this.target.getComponent("CircleComponent").centerPos.x + (this.target.getComponent("CircleComponent").circleRadius+50) * Math.cos( this.target.getComponent("CircleComponent").angle * Math.PI / 180 );
            let cury = this.target.getComponent("CircleComponent").centerPos.y + (this.target.getComponent("CircleComponent").circleRadius+50) * Math.sin( this.target.getComponent("CircleComponent").angle * Math.PI / 180 );
            this.node.setPosition( curx, cury );
        }
    }

});
