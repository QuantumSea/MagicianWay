
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
 */

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

            if (this.gridPool["grid"+gridIndex].gridObJ == null) {
                let cloneItem = cc.instantiate( this.gridPrefab );
                cloneItem.setPosition( this.gridPool["grid"+gridIndex].gridPos );
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
                this.clearGrid( sourceIndex );
                this.updateGrid( targetIndex, this.gridPool["grid"+targetIndex].gridItemLvIdx );           
            } else {
                Engine.GameLogs.log( "无法继续合成了" );
                this.gridPool["grid"+sourceIndex].gridObJ.getComponent('GridComponent').backPoint();
            }
        } else {
            
            if (this.gridPool["grid"+targetIndex].gridState == 0) {
                Engine.GameLogs.log( "不可合成,替换空位" );
                this.updateGrid( targetIndex, this.gridPool["grid"+sourceIndex].gridItemIdx );
                this.clearGrid( sourceIndex );
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
        for (let idx = 0; idx < 10; idx++) {
            if (this.gridPool["grid"+idx].gridState == 1 && this.gridPool["grid"+idx].gridLockState == 0) {
                Engine.GameLogs.log("格子"+idx+"消耗");
                let skillIdx = this.gridPool["grid"+idx].gridItemIdx;
                this.clearGrid( idx )
                return skillIdx;
            };
        }

        return -1;
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
