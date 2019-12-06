
cc.Class({
    extends: cc.Component,

    properties: {
        itemNode: cc.Node,
        itemKey: {
            default: "default",
            tooltip: "技能Key值",
        },
        angle: 0,
    },
    
    ctor: function () {
        this.jumpState = 0;
        this.dmg = 0;
    },

    onLoad: function  () {
        this.behaviorComp = this.node.getComponent("CircleComponent");
        this.collider = this.node.getComponent(cc.BoxCollider);
        // let act = cc.sequence(
        //     cc.delayTime(0.5),
        //     cc.callFunc((node) => {
        //         this.node.destroy();
        //     })
        // );
        // act.setTag(99);
        // this.node.runAction( act );
    },

    initData: function ( skillData ) {
        this.dmg = skillData["shanghai"];
    },

    /**
     * 逻辑代码
     * @param setGroup 设置技能分组
     */
    setGroup: function ( groupStr ) {
        this.node.group = groupStr;
    },

    setSkillSpriteFrame: function ( data ) {
        this.itemNode.getComponent(cc.Sprite).spriteFrame = data;
    },

    play: function () {
        if (this.itemNode) {
            let act = cc.moveTo(3, cc.v2(0,0));
            this.itemNode.runAction( act );
        }
    },

    update(dt) {
        var rotation = Engine.GameUtils.getAngleByPts( cc.v2(this.node.x, this.node.y), cc.v2(0,0) );
        // if (rotation >= 360){
        //     rotation = rotation - 360
        // } else if( rotation < 0 ){
        //     rotation = 360 + rotation;
        // }
        Engine.GameLogs.log( String( rotation ) + "," + this.node.x + "," +this.node.y );
        this.node.angle = rotation;
    },

    aiExcute: function () {

        var typeArr = []
        typeArr[0] = 1;
        typeArr[1] = 1;

        var type = typeArr[Engine.GameUtils.getRandomNum( 0, 1 )];

        var rotation = Engine.GameUtils.getAngleByPts( cc.v2(this.node.x, this.node.y), cc.v2(0,0) );
        if (rotation >= 360){
            rotation = rotation - 360
        }

        var height = 100;
        var radian = Engine.GameUtils.defreesToRadian();

        var diffX1 = ( 0 - this.node.x ) * 0.25;
        var diffY1 = 0 - this.node.y;
        var controlp1X = this.node.x + diffX1;
        var conrtolp1 = cc.v2( controlp1X, height + ( this.node.y - Math.abs( Math.cos( rotation ) * diffX1 ) ) * type);

        var diffX2 = ( 0 - this.node.x ) * 0.5;
        var controlp2X = this.node.x + diffX2;
        var conrtolp2 = cc.v2( controlp2X, height + this.node.y - Math.abs( Math.cos( rotation ) * diffX2 ) );

    	var bezier = [conrtolp1, conrtolp2, cc.v2(0,0)];
        var bezierTo = cc.bezierTo(1, bezier);
        this.node.runAction( cc.sequence( bezierTo, cc.callFunc((node) => {

        }) ) );
    },

});
