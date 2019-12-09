
cc.Class({
    extends: cc.Component,

    properties: {
        trackTarget: {
            default: null,
            type: cc.Node,
            tooltip: "跟踪目标",
        },
        trackSpeed: {
            default: 3,
            tooltip: "跟踪速度",
        },
    },
    
    ctor: function () {

    },

    onLoad: function  () {
        
    },

    Genzong: function (targetPosition){
        var targetPoint = targetPosition;
        var point = cc.v2(this.node.x, this.node.y);
        var delta = targetPoint.sub(point);
        var distance = point.sub(targetPoint).mag();
        var x2 = point.x + this.trackSpeed * delta.x / distance;
        var y2 = point.y + this.trackSpeed * delta.y / distance;
        var newPosition = cc.v2(x2, y2);
        var x1 = point.x;
        var y1 = point.y;
        var deltaRotation = 90 -Math.atan2(y2 - y1, x2 - x1) * 180 /Math.PI;
        this.node.angle=-deltaRotation;
        if(distance<=15){
            return true;
        }
        this.node.setPosition(newPosition);//设置跟踪导弹的位置
    },
 
    setData: function ( data ) {
        this.trackTarget = data["Target"];
        this.trackSpeed = data["Speed"];
    },

    update(dt){
        if (this.Genzong( cc.v2( this.trackTarget.x, this.trackTarget.y ) )) {
            this.node.dispatchEvent( new cc.Event.EventCustom('EnemyGetDmg', true) );
            this.node.destroy();
        }
    }

});
