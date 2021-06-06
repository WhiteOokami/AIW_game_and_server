cc.Class({
    extends: cc.Component,
    
    properties: {
        jumpHeight: 0,
        smallJumpHeight: 0,
        jumpDuration: 0,
        moveSpeed: 0,
        smallMoveSpeed: 0,
        isPlayer: false,
        clientScript: cc.Node,
        xSpeed: 0,
        ySpeed: 0,
        localCenter: 0,
        grounder: cc.Node,
        body: cc.Node,
        animation: cc.Animation,
        deltaTime: 0,
        fallMultiplier: 2.5,
        growing: 0,
        maxScale: 1,
        minScale: 0.5,
        ateCake: false,
        atePotion: false,
        grounded: false,
        movingRight: false,
        movingLeft: false,
        joystickMax: 69,
        joystickVector: cc.v2(),
        joystickBall: cc.Node,
        emojis: cc.Node,
        timeStep: 0,
        startTimer: false,
        playingAnimation: true,
        joystickMoving: false,
        playedFalling: false,
        soundController: cc.Node,
        sounds: null,
        busy: false,

        total: 0,
        sum: 0,
    },

    disable() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            let joystick = cc.find("Canvas/UI/MOBILE/JOYSTICK");
            let jumpButton = cc.find("Canvas/UI/MOBILE/JUMP");
            let potionButton = cc.find("Canvas/UI/MOBILE/POTION");
            let cakeButton = cc.find("Canvas/UI/MOBILE/CAKE");
            joystick.off(cc.Node.EventType.TOUCH_START, this.joystickStart, this);
            joystick.off(cc.Node.EventType.TOUCH_MOVE, this.joystickMove, this);
            joystick.off(cc.Node.EventType.TOUCH_END, this.joystickEnd, this);
            joystick.off(cc.Node.EventType.TOUCH_CANCEL, this.joystickEnd, this);
            jumpButton.off(cc.Node.EventType.TOUCH_START, this.jump, this);
            potionButton.off(cc.Node.EventType.TOUCH_START, this.shrink, this);
            cakeButton.off(cc.Node.EventType.TOUCH_START, this.grow, this);
        } else {
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        }
        
        this.node.getComponent(cc.RigidBody).gravityScale = 0;
        this.node.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(0, 0);
        
    },
    playEmoji(type) {
        let emoji = this.emojis.getChildByName(type);
        //no spam error
        if (! emoji.active) {
            emoji.active = true;
            cc.tween(emoji).to(0.5, { position: cc.v2(this.node.x + Math.ceil(Math.random() * 1000) * (Math.round(Math.random()) ? 1 : -1), this.node.y + 2000) }, { easing: 'sineOutIn' }).start();
            cc.tween(emoji).delay(1).to(0, { position: cc.v2(this.node.getChildByName("body").getChildByName("head").x, this.node.getChildByName("body").getChildByName("head").y) }).call(() => { emoji.active = false }).start();
        }
        
        //this.schedule(function () { emoji.active = false }, 2);
    },
    onBeginContact(contact, self, other) {

        if (self.tag == 2 && (other.node.group == "environment" || other.node.group == "movingPlatform")){

            this.grounded = true;
            //stop falling animation
            //this.animation.stop("falling");
            //this.playedFalling = false;

            //play  animations
            if (this.moving) {
                this.animation.play("walk");
            } else {
                this.animation.play("land");
                if (this.isPlayer)
                    this.sounds["landing"].play();

                this.scheduleOnce(function () {
                    this.playingAnimation = false;
                }, 0.3);
                
            }

            //change speed if different size
            if (this.node.scaleY < this.maxScale) {
                if (this.movingRight)
                    this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.smallMoveSpeed * this.deltaTime, this.ySpeed);
                else if (this.movingLeft)
                    this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(-this.smallMoveSpeed * this.deltaTime, this.ySpeed);
            } else {
                if (this.movingRight)
                    this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.moveSpeed * this.deltaTime, this.ySpeed);
                else if (this.movingLeft)
                    this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(-this.moveSpeed * this.deltaTime, this.ySpeed);
            }

            
        }
            
    },

    onEndContact(contact, self, other) {
        if (self.tag == 2)
            this.grounded = false;
    },
    jumpRunAction() {
        var jumpUp = cc.tween().by(1, { y: 300 }, { easing: 'sineOut' });
        var jumpDown = cc.tween().by(1, { y: -300 }, { easing: 'sineIn' });
        cc.tween(this.node).sequence(jumpUp, jumpDown).start();
    },

    moveRight() {
   
        this.movingLeft = false;
        this.body.scaleX = -1;
        if (!this.moving && this.grounded) {
            let animState = this.animation.play("walk");
            animState.wrapMode = cc.WrapMode.Loop;
            this.moving = true;
        }
        this.movingRight = true;
        if (this.isPlayer) {
            this.busy = false;
            if (this.node.scaleY < this.maxScale)
                this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.smallMoveSpeed * this.deltaTime, this.getComponent(cc.RigidBody).linearVelocity.y);
            else
                this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.moveSpeed * this.deltaTime, this.getComponent(cc.RigidBody).linearVelocity.y);
            
            this.clientScript.getComponent("client").sendPlayerState("right");
        }
    },
    moveLeft() {
   
        this.movingRight = false;
        this.body.scaleX = 1;
        if (!this.moving && this.grounded) {
            let animState = this.animation.play("walk");
            animState.wrapMode = cc.WrapMode.Loop;
            this.moving = true;
        }

       
        this.movingLeft = true;
        if (this.isPlayer) {
            if (this.node.scaleY < this.maxScale)
                this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(-this.smallMoveSpeed * this.deltaTime, this.getComponent(cc.RigidBody).linearVelocity.y);
            else
                this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(-this.moveSpeed * this.deltaTime, this.getComponent(cc.RigidBody).linearVelocity.y);
            this.busy = false;
            
            this.clientScript.getComponent("client").sendPlayerState("left");
        }

    },
    jump() {
        if (this.isPlayer) {
            if (this.grounded) {
                this.sounds["jump"].play();
                this.animation.play("jump");
                this.grounded = false;
                
                this.scheduleOnce(function () {
                    //different jump heights depending on size
                    if (this.node.scaleY >= this.maxScale)
                        this.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.getComponent(cc.RigidBody).linearVelocity.x, this.jumpHeight * this.deltaTime);
                    else
                        this.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.getComponent(cc.RigidBody).linearVelocity.x, this.smallJumpHeight * this.deltaTime);
                    this.startTimer = true;


                    this.clientScript.getComponent("client").sendPlayerState("jump");
                }, 0.1);
            } 
        }
        else {
            this.animation.stop("walk");
            this.animation.play("jump");    
            this.grounded = false;
        }
        

    },
    stopX() {
        this.animation.stop("walk");
        this.busy = false;
        if (this.moving)
            this.playingAnimation = false;
        this.movingLeft = false;
        this.movingRight = false;
        this.moving = false;
        if (this.isPlayer) {
            //cc.find("Canvas/mainCamera").getComponent("cameraFollow").xOffsetPlayer = 0;
            this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(0, this.ySpeed);
            this.clientScript.getComponent("client").sendPlayerState("stopX");
            
        }  

    },
    stopY() {

        if (this.isPlayer) {
            this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.xSpeed, 0);
            this.clientScript.getComponent("client").sendPlayerState("stopY");
        }

    },

    shrink() {
        if (this.isPlayer && this.atePotion) {
            this.sounds["drinking2"].play();
            this.growing = -1;
        }
    },

    grow() {
        if (this.isPlayer && this.ateCake) {
            this.sounds["eating"].play();
            this.growing = 1;
        }
    },
    // LIFE-CYCLE CALLBACKS:
    onKeyDown(event) {

        switch (event.keyCode) {
            case cc.macro.KEY.w:
                if (this.grounded)
                    this.jump();
                break;
            case cc.macro.KEY.a:
                this.moveLeft();
                break;
            case cc.macro.KEY.d:
                this.moveRight();
                break;
            case cc.macro.KEY.e:
                this.grow();
                break;
            case cc.macro.KEY.q:
                this.shrink();
                break;
            case cc.macro.KEY.space:
                if (this.grounded)
                    this.jump();
                break;
        }

    },


    onKeyUp(event) {

        if (event.keyCode == cc.macro.KEY.w) {
            //this.stopY();
            //this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.xSpeed, - 100);
        }

        if (event.keyCode == cc.macro.KEY.a) {
            //this.stopX();
            this.movingLeft = false;
        }

        if (event.keyCode == cc.macro.KEY.d) {
            //this.stopX();
            this.movingRight = false;
        }
    },

    onLoad: function () {
        this.body = this.node.getChildByName("body");
        this.clientScript = cc.find("system");

        this.sounds = new Map();
        //map sounds to their audioSource
        for (var i = 0; i < this.soundController.getComponents(cc.AudioSource).length; i++) {
            this.sounds[this.soundController.getComponents(cc.AudioSource)[i].clip.name] = this.soundController.getComponents(cc.AudioSource)[i];
        }
    },

    onDestroy() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        }
        else {
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        }
        
    },

    joystickStart(event) {
        let touchPos = event.getLocation();
        let out = cc.v2();
        //use camera to get touch pos
        cc.find("Canvas/mainCamera").getComponent(cc.Camera).getScreenToWorldPoint(touchPos, out);
        let localTouchPos = this.joystickBall.parent.convertToNodeSpaceAR(out);

        //limit ball so it can't leave circle
        this.limitJoystick(localTouchPos);

        //change pos of ball accordingly
        this.setJoystickBallPos(localTouchPos); 
        this.joystickVector = localTouchPos;

        this.joystickMovePlayer();
    },

    joystickMove(event) {
        let touch = event.getTouches()[0];
        let touchPos = event.getLocation();
        let out = cc.v2();
        //use camera to get touch pos
        cc.find("Canvas/mainCamera").getComponent(cc.Camera).getScreenToWorldPoint(touchPos, out);
        let localTouchPos = this.joystickBall.parent.convertToNodeSpaceAR(out);

        //limit ball so it can't leave circle
        this.limitJoystick(localTouchPos);

        //change pos of ball accordingly
        this.setJoystickBallPos(localTouchPos);
        this.joystickVector = localTouchPos;

        this.joystickMovePlayer();
    },

    joystickMovePlayer() {
        //move player horizontally
        if (this.joystickVector.x > 0)
            this.moveRight();
        else if (this.joystickVector.x < 0)
            this.moveLeft();
        

        this.joystickMoving = true;
        //move player vertically
        //if (this.joystickVector.y > 10)
        //    this.jump()
    },
    joystickEnd() {
        //stop player
        if (this.joystickMoving) {
            this.movingLeft = false;
            this.movingRight = false;
            this.joystickMoving = false;
        }
        

        this.joystickVector = cc.Vec2.ZERO;
        this.setJoystickBallPos(cc.Vec2.ZERO);
    },

    setJoystickBallPos(pos) {
        this.joystickBall.setPosition(pos);
    },

    limitJoystick(joystickVec) {
        let inputMag = joystickVec.mag();
        if (inputMag > this.joystickMax) {
            joystickVec.mulSelf(this.joystickMax / inputMag);
        }
    },
    update: function (dt) {
 
        this.xSpeed = this.getComponent(cc.RigidBody).linearVelocity.x;
        this.ySpeed = this.getComponent(cc.RigidBody).linearVelocity.y;
        this.localCenter = this.getComponent(cc.RigidBody).getLocalCenter();
        this.sum += dt;
        this.total += 1;

        if (!this.moving && this.grounded && !this.playingAnimation) {
            this.animation.play("stand");
            this.playingAnimation = true;
        }
        
        //if (dt < 0.02 && dt > 0.01)
        //this.deltaTime = dt;
        
        //console.log(dt);

        if (this.clientScript.getComponent("client").gameStarted) {

            if (this.clientScript.getComponent("client").playerId == 0) {
                //do nothing
            } else {

                

                if (this.deltaTime == 0)
                    this.deltaTime = dt;
                else if (Math.abs(dt - (this.sum / this.total)) < 0.03)
                    this.deltaTime = dt;

                if (this.clientScript.getComponent("client").playerId == this.node.name && !this.isPlayer) {
                    this.isPlayer = true;
                    let rb = this.getComponent(cc.RigidBody);

                    if (cc.sys.platform == cc.sys.WECHAT_GAME) {

                        //set mobile touch control listeners
                        cc.find("Canvas/UI/MOBILE").active = true;
                        this.joystickBall = cc.find("Canvas/UI/MOBILE/JOYSTICK/BALL");
                        let joystick = cc.find("Canvas/UI/MOBILE/JOYSTICK");
                        let jumpButton = cc.find("Canvas/UI/MOBILE/JUMP");
                        let potionButton = cc.find("Canvas/UI/MOBILE/POTION");
                        let cakeButton = cc.find("Canvas/UI/MOBILE/CAKE");
                        joystick.on(cc.Node.EventType.TOUCH_START, this.joystickStart, this);
                        joystick.on(cc.Node.EventType.TOUCH_MOVE, this.joystickMove, this);
                        joystick.on(cc.Node.EventType.TOUCH_END, this.joystickEnd, this);
                        joystick.on(cc.Node.EventType.TOUCH_CANCEL, this.joystickEnd, this);
                        jumpButton.on(cc.Node.EventType.TOUCH_START, this.jump, this);
                        potionButton.on(cc.Node.EventType.TOUCH_START, this.shrink, this);
                        cakeButton.on(cc.Node.EventType.TOUCH_START, this.grow, this);

                    } else {
                        this.joystickBall = cc.find("Canvas/UI/MOBILE/JOYSTICK/BALL");
                        let joystick = cc.find("Canvas/UI/MOBILE/JOYSTICK");
                        let jumpButton = cc.find("Canvas/UI/MOBILE/JUMP");
                        let potionButton = cc.find("Canvas/UI/MOBILE/POTION");
                        let cakeButton = cc.find("Canvas/UI/MOBILE/CAKE");
                        joystick.on(cc.Node.EventType.TOUCH_START, this.joystickStart, this);
                        joystick.on(cc.Node.EventType.TOUCH_MOVE, this.joystickMove, this);
                        joystick.on(cc.Node.EventType.TOUCH_END, this.joystickEnd, this);
                        joystick.on(cc.Node.EventType.TOUCH_CANCEL, this.joystickEnd, this);
                        jumpButton.on(cc.Node.EventType.TOUCH_START, this.jump, this);
                        potionButton.on(cc.Node.EventType.TOUCH_START, this.shrink, this);
                        cakeButton.on(cc.Node.EventType.TOUCH_START, this.grow, this);


                        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
                        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
                    }

                }
            }
        }
        
        
       // this.getComponent(cc.RigidBody).gravityScale = dt *     ;
        //if (this.ySpeed < 0) {
        //    //console.log(cc.Vec2(0, cc.director.getPhysicsManager().gravity.y * (this.fallMultiplier - 1) * this.deltaTime));
        //    //.log(cc.director.getPhysicsManager().gravity.y * (this.fallMultiplier - 1) * this.deltaTime);

        //    this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.xSpeed, this.ySpeed + cc.director.getPhysicsManager().gravity.y* this.deltaTime);
        //}

        //if (this.ySpeed > 0 && !jump) {
        //    this.getComponent(cc.RigidBody).linearVelocity += cc.Vec2(this.xSpeed, cc.director.getPhysicsManager().gravity.y * 1 * this.deltaTime);
        //}

        // grow = -1 means shrining

        if (this.isPlayer) {
             

            if (this.grounded && !cc.find("Canvas/mainCamera").getComponent("cameraFollow").yOffsetPlayer > 2 || cc.find("Canvas/mainCamera").getComponent("cameraFollow").yOffsetPlayer < 2) {
                if (cc.find("Canvas/mainCamera").getComponent("cameraFollow").yOffsetPlayer > 2)
                    cc.find("Canvas/mainCamera").getComponent("cameraFollow").yOffsetPlayer -= dt * 200;
                else if (cc.find("Canvas/mainCamera").getComponent("cameraFollow").yOffsetPlayer < 2)
                    cc.find("Canvas/mainCamera").getComponent("cameraFollow").yOffsetPlayer += dt * 200;

            }
            
            if (cc.find("Canvas/mainCamera").getComponent("cameraFollow").xOffsetPlayer < 50 && this.movingRight)
                cc.find("Canvas/mainCamera").getComponent("cameraFollow").xOffsetPlayer += dt * 200;

            if (cc.find("Canvas/mainCamera").getComponent("cameraFollow").xOffsetPlayer > -50 && this.movingLeft)
                cc.find("Canvas/mainCamera").getComponent("cameraFollow").xOffsetPlayer -= dt * 200;
            
            //custom gravity
            //if (!this.grounded)
            //    this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.xSpeed, - 100 * Math.abs(this.ySpeed) + -10);
            //console.log(dt * 1000);

            cc.director.getPhysicsManager().gravity = cc.v2(0, -this.deltaTime * 1000);
            this.node.getComponent(cc.RigidBody).gravityScale = this.deltaTime * 3000;
            

            if (!this.movingRight && !this.movingLeft)
                this.stopX();

            if (this.growing == 1) {

                if (this.maxScale > this.node.scaleY) {
                    this.node.scaleX += 0.05 * dt;
                    this.node.scaleY += 0.05 * dt;

                } else {
                    this.growing = 0;

                    // increase player velocity if on ground
                    if (this.grounded) {
                        if (this.movingRight)
                            this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.moveSpeed * this.deltaTime, this.ySpeed);
                        else if (this.movingLeft)
                            this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(-this.moveSpeed * this.deltaTime, this.ySpeed);
                    }    
                    
                }
            } else if (this.growing == -1) {

                if (this.minScale < this.node.scaleY) {
                    this.node.scaleX -= 0.05 * dt;
                    this.node.scaleY -= 0.05 * dt;
                } else {

                    this.growing = 0;

                    // decrease player velocity if on ground
                    if (this.grounded) {
                        if (this.movingRight)
                            this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(this.smallMoveSpeed * this.deltaTime, this.ySpeed);
                        else if (this.movingLeft)
                            this.getComponent(cc.RigidBody).linearVelocity = cc.Vec2(-this.smallMoveSpeed * this.deltaTime, this.ySpeed);
                    }
                }
            }
        }
        

    },
});
