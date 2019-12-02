
cc.Class({
    extends: cc.Component,

    properties: {
        ITEMHIGHT: 100,             //每个cell的高度
        INITPAGENUM: 2,             //初始化页数
        ITEMPAGECOUNT: 10,          //每页拥有的cell数
        ITEMMAXCOUNT: 100,         //cell总数
        itemPrefab:{
            type:cc.Prefab,
            default:null,
        },
    },

    ctor: function () {
    },

    onLoad: function  () {
        if ( this.enabled == true ) {
            this.listview = this.node.getComponent(cc.ScrollView);
            this.onEvent()
        } 
    },

    onDologic: function () {
        this.bornItem();
        this.startY = this.listview.content.y
        this.startIdx = 0;
        this.updateItem(this.startIdx);
    },

    onDestroy: function  () {

    },

    onUpdate: function (dt) {

    },

/**
 * 逻辑代码
 * @param onEvent 控件的响应事件
 * @param scrollingCb 控件的滚动中回调
 * @param scrollEndCb 控件的滚动终止回调
 * @param bornItem cell生成
 */
    onEvent() {
        this.listview.node.on('scrolling', this.scrollingCb, this);
        this.listview.node.on('scroll-ended', this.scrollEndCb, this);
    },

    scrollingCb() {
        this.loadItem();
    },

    scrollEndCb() {
        this.loadItem();
        this.listview.elastic = true; //加载结束后自动滚动回弹开启
    },

    bornItem() {
        this.valueSet = [];
        for(var i=0;i<this.ITEMMAXCOUNT;i++)
        {
            this.valueSet.push(i);
        }

        this.itemSet = [];
        for(var i=0;i<this.ITEMPAGECOUNT*this.INITPAGENUM;i++)
        {
            var item = cc.instantiate(this.itemPrefab);
            this.listview.content.addChild(item);
            this.itemSet.push(item);
        }
    },

    loadItem() {
        //向下加载数据
        //当开始位置比value_set的长度小则代表没加载完
        if(this.startIdx + this.ITEMPAGECOUNT * (this.INITPAGENUM-1) < this.valueSet.length &&
            this.listview.content.y >= this.startY + this.ITEMPAGECOUNT * (this.INITPAGENUM-1) * this.ITEMHIGHT)//content超过2个PAGE的高度
            {
                //_autoScrolling在引擎源码中负责处理scrollview的滚动动作
                if(this.listview._autoScrolling){ //等自动滚动结束后再加载防止滚动过快，直接跳到非常后的位置
                    this.listview.elastic = false; //关闭回弹效果 美观
                    return;
                }
                var downLoaded = this.ITEMPAGECOUNT; 
                this.startIdx += downLoaded;
                if(this.startIdx + this.ITEMPAGECOUNT * this.INITPAGENUM > this.valueSet.length)
                {
                    //超过数据范围的长度
                    var outLen = this.startIdx + this.ITEMPAGECOUNT * this.INITPAGENUM - this.valueSet.length;
                    downLoaded -= outLen;
                    this.startIdx -= outLen;
                    return;
                }
                this.updateItem(this.startIdx);
                this.listview.content.y -= downLoaded * this.ITEMHIGHT;
                return;
            }
        //向上加载
        if(this.startIdx > 0 && this.listview.content.y<=this.startY)
        {
            if(this.listview._autoScrolling){ 
                this.listview.elastic = false;
                return;
             }
            var upLoaded = this.ITEMPAGECOUNT;
            this.startIdx -= upLoaded;
            if(this.startIdx < 0){
                upLoaded += this.startIdx;
                this.startIdx = 0;
                return;
            }
            this.updateItem(this.startIdx);
            this.listview.content.y += upLoaded * this.ITEMHIGHT;
        }
    },

    updateItem( _startIdx ) {
        this.startIdx = _startIdx;
        for(var i=0;i<this.ITEMPAGECOUNT*this.INITPAGENUM;i++)
        {
            this.itemSet[i].setPosition( cc.v2(0, -this.ITEMHIGHT*0.5-this.startIdx*this.ITEMHIGHT) );
            this.CallerCmd.updateItemCb( this.CallerCmd.itemAtlas, this.itemSet[i], this.valueSet[this.startIdx+i] )
        }
    },

/**
 * 预制代码
 * @param onSetCmd 接受外部调用传参
 */
    onSetCmd( cmd ){
        let self = this
        self.CallerCmd = cmd
    }
});