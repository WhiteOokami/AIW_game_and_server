cc.Class({
    extends: cc.Component,

    properties: {
        playerId: null,
        room: null,
        crowns: 0,
        openid: null,
        serverIp: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.game.addPersistRootNode(this.node);
    },

    // update (dt) {},
});
