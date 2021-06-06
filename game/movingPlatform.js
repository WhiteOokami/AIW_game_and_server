// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        movingPlayer: cc.Node,
        rb: cc.RigidBody,
        speed: 500000,
        startPos: 0,
        distance: 1000,
        direction: 1,
        players: cc.Node,
        spinning: false,
        sideToSide: false,
        dropping: false,
        spinSpeed: 1,
        playersOnMe: 0,
        maxPlayers: 1,
        falling: false,
        rising: false,
        upDown: false,
        moveUpTime: 3,
        startPos: cc.v2(),
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.rb = this.node.getComponent(cc.RigidBody);
        this.startPos = this.node.x;
        this.startPos = cc.v2(this.node.x, this.node.y);
    },

    start () {

    },
    shake() {
        this.falling = true;
        this.scheduleOnce(function () {
            this.falling = false;
        }, 0.1);
        this.scheduleOnce(function () {
            this.rising = true;
        }, 0.2)
        this.scheduleOnce(function () {
            this.rising = false;
        }, 0.3)
        //this.scheduleOnce(function () {
        //    this.falling = true;
        //}, 0.4);
        //this.scheduleOnce(function () {
        //    this.falling = false;
        //}, 0.5);
        //this.scheduleOnce(function () {
        //    this.rising = true;
        //}, 0.6)
        //this.scheduleOnce(function () {
        //    this.rising = false;
        //}, 0.7)


    },
    onBeginContact(contact, self, other) {
 
        if (other.node.group == "player") {
            if (this.dropping && !this.falling && !this.rising)
                this.shake();
            this.playersOnMe += 1;
            if (other.node.getComponent("movement").isPlayer) {
                this.movingPlayer = other.node;
                //this.movingPlayer.parent = this.node;
                //this.movingPlayer.setPosition(0, 0);
            }
        }

        if (other.node.group == "dangerous" && this.dropping) {
            this.node.x = this.startPos.x;
            this.node.y = this.startPos.y;
        }
        
    },
    onCollisionEnter: function (other, self) {

        if (other.node.group == "dangerous" && this.dropping) {
            this.node.x = this.startPos.x;
            this.node.y = this.startPos.y;
            this.falling = false;
            this.rising = false;
        }

    },
    onEndContact(contact, self, other) {
        let location = other.node.x - this.node.x;
        if (other.node.group == "player")
            this.playersOnMe -= 1;

        if (other.node == this.movingPlayer) {
   
            this.movingPlayer = null;
            //this.movingPlayer.parent = this.players;
        }
    },
    moveUpDown() {
        if (this.falling) {
            this.falling = false;
            this.rising = true;
        } else if (this.rising) {
            this.falling = true;
            this.rising = false;
        } else {
            this.falling = true;
        }
    },
    update(dt) {

        if (cc.find("system").getComponent("client").gameStarted) {
            if (this.sideToSide) {
                if (Math.abs(this.startPos - this.node.x) >= this.distance)
                    this.direction *= -1;
                //move object

                this.rb.linearVelocity = cc.v2(this.speed * dt * this.direction, 0);
            }
            else if (this.spinning) {
                this.node.angle += dt * this.spinSpeed;
            }
            else if (this.dropping) {
                if (this.playersOnMe > this.maxPlayers) {
                    this.falling = true;
                }
            }

            if (this.falling) {
                this.node.y -= this.speed * dt;
            }

            if (this.rising) {
                this.node.y += this.speed * dt;
            }

            if (this.upDown) {
                this.schedule(this.moveUpDown, this.moveUpTime);
                this.upDown = false;
            }
        }
       
        //stand on moving platform
        //if (this.movingPlayer != null) {
        //    let lv = this.movingPlayer.getComponent(cc.RigidBody).linearVelocity;
        //    this.movingPlayer.getComponent(cc.RigidBody).applyForceToCenter(cc.v2(this.speed * dt * this.direction, 0));
        //    console.log(lv.x);
        //}
            
    },
});
