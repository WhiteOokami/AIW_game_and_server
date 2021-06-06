// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        id: "",
        type: "",
        spawned: false,
        potionPrefab: cc.Prefab,
        cakePrefab: cc.Prefab,
        cakeProb: 30,
        potoinProb: 30,
        opened: false,
    },

    animateFloating() {
        var jumpUp = cc.tween().by(1, { y:  20 }, { easing: 'sineOut' });
        var jumpDown = cc.tween().by(1, { y: -20 }, { easing: 'sineIn' });
        var tween = cc.tween().sequence(jumpUp, jumpDown);
        return cc.tween().repeatForever(tween);
    },

    // LIFE-CYCLE CALLBACKS:
    openChest(isPlayer) {
        if (!this.opened) {
            this.opened = true;
            if (isPlayer) {
                this.node.getComponent(cc.AudioSource).play(); // play sound
                let randNum = Math.floor(Math.random() * 100);
                let spawnType = "";
                if (randNum <= this.cakeProb) {

                    spawnType = "cake";

                }
                else if (randNum <= (this.cakeProb + this.potoinProb)) {

                    spawnType = "potion";
                }
                else {
                    //console.log("spawn bomb");
                    //spawnType = "potion";
                }
                this.spawned = true;
                if (spawnType != "")
                    cc.find("system").getComponent("client").sendItemState(this.id, "spawn", spawnType, [this.node.x + 50, this.node.y + 50]);
                cc.find("system").getComponent("client").sendItemState(this.id, "spawn", "chest", [this.node.x, this.node.y]);
                cc.find("system").getComponent("client").sendItemState(this.id, "used", "chest", null);
            }
        } 
    },
    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for(var i = 0; i< 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    onLoad() {
        if (this.id == null)
            this.id = this.makeid();
        this.node.name = this.type + this.id;
        if (this.type != "chest") {
            //start floating animation
            cc.tween(this.node).then(this.animateFloating()).start();
        }
        
    },

    start () {

    },

    // update (dt) {},
});
