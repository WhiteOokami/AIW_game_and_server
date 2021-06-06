cc.Class({
    extends: cc.Component,

    properties: {
        canJumpOn: [cc.String],
        canJump: false,
    },
    // LIFE-CYCLE CALLBACKS:

    //onLoad() { },
    onCollisionEnter: function (other, self) {
        for (var i in this.canJumpOn) {
            if (other.node.group == this.canJumpOn[i]) {
                this.canJump = true;
            }
        }
        
    },
    onCollisionExit: function (other, self) {
        this.canJump = false;
    },
    start () {

    },

    // update (dt) {},
});
