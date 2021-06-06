cc.Class({
    extends: cc.Component,

    properties: {
        distanceText: cc.Node,
        distance: 0,
        player: cc.Node,
        following: false,
        endPosition: cc.Node,
        gameEnded: false,
        winnerCanva: cc.Node,
        finishedPlayers: cc.Node,
        playerPrefab: cc.Prefab,
        timesUpUi: cc.Node,
        spawn: cc.Node,
        camera: cc.Node,
        players: cc.Node,
        spectateIndex: 0,
        spectateUI: cc.Node,
        emojiButton: cc.Node,
        emojiUI: cc.Node,
        mobileController: cc.Node,
        numFinished: cc.Node,
        crownsNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        cc.game.setFrameRate(60);
        //cc.director.getCollisionManager().enabledDebugDraw = true; 
        //cc.director.getCollisionManager().enabledDrawBoundingBox = true;
        
    },

    addWinner(player, place) {
        this.numFinished.getComponent(cc.Label).string = place + "/" + this.players.children.length + " finished";
        let aPlayer = cc.instantiate(this.playerPrefab);
        aPlayer.parent = this.finishedPlayers;
        aPlayer.getChildByName("TEXT").getComponent(cc.Label).string = player.name + " finished in " + place + " place   " + cc.find("system").getComponent("client").myTime + "s";
    },
    timesUp() {
        this.player.getComponent("movement").disable();
        this.gameEnded = true;
        this.timesUpUi.active = true;
    },
    showCrowns(crowns) {
        this.crownsNode.active = true;
        console.log(crowns);
        if (crowns > 0)
            this.crownsNode.getChildByName("CROWNS").getComponent(cc.Label).string = "+ " + crowns;
        else
            this.crownsNode.getChildByName("CROWNS").getComponent(cc.Label).string = crowns;
    },
    showWinners(crowns) {
        this.winnerCanva.active = true;
    },
    closeCrowns() {
        this.crownsNode.active = false;
    },
    closeSpectate() {
        this.winnerCanva.active = true;
        this.spectateUI.active = false;
    },
    goBackToLobby() {
        // go back to lobby
        cc.find("system").getComponent("client").disconnect();
        cc.director.loadScene("home");
    },
    confirmTimesUp() {
        this.timesUpUi.active = false;
        this.showWinners();
    },
    openSpectateUi() {
        this.winnerCanva.active = false;
        this.spectateUI.active = true;
    },
    showEmojis() {
        this.emojiButton.active = false;
        this.emojiUI.active = true;
    },
    hideEmojis() {
        this.emojiButton.active = true;
        this.emojiUI.active = false;
    },
    sepctatePrev() {
        this.spectateIndex -=1;
        if (this.spectateIndex < 0)
            this.spectateIndex = this.players.children.length-1;

        let newPlayer = this.players.children[this.spectateIndex];
        this.camera.getComponent("cameraFollow").player = newPlayer;
        // change spectating player name
        this.spectateUI.getChildByName("NAME").getComponent(cc.Label).string = "Spectating " + newPlayer.getChildByName("nameTag").getComponent(cc.Label).string;
    },
    spectateNext() {
        // spectate next player
        this.spectateIndex += 1;
        if (this.spectateIndex >= this.players.children.length)
            this.spectateIndex = 0;
        let newPlayer = this.players.children[this.spectateIndex];
        this.camera.getComponent("cameraFollow").player = newPlayer;
        // change spectating player name
        this.spectateUI.getChildByName("NAME").getComponent(cc.Label).string = "Spectating " + newPlayer.getChildByName("nameTag").getComponent(cc.Label).string;
    },
    update(dt) {
        
        if (!this.following) {
            if (cc.find("system").getComponent("client").myPlayer != null) {
                this.player = cc.find("Canvas/Players/" + cc.find("system").getComponent("client").playerId);
                this.following = true;
                this.numFinished.getComponent(cc.Label).string = "0/" + this.players.children.length + " finished";
            }
        } else {
            //this.distance = Math.floor(Math.sqrt(Math.pow((this.endPosition.x - this.player.x), 2) + Math.pow((this.endPosition.y - this.player.y), 2)) / 10);
            //this.distanceText.getComponent(cc.Label).string = this.distance + " m";
            if (this.gameEnded) {
                this.player.getComponent("movement").active = false;
                this.mobileController.active = false;
            }
        }

    },
});
