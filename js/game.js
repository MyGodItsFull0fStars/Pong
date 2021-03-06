var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,

    dashSize: 5,

    paddleLeft_x: 50,
    paddleRight_x: 590,
    paddleVelocity: 620,
    paddleSegmentsMax: 4,
    paddleSegmentHeight: 4,
    paddleSegmentAngle: 15,
    paddleTopGap: 22,

    ballVelocity: 550,
    ballRandomStartingAngleLeft: [-120, 120],
    ballRandomStartingAngleRight: [-60, 60],
    ballStartDelay: 2,
    ballVelocityIncrement: 25,
    ballReturnCount: 4,

    scoreToWin: 11
};

var graphicAssets = {

    backgroundGraphicURL: 'assets/wallpaper.jpg',
    backgroundGraphicName: 'backgroundName',

    ballURL: 'assets/bomb_small.png',
    ballName: 'ball',

    paddleURL: 'assets/axe_left.png',
    paddleLeftName: 'paddle',

    paddleRightURL: 'assets/axe_right.png',
    paddleRightName: 'paddleRight'
};

var soundAssets = {
    ballBounceURL: 'assets/bounce_sound',
    ballBounceName: 'ballBounce',

    ballHitURL: 'assets/battle_axe_sound',
    ballHitName: 'ballHit',

    ballMissedURL: 'assets/bomb_sound',
    ballMissedName: 'ballMissed',

    backgroundMusicURL: 'assets/background_sound',
    backgroundMusicName: 'backgroundmusic',

    mp4URL: '.m4a',
    oggURL: '.ogg'
};

var fontAssets = {
    scoreLeft_x: gameProperties.screenWidth * 0.25,
    scoreRight_x: gameProperties.screenWidth * 0.75,
    scoreTop_y: 10,

    scoreFontStyle: {font: '80px Arial', fill: '#FFFFFF', align: 'center'},
    instructionsFontStyle: {font: '24px Helvetica', fill: '#FFFFFF', align: 'center'},
};

var labels = {
    clickToStart: 'Left paddle: W,A,S,D for movement.\n\nRight paddle: UP, DOWN, LEFT and RIGHT for movement.\n\n- click to start -',
    winner: 'Winner!'
};

var mainState = function (game) {
    this.backgroundGraphics = null;
    this.ballSprite = null;
    this.paddleLeftSprite = null;
    this.paddleRightSprite = null;
    this.paddleGroup = null;


    /*
     ---------------------------------------------------------------------------------------------

     Controls

     ---------------------------------------------------------------------------------------------
     */


    this.paddleLeft_up = null;
    this.paddleLeft_down = null;
    this.paddleLeft_left = null;
    this.paddleLeft_right = null;


    this.paddleRight_up = null;
    this.paddleRight_down = null;
    this.paddleRight_left = null;
    this.paddleRight_right = null;

    this.missedSide = null;

    /*
     ---------------------------------------------------------------------------------------------

     Score

     ---------------------------------------------------------------------------------------------
     */

    this.scoreLeft = null;
    this.scoreRight = null;

    this.tf_scoreLeft = null;
    this.tf_scoreRight = null;

    /*
     ---------------------------------------------------------------------------------------------

     Ball

     ---------------------------------------------------------------------------------------------
     */

    this.sndBallHit = null;
    this.sndBallBounce = null
    this.sndBallMissed = null;

    this.instructions = null;
    this.winnerLeft = null;
    this.winnerRight = null;

    this.ballVelocity = null;
};

