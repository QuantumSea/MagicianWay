
var AIACTTAG = 1000

cc.Class({
    extends: Engine.GameBaseWindow,

    properties: {
        gridPrefab:{
            type:cc.Prefab,
            default:null,
            tooltip: "技能预制",
        },
    },
    
    ctor: function () {
        this.gridPool = [];
    },

    onLoad: function  () {
        this.aiExcuteNode = new cc.Node;
        this.node.addChild( this.aiExcuteNode );
        this.itemAtlas = null;
        this.eventRegister();
        for (let index = 0; index < 15; index++) {
            /**
             * 参数设置
             * @param gridState 0 代表空格 1 代表格子有道具
             * @param gridState 0 代表格子被锁定,不会被刷新 1 代表格子未锁定
             */
            let lockState = 0;
            var self = this;
            if (index > 9 && index < 15) {
                lockState = 1;
            }
            let gridData = {
                gridIdx: index,
                gridState: 0, 
                gridItemIdx: 0,         //技能ID
                gridItemLvIdx: 0,       //可合成的技能ID
                gridItemSkillId: 0,     //合成时释放的技能ID
                gridItemLv: 0,
                gridLockState: lockState,
                gridPos: cc.v2( cc.v2( 60 + (index%5) * 90, 235 - Math.floor(index/5) * 90 ) ),
                gridObJ: null,
                parentNode: this.node,
            }
            this.gridPool["grid"+index] = gridData;
        }

        this.init();
    },

    init: function () {
        
    },

/**
 * 逻辑代码
 * @param initGrids 初始化格子
 * @param updateGrid 更新格子
 * @param checkGridCompose 检测格子合成
 * @param clearGrid 清空一个格子
 * @param queryEmptyGridsNum 查询空的格子
 * @param paddingGridsPool 填充格子
 * @param checkAutomaticCarry 检测是否可以自动进位  
 * @param gridAutomaticCarry 格子自动进位  
 */

    aiPause: function() {
        cc.director.getActionManager().pauseTarget( this.aiExcuteNode );
    },

    aiResume: function() {
        cc.director.getActionManager().resumeTarget( this.aiExcuteNode );
    },

    aiStop: function() {
        this.aiExcuteNode.stopAllActions();
    },

    paddingGridsPool: function( ) {
        if ( this.aiExcuteNode.getActionByTag( AIACTTAG ) ) {
            Engine.GameLogs.log("格子派发中...");
            return;
        }
        var guanqiaData = DB.getTableDataForKey( DB.GuanQiaVo, Game.Data.Player.checkPoint );
        var guanqiaSkillPackId = guanqiaData["skillpackid"];
        var skillPackData = DB.getTableDataForKey( DB.SkillPackVo, guanqiaSkillPackId );

        var delay = cc.delayTime( 3 );
        var excuteCb = cc.callFunc((node) => {
            var guanqiaNub = guanqiaData["nub" + Engine.GameUtils.getRandomNum( 1, 2 )];
            let emptyGrids = this.queryEmptyGridsNum();
            if (emptyGrids.length <= 0) {
                // Engine.GameLogs.log("暂无空格子");
                return;
            }
            let gridDatas = [];
            let skillList = [];
            for (let index = 0; index < 15; index++) {
                let skillId = skillPackData["skill"+(index+1)];
                let skillWeight = skillPackData["jilv"+(index+1)];
                skillList.push( { id:skillId, weight:skillWeight } );
            }
            let updateNum = emptyGrids.length>guanqiaNub?guanqiaNub:emptyGrids.length;
            for (let index = 0; index < updateNum; index++) {
                let randomSkillId = Engine.GameUtils.getWeightRandomNum(0, skillList);
                let emptyGridIdx = emptyGrids[index];
                gridDatas[emptyGridIdx] = randomSkillId;
            }
            Engine.GameLogs.log("开始刷格子啦" + String( gridDatas ));
            this.initGrids( gridDatas );
        });
        var seq = cc.sequence( excuteCb, delay );
        seq.setTag( AIACTTAG )
        this.aiExcuteNode.runAction( cc.repeatForever( seq ) );
    },

    clearGrid: function( gridIndex ) {
        if (this.gridPool["grid"+gridIndex]) {
            this.gridPool["grid"+gridIndex].gridState = 0;
            this.gridPool["grid"+gridIndex].gridItemIdx = 0;
            if (this.gridPool["grid"+gridIndex].gridObJ != null ) {
                this.gridPool["grid"+gridIndex].gridObJ.getComponent('GridComponent').onDes();
                this.gridPool["grid"+gridIndex].gridObJ = null;
            }
            Game.Data.Player.updateItem( this.gridPool["grid"+gridIndex].gridItemIdx, gridIndex );
            cc.sys.localStorage.setItem('userData', JSON.stringify( Game.Data.Player ));
        }
    },

    clearAllGrids: function() {
        for (var key in this.gridPool) {
            const element = this.gridPool[key];
            this.clearGrid( element.gridIdx );
        }
    },

    updateGrid: function( gridIndex, gridItemIdx ) {
        if (this.gridPool["grid"+gridIndex]) {
            if (gridItemIdx == 0) {
                this.clearGrid( gridIndex );
                return;
            }
            this.gridPool["grid"+gridIndex].gridState = 1;
            this.gridPool["grid"+gridIndex].gridItemIdx = gridItemIdx;
            let skillData = DB.getTableDataForKey( DB.SkillVo, gridItemIdx );
            let itemId = skillData["ITEMID"];
            let itemLvIdx = skillData["hecheng"];
            let resName = "item"+skillData["moxing"];
            let colorResName = "wj_pz"+skillData["pinzhi"];

            this.gridPool["grid"+gridIndex].gridItemLvIdx = itemLvIdx;
            this.gridPool["grid"+gridIndex].gridItemSkillId = skillData["hechengshifang"];
            this.gridPool["grid"+gridIndex].gridItemLv = skillData["LV"];

            if (this.gridPool["grid"+gridIndex].gridObJ == null) {
                let cloneItem = cc.instantiate( this.gridPrefab );
                cloneItem.setPosition( this.gridPool["grid"+gridIndex].gridPos );
                cloneItem.runAction(cc.sequence(cc.scaleTo(0.1,1.2,1.2),cc.scaleTo(0.1,1.0,1.0)))
                this.node.addChild( cloneItem );
                this.gridPool["grid"+gridIndex].gridObJ = cloneItem; 
            };
            this.gridPool["grid"+gridIndex].gridObJ.getComponent('GridComponent').setCmd( this.gridPool["grid"+gridIndex] )
            this.gridPool["grid"+gridIndex].gridObJ.getChildByName('itemIdLb').getComponent(cc.Label).string = skillData["LV"];
            if (this.gridPool["grid"+gridIndex].gridObJ.getComponent('GridComponent')) {
                this.gridPool["grid"+gridIndex].gridObJ.getComponent('GridComponent').setSpriteFrame( this.itemAtlas.getSpriteFrame( resName ) );
            }
            if (this.gridPool["grid"+gridIndex].gridObJ.getComponent('GridComponent')) {
                this.gridPool["grid"+gridIndex].gridObJ.getComponent('GridComponent').setQualityFrame( this.itemAtlas.getSpriteFrame( colorResName ) );
            }
            Game.Data.Player.updateItem( this.gridPool["grid"+gridIndex].gridItemIdx, gridIndex );
            cc.sys.localStorage.setItem('userData', JSON.stringify( Game.Data.Player ));
        }
    },  

    initGrids: function ( gridDatas ) {
        let self = this;

        if (this.itemAtlas != null) {
            gridDatas.forEach((itemId, idx) => {
                if (this.gridPool["grid"+idx].gridState == 1 && this.gridPool["grid"+idx].gridItemIdx == itemId) {
                    Engine.GameLogs.log("格子"+idx+"无变化");
                    return true;
                };
                if (this.gridPool["grid"+idx].gridState == 0) {
                    this.updateGrid( idx, itemId )
                }
            });
        } else {
            cc.loader.loadRes('Image/item/skillItem', cc.SpriteAtlas, function (err, atlas) {
                if(err){
                    console.log( 'load res error' )
                    return;
                }
                self.itemAtlas = atlas;
                gridDatas.forEach((itemId, idx) => {
                    if (self.gridPool["grid"+idx].gridState == 1 && self.gridPool["grid"+idx].gridItemIdx == itemId) {
                        Engine.GameLogs.log("格子"+idx+"无变化");
                        return true;
                    };
                    if (self.gridPool["grid"+idx].gridState == 0) {
                        self.updateGrid( idx, itemId )
                    }
                });
            });
        }

    },

    checkGridCompose: function( sourceIndex, targetIndex ) {
        Engine.GameLogs.log( sourceIndex + "=>" + targetIndex );
        //检测能否合成
        if (this.gridPool["grid"+sourceIndex] == null) {
            Engine.GameLogs.log( "源grid出错 gridIndex = " + sourceIndex );
            return;
        }
        if (this.gridPool["grid"+targetIndex] == null) {
            Engine.GameLogs.log( "目标grid出错 gridIndex = " + targetIndex );
            this.gridPool["grid"+sourceIndex].gridObJ.getComponent('GridComponent').backPoint();
            return;
        }
        if (sourceIndex == targetIndex) {
            Engine.GameLogs.log( "位置没有发生变化 gridIndex = " + targetIndex );
            this.gridPool["grid"+sourceIndex].gridObJ.getComponent('GridComponent').backPoint();
            return;
        }
        if (this.gridPool["grid"+sourceIndex].gridItemIdx == this.gridPool["grid"+targetIndex].gridItemIdx) {
            if (this.gridPool["grid"+targetIndex].gridItemLvIdx > 0) {
                Engine.GameLogs.log( "可合成 ItemId = " + this.gridPool["grid"+targetIndex].gridItemIdx );
                var hechengSkillId = this.gridPool["grid"+targetIndex].gridItemSkillId;
                var sourceSkillId = this.gridPool["grid"+sourceIndex].gridItemIdx
                this.clearGrid( sourceIndex );
                this.updateGrid( targetIndex, this.gridPool["grid"+targetIndex].gridItemLvIdx );
                var cmd = [hechengSkillId, this.gridPool["grid"+targetIndex].gridObJ.convertToWorldSpaceAR(cc.v2(0, 0)), sourceSkillId];
                this.checkAutomaticCarry();
                Game.SceneBaseRoot.emit('GridCompose', cmd);
            } else {
                Engine.GameLogs.log( "无法继续合成了" );
                this.gridPool["grid"+sourceIndex].gridObJ.getComponent('GridComponent').backPoint();
            }
        } else {
            
            if (this.gridPool["grid"+targetIndex].gridState == 0) {

                if (this.gridPool["grid"+sourceIndex].gridLockState == 0) {
                    if (this.gridPool["grid"+targetIndex].gridLockState == 0) {
                        Engine.GameLogs.log( "不可合成,返回原位" );
                        this.gridPool["grid"+sourceIndex].gridObJ.getComponent('GridComponent').backPoint();
                    } else {
                        Engine.GameLogs.log( "目标位为锁定位，替换空位" );
                        this.updateGrid( targetIndex, this.gridPool["grid"+sourceIndex].gridItemIdx );
                        this.clearGrid( sourceIndex );
                    }
                } else {
                    Engine.GameLogs.log( "移动位为锁定位,可以替换空位：" + this.queryLastEmptyGridsNum() );
                    this.updateGrid( this.queryLastEmptyGridsNum()==-1?0:this.queryLastEmptyGridsNum(), this.gridPool["grid"+sourceIndex].gridItemIdx );
                    this.clearGrid( sourceIndex ); 
                }
            } else {
                Engine.GameLogs.log( "不可合成,互换位置" );
                let tarGirdItemIdx = this.gridPool["grid"+targetIndex].gridItemIdx;
                this.updateGrid( targetIndex, this.gridPool["grid"+sourceIndex].gridItemIdx );
                this.clearGrid( sourceIndex );
                this.updateGrid( sourceIndex, tarGirdItemIdx );
            }
            
        } 

    },



    consumeGrid: function ( ) {
        var cmd = [];
        cmd[0] = -1;
        cmd[1] = cc.v2(0,0);
        for (let idx = 0; idx < 10; idx++) {
            if (this.gridPool["grid"+idx].gridState == 1 && this.gridPool["grid"+idx].gridLockState == 0) {
                Engine.GameLogs.log("格子"+idx+"消耗");
                cmd[0] = this.gridPool["grid"+idx].gridItemIdx;
                cmd[1] = this.gridPool["grid"+idx].gridObJ.convertToWorldSpaceAR(cc.v2(0, 0));
                this.clearGrid( idx );
                this.checkAutomaticCarry();
                return cmd;
            };
        }

        return cmd;
    },

    queryEmptyGridsNum: function () {
        var emptyGridList = [];
        for (let idx = 0; idx < 15; idx++) {
            if (this.gridPool["grid"+idx].gridState == 0) {
                emptyGridList.push(idx);
            };
        }

        return emptyGridList;
    },

    queryLastEmptyGridsNum: function () {
        var lastEmptyIdx = -1;
        for (let idx = 9; idx >= 0; idx--) {
            if (this.gridPool["grid"+idx].gridState == 1) {
                lastEmptyIdx = idx + 1;
                if (lastEmptyIdx > 9) {
                    lastEmptyIdx = 9;
                }
                break;
            };
        }
        return lastEmptyIdx
    },

    checkAutomaticCarry: function () {
        var autoCarryGridBeginIdx = -1;
        var autoCarryGridEndIdx = this.queryLastEmptyGridsNum();
        if (autoCarryGridEndIdx==-1) {
            Engine.GameLogs.log("没有发现技能");
            return;
        }
        for (var key in this.gridPool) {
            if (this.gridPool[key].gridLockState == 0) {
                if (this.gridPool[key].gridState == 0) {
                    const element = this.gridPool[key];
                    let emptyGridIdx = element.gridIdx;
                    autoCarryGridBeginIdx = emptyGridIdx + 1;
                    autoCarryGridBeginIdx = autoCarryGridBeginIdx > 9?9:autoCarryGridBeginIdx;
                    break;
                }
            }
        }

        if (autoCarryGridBeginIdx>0) {
            Engine.GameLogs.log("从格子" + autoCarryGridBeginIdx + "开始进位至" + autoCarryGridEndIdx);
            this.gridAutomaticCarry( autoCarryGridBeginIdx, autoCarryGridEndIdx );   
        }
    },

    gridAutomaticCarry: function ( beginGridIdx, endGirdIdx ) {
        for (let index = beginGridIdx; index <= endGirdIdx; index++) {
            let newGridIdx = index - 1;
            if (index == endGirdIdx) {
                this.updateGrid( newGridIdx, this.gridPool["grid"+index].gridItemIdx );
                this.clearGrid( endGirdIdx );
            } else {
                this.updateGrid( newGridIdx, this.gridPool["grid"+index].gridItemIdx );
            }
        }
    },


    /**
     * 事件代码
     * @param eventRegister 事件注册
     * @param eventListen 事件监听
     */

    eventRegister: function () {
        this.node.on('checkComponseCb', function ( sourceIndex, targetIndex ) {
            this.checkGridCompose( sourceIndex, targetIndex );
        }, this);
    },
});
