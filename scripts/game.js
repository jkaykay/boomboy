import { getCurrentUser, getAllUsers } from "./validate.js";



let game; // Declare game variable. This becomes the "canvas". 

// These are various game settings and options set into an object so if changes are needed, I can come here and it'll change globally. 
// The values can change throughout the game (speeds of things, mostly) so a method was written to reset these values. 
// The scope of the values relate to Phaser
let gameOptions = {
    horizon: 768 - 52,
    scrollSpeed: 400,
    cloudSpeeds: [0.5, 0.8, 1.0],
    forestSpeeds: [1.5, 3.0, 6.25, 6.5],
    lastSpeedIncreaseScore: 0,

    speedMult: 0.025,
    maxSpeed: 1350,
    spawnRange: [768 - 150, 373], //373 is boomboy max jump height
    birdSpeed: 600,
    wolfSpeed: 800,
    frogSpeed: 425,
    frogJump: 200,
    monkeyspeedinit: 500,
    monkeyspeedleap: 900,

    boomboyGravity: 1000,
    boomboyStartingPositionX: 200,
    boomboyStartingPositionY: 620,
    boomboyJumpForce: 700,
    boomboyAnimJumpHeight: 590, //boomboy lowest jump height
    beamSpeed: 600,
    boomboyHearts: 3,
    // Exists outside of SCENE. this.scene.restart does NOT reset the gameOption attributes, so a function must be made to reset necessary attributes. 
    reset: function () {
        this.horizon = 768 - 52;
        this.scrollSpeed = 400;
        this.cloudSpeeds = [0.5, 0.8, 1.0];
        this.forestSpeeds = [1.5, 3.0, 6.25, 6.5];
        this.lastSpeedIncreaseScore = 0;
        this.birdSpeed = 600;
        this.wolfSpeed = 800;
        this.frogSpeed = 425;
        this.monkeyspeedinit = 300;
        this.monkeyspeedleap = 900;
        this.boomboyHearts = 3;
    }
}

window.onload = function () {
    // This is the actual configuration for the Phaser Game object. (Things related directly to Phaser and not just the game)
    const gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1366,
            height: 768,
            resolution: window.devicePixelRatio
        },
        parent: "gameboy", // Here is where the parent div is defined. "gameboy" is the ID/Class of the div defined in the HTML page.
        physics: {
            default: "arcade",
            arcade: {
                debug: false
            }
        },
        forceSingleUpdate: true, // Fix framerate issues between different monitors with different hz? I am not sure if it works.
        scene: [StartGame, PlayGame] //The Classes are the Scenes for Phaser
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}

// Main Game Scene
class PlayGame extends Phaser.Scene {
    constructor() {
        super({ key: "PlayGame" });
        this.state = 0; //0 = playing, 1 = slowdown, 2 = game over screen
    }

    // Core user score saving to localStorage function
    updateUserScore(score) {   
        if (this.userList && this.user) {
            // Find and update current user"s score
            let userIndex = this.userList.findIndex(user => user.username === this.user.username);
            if (userIndex !== -1) {
                this.userList[userIndex].score = score;
                
                // Save updated users array back to localStorage
                localStorage.setItem("users", JSON.stringify(this.userList));
                sessionStorage.setItem("currentUser", JSON.stringify(this.userList[userIndex])); // Update current user data as well
            }
        }
    }

    //------------------- CUSTOM METHODS -----------------------
    addGround(posX) {
        let ground;
        // Get from pool or create new
        // If from ground pool, reset ground and add it to the ground group
        if (this.groundPool.getLength()) {

            ground = this.groundPool.getFirst();
            ground.x = 15; // Reset x position (from previous position offscreen to left) (Not sure why 15. Other pools make more sense)
            ground.active = true;
            ground.visible = true;
            ground.body.enable = true;
            ground.setVelocityX(-gameOptions.scrollSpeed);
            this.groundPool.remove(ground);
        } else { // If no ground in ground pool yet, create a fresh new ground.
            ground = this.physics.add.sprite(posX, gameOptions.horizon, "ground");
            ground.setImmovable(true);
            ground.setVelocityX(-gameOptions.scrollSpeed);
            ground.active = true;
            ground.visible = true;
            ground.body.enable = true;
            this.groundGroup.add(ground);
        }
        ground.setOrigin(0, 0.5); //Outside of if-else to apply to both new and pooled grounds
        ground.displayWidth = game.config.width;
        ground.refreshBody();
    }

    // Any speed increases should ONLY be in this method, so speeds are consistent throughout and not increased twice by accident
    increaseSpeeds() {
        // Increase ground speed
        gameOptions.scrollSpeed += (gameOptions.scrollSpeed * gameOptions.speedMult);

        // Update all existing ground pieces
        this.groundGroup.getChildren().forEach(function (ground) {
            ground.setVelocityX(-gameOptions.scrollSpeed);
        }, this);
        // Update all existing ground pieces
        this.groundPool.getChildren().forEach(function (ground) {
            ground.setVelocityX(-gameOptions.scrollSpeed);
        }, this);

        // Increase cloud speeds
        gameOptions.cloudSpeeds = gameOptions.cloudSpeeds.map(speed =>
            speed + (speed * gameOptions.speedMult)
        );

        // Increase forest speeds
        gameOptions.forestSpeeds = gameOptions.forestSpeeds.map(speed =>
            speed + (speed * gameOptions.speedMult)
        );

        // Increase bird speeds (applied in spawnBird method)
        gameOptions.birdSpeed += (gameOptions.birdSpeed * gameOptions.speedMult);

        // Increase wolf speeds (no method, so apply here)
        gameOptions.wolfSpeed += (gameOptions.wolfSpeed * gameOptions.speedMult);
        this.wolf.setVelocityX(-gameOptions.wolfSpeed);

        // Increase frog speeds (no method, so apply here)
        gameOptions.frogSpeed += (gameOptions.frogSpeed * gameOptions.speedMult);
        this.frog.setVelocityX(-gameOptions.frogSpeed);
    }

