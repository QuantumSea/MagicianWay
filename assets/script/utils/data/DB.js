
var guanqia = require("guanka");
var item = require("item");
var monster = require("monster");
var zhujue = require("zhujue");
var monsterPack = require("monpack");
var playerPack = require("zhujuepack");
var skillPack = require("skillpack");
var skill = require("skill");
var ai = require("ai");

window.DB =  {
    ItemVo: item,
    GuanQiaVo: guanqia,
    MonsterVo: monster,
    PlayerVo: zhujue, 
    MonPackVo: monsterPack,
    PlayerPackVo: playerPack,
    SkillPackVo: skillPack,
    SkillVo: skill,
    AiVo: ai,

     /*
     * 获取对象属性名称列表
     *   @param bable 表对象
     *   @return {Array}
     * */
    getTableNames: function (table) {
        if(!table)
            Engine.Log.error("没有查找到本"+key+"数据！");
        var names = Object.getOwnPropertyNames(table);
        return names;
    },
    /**
     * 获取表的 key 列表
     * */
    getTableKeys: function (table) {
        let names = this.getTableNames(table);
        let keys = [];
        if(names){
            for(let i = 0; i < names.length; i++)
            {
                let name = names[i];
                name = name.split("_");
                keys.push(name[1]);
            }
        }
        return keys;
    },
    //获取table数据
    getTableDataForKey: function (table, key) {
        let _key = "id_"+key;
        return table[_key];
    },
    //获取slot数据
    getSlotTypeData: function (type) {
        let key = "slot"+type;
        return DB[key];
    },
    //获取table 字段数据
    getValueToNumber: function (table, key) {
        let value = table[key];

        // Engine.Log.log("table[key]==" + value + table.Column);
        return parseInt(value);
    },
    getValueToFloat: function (table, key) {
        return parseFloat(table[key]);
    },

};