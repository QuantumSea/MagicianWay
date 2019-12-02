
var Utils = {

    //变量
    screenShake: false,

    defreesToRadian: function ( ag ) {
        return ag * 0.01745329252;
    },

    radiansToDegrees: function ( ag ) {
        return ag * 57.29577951;
    },

    getAngleByPts: function ( pt1, pt2 ) {
        let disX = pt1.x - pt2.x;
        let disY = pt1.y - pt2.y;
        let at = Math.atan( disX / disY ) / Math.PI * 180;

        let getPtAngle = function ( ptS, ptT ) {
            let vecTarget = ptT.sub(ptS);
            if (vecTarget == null) {
                return 0;
            }
            let ag = radiansToDegrees( vecTarget.angle( cc.v2( 1,0 ) ) );

            return ag;
        };

        let angle = getPtAngle( cc.v2( disX, disY ), pt1 );

        return angle + 180;
    },

    /*
     * 统一的加载prefab文件方法
     * @param name   prefab文件名
     * @param callback(prefabNode) 回调方法
     * */
    loadPrefabFile: function (name, callback) {

        var loadCall = function ( error, data ) {

            if( error ) {
                Engine.GameLogs.log( 'Prefab载入失败, 原因:' + error + name );
                return;

            }
            if( !( data instanceof cc.Prefab ) ) { console.log( '你载入的不是Prefab文件' ); return; }

            var newMyPrefab = cc.instantiate( data );
            callback(newMyPrefab);
        };
        if(!name)
            if( error ) { Engine.Log.log( 'Prefab文件路径' + error ); return; }
        cc.loader.loadRes( name, loadCall );
    },

    loadRes: function( name, type, callback) {
        cc.loader.loadRes(name, type, function (err, data) {
            if(err){
                console.log( 'load res ' + name + ' error ：' + err )
                return;
            }
            if ( callback ) {
                callback( data );
            }
        });
    },

    getRandomNum: function ( minNum,maxNum ) {
        switch(arguments.length){ 
            case 1: 
                return parseInt(Math.random()*minNum+1,10); 
            break; 
            case 2: 
                return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
            break; 
                default: 
                    return 0; 
                break; 
        } 
    },

    getWeightRandomNum: function ( curVal, randomConfig ) {
        var randomList = [];
        for (var i in randomConfig) {
            for (var j = 0; j < randomConfig[i].weight; j++) {
                randomList.push(randomConfig[i].id);
            }
        }
        var randomValue = randomList[Math.floor(Math.random() * randomList.length)];
        if (curVal != 0) {
            while (randomValue == curVal ) {
                randomValue  = randomList[Math.floor(Math.random() * randomList.length)];
            }
        }

        return randomValue;
    },

    shakeNode: function( componet, node, time ){
        let excuteComp = componet;
        var sourceX = node.x;
        var sourceY = node.y;
        var pos = cc.v2(sourceX, sourceY);
        var tmp = 0;
        var zs = node.scale;
        node.setPosition(pos);
    
        var shake =  function (dt) {
            tmp = tmp + dt;
            if (Number(tmp) >= Number(time)) {
                excuteComp.unschedule( shake );
                node.setPosition(pos);
                Engine.GameUtils.screenShake = false; 
            }else {
                let x = Engine.GameUtils.getRandomNum(-10, 10);
                let y = Engine.GameUtils.getRandomNum(-10, 10);
                node.setPosition(sourceX+x,sourceY+y);
            }
        }

        excuteComp.schedule(shake, 0);
    },
};

module.exports = Utils;

