module.exports = cc.Class({
    ctor: function () {
        this.checkPoint =   1;
        this.playerLv   =   1;
        this.itemList   =   [];
    },

    updateCheckPoiunt: function ( lv ) {
        this.checkPoint = lv;
    },

    updatePlayerLv: function ( lv ) {
        this.playerLv = lv;
    },

    updateItemlist: function ( gridDatas ) {
        gridDatas.forEach((griditemIdx, idx) => {
            this.updateItem( griditemIdx, idx );
        });
    },
    
    updateItem: function ( griditemIdx, idx ) {
        this.itemList[idx] = griditemIdx;
    },
  
});