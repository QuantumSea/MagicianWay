
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
        let resMaxNum = 7;
        let resData = {
            0:  "animation/contra",
            1:  "animation/contra2",
            2:  "animation/contra3",
            3:  "animation/contra4",
            4:  "animation/contra5",
            5:  "animation/hedanpao",
            6:  "animation/hedan_baozha",
        }

        var loadResCb = function ( idx ) {
            cc.loader.loadRes(resData[idx], sp.SkeletonData, function (err, data) {
                if(!err){
                    self.ResSpineList[idx] = data;
                    idx = idx + 1
                    if (idx == resMaxNum) {
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
        cc.debug.setDisplayStats(false);
        // manager.enabledDebugDraw = true;
        // manager.enabledDrawBoundingBox = true;

        this.loadRes();
    },

    init () {
        // Game.Data.Player.checkPoint = 1;
        var guanqiaData = DB.getTableDataForKey( DB.GuanQiaVo, Game.Data.Player.checkPoint );
        var guankaSkillData = DB.getTableDataForKey( DB.SkillVo, guanqiaData["nengliangID"] );
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
            composeNum:             0,
            composeMaxNum:          5,
            continuityNum:          0,
            continuityMaxNum:       5,
            continuitySkillId:      guanqiaData["nengliangID"],
            continuityChargeNum:    0,         //能量连击增值
            continuityAttenuationNum:   Number(guanqiaData["shuaijian"])*0.5,       //能量连击衰减值
        };
        
        this.initGuanQia();
        this.parallelWorld = this.skillLayoutPtr.getChildByName("parallelWorld");
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

        this.checkPointLb = this.rootLayoutPtr.getChildByName("CheckPointLb");
        this.checkPointLb.getComponent(cc.Label).string = "第" + this.checkPointData.checkPointIdx + "关";

        self.playerBorn();
        self.enemyBorn();

        this.aiExcuteNode = new cc.Node;
        this.node.addChild( this.aiExcuteNode );
        this.aiExcuteNode.runAction( cc.repeatForever( cc.sequence(
            cc.delayTime(1),
            cc.callFunc((node) => {
                if (this.checkPointData.continuityNum > 0) {
                    this.checkPointData.continuityNum = this.checkPointData.continuityNum - this.checkPointData.continuityAttenuationNum;
                    if (this.checkPointData.continuityNum < 0) {
                        this.checkPointData.continuityNum = 0;
                    }
                    this.updateContinuityEnergyBar();
                }
            })
        ) ) );
        cc.director.getActionManager().pauseTarget( this.aiExcuteNode );
    },

    playerBorn: function () {
        let ang = 90;
        // this.PlayerList.forEach((player, idx) => {
        //     if (player.getComponent("CircleComponent")) {
        //         ang = player.getComponent("CircleComponent").angle;
        //     }
        // });
        let playerAng = ang;
        let playerCountIdx = 0;
        let playerPackData = DB.getTableDataForKey( DB.PlayerPackVo, this.checkPointData.playerPackId );
        for (let index = 0; index < 5; index++) {
            let playerId = playerPackData["zhujue"+(index+1)];
            if (Number(playerId) > 0) {
                let playerData = DB.getTableDataForKey( DB.PlayerVo, playerId );
                if (this.PlayerList[index]) {
                    if ("player"+playerId == this.PlayerList[index].roleKey) {
                        this.PlayerList[index].getComponent("PlayerComponent").roleKey = "player"+playerId;
                        this.PlayerList[index].getComponent("PlayerComponent").playerIdx = playerCountIdx;
                        this.PlayerList[index].getComponent("PlayerComponent").setAnimation( this.ResSpineList[Number(playerData["moxing"])] );
                        continue;
                        // return;
                    } else {
                        Engine.GameLogs.log(index + "玩家角色ID没有更换" + playerId);
                        this.PlayerList[index].getComponent("PlayerComponent").onLoad();
                        if ( this.PlayerList[index].getComponent("CircleComponent") ) {
                            this.PlayerList[index].getComponent("CircleComponent").angle = playerAng;
                            this.PlayerList[index].getComponent("CircleComponent").onLoad();
                            playerAng = playerAng + 15;
                            if (playerAng >= 360) {
                                playerAng = playerAng - 360;
                            }
                        }
                        // return;
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

    enemyBorn: function ( ) {
        Engine.GameLogs.log( "第" + (this.checkPointData.monsterPackIdx+1) + "波怪物" );
        let ang = 0;
        if (this.PlayerList[0]) {
            ang = 270 - (this.PlayerList[0].angle + 90);
            if (ang > 0) {
                ang = 360 - ang;
            } else {
                ang = 0 - ang;
            }         
        }
        let enemyAng = ang;
        // let enemyAng = 0;
        let monsterCountIdx = 0;

        if ( Number(this.checkPointData.monsterPackId[this.checkPointData.monsterPackIdx]) > 0 ) {
            let mPackId = Number(this.checkPointData.monsterPackId[this.checkPointData.monsterPackIdx])
            let monsterPackData = DB.getTableDataForKey( DB.MonPackVo, mPackId );
            for (let index = 0; index < 10; index++) {
                let monsterId = monsterPackData["mon"+(index+1)]
                if ( Number( monsterId ) > 0 ) {
                    let monsterData = DB.getTableDataForKey( DB.MonsterVo, monsterId );
                    if (this.EnemyList[monsterCountIdx]) {
                        if (monsterCountIdx+"enemy"+monsterId == this.EnemyList[monsterCountIdx].getComponent("EnemyComponent").roleKey) {
                            Engine.GameLogs.log(monsterCountIdx + "敌人角色ID没有更换" + monsterId);
                            this.EnemyList[monsterCountIdx].getComponent("EnemyComponent").onLoad();
                            if ( this.EnemyList[monsterCountIdx].getComponent("CircleComponent") ) {
                                this.EnemyList[monsterCountIdx].getComponent("CircleComponent").angle = enemyAng;
                                this.EnemyList[monsterCountIdx].getComponent("CircleComponent").onLoad();
                                enemyAng = enemyAng + 15;
                                if (enemyAng >= 360) {
                                    enemyAng = enemyAng - 360;
                                }
                            }
                            monsterCountIdx = monsterCountIdx + 1;
                            continue;
                        } else {
                            this.EnemyList[monsterCountIdx].getComponent("EnemyComponent").roleKey = monsterCountIdx+"enemy"+monsterId;
                            this.EnemyList[monsterCountIdx].getComponent("EnemyComponent").monsterIdx = monsterCountIdx;
                            this.EnemyList[monsterCountIdx].getComponent("EnemyComponent").setAnimation( this.ResSpineList[Number(monsterData["moxing"])] );
                            monsterCountIdx = monsterCountIdx + 1;
                            continue;
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
        Engine.GameLogs.log( "敌人" + idx + "死亡" );
        if (this.getSurvivalEnemyCount() == 0) {
            this.checkPointData.monsterPackIdx = this.checkPointData.monsterPackIdx + 1;
            if (Number(this.checkPointData.monsterPackId[this.checkPointData.monsterPackIdx]) > 0) {
                obj.runAction( cc.sequence(
                    cc.fadeOut(2),
                    cc.callFunc((node) => {
                        node.destroy();
                        this.EnemyList.splice(idx,1);
                        this.nextMonsterLogic();
                    })
                ) );
                cc.director.getActionManager().pauseTarget( this.aiExcuteNode );
            } else {
                this.skillLayoutPtr.destroyAllChildren();
                obj.runAction( cc.sequence(
                    cc.fadeOut(2),
                    cc.callFunc((node) => {
                        node.destroy();
                        this.EnemyList.splice(idx,1);
                        Engine.GameLogs.log("关卡挑战成功");
                        Game.Data.Player.checkPoint = Game.Data.Player.checkPoint + 1;
                        Engine.GameUtils.loadPrefabFile( "prefab/window/WinView", (window) => {
                            this.node.getComponent("UiPoolComponent").pushUI( window )
                        });
                        this.PlayerList.forEach((player, idx) => {
                            if (player.getComponent("PlayerComponent").lifeState == true) {
                                player.getComponent("PlayerComponent").idle();
                                player.getComponent("CircleComponent").isExcute = false;
                            }
                        });
                        if (this.itemPoolObj) {
                            this.itemPoolObj.getComponent("ItemPoolComponent").aiStop();
                        }
                        this.itemPoolObj.getComponent("ItemPoolComponent").clearAllGrids();
                    })
                ) );
                cc.director.getActionManager().pauseTarget( this.aiExcuteNode );
            }
        } else {
            obj.runAction( cc.sequence(
                cc.fadeOut(2),
                cc.callFunc((node) => {
                    node.destroy();
                    this.EnemyList.splice(idx,1);
                })
            ) );
        }
    },

    playerDeath: function ( obj, idx ) {
        Engine.GameLogs.log("关卡失败");
        obj.runAction( cc.sequence(
            cc.callFunc((node) => {
                if (this.itemPoolObj) {
                    this.itemPoolObj.getComponent("ItemPoolComponent").aiStop();
                }
                this.EnemyList.forEach((enemy, idx) => {
                    if (enemy.getComponent("EnemyComponent").lifeState == true) {
                        enemy.getComponent("EnemyComponent").idle();
                        enemy.getComponent("CircleComponent").isExcute = false;
                        enemy.getComponent("EnemyComponent").aiPause();
                    }
                });
            }),
            cc.fadeOut(2),
            cc.callFunc((node) => {
                node.destroy();
                this.PlayerList.splice(idx,1)
                if (this.PlayerList.length == 0) {
                    Engine.GameUtils.loadPrefabFile( "prefab/window/FailedView", (window) => {
                        this.node.getComponent("UiPoolComponent").pushUI( window )
                    });
                }
            })
        ) );
    },

    skillBorn: function ( cmd ) {
        var skillIdx = cmd[0];
        var skillBornPos = cmd[1];
        if (skillIdx <= 0 ) {
            Engine.GameLogs.log( "技能不存在" );
            return
        }
        var self = this;
        var skillData = DB.getTableDataForKey( DB.SkillVo, skillIdx );
        Engine.GameLogs.log( "技能" + skillIdx + "发射" );
        var skillType = Number(skillData["jinengleixing"])
        var targetIdx = this.getSkillTarget( Number(skillData["mubia"]), Number(skillData["mubiaotype"]) );
        if (targetIdx == -1) {
            Engine.GameLogs.log("场内没有存活目标 : " + String(skillData["mubia"]) + "/" + String(skillData["mubiaotype"]) );
            return
        }

        if (skillType == 1) {
            Engine.GameLogs.log("普通攻击");
        } else if ( skillType == 2 ) {
            Engine.GameLogs.log("轨道技能");
            self.PlayerList[0].getComponent("RoleComponent").attack();
            self.parallelWorld.getComponent("ParallelWorldComponent").setTarget( self.EnemyList[targetIdx] );
            let skillobj = cc.instantiate( self.skillItemPrefab );
            skillobj.addComponent( "CircleComponent" );
            if ( skillobj.getComponent("CircleComponent") ) {
                skillobj.getComponent( "CircleComponent" ).excuteNode = skillobj;
                skillobj.getComponent( "CircleComponent" ).centerPos = cc.v2( 320, 680 );
                skillobj.getComponent( "CircleComponent" ).circleRadius = 265;
                // skillobj.getComponent( "CircleComponent" ).step = Number(skillData["speed"]);
                skillobj.getComponent( "CircleComponent" ).step = 5;
                skillobj.getComponent( "CircleComponent" ).angle = this.PlayerList[0].getComponent("CircleComponent").angle-18;
                skillobj.getComponent( "CircleComponent" ).isExcute = true;
            };
            if ( skillobj.getComponent("SkillItemComponent") ) {
                skillobj.getComponent("SkillItemComponent").initData( skillData );
                skillobj.getComponent("SkillItemComponent").setGroup( "arr_skill" );
                skillobj.getComponent("SkillItemComponent").itemNode.angle = 360-45;
                let resName = "item"+skillData["moxing"];
                skillobj.getComponent("SkillItemComponent").setSkillSpriteFrame( self.itemPoolObj.getComponent("ItemPoolComponent").itemAtlas.getSpriteFrame( resName ) );
                self.skillLayoutPtr.addChild( skillobj );
            };
            this.checkPointData.continuityChargeNum = Number(skillData["zengjia"]);
            this.checkContinuityEnergy();
        } else if ( skillType == 3 ) {
            Engine.GameLogs.log("合成技能");
            self.PlayerList[0].getComponent("RoleComponent").attack();
            self.parallelWorld.getComponent("ParallelWorldComponent").setTarget( self.EnemyList[targetIdx] );
            let skillobj = cc.instantiate( self.skillItemPrefab );
            skillobj.addComponent( "TrackComponent" );
            var trackData = {
                Target: self.parallelWorld,
                Speed: Number(skillData["speed"]),
            };
            skillobj.getComponent("TrackComponent").setData( trackData );
            skillobj.position = skillBornPos;
            if ( skillobj.getComponent("SkillItemComponent") ) {
                skillobj.getComponent("SkillItemComponent").initData( skillData );
                skillobj.getComponent("SkillItemComponent").setGroup( "arr_skill" );
                let resName = "wu"+skillData["moxing"];
                skillobj.getComponent("SkillItemComponent").setSkillSpriteFrame( self.itemPoolObj.getComponent("ItemPoolComponent").itemAtlas.getSpriteFrame( resName ) );
                self.skillLayoutPtr.addChild( skillobj );
            }
        } else if ( skillType == 4 ) {
            Engine.GameLogs.log("连击技能");
            let skillobj = cc.instantiate( self.skillItemPrefab );
            skillobj.position = skillBornPos;
            if ( skillobj.getComponent("SkillItemComponent") ) {
                skillobj.getComponent("SkillItemComponent").initData( skillData );
                skillobj.getComponent("SkillItemComponent").setGroup( "arr_skill" );
                self.skillLayoutPtr.addChild( skillobj );
            }
            skillobj.runAction( cc.sequence(
                cc.delayTime(2),
                cc.callFunc((node) => {
                    this.shakeLogic();
                    node.dispatchEvent( new cc.Event.EventCustom('EnemyGetDmg', true) );
                })
            ) );
            cc.loader.loadRes("animation/hedan_baozha", sp.SkeletonData, function (err, data) {
                if(!err){
                    var spine = new cc.Node;
                    spine.addComponent(sp.Skeleton);
                    spine.setPosition( skillBornPos );
                    self.skillLayoutPtr.addChild( spine );
                    spine.getComponent(sp.Skeleton).skeletonData = data;
                    spine.getComponent(sp.Skeleton).setAnimation( 0, "born", false );
                    spine.getComponent(sp.Skeleton).premultipliedAlpha = false;
                    spine.runAction( cc.sequence(
                        cc.delayTime(5),
                        cc.callFunc((node) => {
                            node.destroy();
                        })
                    ) );
                }
            }); 
        }
    },

    updateGridPool: function ( gridDatas ) {
        this.itemPoolObj.getComponent('ItemPoolComponent').initGrids( gridDatas )
    },

    getSurvivalEnemyCount: function () {
        var count = 0;
        this.EnemyList.forEach((enemy, idx) => {
            if (enemy.getComponent("EnemyComponent").lifeState == true) {
                count = count + 1;
            }
        });

        return count;
    },

    getSurvivalPlayerCount: function () {
        var count = 0;
        this.PlayerList.forEach((player, idx) => {
            if (player.getComponent("PlayerComponent").lifeState == true) {
                count = count + 1;
            }
        });

        return count;
    },

    getSkillTarget: function ( target, targetType ) {
        var targetIdx = -1;
        function getIdx( targetArr ) {
            if (targetType == 1) {
                targetArr.forEach((tar, idx) => {
                    if (tar.getComponent("RoleComponent").lifeState == true) {
                        targetIdx = idx;
                        return false;
                    }
                }); 
            } else if ( targetType == 2 ) {
                targetArr.forEach((tar, idx) => {
                    if (tar.getComponent("RoleComponent").lifeState == true) {
                        targetIdx = idx;
                    }
                }); 
            } else if ( targetType == 3 ) {
                var hp = 99999999;
                targetArr.forEach((tar, idx) => {
                    if (tar.getComponent("RoleComponent").lifeState == true) {
                        if (tar.getComponent(cc.Component).hp < hp) {
                            hp = tar.getComponent(cc.Component).hp;
                            targetIdx = idx;
                        }
                    }
                }); 
            }  else if ( targetType == 4 ) {
                targetIdx = 99;
            }  
        }
        if (target == 1) {
            getIdx( this.EnemyList );
        } else if( target == 2 ) {
            getIdx( this.PlayerList );
        }

        return targetIdx;
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
        this.node.on('GridCompose', function ( cmd ) {
            this.checkPointData.composeNum = this.checkPointData.composeNum + 1;
            var sourceSkillData = DB.getTableDataForKey( DB.SkillVo, cmd[2] );
            this.checkPointData.continuityChargeNum = Number(sourceSkillData["zengjia"]);
            this.checkContinuityEnergy();
            this.receiveskillborn( cmd );
            this.updateComposeEnergyBar();
            this.checkFireShow();
        }, this);
        this.node.on('NextLvCb', function ( event ) {
            event.stopPropagation();
            this.nextLvLogic();
        }, this);
        this.node.on('EnemyDeathCb', function ( event ) {
            event.stopPropagation();
            this.enemyDeathLogic();
        }, this);
        this.node.on('EnemyGetDmg', function ( event ) {
            Engine.GameLogs.log( "敌人受击" );
            event.stopPropagation();
            this.enemyGetDmg( event.target );
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
        this.node.on('GuanQiaRefresh', function ( event ) {
            event.stopPropagation();
            Engine.GameLogs.log( "第" + this.checkPointData.checkPointIdx + "关重新开始" );
            this.playerBorn();
            this.enemyBorn();
            this.itemPoolObj.getComponent("ItemPoolComponent").clearAllGrids();
        }, this);
    },

    enemyGetDmg: function ( dmgNode ) {
        var targetIdx = this.getSkillTarget( Number(dmgNode.getComponent("SkillItemComponent").target), Number(dmgNode.getComponent("SkillItemComponent").targetType) );
        if (targetIdx == -1) {
            Engine.GameLogs.log("enemyGetDmg--场内没有存活目标 : " + String(dmgNode.getComponent("SkillItemComponent").target) + "/" + String(dmgNode.getComponent("SkillItemComponent").targetType) );
            return
        }
        if (targetIdx == 99) {
            //所有目标
            this.EnemyList.forEach((enemy, idx) => {
                if ( enemy.getComponent("EnemyComponent").lifeState == true) {
                    var dmg = dmgNode.getComponent("SkillItemComponent").dmg;
                    enemy.getComponent("EnemyComponent").getHit( dmg );
                    return;
                }
            }); 
        } else {
            this.EnemyList.forEach((enemy, idx) => {
                if ( idx == targetIdx && enemy.getComponent("EnemyComponent").lifeState == true) {
                    var dmg = dmgNode.getComponent("SkillItemComponent").dmg;
                    enemy.getComponent("EnemyComponent").getHit( dmg );
                    return;
                }
            });
        }

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
        cc.sys.localStorage.setItem('userData', JSON.stringify( Game.Data.Player ));
        Engine.GameLogs.log( "准备下一关" );
        this.init();
    },
    //下一波怪物
    nextMonsterLogic: function () {
        this.enemyBorn( );
        this.btnGameBegin();
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
        if (this.itemPoolObj) {
            this.itemPoolObj.getComponent("ItemPoolComponent").paddingGridsPool();
        }
        cc.director.getActionManager().resumeTarget( this.aiExcuteNode );
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
        if (self.getSurvivalEnemyCount() == 0) {
            Engine.GameLogs.log( "无法发射,场上暂无敌人" );
            return;
        }
        if (touchType == 1) {
            let cmd = self.itemPoolObj.getComponent('ItemPoolComponent').consumeGrid();
            // let skillIdx = cmd[0];
            // let gridWorldPos = cmd[1];
            this.receiveskillborn( cmd );
            this.checkPointData.composeNum = 0;
            this.checkFireShow();
            this.updateComposeEnergyBar();
        } else if ( touchType == 3 ) {
        }else if ( touchType == 4 ) {
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

    receiveskillborn: function ( cmd ) {
        this.skillBorn( cmd );
    },

    updateComposeEnergyBar: function ( ) {
        var composeProgressBar = this.uiLayoutPtr.getChildByName( "composeProgressBar" );
        composeProgressBar.getComponent(cc.ProgressBar).progress = this.checkPointData.composeNum / this.checkPointData.composeMaxNum;
    },

    updateContinuityEnergyBar: function ( ) {
        var continuityHitProgressBar = this.uiLayoutPtr.getChildByName( "continuityHitProgressBar" );
        continuityHitProgressBar.getComponent(cc.ProgressBar).progress = this.checkPointData.continuityNum / this.checkPointData.continuityMaxNum;
    },

    checkFireShow: function ( ) {
        var btnFire = this.rootLayoutPtr.getChildByName("btnFire");
        if (this.checkPointData.composeNum >= this.checkPointData.composeMaxNum) {
            btnFire.opacity = 255;
            btnFire.getComponent(cc.Button).onEnable();
        } else {
            btnFire.opacity = 0;
            btnFire.getComponent(cc.Button).onDisable();
        }
    },

    checkContinuityEnergy: function ( ) {
        var self = this;
        self.checkPointData.continuityNum = self.checkPointData.continuityNum + self.checkPointData.continuityChargeNum;
        if (self.checkPointData.continuityNum >= self.checkPointData.continuityMaxNum) {
            Engine.GameLogs.log("发射连击技能！");
            self.checkPointData.continuityNum = 0;
            this.receiveskillborn( [self.checkPointData.continuitySkillId, cc.v2(320, 680)] );
        }
        self.updateContinuityEnergyBar();
    }
});