    // Fires beams 
    fireBeam(posY) { //The passed param posY will be Boomboy's position when he fires the beam
        let beam;

        //Grab from beam pool if there are beams
        if (this.beamPool.getLength()) {
            beam = this.beamPool.getFirst();
            beam.y = posY;
            beam.x = gameOptions.boomboyStartingPositionX + 41;
            beam.setVelocityX((gameOptions.scrollSpeed));
            beam.setVelocityY(0);
            beam.active = true;
            beam.visible = true;
            beam.body.enable = true;
            beam.setImmovable = true;
            this.beamPool.remove(beam);
        }
        // Create more beams unless there are already 15 max beams. (Eventually active beams will add to pool, so max amount of beams in game will be 15 at all times) 
        else if (this.beams.getLength() <= 15) {
            beam = this.physics.add.sprite(gameOptions.boomboyStartingPositionX + 41, posY, "beam").setScale(2);
            beam.setVelocityX((gameOptions.scrollSpeed));
            beam.setVelocityY(0);
            beam.active = true;
            beam.visible = true;
            beam.body.enable = true;
            beam.setImmovable = true;
            this.beams.add(beam);

        }

        // If there is a beam selected (i.e. there are not 15 beams already on screen)
        if (beam != null) {
            beam.setOrigin(0, 0.5);
            beam.refreshBody();
        }


    }

    spawnBird() { // Essentially same as Ground Pool
        let bird;
        let posY = Math.floor(Math.random() * (gameOptions.spawnRange[0] - gameOptions.spawnRange[1] + 1)) + gameOptions.spawnRange[1]; // Set bird Y at random spot within range.

        if (this.birdPool.getLength()) {
            bird = this.birdPool.getFirst();
            bird.y = posY;
            bird.x = game.config.width;
            bird.setVelocityX(-gameOptions.birdSpeed);
            bird.active = true;
            bird.visible = true;
            bird.body.enable = true;
            bird.setImmovable = true;
            this.birdPool.remove(bird);
        }
        else if (this.birdGroup.getLength() < 5) { //set to less than 5, but this is technically always true because there are only ever 2 birds active
            bird = this.physics.add.sprite(game.config.width, posY, "redBird").setScale(2);
            bird.setVelocityX(-gameOptions.birdSpeed);
            bird.active = true;
            bird.visible = true;
            bird.body.enable = true;
            bird.setImmovable = true;
            this.birdGroup.add(bird);
            bird.setOrigin(0, 0.5);
            bird.refreshBody();
        }
    }

    // Called whenever boomboy takes damage. Manages Boomboy's HP and updates both the var and the corresponding image. 
    takeDmg() {
        this.boomboy.anims.play("hit");
        this.hurtAlert.play();
        this.hurtGrunt.play();
        gameOptions.boomboyHearts -= 1; // Decrease amount of hearts

        // Set image based on current hearts.
        if (gameOptions.boomboyHearts == 2) {
            this.healthbar.destroy();
            this.healthbar = this.add.image(game.config.width / 2, game.config.height - 35, "life-two").setDepth(0.1).setScale(0.8);
        } else if (gameOptions.boomboyHearts == 1) {
            this.healthbar.destroy();
            this.healthbar = this.add.image(game.config.width / 2, game.config.height - 35, "life-one").setDepth(0.1).setScale(0.8);
        } else {
            this.healthbar.destroy();
            this.healthbar = this.add.image(game.config.width / 2, game.config.height - 35, "life-none").setDepth(0.1).setScale(0.8);
        }
    }

    // ----------------------------------- GAME OVER SECTION ---------------------------------------
    slowDown(){
        // Stop all sounds
        this.sound.stopAll();
        this.track1.stop();

        //Death noise
        this.hurtFinal.play();
        this.hurtAlert.play();

        // Stop all boomboy anims
        this.boomboy.anims.stop();
        // Disable physics and gravity if boomboy dies while on the ground. I believe this was for collision issues.
        if(this.boomboy.body.isDown){
            this.boomboy.body.enable = false; // Disable physics body
            this.boomboy.setGravityY(0);
        }
        // Have to set boomboy body size because boomboy can die in the air. 
        this.boomboy.setBodySize(28, 40);
        // Finally play the animation
        this.boomboy.anims.play("ko", true);
        
        //remove all active projectiles
        this.beams.getChildren().forEach(function(beam) {
            beam.active = false;
            beam.visible = false;
            beam.body.enable = false;
        }, this);
        // ability to fire is removed so no need to clear beam pool

        // Stop all enemy spawns
        this.birdSpawns.remove();
        this.wolfTime.remove();
        this.frogTime.remove();
        this.monkeyTime.remove();
        
        // Hide all current NPCs on screen.
        this.birdGroup.getChildren().forEach(function(bird) {
            bird.active = false;
            bird.visible = false;
            bird.body.enable = false;
        }, this);
        this.birdPool.getChildren().forEach(function(bird) {
            bird.active = false;
            bird.visible = false;
            bird.body.enable = false;
        }, this);
        this.wolf.active = false;
        this.wolf.visible = false;
        this.wolf.body.enable = false;
        this.frog.active = false;
        this.frog.visible = false;
        this.frog.body.enable = false;
        this.monkey.active = false;
        this.monkey.visible = false;
        this.monkey.body.enable = false;

        // Ease into stopping the game
        // Don"t want to call this in the update loop because of constant calling
        // Want to work with staticly changing values(?)
        let initialScrollSpeed = gameOptions.scrollSpeed;
        let initialCloudSpeeds = [...gameOptions.cloudSpeeds];  // Make a copy of array
        let initialForestSpeeds = [...gameOptions.forestSpeeds]; // Make a copy of array

        let delayTime = 50; // This is the sort of "interpolation" time.
        let steps = 20; // Amount of steps to take.

        let scrollReduction = initialScrollSpeed / steps; //Calculate amount of reduction needed to reach 0ish for all
        let cloudReductions = initialCloudSpeeds.map(speed => speed / steps);
        let forestReductions = initialForestSpeeds.map(speed => speed / steps);

        let currentStep = 0; // Tracker

        this.time.addEvent({
            delay: delayTime,
            callback: function () {
                currentStep++;
                gameOptions.scrollSpeed = Math.max(0, initialScrollSpeed - (scrollReduction * currentStep));
                
                // Update all moving objects with new speed
                this.groundGroup.getChildren().forEach(function (ground) {
                    ground.setVelocityX(-gameOptions.scrollSpeed);
                }, this);
                this.groundPool.getChildren().forEach(function (ground) {
                    ground.setVelocityX(-gameOptions.scrollSpeed);
                }, this);
                this.scoreBox.setVelocityX(-gameOptions.scrollSpeed);
                
                // Update cloud speeds
                gameOptions.cloudSpeeds = initialCloudSpeeds.map((speed, index) => 
                    Math.max(0, speed - (cloudReductions[index] * currentStep))
                );
                
                // Update forest speeds
                gameOptions.forestSpeeds = initialForestSpeeds.map((speed, index) => 
                    Math.max(0, speed - (forestReductions[index] * currentStep))
                );
                
                if (gameOptions.scrollSpeed === 0 && 
                gameOptions.cloudSpeeds.every(speed => speed === 0) && 
                gameOptions.forestSpeeds.every(speed => speed === 0) && 
                this.state != 2) {
                    this.state = 2; // Move to final game over state
                    this.displayGameOver();
                }            
            },
            callbackScope: this,
            repeat: steps
        });
    }

