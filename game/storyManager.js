// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        panel1: cc.Node,
        panel2: cc.Node,
        panel3: cc.Node,
        panel4: cc.Node,
        panel5: cc.Node,
        shake: cc.Node,
        rabbit: cc.Node,
        text: cc.Label,
        textArea: cc.Node,
        showTextSpeed:0.1,

        speech1: "Alice, welcome back to Wonderland!",
        speech2: " However, I must tell you that this world is no longer the same as before. ",
        speech3: "Things have changed and now you aren't the only Alice. In fact, there are tons of Alices. ",
        speech4: "The Red Queen is forcing them to compete against each other in a race.If you reach the end, you will gain crowns.Lose and you might lose crowns.",
        speech5: "If you win enough crowns, you may be able to escape Wonderland.",
        speech6: "I wish you the best of luck.",
        theChar: 'a',
        textIndex: 0,
        theTextA: "",

        coolNode: cc.Node,
        thanks: cc.Node,
    },

    showChar() {
        this.text.string += this.theChar;
    },
    // LIFE-CYCLE CALLBACKS:
    revealText(theText) {
        this.text.string = "";
        this.textIndex = 0;
        this.theTextA = theText;
        for (var i = 0; i < theText.length; i++) {
            this.scheduleOnce(function () {
                if (this.textIndex < this.theTextA.length) {
                    this.text.string += this.theTextA[this.textIndex];
                    this.textIndex += 1;
                }
            }, this.showTextSpeed * i);
        }
        
    },
    skip() {
        cc.director.loadScene("home");
    },
    onLoad() {
        console.log(this.speech1[0]);
        this.panel1.opacity = 0;
        this.panel2.opacity = 0;
        this.panel3.opacity = 0;
        this.panel4.opacity = 0;
        this.panel5.opacity = 0;
        this.rabbit.opacity = 0;
        this.textArea.opacity = 0;
        this.coolNode.opacity = 0;
        this.shake.opacity = 0;

        cc.tween(this.panel1).to(2, { opacity: 255 }, { easing: 'sineOut' }).start();

        this.scheduleOnce(function () {
            cc.tween(this.panel2).to(2, { opacity: 255 }, { easing: 'sineOut' }).start();
        }, 3);

        this.scheduleOnce(function () {
            cc.tween(this.panel3).to(2, { opacity: 255 }, { easing: 'sineOut' }).start();
        }, 6);

        this.scheduleOnce(function () {
            this.panel1.active = false;
            this.panel2.active = false;
            this.panel3.active = false;
            cc.tween(this.panel4).to(2, { opacity: 255 }, { easing: 'sineOut' }).start();
        }, 14);

        this.scheduleOnce(function () {
            cc.tween(this.panel5).to(2, { opacity: 255 }, { easing: 'sineOut' }).start();
            cc.tween(this.shake).to(2, { opacity: 255 }, { easing: 'sineOut' }).start();
        }, 18);

        this.scheduleOnce(function () {
            
            this.panel4.active = false;
            this.panel5.active = false;
            this.shake.active = false;
            cc.tween(this.rabbit).to(2, { opacity: 255 }, { easing: 'sineOut' }).start();
            cc.tween(this.textArea).to(2, { opacity: 255 }, { easing: 'sineOut' }).start();
            
        }, 26);



        this.scheduleOnce(function () {
            //speech1
            this.revealText(this.speech1);
            this.scheduleOnce(function () {
                //speech2
                this.revealText(this.speech2);
                this.scheduleOnce(function () {
                    //speech3
                    this.revealText(this.speech3);
                    this.scheduleOnce(function () {
                        //speech4
                        this.revealText(this.speech4);
                        this.scheduleOnce(function () {
                            //speech5
                            this.revealText(this.speech5);
                            this.scheduleOnce(function () {
                                //speech6
                                this.revealText(this.speech6);

                                this.scheduleOnce(function () {
                                    cc.tween(this.coolNode).to(2, { opacity: 255 }, { easing: 'sineOut' }).start();

                                    // thankyou
                                    this.scheduleOnce(function () {
                                        cc.tween(this.thanks).to(2, { scaleX: 0.9, scaleY: 0.9 }, { easing: 'sineOut' }).start();

                                        //switch scene
                                        this.scheduleOnce(function () {
                                            cc.director.loadScene("home");
                                        }, 3);
                                    }, 2);
                                }, 7);
                            }, 8);
                        }, 14);
                    }, 8);
                }, 8);
            }, 6);
        }, 27);

       

        

    },

    // update (dt) {},
});
