Crafty.c("Player", {

    engine: {
        started: false,
        move: 'none',
        movespeed: 10,
        rotate: 'none'
    },

    weapon: {

        bullet: "BasicBullet",
        bulletspeed: 10,
        bulletcolor: "orange",

        firerate: 10,

        overheated: false,
    },

    init: function () {
        this.addComponent("2D, Canvas, Color, Twoway, Collision");

        this._playerId = new Date().getTime();
        this._sessionId = new Date().getTime();

        this.isActive = true;

        this.w = 16;
        this.h = 16;
        this.z = 10;
        this.rotation = 0;

        this.isShooting = false;

        Crafty.audio.add(this.audioFiles.ENGINE_IDLE(), "asset/sound/engine/090913-009.mp3");
        Crafty.audio.add(this.audioFiles.ENGINE(), "asset/sound/engine/090913-002.mp3");
        Crafty.audio.add(this.audioFiles.SHOOT(), "asset/sound/shoot/shoot003.mp3");
        Crafty.audio.add(this.audioFiles.SHOOT3(), "asset/sound/shoot/shoot002.mp3");
        Crafty.audio.add(this.audioFiles.EXPLODE(), "asset/sound/explode.mp3");

        this.insideBoard = function (newX, newY) {
            return newX >= 0 && newX <= Crafty.viewport.width && newY >= 0 && newY <= Crafty.viewport.height
        };

        this.bind("EnterFrame", function (frame) {

            if (frame.frame % 10 == 0) {
                if (this.isShooting) {
                    this.shoot();
                }
            }

            if (this.engine.rotate == 'right') {
                this.rotation += 3;
            }

            if (this.engine.rotate == 'left') {
                this.rotation -= 3;
            }

            if (this.engine.move == 'forward') {
                newX = this.x + this.engine.movespeed * Math.cos(this.rotation * Math.PI / 180);
                newY = this.y + this.engine.movespeed * Math.sin(this.rotation * Math.PI / 180);
                if (this.insideBoard(newX, newY)) this.place(newX, newY);
            }
            else if (this.engine.move == 'backward') {
                newX = this.x - this.engine.movespeed * Math.cos(this.rotation * Math.PI / 180);
                newY = this.y - this.engine.movespeed * Math.sin(this.rotation * Math.PI / 180);
                if (this.insideBoard(newX, newY)) this.place(newX, newY);
            }
        });
    },

    reset: function () {
        this.isActive = true;

        this.x = Crafty.viewport.width / 2 - this.w / 2;
        this.y = 36;
        this.rotation = 90;

        this.stopEngine();

        return this;
    },

    die: function () {
        Crafty.e("DieExplosion").attr({
            x: this.x - 60,
            y: this.y - 40
        });

        this.isActive = false;
        this.z = -1;
        this.x = 1000000;
        this.y = 1000000;

        this.stopEngine()

        return this;
    },

    respawn: function () {
        this.reset();

        return this;
    },

    place: function (x, y, r) {
        this.x = x;
        this.y = y;

        if (r != undefined)
            this.rotation = r;

        return this;
    },

    addWeapon: function (type) {
        this.origin('center');

        if (type == 'rifle') {
            var rifle = Crafty.e("2D, Canvas, Color").attr({ x: 16, y: 5, w: 8, h: 5, z: 10 }).color('red');
            this.attach(rifle);
        }

        return this;
    },

    setName: function (name) {
        this.name = name;
        return this;
    },

    showName: function (name) {
        this.attach(Crafty.e("2D, DOM, Text").attr({ x: this.x, y: this.y + 20 }).text(this.name).textColor('black').textFont({ size: '11px', weight: 'bold' }));
        return this;
    },

    startEngine: function () {
        this.engine.started = true;
        this.engine.move = 'none';
        this.engine.rotate = 'none';

        Crafty.audio.stop(this.audioFiles.ENGINE_IDLE());
        Crafty.audio.play(this.audioFiles.ENGINE_IDLE(), -1, 0.5);

        return this;
    },

    stopEngine: function () {
        this.engine.started = false;
        this.engine.move = 'none';
        this.engine.rotate = 'none';

        Crafty.audio.stop(this.audioFiles.ENGINE());
        Crafty.audio.stop(this.audioFiles.ENGINE_IDLE());

        return this;
    },

    toggleEngine: function () {
        if (!this.engine.started) this.startEngine(); else this.stopEngine();
    },

    movePlayer: function (direction) {

        if (!this.engine.started) {
            return;
        }

        console.log(direction);

        Crafty.audio.stop(this.audioFiles.ENGINE());
        Crafty.audio.stop(this.audioFiles.ENGINE_IDLE());

        if (direction == "stopMovement") {
            this.engine.move = 'none';
            Crafty.audio.play(this.audioFiles.ENGINE_IDLE(), -1);
        } else if (direction == "forward") {
            this.engine.move = 'forward';
            Crafty.audio.play(this.audioFiles.ENGINE(), -1);
        } else if (direction == "backward") {
            this.engine.move = 'backward';
            Crafty.audio.play(this.audioFiles.ENGINE(), -1);
        }
    },

    rotatePlayer: function (direction) {

        console.log(direction);

        if (direction == "stopRotate") {
            this.engine.rotate = 'none';
        }
        else if (direction == "right") {
            this.engine.rotate = 'right';
        }
        else if (direction == "left") {
            this.engine.rotate = 'left';
        }
    },

    startShoot: function (shooter) {
        this.isShooting = true;
    },

    stopShoot: function () {
        this.isShooting = false;
    },

    shoot: function () {
        Crafty.audio.stop(this.audioFiles.SHOOT());
        Crafty.audio.play(this.audioFiles.SHOOT());

        var bullet = Crafty.e(this.weapon.bullet).color(this.weapon.bulletcolor);

        bullet.attr({
            ownerId: this._playerId,
            x: this.x,
            y: this.y + 4,
            rotation: this.rotation,
            xspeed: this.weapon.bulletspeed * Math.cos(this.rotation * Math.PI / 180),
            yspeed: this.weapon.bulletspeed * Math.sin(this.rotation * Math.PI / 180)
        });

    },

    shoot3: function () {
        Crafty.audio.stop(this.audioFiles.SHOOT3());
        Crafty.audio.play(this.audioFiles.SHOOT3());

        Crafty.e(this.weapon.bullet).color(this.weapon.bulletcolor)
            .attr({
                ownerId: this._playerId,
                x: this.x,
                y: this.y,
                rotation: this.rotation,
                xspeed: this.weapon.bulletspeed * Math.cos(this.rotation * Math.PI / 180),
                yspeed: this.weapon.bulletspeed * Math.sin(this.rotation * Math.PI / 180)
            });

        Crafty.e(this.weapon.bullet).color(this.weapon.bulletcolor)
            .attr({
                ownerId: this._playerId,
                x: this.x + 10,
                y: this.y,
                rotation: this.rotation + 45,
                xspeed: this.weapon.bulletspeed * Math.cos((this.rotation + 45) * Math.PI / 180),
                yspeed: this.weapon.bulletspeed * Math.sin((this.rotation + 45) * Math.PI / 180)
            });

        Crafty.e(this.weapon.bullet).color(this.weapon.bulletcolor)
            .attr({
                ownerId: this._playerId,
                x: this.x + 50,
                y: this.y,
                rotation: this.rotation - 45,
                xspeed: this.weapon.bulletspeed * Math.cos((this.rotation - 45) * Math.PI / 180),
                yspeed: this.weapon.bulletspeed * Math.sin((this.rotation - 45) * Math.PI / 180)
            });
    },

    audioFiles: {
        ENGINE: function () { return "engine_" + this._sessionId; },
        ENGINE_IDLE: function () { return "engine-idle_" + this._sessionId; },
        SHOOT: function () { return "shoot_" + this._sessionId; },
        SHOOT3: function () { return "shoot3_" + this._sessionId; },
        EXPLODE: function () { return "explode"; },
    },
});