    // Final game over state
    displayGameOver(){
        let finalScore = this.score;
        let result1 = this.score > this.pb; // Check if score beats personal best
        let result2 = this.score > this.highscore; // CHeck if score beats high score

        // Set up various images and assets (but invisible for gradual appearance)
        this.gameOverScreen = this.add.image(game.config.width / 2, game.config.height / 2, "gameOverScreen").setDepth(0.2).setAlpha(0);

        this.goScoreText = this.add.text(game.config.width / 2, game.config.height / 2, "Score: 0", { fontSize: "48px", color: "#ffffff" }).setOrigin(0.5).setDepth(0.21).setAlpha(0);
        this.resultText1 = this.add.text(game.config.width / 2, game.config.height / 2 + 60, "New Personal Best!", { fontSize: "48px", color: "red" }).setOrigin(0.5).setDepth(0.21).setAlpha(0);
        this.restultText2 = this.add.text(game.config.width / 2, game.config.height / 2 + 120, "Highscore!", { fontSize: "48px", color: "gold" }).setOrigin(0.5).setDepth(0.21).setAlpha(0);

        this.replayButton = this.add.sprite(game.config.width / 2, game.config.height / 2 + 200, "replayButton").setDepth(0.2).setInteractive();
        this.replayButton.on("pointerdown", this.reStart, this);
        this.replayButton.active = false;
        this.replayButton.visible = false;
        
        // Oh boy, nested timers. The end of first timer starts the next. 
        // First timer manages the transition from invisible to visible, and once that's completed, the next time starts to do the points tallying. 
        this.time.addEvent({
            delay: 50,
            callback: function(){
                //Change alpha
                this.gameOverScreen.alpha = (this.gameOverScreen.alpha + 0.10);
                this.goScoreText.alpha = (this.goScoreText.alpha + 0.10);
                //Once alpha is near 1. 
                if(this.gameOverScreen.alpha > 0.9){
                    this.gameOverScreen.alpha = 1;
                }

                //This means timer is done. 
                if(this.gameOverScreen.alpha >= 1){
                    let duration = 1000; //Make the tally a consistent 1 second
                    let tracker = 0;
                    let steps = 10;
                    let delayer = duration / steps; //Calculate delay based on duration and steps desired

                    let counter = Math.floor(finalScore / steps); //Calculate the amount required to reach finalScore within steps
                   
                    this.time.addEvent({
                        delay: delayer,
                        callback: function() {
                            tracker += counter; //Add amount required
                            
                            //Exit condition
                            if(tracker >= finalScore){
                                tracker = finalScore;
                                this.goScoreText.setText("Score: " + finalScore.toString());

                                // Tell user if they've beaten their personal score or high score
                                if(result1){
                                    this.resultText1.alpha = 1;
                                    this.updateUserScore(finalScore);
                                    this.thatsnice.play();
                                    this.youdidntdieinvain.play();
                                }
                                if(result2){
                                    this.restultText2.alpha = 1;
                                }
                                if(!result1 && !result2){
                                    this.resultText1.setText("No Personal Best :(");
                                    this.resultText1.alpha = 1;
                                    this.thatsrough.play();
                                    this.youdied.play();
                                }
                                // Set button to active
                                this.replayButton.active = true;
                                this.replayButton.visible = true;
                            }

                            // Update text when tracker is still not == finalScore.
                            else{
                                this.goScoreText.setText("Score: " + tracker.toString());
                                this.uptick.play();
                            }
                        },
                        callbackScope: this,
                        repeat: steps - 1,
                    });
                }
            },
            callbackScope: this,
            repeat: 9,
            startAt: 0
        });

        
    }

    // ----------------------------------- GAME OVER SECTION END ---------------------------------------

    //Restart game, reset state and options. 
    reStart(){
        this.state = 0;
        gameOptions.reset();
        this.scene.restart();
    }

    // ------------------- CUSTOM METHODS END -------------------

