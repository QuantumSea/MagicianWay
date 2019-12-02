
cc.Class({
    extends: cc.Component,

    properties: {
        excuteNode: {
            default: null,
            type: cc.Node,
            tooltip: "执行组件逻辑的节点",
        },
        angle: {
            default: 90,
            tooltip: "节点的初始角度",
        },
        step: {
            default: 1,
            tooltip: "速度步长",
        },
        centerPos: {
            default: cc.v2( 0,0 ),
            tooltip: "节点运动的圆心坐标",
        },
        circleRadius: {
            default: 100,
            tooltip: "节点运动的圆的半径",
        },
        isExcute: {
            default: false,
            tooltip: "是否开始做圆周运动(默认false)",
        }
    },
    
    ctor: function () {
        this.roundAngle = 180;
        this.jumpStep = 45;         //起跳间隔20°
        this.runfastScale = 2;
        this.maxAngle = 70;
        this.ticktime = 0.01;
        this.isJumpCount = false;
        this.isJumping = false;
        this.tmpPt = {};
    },

    onLoad: function  () {
        if (this.excuteNode == null ) {
            Engine.GameLogs.log("ExcuteNode Is NULL");
            return
        }

        let initx = this.centerPos.x + this.circleRadius * Math.cos( this.angle * Math.PI / 180 );
        let inity = this.centerPos.y + this.circleRadius * Math.sin( this.angle * Math.PI / 180 );

        this.excuteNode.setPosition( initx, inity );
        this.excuteNode.angle = this.angle - 90;
        // this.excuteNode.angle = 70 - this.angle;
    },

    init: function () {

    },

    jump: function () {
        let beginAngle = this.angle
        let endAngle = this.angle - this.jumpStep;

        if (endAngle < 0) {
            endAngle = 360 - Math.abs(endAngle);
        }

        let beginX = this.centerPos.x + this.circleRadius * Math.cos( beginAngle * Math.PI / 180 );
        let beginY = this.centerPos.y + this.circleRadius * Math.sin( beginAngle * Math.PI / 180 );

        let beginPos = cc.v2( beginX, beginY );

        let endX = this.centerPos.x + this.circleRadius * Math.cos( endAngle * Math.PI / 180 );
        let endY = this.centerPos.y + this.circleRadius * Math.sin( endAngle * Math.PI / 180 );
        
        let endPos = cc.v2( endX, endY );

        //以开始点和结束点为直径，当前step为速度求出半圆的上的坐标点
        let radiusDouble = beginPos.sub(endPos).mag();
        let jumpRadius = radiusDouble * 0.5;

        let centerX = (beginX + endX) * 0.5
        let centerY = (beginY + endY) * 0.5;

        let getAngleByPos = function ( p1, p2 ) {
            let p = cc.v2(0,0);
            p.x = p2.x - p1.x;
            p.y = p2.y - p1.y;
            return Math.atan2(p.y, p.x) * 180 / Math.PI;
        };

        this.angleByPts = getAngleByPos( beginPos, endPos );
       
        let countDistanceByPt = function ( p1, p2 ) {
            let disX = Math.pow(p1.x - p2.x, 2)
            let disY = Math.pow(p1.y - p2.y, 2)
            return Math.sqrt(disX + disY);
        };

        //计算出跳跃路径的坐标
        //记录当前的中心点和半径作为临时存储，跳跃完后重新赋值
        this.tmpPt.tmpCenterPt = this.centerPos;
        this.tmpPt.tmpRadius = this.circleRadius;
        this.tmpPt.tmpStep = this.step;

        this.centerPos = cc.v2(centerX, centerY);
        this.circleRadius = jumpRadius;
        this.jumpAngle = 180 + this.angleByPts;
        this.isJumpCount = true;
        this.isJumping = true;

        let rotation = Engine.GameUtils.getAngleByPts( beginPos, endPos ) + 270;
        let radian = Engine.GameUtils.defreesToRadian( rotation );
        let qt1X = beginPos.x + ( endPos.x - beginPos.x ) / 4;
        let qt1 = cc.v2( qt1X, 100 + beginPos.y + Math.cos( radian ) * qt1X );
        let qt2X = beginPos.x + ( endPos.x - beginPos.x ) / 2;
        let qt2 = cc.v2( qt2X, 100 + beginPos.y + Math.cos( radian ) * qt2X );
        
        let bezier = {
            qt1,
            qt2,
            endPos
        }

        let actBez = cc.bezierTo(1, bezier);


    },

    pause: function ( time ) {
        this.isExcute = false
        if (time) {
            this.node.runAction( cc.sequence(
                cc.delayTime(time),
                cc.callFunc((node) => {
                    this.isExcute = true
                })
            ) );
        }
    },

    update (dt) {
        if (this.isExcute == true) {
            this.step = 0.5;
            this.angle = this.angle - this.step;
            if (this.angle > 360) {
                this.angle = 0;
            } else if( this.angle < 0 ){
                this.angle = 360;
            }
            let curx = this.centerPos.x + this.circleRadius * Math.cos( this.angle * Math.PI / 180 );
            let cury = this.centerPos.y + this.circleRadius * Math.sin( this.angle * Math.PI / 180 );

            this.excuteNode.setPosition( curx, cury );
            // this.excuteNode.angle = 70 - this.angle;
            this.excuteNode.angle = this.angle - 90;
        }
    },
    
});