Crafty.c("MyPlayer", {

    init: function () {

        this.addComponent("Player");

        this.socket = null;

        this.onSocketBinded = function (socket) {
            var that = this;

            this.checkHits('Bullet').bind("HitOn", function (hitData) {
                var bulletOwnerId = hitData[0].obj.ownerId;
                if (this._playerId != bulletOwnerId) {
                    this.socket.emit("die", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                    this.die();
                }
            });
        }

        this.bind('KeyDown', function (e) {

            var that = this;

            if (e.key == Crafty.keys.HOME && !this.isActive) {
                this.respawn();
                this.socket.emit("respawn", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
            };

            if (!this.isActive) {
                return false;
            }

            if (e.key == Crafty.keys.E) {
                if (!this.engine.started) {
                    this.socket.emit("engine-on", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                    this.startEngine();
                } else {
                    this.socket.emit("engine-off", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                    this.stopEngine();
                }
            } else if (e.key == Crafty.keys.ESC) {
                this.die();
            } else if (e.key == Crafty.keys.LEFT_ARROW) {
                this.socket.emit("rotate-left", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                this.rotatePlayer("left");
            } else if (e.key == Crafty.keys.RIGHT_ARROW) {
                this.rotatePlayer("right");
                this.socket.emit("rotate-right", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
            } else if (e.key == Crafty.keys.UP_ARROW) {
                this.socket.emit("move-forward", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                this.movePlayer("forward");
            } else if (e.key == Crafty.keys.DOWN_ARROW) {
                this.socket.emit("move-backward", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                this.movePlayer("backward");
            } else if (e.key == Crafty.keys.SPACE) {
                this.socket.emit("start-shoot", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                this.startShoot();
            } else if (e.key == Crafty.keys.X) {
                this.shoot3();
            }
        });

        this.bind('KeyUp', function (e) {

            var that = this;

            if (!this.isActive) {
                return false;
            }

            if (e.key == Crafty.keys.LEFT_ARROW || e.key == Crafty.keys.RIGHT_ARROW) {
                this.socket.emit("stop-rotate", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                this.rotatePlayer("stopRotate");
            } else if (e.key == Crafty.keys.UP_ARROW || e.key == Crafty.keys.DOWN_ARROW) {
                this.socket.emit("stop-movement", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                this.movePlayer("stopMovement");
            } else if (e.key == Crafty.keys.SPACE) {
                this.socket.emit("stop-shoot", { x: that.x, y: that.y, rotation: that.rotation, id: that._playerId, playerId: this._playerId });
                this.stopShoot();
            }
        });
    },

    bindSocket: function (socketObject) {
        this.socket = socketObject;
        this.onSocketBinded(this.socket);
        return this;
    }

});

Crafty.c("OtherPlayer", {

    init: function () {
        this.addComponent("Player");

        this.socket = null;

        this.onSocketBinded = function (socket) {
            var that = this;

            socket.on("player-respawn", function (playerInfo) {
                console.log(that._playerId, that.name, "PLAYER-RESPAWN", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.respawn();
                }
            });

            socket.on("player-die", function (playerInfo) {
                console.log(that._playerId, that.name, "DIED", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.die();
                }
            });

            socket.on("player-engine-on", function (playerInfo) {
                console.log(that._playerId, that.name, "ENGINE-ON", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.startEngine();
                }
            });

            socket.on("player-engine-off", function (playerInfo) {
                console.log(that._playerId, that.name, "ENGINE-OFF", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.stopEngine();
                }
            });

            socket.on("player-move-forward", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.movePlayer("forward");
                }
            });

            socket.on("player-move-backward", function (playerInfo) {
                console.log(that._playerId, that.name, "MOVING-BACKWARD", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.movePlayer("backward");
                }
            });

            socket.on("player-stop-movement", function (playerInfo) {
                console.log(that._playerId, that.name, "STOP-MOVEMENT", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.movePlayer("stopMovement");
                }
            });

            socket.on("player-rotate-right", function (playerInfo) {
                console.log(that._playerId, that.name, "ROTATE-RIGHT", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.rotatePlayer("right");
                }
            });

            socket.on("player-rotate-left", function (playerInfo) {
                console.log(that._playerId, that.name, "ROTATE-LEFT", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.rotatePlayer("left");
                }
            });

            socket.on("player-rotate-stop", function (playerInfo) {
                console.log(that._playerId, that.name, "ROTATE-STOP", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.rotatePlayer("stopRotate");
                }
            });

            socket.on("player-start-shoot", function (playerInfo) {
                console.log(that._playerId, that.name, "PLAYER-START-SHOOT", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.startShoot();
                }
            });

            socket.on("player-stop-shoot", function (playerInfo) {
                console.log(that._playerId, that.name, "PLAYER-STOP-SHOOT", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.stopShoot();
                }
            });

            socket.on("player-shoot", function (playerInfo) {
                console.log(that._playerId, that.name, "PLAYER-SHOOT", playerInfo);
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.shoot();
                }
            });
        }
    },

    setId: function (id) {
        if (id !== undefined) {
            this._playerId = id;
        }
        return this;
    },

    bindSocket: function (socketObject) {
        this.socket = socketObject;
        this.onSocketBinded(this.socket);
        return this;
    }

});