    // Preload is the asset loader for Phaser. No logic applied, but makes it available for Phaser to use. 
    preload() {
        this.load.image("sky", "../assets/sprites/environment/sky.png");

        this.load.image("cloud-low", "../assets/sprites/environment/cloud-low.png");
        this.load.image("cloud-mid", "../assets/sprites/environment/cloud-mid.png");
        this.load.image("cloud-top", "../assets/sprites/environment/cloud-top.png");

        this.load.image("forest-tile-back", "../assets/sprites/environment/forest/forest-tile-back.png");
        this.load.image("forest-tile-low", "../assets/sprites/environment/forest/forest-tile-low.png");
        this.load.image("forest-tile-mid", "../assets/sprites/environment/forest/forest-tile-mid.png");
        this.load.image("forest-tile-top", "../assets/sprites/environment/forest/forest-tile-top.png");

        this.load.image("foliage", "../assets/sprites/environment/forest/foliage.png");

        this.load.image("ground", "../assets/sprites/environment/ground_alt.png");

        this.load.image("redBird", "../assets/sprites/mobs/redbird.png");
        this.load.atlas("wolf", "../assets/sprites/mobs/wolf.png", "../assets/sprites/mobs/wolf.json");
        this.load.atlas("frog", "../assets/sprites/mobs/frog.png", "../assets/sprites/mobs/frog.json");
        this.load.atlas("monkey", "../assets/sprites/mobs/monkey.png", "../assets/sprites/mobs/monkey.json");
   
        this.load.atlas("boomboy", "../assets/sprites/boomboy/boomboy.png", "../assets/sprites/boomboy/boomboy-sprites.json");
        this.load.image("beam", "../assets/sprites/boomboy/beam.png")
        //----
        this.load.image("scoreHitBox", "../assets/sprites/scoreHitBox.png");

        this.load.image("life-none", "../assets/sprites/boomboy/health-0.png");
        this.load.image("life-one", "../assets/sprites/boomboy/health-1.png");
        this.load.image("life-two", "../assets/sprites/boomboy/health-2.png");
        this.load.image("life-full", "../assets/sprites/boomboy/health-3.png");
        this.load.image("uiflare", "../assets/images/ui_flare.png");
        this.load.image("gameOverScreen", "../assets/images/gameover.png");
        this.load.image("replayButton", "../assets/sprites/replay.png");

        this.load.audio("shootSound", "../assets/audio/fx/boomboy/shoot.mp3");
        this.load.audio("jumpSound", "../assets/audio/fx/boomboy/jump.mp3");
        this.load.audio("slideSound", "../assets/audio/fx/boomboy/slide-wrapped.mp3");
        this.load.audio("beamHit", "../assets/audio/fx/boomboy/hit_shoot.mp3");
        this.load.audio("hurtGrunt", "../assets/audio/fx/boomboy/hurt-grunt.mp3");
        this.load.audio("hurtFinal", "../assets/audio/fx/boomboy/hit-gruntfinal.mp3");
        this.load.audio("hurtAlert", "../assets/audio/fx/boomboy/hurt_alert.mp3");

        this.load.audio("track1", "../assets/audio/music/track1.mp3");
        this.load.audio("youdied", "../assets/audio/music/gameover.mp3");
        this.load.audio("youdidntdieinvain", "../assets/audio/music/goodjob.mp3");

        this.load.audio("thatsnice", "../assets/audio/fx/thatsnice.mp3");
        this.load.audio("thatsrough", "../assets/audio/fx/thatsrough.mp3");
        this.load.audio("uptick", "../assets/audio/fx/uptick.mp3");
    }

