// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,
    properties: {
        btnClose: cc.Button,
        itemPrefab:{
            type:cc.Prefab,
            default:null,
        },
        jsListView:{
            type:cc.ScrollView,
            default:null,
        },
    },

    onLoad () {
        let self = this;
        this.onTouchsEvent(this.node);
        /* this.onEvent();
        this.itemAtlas = null;
        cc.loader.loadRes('Image/slot/symbol', cc.SpriteAtlas, function (err, atlas) {
            if(err){
                console.log( 'load res error' )
                return;
            }
            self.itemAtlas = atlas;
            self.bornItem();
            self.startY = self.jsListView.content.y
            self.startIdx = 0;
            self.updateItem(self.startIdx);
        });*/
    },

    onEvent() {
        // this.jsListView.node.on('scrolling', this.scrollingCb, this);
        // this.jsListView.node.on('scroll-ended', this.scrollEndCb, this);
    },

    scrollingCb() {
        this.loadItem();
    },

    scrollEndCb() {
        this.loadItem();
        this.jsListView.elastic = true; //加载结束后自动滚动回弹开启
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
            this.jsListView.content.addChild(item);
            this.itemSet.push(item);
        }
    },

    loadItem() {
        //向下加载数据
        //当开始位置比value_set的长度小则代表没加载完
        if(this.startIdx + this.ITEMPAGECOUNT * (this.INITPAGENUM-1) < this.valueSet.length &&
            this.jsListView.content.y >= this.startY + this.ITEMPAGECOUNT * (this.INITPAGENUM-1) * this.ITEMHIGHT)//content超过2个PAGE的高度
            {
                //_autoScrolling在引擎源码中负责处理scrollview的滚动动作
                if(this.jsListView._autoScrolling){ //等自动滚动结束后再加载防止滚动过快，直接跳到非常后的位置
                    this.jsListView.elastic = false; //关闭回弹效果 美观
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
                this.jsListView.content.y -= downLoaded * this.ITEMHIGHT;
                return;
            }
        //向上加载
        if(this.startIdx > 0 && this.jsListView.content.y<=this.startY)
        {
            if(this.jsListView._autoScrolling){ 
                this.jsListView.elastic = false;
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
            this.jsListView.content.y += upLoaded * this.ITEMHIGHT;
        }
    },

    updateItem( _startIdx ) {
        this.startIdx = _startIdx;
        for(var i=0;i<this.ITEMPAGECOUNT*this.INITPAGENUM;i++)
        {
            this.itemSet[i].setPosition( cc.v2(0, -this.ITEMHIGHT*0.5-this.startIdx*this.ITEMHIGHT) );
            this.itemSet[i].getChildByName('nameLb').getComponent(cc.Label).string = '憨憨' + this.valueSet[this.startIdx+i] + '号';
            this.itemSet[i].getChildByName('infoLb').getComponent(cc.Label).string = '这人是个憨憨' + this.valueSet[this.startIdx+i] + '号';
            if (this.itemSet[i].getChildByName('headnode')) {
                if (this.itemSet[i].getChildByName('headnode').getChildByName('Icon')) {
                    this.itemSet[i].getChildByName('headnode').getChildByName('Icon').getComponent(cc.Sprite).spriteFrame = this.itemAtlas.getSpriteFrame('s_'+(this.valueSet[this.startIdx+i]%8+1));
                }
            }
        }
    },

    btnCallBack: function (event, eventData) {

        if(eventData == "Close"){
            console.log( "Close" )
            this.node.destroy();
        }

    },

    start () {

    },

    onTouchsEvent: function (node) {

        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            // this.onTouchsStart(event);
            event.stopPropagation();
        }.bind(this), node);
        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            // this.onTouchsMove(event);
            event.stopPropagation();
        }.bind(this), node);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            // this.onTouchsEnd(event);
                event.stopPropagation();
        }.bind(this), node);
        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            // this.onTouchsCancel(event);
                event.stopPropagation();
        }.bind(this), node);

    },

    // update (dt) {
        
    // },
});