mainState.prototype = {
    preload: function () {

        game.load.image(graphicAssets.backgroundGraphicName, graphicAssets.backgroundGraphicURL);
        game.load.image(graphicAssets.ballName, graphicAssets.ballURL);
        game.load.image(graphicAssets.paddleLeftName, graphicAssets.paddleURL);
        game.load.image(graphicAssets.paddleRightName, graphicAssets.paddleRightURL);

        game.load.audio(soundAssets.ballBounceName, [soundAssets.ballBounceURL + soundAssets.mp4URL, soundAssets.ballBounceURL + soundAssets.oggURL]);
        game.load.audio(soundAssets.ballHitName, [soundAssets.ballHitURL + soundAssets.mp4URL, soundAssets.ballHitURL + soundAssets.oggURL]);
        game.load.audio(soundAssets.ballMissedName, [soundAssets.ballMissedURL + soundAssets.mp4URL, soundAssets.ballMissedURL + soundAssets.oggURL]);
        game.load.audio(soundAssets.backgroundMusicName, [soundAssets.backgroundMusicURL + soundAssets.mp4URL, soundAssets.backgroundMusicURL + soundAssets.oggURL]);
    },

    create: function () {
        this.initGraphics();
        this.initPhysics();
        this.initKeyboard();
        this.initSounds();
        this.startDemo();
    },

    update: function () {
        this.moveLeftPaddle();
        this.moveRightPaddle();
        game.physics.arcade.overlap(this.ballSprite, this.paddleGroup, this.collideWithPaddle, null, this);

        if (this.ballSprite.body.blocked.up
            || this.ballSprite.body.blocked.down
            || this.ballSprite.body.blocked.left
            || this.ballSprite.body.blocked.right) {
            this.sndBallBounce.play();
        }
    },

    initGraphics: function () {

        this.background = game.add.sprite(0, 0, graphicAssets.backgroundGraphicName);

        this.backgroundGraphics = game.add.graphics(0, 0);
        this.backgroundGraphics.lineStyle(2, 0xFFFFFF, 1);

        for (var y = 0; y < gameProperties.screenHeight; y += gameProperties.dashSize * 2) {
            this.backgroundGraphics.moveTo(game.world.centerX, y);
            this.backgroundGraphics.lineTo(game.world.centerX, y + gameProperties.dashSize);
        }

        this.ballSprite = game.add.sprite(game.world.centerX, game.world.centerY, graphicAssets.ballName);
        this.ballSprite.anchor.set(0.5, 0.5);

        this.paddleLeftSprite = game.add.sprite(gameProperties.paddleLeft_x, game.world.centerY, graphicAssets.paddleLeftName);
        this.paddleLeftSprite.anchor.set(0.5, 0.5);

        this.paddleRightSprite = game.add.sprite(gameProperties.paddleRight_x, game.world.centerY, graphicAssets.paddleRightName);
        this.paddleRightSprite.anchor.set(0.5, 0.5);

        this.tf_scoreLeft = game.add.text(fontAssets.scoreLeft_x, fontAssets.scoreTop_y, "0", fontAssets.scoreFontStyle);
        this.tf_scoreLeft.anchor.set(0.5, 0);

        this.tf_scoreRight = game.add.text(fontAssets.scoreRight_x, fontAssets.scoreTop_y, "0", fontAssets.scoreFontStyle);
        this.tf_scoreRight.anchor.set(0.5, 0);

        this.instructions = game.add.text(game.world.centerX, game.world.centerY, labels.clickToStart, fontAssets.instructionsFontStyle);
        this.instructions.anchor.set(0.5, 0.5);

        this.winnerLeft = game.add.text(gameProperties.screenWidth * 0.25, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
        this.winnerLeft.anchor.set(0.5, 0.5);

        this.winnerRight = game.add.text(gameProperties.screenWidth * 0.75, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
        this.winnerRight.anchor.set(0.5, 0.5);

        this.hideTextFields();
    },

    initPhysics: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.enable(this.ballSprite, Phaser.Physics.ARCADE);

        this.ballSprite.checkWorldBounds = true;
        this.ballSprite.body.collideWorldBounds = true;
        this.ballSprite.body.immovable = true;
        this.ballSprite.body.bounce.set(1);
        this.ballSprite.events.onOutOfBounds.add(this.ballOutOfBounds, this);

        this.paddleGroup = game.add.group();
        this.paddleGroup.enableBody = true;
        this.paddleGroup.physicsBodyType = Phaser.Physics.ARCADE;

        this.paddleGroup.add(this.paddleLeftSprite);
        this.paddleGroup.add(this.paddleRightSprite);

        this.paddleGroup.setAll('checkWorldBounds', true);
        this.paddleGroup.setAll('body.collideWorldBounds', true);
        this.paddleGroup.setAll('body.immovable', true);
    },

    initKeyboard: function () {

        // Left Paddle
        this.paddleLeft_up = game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.paddleLeft_down = game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.paddleLeft_left = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.paddleLeft_right = game.input.keyboard.addKey(Phaser.Keyboard.D);

        // Right Paddle
        this.paddleRight_up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.paddleRight_down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.paddleRight_left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.paddleRight_right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    },

    initSounds: function () {

        this.sndBackground = game.add.audio(soundAssets.backgroundMusicName);
        this.sndBallHit = game.add.audio(soundAssets.ballHitName);
        this.sndBallBounce = game.add.audio(soundAssets.ballBounceName);
        this.sndBallMissed = game.add.audio(soundAssets.ballMissedName);
    },

    startDemo: function () {
        this.ballSprite.visible = false;
        this.resetBall();
        this.enablePaddles(false);
        this.enableBoundaries(true);
        game.input.onDown.add(this.startGame, this);

        this.instructions.visible = true;
    },

    startGame: function () {
        game.input.onDown.remove(this.startGame, this);
        this.sndBackground.play();

        this.enablePaddles(true);
        this.enableBoundaries(false);
        this.resetBall();
        this.resetScores();
        this.hideTextFields();
    },

    startBall: function () {
        this.ballVelocity = gameProperties.ballVelocity;
        this.ballReturnCount = 0;
        this.ballSprite.visible = true;

        var randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight.concat(gameProperties.ballRandomStartingAngleLeft));

        if (this.missedSide == 'right') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight);
        } else if (this.missedSide == 'left') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleLeft);
        }
        game.physics.arcade.velocityFromAngle(randomAngle, gameProperties.ballVelocity, this.ballSprite.body.velocity);
    },

    resetBall: function () {
        this.ballSprite.reset(game.world.centerX, game.rnd.between(0, gameProperties.screenHeight));
        this.ballSprite.visible = false;
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballStartDelay, this.startBall, this);
    },

    enablePaddles: function (enabled) {
        this.paddleGroup.setAll('visible', enabled);
        this.paddleGroup.setAll('body.enable', enabled);

        this.paddleLeft_up.enabled = enabled;
        this.paddleLeft_down.enabled = enabled;
        this.paddleLeft_left.enabled = enabled;
        this.paddleLeft_right.enabled = enabled;

        this.paddleRight_up.enabled = enabled;
        this.paddleRight_down.enabled = enabled;
        this.paddleRight_left.enabled = enabled;
        this.paddleLeft_right.enabled = enabled;

        this.paddleLeftSprite.y = game.world.centerY;
        this.paddleLeftSprite.x = game.world.centerX - (gameProperties.screenWidth / 2 ) + 50;
        this.paddleRightSprite.y = game.world.centerY;
    },

    enableBoundaries: function (enabled) {
        game.physics.arcade.checkCollision.left = enabled;
        game.physics.arcade.checkCollision.right = enabled;
    },

    moveLeftPaddle: function () {
        // game.world.centerY
        if (this.paddleLeft_up.isDown) {
            this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_down.isDown) {
            this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_left.isDown) {
            this.paddleLeftSprite.body.velocity.x = -gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_left.isDown && this.paddleLeft_up.isDown) {
            this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
            this.paddleLeftSprite.body.velocity.x = -gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_left.isDown && this.paddleLeft_down.isDown) {
            this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
            this.paddleLeftSprite.body.velocity.x = -gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_right.isDown && this.paddleLeft_up.isDown) {
            this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
            this.paddleLeftSprite.body.velocity.x = gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_right.isDown && this.paddleLeft_down.isDown) {
            this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
            this.paddleLeftSprite.body.velocity.x = gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_right.isDown) {
            this.paddleLeftSprite.body.velocity.x = gameProperties.paddleVelocity;
        }

        else {
            this.paddleLeftSprite.body.velocity.y = 0;
            this.paddleLeftSprite.body.velocity.x = 0;
        }
        if (this.paddleLeftSprite.body.y < gameProperties.paddleTopGap) {
            this.paddleLeftSprite.body.y = gameProperties.paddleTopGap;
        }

        if (this.paddleLeftSprite.body.x + this.paddleLeftSprite.body.width > gameProperties.screenWidth / 2) {
            this.paddleLeftSprite.body.x = gameProperties.screenWidth / 2 - this.paddleLeftSprite.body.width;
        }
    },

    moveRightPaddle: function () {
        if (this.paddleRight_up.isDown) {
            this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_down.isDown) {
            this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_left.isDown) {
            this.paddleRightSprite.body.velocity.x = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_left.isDown && this.paddleLeft_up.isDown) {
            this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
            this.paddleRightSprite.body.velocity.x = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_left.isDown && this.paddleRight_down.isDown) {
            this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
            this.paddleRightSprite.body.velocity.x = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_right.isDown && this.paddleRight_up.isDown) {
            this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
            this.paddleRightSprite.body.velocity.x = gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_right.isDown && this.paddleRight_down.isDown) {
            this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
            this.paddleRightSprite.body.velocity.x = gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_right.isDown) {
            this.paddleRightSprite.body.velocity.x = gameProperties.paddleVelocity;
        }
        else {
            this.paddleRightSprite.body.velocity.y = 0;
            this.paddleRightSprite.body.velocity.x = 0;
        }

        if (this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
            this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
        }
        if (this.paddleRightSprite.body.x < gameProperties.screenWidth / 2) {
            this.paddleRightSprite.body.x = gameProperties.screenWidth / 2;
        }
    },

    collideWithPaddle: function (ball, paddle) {
        this.sndBallHit.play();

        var returnAngle;
        var segmentHit = Math.floor((ball.y - paddle.y) / gameProperties.paddleSegmentHeight);

        if (segmentHit >= gameProperties.paddleSegmentsMax) {
            segmentHit = gameProperties.paddleSegmentsMax - 1;
        } else if (segmentHit <= -gameProperties.paddleSegmentsMax) {
            segmentHit = -(gameProperties.paddleSegmentsMax - 1);
        }

        if (paddle.x < gameProperties.screenWidth * 0.5) {
            returnAngle = segmentHit * gameProperties.paddleSegmentAngle;
            game.physics.arcade.velocityFromAngle(returnAngle, this.ballVelocity, this.ballSprite.body.velocity);
        } else {
            returnAngle = 180 - (segmentHit * gameProperties.paddleSegmentAngle);
            if (returnAngle > 180) {
                returnAngle -= 360;
            }

            game.physics.arcade.velocityFromAngle(returnAngle, this.ballVelocity, this.ballSprite.body.velocity);
        }

        this.ballReturnCount++;

        if (this.ballReturnCount >= gameProperties.ballReturnCount) {
            this.ballReturnCount = 0;
            this.ballVelocity += gameProperties.ballVelocityIncrement;
        }
    },

    ballOutOfBounds: function () {
        this.sndBallMissed.play();

        if (this.ballSprite.x < 0) {
            this.missedSide = 'left';
            this.scoreRight++;
        } else if (this.ballSprite.x > gameProperties.screenWidth) {
            this.missedSide = 'right';
            this.scoreLeft++;
        }

        this.updateScoreTextFields();

        if (this.scoreLeft >= gameProperties.scoreToWin) {
            this.winnerLeft.visible = true;
            this.startDemo();
        } else if (this.scoreRight >= gameProperties.scoreToWin) {
            this.winnerRight.visible = true;
            this.startDemo();
        } else {
            this.resetBall();
        }
    },

    resetScores: function () {
        this.scoreLeft = 0;
        this.scoreRight = 0;
        this.updateScoreTextFields();
    },

    updateScoreTextFields: function () {
        this.tf_scoreLeft.text = this.scoreLeft;
        this.tf_scoreRight.text = this.scoreRight;
    },

    hideTextFields: function () {
        this.instructions.visible = false;
        this.winnerLeft.visible = false;
        this.winnerRight.visible = false;
    },
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');