
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
        this.step = 5;
    },

    onLoad: function  () {
        // this.behaviorComp = this.node.getComponent("CircleComponent");
        this.collider = this.node.getComponent(cc.BoxCollider);
    },

    initData: function ( skillData ) {
        this.dmg = skillData["shanghai"];
        this.target = skillData["mubia"];               // 1.enemy 2.player
        this.targetType = skillData["mubiaotype"];      // 1.从前往后朝目标 2.从后往前找目标 3.血量最低的目标 4.全体目标
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
        // let aiType = Engine.GameUtils.getRandomNum( 1, 2 );
        // if (aiType==1) {
        //     this.step = 3;
        //     this.itemNode.x = this.itemNode.x + this.step;
        //     if ( this.itemNode.x > 200 ) {
        //         this.step = -this.step;       
        //     } else if ( this.itemNode.x < 0 ) {
        //         this.step = -this.step;
        //     }     
        // } else if (aiType==2) {
        //     this.step = 1;
        //     this.itemNode.x = this.itemNode.x - this.step;
        //     if ( this.itemNode.x > 200 ) {
        //         this.step = -this.step;       
        //     } else if ( this.itemNode.x < 0 ) {
        //         this.step = -this.step;
        //     }    
        // } else if (aiType==3) {
        //     this.itemNode.x = this.itemNode.x + this.step;
        //     if ( this.itemNode.x > 50 ) {
        //         this.step = -this.step;       
        //     } else if ( this.itemNode.x < 0 ) {
        //         this.step = -this.step;
        //     }      
        // }

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
