
cc.Class({
    extends: cc.Component,

    properties: {
        rootLayoutPtr: {
            default: null,
            type: cc.Node,
            tooltip: "父节点的指针",
        },
        uiLayoutPtr: {
            default: null,
            type: cc.Node,
            tooltip: "UI节点的指针",
        },
        roleLayoutPtr: {
            default: null,
            type: cc.Node,
            tooltip: "角色节点的指针",
        },
        skillLayoutPtr: {
            default: null,
            type: cc.Node,
            tooltip: "技能节点的指针",
        },
        effectLayoutPtr: {
            default: null,
            type: cc.Node,
            tooltip: "特效节点的指针",
        },
        itemPoolPrefab:{
            type:cc.Prefab,
            default:null,
            tooltip: "spine预制",
        },
        playerPrefab:{
            type:cc.Prefab,
            default:null,
            tooltip: "玩家角色预制",
        },
        enemyPrefab:{
            type:cc.Prefab,
            default:null,
            tooltip: "敌人角色预制",
        },
        skillItemPrefab:{
            type:cc.Prefab,
            default:null,
            tooltip: "技能预制",
        },
    },

    ctor: function () {
        this.ResSpineList = [];
        this.PlayerList = [];
        this.EnemyList = [];

        this.skillPosIdx = 0;
    },

    update( dt ) {

    },

    loadRes: function () {
        let self = this;

        let resData = {
            0:  "animation/contra",
            1:  "animation/contra2",
            2:  "animation/contra3",
            3:  "animation/contra4",
            4:  "animation/contra5",
        }

        var loadResCb = function ( idx ) {
            cc.loader.loadRes(resData[idx], sp.SkeletonData, function (err, data) {
                if(!err){
                    self.ResSpineList[idx] = data;
                    idx = idx + 1
                    if (idx == 5) {
                        self.eventRegister();
                        self.init();
                    } else {
                        loadResCb(idx);
                    }
                }
            }); 
        }

        loadResCb(0);
    },

    onLoad () {

        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        manager.enabledDrawBoundingBox = true;

        this.loadRes();

    },

    init () {
        Game.Data.Player.checkPoint = 9;
        var guanqiaData = DB.getTableDataForKey( DB.GuanQiaVo, Game.Data.Player.checkPoint );
        this.checkPointData = {
            checkPointIdx:          Game.Data.Player.checkPoint,
            checkPointInfo:         guanqiaData["guankashuoming"],
            monsterInfo:            guanqiaData["guaiwushuoming"],
            profit:                 guanqiaData["shouyi"],
            mapId:                  guanqiaData["map"],
            skyId:                  guanqiaData["sky"],
            itemPrice:              guanqiaData["price"],
            skillPackId:            guanqiaData["skillpackid"],
            monsterPackId:          [guanqiaData["monpackid1"], guanqiaData["monpackid2"], guanqiaData["monpackid3"]],
            monsterPackIdx:         0,
            playerPackId:           guanqiaData["zhujuepack"],
        };

        
        this.initGuanQia();
    },
 
    start () {

    },

/**
 * 逻辑代码
 * @param playerBorn 玩家角色生成
 * @param enemyBorn 敌人角色生成
 * @param updateGridPool 更新格子池
 */

    initGuanQia: function () {
        //初始化关卡地图
        let self = this;
        Engine.GameUtils.loadRes( "Image/ui/bg_" + this.checkPointData.skyId, cc.SpriteFrame, ( data ) => {
            self.rootLayoutPtr.getChildByName("BgSprite").getComponent(cc.Sprite).spriteFrame = data;
        } );

        Engine.GameUtils.loadRes( "Image/ui/center_" + this.checkPointData.mapId, cc.SpriteFrame, ( data ) => {
            self.rootLayoutPtr.getChildByName("centerSp").getComponent(cc.Sprite).spriteFrame = data;
        } );

        if (self.itemPoolObj == null) {
            self.itemPoolObj = cc.instantiate( self.itemPoolPrefab );
            self.uiLayoutPtr.addChild( self.itemPoolObj );   
        }

        var emptyGrids = this.itemPoolObj.getComponent('ItemPoolComponent').queryEmptyGridsNum();
        if (emptyGrids.length == 15) {
            let gridDatas = [];
            if (Game.Data.Player.itemList.length > 0) {
                gridDatas = [...Game.Data.Player.itemList];
            }
            self.updateGridPool( gridDatas );
        }

        this.checkPointLb = this.rootLayoutPtr.getChildByName("CheckPointLb");
        this.checkPointLb.getComponent(cc.Label).string = "第" + this.checkPointData.checkPointIdx + "关";

        self.playerBorn();
        self.enemyBorn();
    },

    playerBorn: function () {
        let stepAng = 15;
        let ang = 90;
        this.PlayerList.forEach((player, idx) => {
            if (player.getComponent("CircleComponent")) {
                ang = player.getComponent("CircleComponent").angle;
            }
        });
        let playerAng = ang;
        let playerCountIdx = 0;
        let playerPackData = DB.getTableDataForKey( DB.PlayerPackVo, this.checkPointData.playerPackId );
        for (let index = 0; index < 5; index++) {
            let playerId = playerPackData["zhujue"+(index+1)];
            if (Number(playerId) > 0) {
                let playerData = DB.getTableDataForKey( DB.PlayerVo, playerId );
                if (this.PlayerList[index]) {
                    playerAng = playerAng + 15;
                    if (playerAng >= 360) {
                        playerAng = playerAng - 360;
                    }
                    if ("player"+playerId == this.PlayerList[index].roleKey) {
                        this.PlayerList[index].getComponent("PlayerComponent").roleKey = "player"+playerId;
                        this.PlayerList[index].getComponent("PlayerComponent").playerIdx = playerCountIdx;
                        this.PlayerList[index].getComponent("PlayerComponent").setAnimation( this.ResSpineList[Number(playerData["moxing"])] );
                        continue;
                    } else {
                        Engine.GameLogs.log(index + "玩家角色ID没有更换" + playerId);
                        continue;
                    }
                }
                let roleobj = cc.instantiate( this.playerPrefab );
                if ( roleobj.getComponent("PlayerComponent") ) {
                    roleobj.getComponent("PlayerComponent").roleKey = "player"+playerId;
                    roleobj.getComponent("PlayerComponent").initData( playerData, playerId, playerCountIdx );
                    roleobj.getComponent("PlayerComponent").setGroup( "arr_player" );
                    roleobj.getComponent("PlayerComponent").setAnimation( this.ResSpineList[Number(playerData["moxing"])] );
                    roleobj.getComponent("PlayerComponent").setSkin( "gun4" );
                }
                if ( roleobj.getComponent("CircleComponent") ) {
                    roleobj.getComponent("CircleComponent").angle = playerAng;
                    playerAng = playerAng + 15;
                    if (playerAng >= 360) {
                        playerAng = playerAng - 360;
                    }      
                }
                this.roleLayoutPtr.addChild( roleobj );
                this.PlayerList.push( roleobj );
                playerCountIdx = playerCountIdx + 1;

                roleobj.getComponent("PlayerComponent").idle();
            } else {
                //判断此角色是否多余
                if (this.PlayerList[index]) {
                    Engine.GameLogs.log(index + "玩家多余" + playerId);
                    this.PlayerList[index].destroy();
                    this.PlayerList.splice(index,1);
                }
            }
        }
    },

    enemyBorn: function () {
        let ang = 0;
        if (this.PlayerList[0]) {
            ang = 270 - (this.PlayerList[0].angle + 90);
            if (ang > 0) {
                ang = 360 - ang;
            } else {
                ang = 0 - ang;
            }         
        }
        let stepAng = 15;
        let enemyAng = ang;
        let monsterCountIdx = 0;

        if ( Number(this.checkPointData.monsterPackId[this.checkPointData.monsterPackIdx]) > 0 ) {
            let mPackId = Number(this.checkPointData.monsterPackId[this.checkPointData.monsterPackIdx])
            let monsterPackData = DB.getTableDataForKey( DB.MonPackVo, mPackId );
            for (let index = 0; index < 10; index++) {
                let monsterId = monsterPackData["mon"+(index+1)]
                if ( Number( monsterId ) > 0 ) {
                    let monsterData = DB.getTableDataForKey( DB.MonsterVo, monsterId );
                    if (this.EnemyList[monsterCountIdx]) {
                        if (monsterCountIdx+"enemy"+monsterId == this.EnemyList[monsterCountIdx].roleKey) {
                            this.EnemyList[monsterCountIdx].getComponent("EnemyComponent").roleKey = monsterCountIdx+"enemy"+monsterId;
                            this.EnemyList[monsterCountIdx].getComponent("EnemyComponent").monsterIdx = monsterCountIdx;
                            this.EnemyList[monsterCountIdx].getComponent("EnemyComponent").setAnimation( this.ResSpineList[Number(monsterData["moxing"])] );
                            return
                        } else {
                            Engine.GameLogs.log(monsterCountIdx + "敌人角色ID没有更换" + monsterId);
                            return
                        }
                    }
                    let roleobj = cc.instantiate( this.enemyPrefab );
                    if ( roleobj.getComponent("EnemyComponent") ) {
                        roleobj.getComponent("EnemyComponent").roleKey = monsterCountIdx+"enemy"+monsterId;
                        roleobj.getComponent("EnemyComponent").initData( monsterData, monsterId, monsterCountIdx );
                        roleobj.getComponent("EnemyComponent").setGroup( "arr_enemy" );
                        roleobj.getComponent("EnemyComponent").setAnimation( this.ResSpineList[Number(monsterData["moxing"])] );
                        roleobj.getComponent("EnemyComponent").setSkin( "gun3" );
                    }
                    if ( roleobj.getComponent("CircleComponent") ) {
                        roleobj.getComponent("CircleComponent").angle = enemyAng;
                        enemyAng = enemyAng + 15;
                        if (enemyAng >= 360) {
                            enemyAng = enemyAng - 360;
                        }      
                    }
                    
                    this.roleLayoutPtr.addChild( roleobj );
                    this.EnemyList.push(roleobj);
                    monsterCountIdx = monsterCountIdx + 1;
    
                    roleobj.getComponent("EnemyComponent").idle();
                } else {
                    //判断此角色是否多余
                    if (this.EnemyList[monsterCountIdx]) {
                        Engine.GameLogs.log(monsterCountIdx + "敌人多余" + monsterId);
                        this.EnemyList[monsterCountIdx].destroy();
                        this.EnemyList.splice(monsterCountIdx,1);
                    }
                }
            }  
        }

    },

    enemyDeath: function ( obj, idx ) {
        let x = Engine.GameUtils.getRandomNum( -500, 1880 );
        let y = 1500;
        let spawn = cc.spawn( cc.moveTo(0.5, cc.v2(x,y)), cc.rotateBy(0.5, 1800) );
        obj.runAction( cc.sequence(
            spawn,
            cc.delayTime(1),
            cc.callFunc((node) => {
                node.destroy();
                this.EnemyList.splice(idx,1)
                if (this.EnemyList.length == 0) {
                    this.checkPointData.monsterPackIdx = this.checkPointData.monsterPackIdx + 1;
                    if (this.checkPointData.monsterPackIdx >= 3) {
                        this.nextLvLogic();
                    } else {
                        this.nextMonsterLogic();
                    }
                }
            })
        ) );
    },

    playerDeath: function ( obj, idx ) {
        obj.runAction( cc.sequence(
            cc.fadeOut(2),
            cc.callFunc((node) => {
                node.destroy();
                this.PlayerList.splice(idx,1)
                if (this.PlayerList.length == 0) {
                    Engine.GameLogs.log("关卡失败");
                    this.EnemyList.forEach((enemy, idx) => {
                        if (enemy.getComponent("EnemyComponent").lifeState == true) {
                            enemy.getComponent("EnemyComponent").idle();
                            enemy.getComponent("CircleComponent").isExcute = false;
                            enemy.getComponent("EnemyComponent").aiPause();
                        }
                    });
                }
            })
        ) );
    },

    skillBorn: function ( skillIdx ) {
        var self = this;
        let skillobj = cc.instantiate( this.skillItemPrefab );
        let skillData = DB.getTableDataForKey( DB.SkillVo, skillIdx );
        if ( skillobj.getComponent("SkillItemComponent") ) {
            skillobj.getComponent("SkillItemComponent").initData( skillData );
            skillobj.getComponent("SkillItemComponent").setGroup( "arr_skill" );
            let resName = "item"+skillData["moxing"];
            skillobj.getComponent("SkillItemComponent").setSkillSpriteFrame( this.itemPoolObj.getComponent("ItemPoolComponent").itemAtlas.getSpriteFrame( resName ) );
            if ( skillobj.getComponent("CircleComponent") ) {
                skillobj.getComponent("CircleComponent").angle = 90 + (self.skillPosIdx * 10);
            }
            self.skillLayoutPtr.addChild( skillobj );
        }
        
    },

    updateGridPool: function ( gridDatas ) {
        this.itemPoolObj.getComponent('ItemPoolComponent').initGrids( gridDatas )
    },

/**
 * 事件代码
 * @param eventRegister 事件注册
 * @param eventListen 事件监听
 */

    eventRegister: function () {
        this.node.on('btnSkillSpeedUp', function ( roleIndex ) {
            this.btnSpeedUp( roleIndex );
        }, this);
        this.node.on('btnSkillFireCircle', function ( roleIndex ) {
            this.fireCircleLogic( roleIndex );
        }, this);
        this.node.on('btnBulletLv1', function ( roleIndex ) {
            this.bulletLogic( roleIndex, 1 );
        }, this);
        this.node.on('btnBulletLv2', function ( roleIndex ) {
            this.bulletLogic( roleIndex, 2 );
        }, this);
        this.node.on('btnBulletLv3', function ( roleIndex ) {
            this.bulletLogic( roleIndex, 3 );
        }, this);
        this.node.on('btnUpdateGridsCb', function ( ) {
            this.btnUpdateGridsLogic( );
        }, this);
        this.node.on('btnGameBeginCb', function ( ) {
            this.btnGameBegin( );
        }, this);
        this.node.on('btnFireGridsBeginCb', function ( ) {
            this.btnFireLogic( 1 );
        }, this);
        this.node.on('btnFireGridsMoveCb', function ( ) {
            this.btnFireLogic( 2 );
        }, this);
        this.node.on('btnFireGridsEndCb', function ( ) {
            this.btnFireLogic( 3 );
        }, this);
        this.node.on('btnFireGridsCancelCb', function ( ) {
            this.btnFireLogic( 4 );
        }, this);
        this.node.on('NextLvCb', function ( event ) {
            event.stopPropagation();
            this.nextLvLogic();
        }, this);
        this.node.on('EnemyDeathCb', function ( event ) {
            Engine.GameLogs.log( "敌人死亡" );
            event.stopPropagation();
            this.enemyDeathLogic();
        }, this);
        this.node.on('PlayerDeathCb', function ( event ) {
            Engine.GameLogs.log( "玩家死亡" );
            event.stopPropagation();
            this.playerDeathLogic();
        }, this);
        this.node.on('EnemyAttackCb', function ( event ) {
            event.stopPropagation();
            this.enemyAttackLogic( event.target );
        }, this);
        this.node.on('ShakeCb', function ( event ) {
            event.stopPropagation();
            this.shakeLogic();
        }, this);
    },

    enemyDeathLogic: function () {
        this.EnemyList.forEach((enemy, idx) => {
            if (enemy.getComponent("EnemyComponent").lifeState == false) {
                this.enemyDeath( enemy, idx );
            }
        });
    },

    playerDeathLogic: function () {
        this.PlayerList.forEach((player, idx) => {
            if (player.getComponent("PlayerComponent").lifeState == false) {
                this.playerDeath( player, idx );
            }
        });
    },

    enemyAttackLogic: function ( enemyNode ) {
        if ( enemyNode.getComponent("EnemyComponent") ) {
            var aiData = DB.getTableDataForKey( DB.AiVo, enemyNode.getComponent("EnemyComponent").aiId );
            var aiTarget = aiData["mubiao"];
            var playerIdx = aiTarget;
            if (this.PlayerList[playerIdx]) {
                if (this.PlayerList[playerIdx].getComponent("PlayerComponent").lifeState == true) {
                    var enemyDmg = enemyNode.getComponent("EnemyComponent").dmg;
                    this.PlayerList[playerIdx].getComponent("PlayerComponent").getHit( Number( enemyDmg ) );
                }   
            }
            // Engine.GameLogs.log( enemyNode.getComponent("EnemyComponent").monsterIdx + "位敌人攻击目标" + aiTarget );
        }
    },

    playerHit: function () {

    },
    //下一关
    nextLvLogic: function () {
        Game.Data.Player.checkPoint = Game.Data.Player.checkPoint + 1;
        cc.sys.localStorage.setItem('userData', JSON.stringify( Game.Data.Player ));
        Engine.GameLogs.log( "准备下一关" );
        this.init();
    },
    //下一波怪物
    nextMonsterLogic: function () {
        Engine.GameLogs.log( "第" + this.checkPointData.monsterPackIdx + "波怪物" );
        this.enemyBorn();
    },

    btnGameBegin: function ( ) {
        this.PlayerList.forEach((player, idx) => {
            if (player.getComponent("PlayerComponent").lifeState == true) {
                player.getComponent("PlayerComponent").run();
                player.getComponent("CircleComponent").isExcute = true;
            }
        });
        this.EnemyList.forEach((enemy, idx) => {
            if (enemy.getComponent("EnemyComponent").lifeState == true) {
                enemy.getComponent("EnemyComponent").run();
                enemy.getComponent("CircleComponent").isExcute = true;
                enemy.getComponent("EnemyComponent").aiResume();
            }
        });
    },

    btnUpdateGridsLogic: function ( ) {
        var skillPackData = DB.getTableDataForKey( DB.SkillPackVo, this.checkPointData.skillPackId );
        var gridDatas = [];
        var skillList = [];
        for (let index = 0; index < 15; index++) {
            let skillId = skillPackData["skill"+(index+1)];
            let skillWeight = skillPackData["jilv"+(index+1)];
            skillList.push( { id:skillId, weight:skillWeight } );
        }
        var emptyGrids = this.itemPoolObj.getComponent('ItemPoolComponent').queryEmptyGridsNum();
        for (let index = 0; index < emptyGrids.length; index++) {
            let randomSkillId = Engine.GameUtils.getWeightRandomNum(0, skillList);
            let emptyGridIdx = emptyGrids[index];
            gridDatas[emptyGridIdx] = randomSkillId;
        }
        this.updateGridPool( gridDatas );
    },

    btnFireLogic: function ( touchType ) {
        let self = this;
        if (touchType == 1) {
            this.skillPosIdx = 0;
            if (this.node.getActionByTag(100)) {
                this.skillPosIdx = 0;
                this.node.stopActionByTag( 100 )   
            }
            let doLogic = function () {
                let skillIdx = self.itemPoolObj.getComponent('ItemPoolComponent').consumeGrid();
                if (skillIdx > 0) {
                    Engine.GameLogs.log("技能"+skillIdx+"发射");
                    self.skillBorn( skillIdx );
                    self.PlayerList[0].getComponent("RoleComponent").attack();
                    self.skillPosIdx = self.skillPosIdx + 1;
                    if (self.node.getActionByTag(100)) {
                        self.node.stopActionByTag( 100 )   
                    }
                    let act = cc.sequence(
                        cc.delayTime(0.15),
                        cc.callFunc((node) => {
                            doLogic();
                        })
                    );
                    act.setTag(100);
                    self.node.runAction( act )
                } else {
                    self.skillPosIdx = 0;
                }   
            }
            doLogic();
        } else if ( touchType == 3 ) {
            if (this.node.getActionByTag(100)) {
                this.node.stopActionByTag( 100 )
            }
            this.skillPosIdx = 0;
        }else if ( touchType == 4 ) {
            if (this.node.getActionByTag(100)) {
                this.node.stopActionByTag( 100 )
            }
            this.skillPosIdx = 0;
        }
    },

    btnSpeedUp: function ( roleIndex ) {  
        for(let index in this.PlayerList){
            let player = this.PlayerList[index];
            if (player.getComponent("SpeedUpComponent") == null) {
                if (player.getComponent(cc.Component).roleKey == "player" + roleIndex) {
                    player.addComponent("SpeedUpComponent");
                    player.getComponent("SpeedUpComponent").Excute();
                }
            } else {
                player.getComponent("SpeedUpComponent").Excute();
            }
        }
    },

    fireCircleLogic: function ( roleIndex ) {
        for(let index in this.PlayerList){
            let player = this.PlayerList[index];
            if (player.getComponent("RoleComponent").roleKey == "player" + roleIndex) {
                player.getComponent("RoleComponent").attack();
                let playerAngle = player.getComponent("CircleComponent").angle - 20;
                let skillobj = cc.instantiate( this.skillPrefab );
                if ( skillobj.getComponent("SkillComponent") ) {
                    skillobj.getComponent("SkillComponent").setGroup( "arr_playerAttack" );
                    skillobj.getComponent("SkillComponent").roleKey = "skill" + index;
                }
                if ( skillobj.getComponent("CircleComponent") ) {
                    skillobj.getComponent("CircleComponent").angle = playerAngle;
                    skillobj.getComponent("CircleComponent").isExcute = true;
                    skillobj.getComponent("CircleComponent").step = 2.5;
                }
                this.SkillPtr.addChild( skillobj );
                this.SkillList.push( skillobj );
            }
        }
    },

    bulletLogic: function ( roleIndex, lv ) {

    },

    shakeLogic: function () {
        if (Engine.GameUtils.screenShake == false) {
            let self = this;
            Engine.GameUtils.screenShake = true; 
            Engine.GameUtils.shakeNode( self, self.rootLayoutPtr, 0.5 );      
        }
    },
});