    // ----------------------------------------------------------------------------------------------------------------------------------
    // Here is where preloaded assets are actually turned into game objects and used for the game. 
    create() {
        // User Data
        this.user = getCurrentUser();
        this.userList = getAllUsers();

        // --------------------------- BACKGROUND ---------------------------
        this.add.image(game.config.width / 2, game.config.height / 2, "sky");

        this.cloudlow = this.add.tileSprite(0, game.config.height / 2, game.config.width, game.config.height, "cloud-low").setOrigin(0, 0.5);
        this.cloudmid = this.add.tileSprite(0, game.config.height / 2, game.config.width, game.config.height, "cloud-mid").setOrigin(0, 0.5);
        this.cloudtop = this.add.tileSprite(0, game.config.height / 2, game.config.width, game.config.height, "cloud-top").setOrigin(0, 0.5);


        this.add.image(game.config.width / 2, game.config.height / 2, "forest-tile-back");
        this.forestlow = this.add.tileSprite(0, game.config.height / 2 + 4, game.config.width, game.config.height, "forest-tile-low").setOrigin(0, 0.5);
        this.forestmid = this.add.tileSprite(0, game.config.height / 2 + 4, game.config.width, game.config.height, "forest-tile-mid").setOrigin(0, 0.5);
        this.foresttop = this.add.tileSprite(0, game.config.height / 2 + 4, game.config.width, game.config.height, "forest-tile-top").setOrigin(0, 0.5);

        this.foliage = this.add.tileSprite(0, 642, game.config.width, 40, "foliage").setOrigin(0, 0.5);

        // --------------------------- BACKGROUND END ---------------------------

        // --------------------------- Ground ---------------------------                
        this.groundGroup = this.add.group({
            removeCallback: function (ground) {
                ground.scene.groundPool.add(ground)
            }
        })

        this.groundPool = this.add.group({
            removeCallback: function (ground) {
                ground.scene.groundGroup.add(ground)
            }
        });

        // Start with three ground pieces 
        if (this.groundGroup.getLength() == 0) {
            this.addGround(0);
            this.addGround(game.config.width - 100);
            this.addGround(game.config.width * 2 - 100);
        }

        // --------------------------- GROUND END ---------------------------
        // --------------------------- ANIMATIONS ---------------------------
        // This if statement was my quickest solution to animation manager already having key and throwing errors
        // The proper solution is to create a preload scene(class) that loads assets and creates animations right at the start. 
        if (!this.anims.exists("run")) {
            this.anims.create({
                key: "run",
                frames: this.anims.generateFrameNames("boomboy", { prefix: "run", end: 9, zeroPad: 2 }),
                frameRate: 12,
                repeat: -1
            });

            this.anims.create({
                key: "jump",
                frames: this.anims.generateFrameNames("boomboy", { prefix: "jump", end: 4, zeroPad: 2 }),
                frameRate: 12,
                repeat: 0
            });

            this.anims.create({
                key: "slide",
                frames: this.anims.generateFrameNames("boomboy", { prefix: "slide", end: 2, zeroPad: 2 }),
                frameRate: 12,
                repeat: -1
            });

            this.anims.create({
                key: "shoot",
                frames: this.anims.generateFrameNames("boomboy", { prefix: "shoot", end: 5, zeroPad: 2 }),
                frameRate: 20,
                repeat: 0
            });

            this.anims.create({
                key: "jumpshot",
                frames: this.anims.generateFrameNames("boomboy", { prefix: "jumpshot", end: 5, zeroPad: 2 }),
                frameRate: 20,
                repeat: 0
            });

            this.anims.create({
                key: "hit",
                frames: this.anims.generateFrameNames("boomboy", { prefix: "hit", end: 3, zeroPad: 2 }),
                frameRate: 20,
                repeat: 1
            });

            this.anims.create({
                key: "ko",
                frames: this.anims.generateFrameNames("boomboy", { prefix: "ko", end: 3, zeroPad: 2 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: "wolfrun",
                frames: this.anims.generateFrameNames("wolf", { prefix: "wolf", end: 3, zeroPad: 2 }),
                frameRate: 12,
                repeat: -1
            });

            this.anims.create({
                key: "frog",
                frames: this.anims.generateFrameNames("frog", { prefix: "frog", start: 1, end: 4, zeroPad: 2 }),
                frameRate: 24,
                repeat: 0
            });

            this.anims.create({
                key: "frogStand",
                frames: [
                    { key: "frog", frame: "frog00" }
                ]
            });

            this.anims.create({
                key: "monkey",
                frames: this.anims.generateFrameNames("monkey", { prefix: "monkey", end: 7, zeroPad: 2 }),
                frameRate: 12,
                repeat: -1
            })
        }

        // --------------------------- ANIMATIONS END --------------------------- 

        // --------------------------- BOOMBOY ---------------------------
        // ---- boomboy main
        this.boomboy = this.physics.add.sprite(gameOptions.boomboyStartingPositionX, gameOptions.boomboyStartingPositionY, "boomboy").setScale(2); //Creates the sprite with starting position and asset
        this.boomboy.setGravityY(gameOptions.boomboyGravity);
        this.boomboy.setBodySize(28, 35);
        this.boomboy.setDepth(0.1); // Boomboy above ground fix (Layering)
        // ----
        // - projectiles
        // FOR ALL ITEMS IN GROUPS AND POOLS IN THIS GAME, THEY AUTOMATICALLY SWAP TO THE OTHER UPON REMOVAL
        this.beams = this.add.group({
            removeCallback: function (beam) {
                beam.scene.beamPool.add(beam); // <---- here
            }
        });

        this.beamPool = this.add.group({
            removeCallback: function (beam) {
                beam.scene.beams.add(beam); // <---- and here
            }
        });
        //- projectiles end
        // ---- boomboy main end

        // ---- collisions
        this.physics.add.collider(this.boomboy, this.groundGroup, function () {
            if (!this.boomboy.anims.isPlaying) {
                this.boomboy.setBodySize(28, 35);
            }

        }, null, this);

        // Boomboy falling through platform after jumping. (I think the y velocity is persisting or gravity is heavy) so I have to reset his position and hitbox.
        // Some slide collision as well
        this.physics.add.overlap(this.boomboy, this.groundGroup, function () {
            this.boomboy.y = gameOptions.boomboyStartingPositionY;
            this.boomboy.setBodySize(28, 35);
        }, null, this);
        // ---- collisions end

        // ---- controls
        // create key listeners
        this.w_key = this.input.keyboard.addKey("W");
        this.s_key = this.input.keyboard.addKey("S");
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        // Shooting placed in the create() function due to update() function's continuous reading per frame. I only want beam to fire once per key press. 
        // Putting this logic in the update function COMPLICATES things. 
        this.cursorKeys.right.on("down", function () {
            if( this.state == 0){
                if (this.boomboy.body.touching.down) {
                    this.boomboy.setBodySize(28, 35);
                    this.boomboy.anims.play("shoot");
                    this.shootSound.play();
                    this.slideSound.stop();
                    this.fireBeam(this.boomboy.y);
                }
                else if (this.boomboy.y < gameOptions.boomboyAnimJumpHeight + 25) { // only allow jumpshot if boomboy is above a certain height
                    this.boomboy.anims.play("jumpshot");
                    this.shootSound.play();
                    this.fireBeam(this.boomboy.y);
                }
            }

        }, this);
        // ---- controls end
        // ---- boomboy fx
        this.shootSound = this.sound.add("shootSound").setVolume(1.5);
        this.jumpSound = this.sound.add("jumpSound").setVolume(0.8);
        this.slideSound = this.sound.add("slideSound").setLoop(true).setRate(1.5).setVolume(1.2);
        this.beamHit = this.sound.add("beamHit").setVolume(1.2);
        this.hurtGrunt = this.sound.add("hurtGrunt").setVolume(0.7);
        this.hurtAlert = this.sound.add("hurtAlert").setVolume(1.5);
        this.hurtFinal = this.sound.add("hurtFinal").setVolume(0.7);

        // slidesound fix (it kept playing if dying while sliding) starts at beginning of game. 
        this.slideFix = this.time.addEvent({
            delay: 0,
            startAt: 0,
            callback: function () { this.sound.stopAll(); }, //track 1 is causing the issue?
            callbackScope: this,
            repeat: 0
        })
        // --------------------------- BOOMBOY END ---------------------------

        // ---------------------------- DANGERS -----------------------------
        // ---- BIRD ----
        this.birdGroup = this.add.group({
            removeCallback: function (bird) {
                bird.scene.birdPool.add(bird);
            }
        });

        this.birdPool = this.add.group({
            removeCallback: function (bird) {
                bird.scene.birdGroup.add(bird);
            }
        });

        // Event timer for bird spawning. Consistent timing per bird, but different Y placement. 
        this.birdSpawns = this.time.addEvent({
            delay: 1500,
            callback: this.spawnBird,
            callbackScope: this,
            loop: true
        })

        this.physics.add.collider(this.beams, this.birdGroup, function (beam, bird) {
            beam.active = false;
            beam.visible = false;
            beam.body.enable = false;
            this.beams.remove(beam);
            bird.active = false;
            bird.visible = false;
            bird.body.enable = false;
            this.birdGroup.remove(bird);
            this.beamHit.play();
        }, null, this);

        this.physics.add.overlap(this.boomboy, this.birdGroup, function (boomboy, bird) {
            bird.active = false;
            bird.visible = false;
            bird.body.enable = false;
            this.birdGroup.remove(bird);

            this.takeDmg();
        }, null, this);

        // ---- WOLF ----
        this.wolf = this.physics.add.sprite(game.config.width + 100, gameOptions.boomboyStartingPositionY - 20, "wolf").setScale(3).setOrigin(0.5, 0);
        this.wolf.anims.play("wolfrun");
        this.wolf.setImmovable(true);

        // Wolf timer simply reactivates wolf. Position reset is handled through collision detections. 
        this.wolfTime = this.time.addEvent({
            delay: 5000,
            callback: function () {
                this.wolf.active = true;
                this.wolf.visible = true;
                this.wolf.body.enable = true;
                this.wolf.setVelocityX(-gameOptions.wolfSpeed);
            },
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(this.boomboy, this.wolf, function (boomboy, wolf) {
            wolf.setVelocityX(0);
            wolf.visible = false;
            wolf.body.enable = false;
            wolf.x = game.config.width + 100;
            wolf.y = gameOptions.boomboyStartingPositionY - 20;
            this.takeDmg();
        }, null, this);

        this.physics.add.collider(this.beams, this.wolf, function (beam, wolf) {
            beam.active = false;
            beam.visible = false;
            beam.body.enable = false;
            this.beams.remove(beam);
            wolf.setVelocityX(0);
            wolf.visible = false;
            wolf.body.enable = false;
            wolf.x = game.config.width + 100;
            wolf.y = gameOptions.boomboyStartingPositionY - 20;
            this.beamHit.play();
        }, null, this);

        // ---- FROG ----
        this.frog = this.physics.add.sprite(game.config.width + 100, gameOptions.boomboyStartingPositionY + 16, "frog").setScale(2).setOrigin(1, 0.5);
        this.frog.setImmovable(true);
        this.frog.setGravityY(1);
        this.frog.setBodySize(40, 25);
        this.frog.setDepth(0.1);
        this.frog.hearts = 2; // Frog HP variable

        // Same as wolf, but heart variable reset as well
        this.frogTime = this.time.addEvent({
            delay: 8000,
            callback: function () {
                this.frog.active = true;
                this.frog.visible = true;
                this.frog.body.enable = true;
                this.frog.hearts = 2;
            },
            callbackScope: this,
            loop: true
        });

        // This is some crazy logic I had to figure out. 
        this.physics.add.collider(this.frog, this.groundGroup, function () {
            this.frog.setGravityY(0);
            this.frog.setVelocityY(0);
            this.frog.anims.play("frogStand");
            this.frog.setBodySize(40, 20);
            this.frog.setVelocityX(-gameOptions.scrollSpeed); // Frog Moves at same speed as ground when on ground. 
            this.frog.y = gameOptions.boomboyStartingPositionY + 25;

            // Auto Jump when frog is on ground. Delay, though. 
            this.time.addEvent({
                delay: 500,
                callback: function () {
                    this.frog.anims.play("frog");
                    this.frog.setGravityY(gameOptions.boomboyGravity);
                    this.frog.setVelocityY(-gameOptions.frogJump);
                    this.frog.setVelocityX(-gameOptions.frogSpeed); // Frog speed changes when jumping. (slight faster)
                },
                callbackScope: this,
                loop: false
            });
        }, null, this);

        this.physics.add.overlap(this.boomboy, this.frog, function (boomboy, frog) {
            frog.setVelocityX(0);
            frog.active = false;
            frog.visible = false;
            frog.body.enable = false;
            frog.x = game.config.width + 100;
            frog.y = gameOptions.boomboyStartingPositionY;
            this.takeDmg();
        }, null, this);

        this.physics.add.collider(this.beams, this.frog, function (beam, frog) {
            beam.active = false;
            beam.visible = false;
            beam.body.enable = false;
            this.beams.remove(beam);

            this.frog.hearts--; // Remove frog's hearts
            //When frog takes 2 hits, frog die
            if(this.frog.hearts == 0){
                frog.setVelocityX(0);
                frog.active = false;
                frog.visible = false;
                frog.body.enable = false;
                frog.x = game.config.width + 100;
                frog.y = gameOptions.boomboyStartingPositionY;
            }
            
            this.beamHit.play();
        }, null, this);

        //---- monkey
        this.monkey = this.physics.add.sprite(game.config.width + 100, game.config.height /2, "monkey").setScale(2);
        this.monkey.anims.play("monkey");
        this.monkey.setImmovable(true);
        this.monkey.active = false;
        this.monkey.visible = false;
        this.monkey.body.enable = false;
        this.monkey.setDepth(0.1);
        this.monkey.tracker = 0; // Just a state tracker so grabY isn't constantly changing. 
        this.monkey.grabY; // Capture boomboy's y position at a specific point in time (initialized in the update() func)

        this.monkeyTime = this.time.addEvent({
            delay: 10000,
            callback: function () {
                if(this.state == 0){ // Only run in playing state
                    this.monkey.setVelocityX(-gameOptions.monkeyspeedinit);
                    this.monkey.active = true;
                    this.monkey.visible = true;
                    this.monkey.body.enable = true;
                    this.monkey.tracker = 0; // Reset tracker state
                }
                
            },
            callbackScope: this,
            loop: true,
            startAt: 0
        });

        this.physics.add.collider(this.boomboy, this.monkey, function (boomboy, monkey) {
            monkey.setVelocityX(0);
            monkey.visible = false;
            monkey.active = false;
            monkey.body.enable = false;
            monkey.x = game.config.width + 100;
            monkey.y = game.config.height /2;
            this.takeDmg();
        }, null, this);

        this.physics.add.collider(this.beams, this.monkey, function (beam, monkey) {
            beam.active = false;
            beam.visible = false;
            beam.body.enable = false;
            this.beams.remove(beam);
            monkey.setVelocityX(0);
            monkey.visible = false;
            monkey.active = false;
            monkey.body.enable = false;
            monkey.x = game.config.width + 100;
            monkey.y = game.config.height /2;
            this.beamHit.play();
        }, null, this);

        this.physics.add.overlap(this.groundGroup, this.monkey, function (ground, monkey) {
            monkey.setVelocityX(0);
            monkey.visible = false;
            monkey.active = false;
            monkey.body.enable = false;
            monkey.x = game.config.width + 100;
            monkey.y = game.config.height /2;
        }, null, this);

        // --------------------------- DANGERS END ----------------------------

        // --------------------------- MUSIC ------------------------------

        this.track1 = this.sound.add("track1").setLoop(true).setVolume(1.0);

        this.time.addEvent({
            delay: 1500,
            callback: function () { this.track1.play() },
            callbackScope: this,
            repeat: 0
        });

        this.youdied = this.sound.add("youdied").setLoop(true).setVolume(1.0);
        this.youdidntdieinvain = this.sound.add("youdidntdieinvain").setLoop(true).setVolume(1.0);

        this.thatsnice = this.sound.add("thatsnice").setVolume(1.0);
        this.thatsrough = this.sound.add("thatsrough").setVolume(1.0);
        this.uptick = this.sound.add("uptick").setVolume(1.0);

        // ------------------------- MUSIC END ----------------------------

        // ------------------------- SYSTEM SCORING ------------------------
        this.scoreBox = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, "scoreHitBox"); //Invis hitbox that stretches height of game.
        this.scoreBox.setVelocityX(-gameOptions.scrollSpeed); // Set at beginning of game, and does not change with the increaseSpeeds() function. 
        this.scoreBox.setImmovable(true);

        this.score = 0; //Init at 0
        this.scoreText = this.add.text((game.config.width / 4.8), 18, "0", { fontSize: "32px", fill: "#2B3A67", fontFamily: "Outfit, sans-serif" }).setDepth(0.2).setOrigin(0.5,0);

        this.pb = this.user.score; //Set as user's personal best
        this.pbText = this.add.text((game.config.width / 2), 18, this.pb, { fontSize: "32px", fill: "#2B3A67", fontFamily: "Outfit, sans-serif" }).setDepth(0.2).setOrigin(0.5,0);

        this.highscore = Math.max(...this.userList.map(u => u.score || 0)); // Grab the largest .score value from user list. 
        this.hsText = this.add.text((game.config.width - (game.config.width / 4.8)), 18, this.highscore, { fontSize: "32px", fill: "#2B3A67", fontFamily: "Outfit, sans-serif" }).setDepth(0.2).setOrigin(0.5,0);

        // Score incrementer
        this.physics.add.overlap(this.boomboy, this.scoreBox, function (boomboy, box) {
            // Increment score
            this.score += 10;
            this.scoreText.setText(this.score);
            // Jump back to middle
            this.scoreBox.x = game.config.width / 2;
        }, null, this);

        //initial health bar (full)
        this.healthbar = this.add.image(game.config.width / 2, game.config.height - 35, "life-full").setDepth(0.1).setScale(0.8);
        // UI
        this.add.image(game.config.width / 2, game.config.height / 2, "uiflare").setDepth(0.2);
        // ------------------------ SYSTEM SCORING END ---------------------
    }

    // ----------------------------------------------------------------------------------------------------------------------------------
    // Update is a constant tracker/updater for the game. It essentially performs everything within every frame @ 60fps. 
    update() {
        this.boomboy.x = gameOptions.boomboyStartingPositionX; //Lock Boomboy to one X position

        
        //GAME OVER - NO HEALTH
        if (gameOptions.boomboyHearts == 0) { //this is being called EVERY FRAME when health is 0, so any code here will be spammed
            if(this.state == 0){ // So we have a state variable to couteract that.
                this.state = 1;
                this.slowDown();
            }
        }
        else if (this.state !== 2) { // Only run game if not in final game over state
            //I need the tiles to work during the slow down state. 
            this.cloudlow.tilePositionX += gameOptions.cloudSpeeds[0];
            this.cloudmid.tilePositionX += gameOptions.cloudSpeeds[1];
            this.cloudtop.tilePositionX += gameOptions.cloudSpeeds[2];

            this.forestlow.tilePositionX += gameOptions.forestSpeeds[0];
            this.forestmid.tilePositionX += gameOptions.forestSpeeds[1];
            this.foresttop.tilePositionX += gameOptions.forestSpeeds[2];
            this.foliage.tilePositionX += gameOptions.forestSpeeds[3];

            
            if(this.state === 0){ // Only run game if in playing state
                //Everything within this condition runs during actual playing of the game.

                //RUNNING (Should be constant whenever on the ground and not sliding)
                if (this.boomboy.body.touching.down && !this.boomboy.anims.isPlaying) {
                    // Check if boomboy is in air (fallback condition)
                    if (this.boomboy.y > gameOptions.boomboyAnimJumpHeight) {
                        // Stop slide sound persisting
                        if (this.slideSound.isPlaying) {
                            this.slideSound.stop();
                        }
                        this.boomboy.anims.play("run");
                    }
                }

                //JUMPING (Check if boomboy is currently on the ground first)
                if (this.boomboy.body.touching.down && this.w_key.isDown && this.boomboy.y >= gameOptions.boomboyStartingPositionY) {
                    this.boomboy.setVelocityY(-gameOptions.boomboyJumpForce);
                    this.boomboy.anims.play("jump");
                    this.jumpSound.play();
                }

                // Change hitbox size to correspond with jumping animation. Also helps with collision detection when landing on ground. 
                if (this.boomboy.y < gameOptions.boomboyAnimJumpHeight) {
                    this.boomboy.setBodySize(25, 45);
                }

                //SLIDE
                if (this.boomboy.anims.isPlaying) {
                    if (this.boomboy.anims.currentAnim.key != "hit") { //super condition so the hit animation will play
                        if (this.boomboy.body.touching.down && this.s_key.isDown && this.cursorKeys.right.isUp) {
                            this.boomboy.setBodySize(32, 16);

                            // ONLY play the animation if it"s not already the current one. Code similar to this is reapeated.
                            if (this.boomboy.anims.currentAnim.key !== "slide") {
                                this.boomboy.anims.play("slide");
                                if (!this.slideSound.isPlaying) {
                                    this.slideSound.play();
                                }

                            }
                        }
                    }
                }
                //Trigger on release of S key. So, S key MUST be held down to keep sliding
                if (this.boomboy.body.touching.down && this.s_key.isUp && this.boomboy.anims.currentAnim.key === "slide") {
                    this.boomboy.setBodySize(28, 35);
                    if (this.boomboy.anims.currentAnim.key !== "run") {
                        this.boomboy.anims.play("run");
                        this.slideSound.stop();
                    }
                }
                // ----------------------- Scoring ------------------------------------
                // Game gets progressively harder as score increases (When score is a multiple of 100, this can be changed to make the game harder/easier)
                if (this.score > 0 && this.score % 100 === 0 && gameOptions.scrollSpeed < gameOptions.maxSpeed) {
                    // Only increase speed on the frame where score hits multiple of 100 (stop increasing mutiple times within the same score)
                    if (gameOptions.lastSpeedIncreaseScore !== this.score) {
                        this.increaseSpeeds();
                        gameOptions.lastSpeedIncreaseScore = this.score;
                    }
                }
                // ----------------------- Scoring End ------------------------------------

                // ----------------------- Beam Tracking ----------------------------------
                let beamPos;
                this.beams.getChildren().forEach(function (beam) {
                    beamPos = beam.x + beam.displayWidth;

                    if (beamPos >= game.config.width) { //checks if beam has made it to offscreen
                        this.beams.remove(beam);
                        beam.active = false;
                        beam.visible = false;
                        beam.body.enable = false;
                    }
                }, this);

                // --------------------- Bird Tracking -----------------------------------
                let birdPos;
                this.birdGroup.getChildren().forEach(function (bird) {
                    birdPos = bird.x + bird.displayWidth;

                    if (birdPos <= 0) {
                        this.birdGroup.remove(bird);
                        bird.active = false;
                        bird.visible = false;
                        bird.body.enable = false;
                    }
                }, this);

                // --------------------- wolf Tracking -----------------------------------
                let wolfPos;
                wolfPos = this.wolf.x + this.wolf.displayWidth;

                if (wolfPos <= 0) {
                    this.wolf.setVelocityX(0);
                    this.wolf.visible = false;
                    this.wolf.body.enable = false;
                    this.wolf.x = game.config.width + 100;
                    this.wolf.y = gameOptions.boomboyStartingPositionY - 20;
                }

                // ------------------- FROG TRACKING -----------------------------
                let frogPos;
                frogPos = this.frog.x + this.frog.displayWidth;

                if (frogPos <= 0) {
                    this.frog.setVelocityX(0);
                    this.frog.active = false;
                    this.frog.visible = false;
                    this.frog.body.enable = false;
                    this.frog.x = game.config.width + 100;
                    this.frog.y = gameOptions.boomboyStartingPositionY - 30;
                }
                // Frog size changes in air
                if (this.frog.y <= 600) {
                    this.frog.setBodySize(40, 40);
                }

                // ------------------- MONKEY TRACKING -----------------------------
                let monkeyPos;
                monkeyPos = this.monkey.x + this.monkey.displayWidth;

                if(this.monkey.active){
                    // If monkey offscreens
                    if (monkeyPos <= 0) {
                        this.monkey.setVelocityX(0);
                        this.monkey.active = false;
                        this.monkey.visible = false;
                        this.monkey.body.enable = false;
                        this.monkey.x = game.config.width + 100;
                        this.monkey.y = game.config.height /2;
                    } 
                    // When monkey reaches middle of screen, swing to boomboy last y position before monkey reached middle of screen
                    else if (monkeyPos > 0 && monkeyPos <= game.config.width/2) {
                        this.monkey.tracker += 1;
                        if(this.monkey.tracker == 1){
                            this.monkey.grabY = this.boomboy.y; // Should only run once per monkey spawn due to tracker condition (lock on to boomboy y position frame when monkey reaches middle of screen)
                        }
                        // Move monkey Y position to match saved boomboy Y position
                        else if(this.monkey.y !== this.monkey.grabY){
                            this.monkey.setVelocityX(-gameOptions.monkeyspeedleap);
                            if(this.monkey.y < this.monkey.grabY){
                                this.monkey.y += 8; // just played around with values and 8 seemed right
                            }
                            else if(this.monkey.y > this.monkey.grabY){ // this actually always runs as well, making monkey wiggle at ~grabY
                                this.monkey.y -= 8;
                            }
                        }
                    }
                }
                
        
        
            }
        }

        // Ground generation and management. Outside of state check as ground must continue to generate in slow down state
            // 1. Find the rightmost ground
            let rightmostX = 0; //arbritrary low value to start; reset for each update
            this.groundGroup.getChildren().forEach(function (ground) {
                // Update rightmostX to position of ground"s rightmost Edge (aligned with right edge)
                rightmostX = ground.x + ground.displayWidth;
                // Check if ground has moved off screen to the left
                if (rightmostX <= 0) {
                    // Disable and move to pool
                    this.groundGroup.remove(ground);
                    ground.active = false;
                    ground.visible = false;
                    ground.body.enable = false;
                }
            }, this);

            // 2. Spawn new ground when needed
            // Add small buffer (50px) to prevent visible gaps
            if (rightmostX < game.config.width + 100) {
                this.addGround(game.config.width);
            }




    }
    // ----------------------------------------------------------------------------------------------------------------------------------
};

//Main Menu Scene. Simply move on to the game when button press. 
// Wanted to add options menu for audio and stuff. 
class StartGame extends Phaser.Scene {
    constructor() {
        super({ key: "StartGame" });
    }

    //the code runs instantly instead of waiting for the delay so I have to do this, for some reason
    //I have no clue why it is any different but phaser treats it differently
    next() {
        if (this.times.getElapsed() == 2000) {
            this.scene.start("PlayGame");
        }
    }

    // Each scene has its own preload, create, and update functions. 
    preload() {
        this.load.image("menuArt", "../assets/images/menu.png");
        this.load.image("logoShadow", "../assets/images/boomboytitle-shadow.png");
        this.load.image("logo", "../assets/images/boomboytitle.png");
        this.load.image("playButtonDown", "../assets/sprites/playbuttondown.png");
        this.load.image("playButtonUp", "../assets/sprites/playbuttonup.png");

        //menu music
        this.load.audio("menuMusic", "../assets/audio/music/menu.mp3");
        this.load.audio("buttonPress", "../assets/audio/fx/buttonpress.mp3");
        this.load.audio("buttonChime", "../assets/audio/fx/buttonchime.mp3");
    }

    create() {
        this.add.image(0, 0, "menuArt").setOrigin(0, 0);
        this.add.image((game.config.width / 3) * 2 + 10, (game.config.height / 4) + 10, "logoShadow").setOrigin(0.25, 0.5);
        this.add.image((game.config.width / 3) * 2, (game.config.height / 4), "logo").setOrigin(0.25, 0.5);
        this.buttonDown = this.add.sprite((game.config.width / 3) * 2, (game.config.height / 2), "playButtonDown").setOrigin(0, 0);
        this.buttonUp = this.add.sprite((game.config.width / 3) * 2, (game.config.height / 2), "playButtonUp").setOrigin(0, 0).setInteractive();
        this.menuMusic = this.sound.add("menuMusic").setLoop(true);
        this.buttonPress = this.sound.add("buttonPress");
        this.buttonChime = this.sound.add("buttonChime");

        this.time.addEvent({
            delay: 1000,
            callback: function () { this.menuMusic.play() },
            callbackScope: this,
            repeat: 0
        });

        this.buttonUp.on("pointerdown", () => {
            this.menuMusic.stop();
            this.buttonPress.play();
            this.buttonChime.play();
            this.buttonUp.active = false;
            this.buttonUp.visible = false;
            this.times = this.time.addEvent({
                delay: 2000,
                callback: this.next,
                callbackScope: this,
                repeat: 0
            });
        });

    }
}