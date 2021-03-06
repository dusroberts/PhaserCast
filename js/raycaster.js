/*
 HTML5 Raycaster Demo
 
 Just playing around with the canvas.
 Very basic raycasting engine with texture mapping support.
 Feel free to use for whatever you need it for.
 
 Version: 0.3
 Author: Ruud van Falier
 Thanks to: James Abley (https://github.com/jabley) for removing jQuery dependency
 
 ruud@dottech.nl
 http://www.dottech.nl
 */

//var raycaster = function()
//{
//

var game = new Phaser.Game(640, 420, Phaser.CANVAS, 'container',
        {preload: preload, create: create, update: update,
            render: render});

var debug = document.getElementById('debug');
var bmd;
var arrowRight;
var toggleMap = false;
var right = left = up = down = false;//arrow images on screen
var spriteMap;
var stone;
var mapper;
var layer;
var mapArray = [];
var barrel;
var player;
var dot=[];




function preload() {

    game.load.image('arrowRight', 'img/arrowRight.png');
    game.load.image('stones', 'img/redbrick.png');
    game.load.image('stone1', 'img/bluestone.png');
    game.load.image('barrel', 'img/barrel.png');
    game.load.image('player','img/character.png');
    game.load.image('dot','img/dot.png');
    game.load.image('dot64','img/dot64.png');
    game.load.tilemap('walls', 'level/smalltest.json', null, Phaser.Tilemap.TILED_JSON);
    //  game.load.tilemap('walls','level/walls.csv', null, Phaser.Tilemap.CSV);
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;


}

function create() {
game.physics.startSystem(Phaser.Physics.ARCADE);
   
    bmd = game.add.bitmapData(640, 320);
    game.add.sprite(0, 0, bmd);
    stone = game.add.sprite(-100, 0, 'stones');
    barrel = game.add.sprite(-100,0,'barrel');    
    playerSprite = game.add.sprite(-100,0,'player');
    game.physics.enable(playerSprite,Phaser.Physics.ARCADE);
    constants.images = [
        //pass null first as 0 position is not a wall
        null,
        stone.key,
        'barrel'
       
    ];


    mapper = game.add.tilemap('walls', 64, 64);
    mapper.addTilesetImage('dot64', 'dot64');
    mapper.setCollisionBetween(0,2);
 /*  layer = mapper.createLayer('Tile Layer 1');
  layer.resizeWorld();
  layer.debug = true;
  game.physics.p2.convertTilemap(mapper,layer);
  
    game.physics.p2.enable(playerSprite);
  */
    //take our json tilemap and parse out the x and y for the raycast to use
    var mapLength = mapper.layers[0].data.length;
    var mapWidth = mapper.layers[0].data[0].length;
    var array = [];
    for (var y = 0; y < mapLength; y++) {
        array[y] = [];
        mapArray[y] = [];
        for (var x = 0; x < mapWidth; x++) {
            array[y][x] = mapper.layers[0].data[y][x].index;
            if (array[y][x] < 0) {
                array[y][x] = 0;
            }

            mapArray[y].push(array[y][x]);
            
        }
    }

    init();
    arrows();
    // debug.innerHTML= text ;
 for (var y = 0; y < objects.walls.length; y++) {
            dot[y]=[];
            for (var x = 0; x < objects.walls[0].length; x++) {
                dot[y][x] = game.add.sprite(-100,0,'dot64');
                game.physics.enable(dot[y][x],Phaser.Physics.ARCADE);
            }
        }
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN]);
}
function update() {
 for (var y = 0; y < objects.walls.length; y++) {
           
            for (var x = 0; x < objects.walls[0].length; x++) {
                game.physics.arcade.collide(playerSprite,dot[y][x],change,null,this);
            }
        }
    if (game.input.keyboard.justPressed(Phaser.Keyboard.M, 10)) {
        setMapToggle();
    }

    if ((game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) || left)
    {
        movement.update("left");
    }
    else if ((game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) || right)
    {
        movement.update("right");
    }
    else if ((game.input.keyboard.isDown(Phaser.Keyboard.UP)) || up)
    {
        movement.update("up");
    } else if ((game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) || down)
    {
        movement.update("down");
    }


    // debug.innerHTML=  Object.getOwnPropertyNames(mapper.layers[0].data[1][0]) ;     
    // console.log(mapper);
}


function render() {

}

function change(){
    playerSprite.width = 50;
}


function mapToggle() {
    if (toggleMap === true) {
        return true;
    } else {
        return false;
    }

}

function setMapToggle() {
    if (toggleMap === true) {
        playerSprite.kill();
        toggleMap = false;
    } else {
        playerSprite.revive();
        toggleMap = true;
    }
}

// Game constants
var constants =
        {
            mapBlockSize: 5, // Size of walls on the mini map
            wallSize: 64, // Size of walls in the game world
            fieldOfView: 66, // Field of view of the player (in degrees)
            screenWidth: 640, // Width of the viewport
            screenHeight: 320, // Height of the viewport
            angleBetweenRays: parseFloat(66 / 640), // Angle between casted rays
            movementStep: 3, // How much the player moves each step 10
            turningStep: 2, // How fast the player turns 2.5
            distanceToViewport: 0,
            sprite: null,
            texturesFiles: [
                "img/bluestone.png",
                "img/stoneWall.png",
                "img/stoneWall2.png",
                "img/stoneWall2.png",
                "img/stoneWall3.png",
                "img/stoneWall3.png",
                "img/stoneWall3.png",
                "img/stoneWall3.png",
                "img/barrel.png"
            ],
            images: [
            ],
            sprites3d: []

        };

// Define classes / structures
var classes =
        {
            // Point on the screen or on the map
            point: function(x, y)
            {
                return {
                    x: x,
                    y: y
                };
            },
            // Defines a wall that is found during raycasting
            wall: function()
            {
                return {
                    x: 0, // X coordinate of this wall
                    y: 0, // Y coordinate of this wall
                    intersectsWithX: false, // Ray intersected on the X-axis?
                    intersectsWithY: false, // Ray intersected on the Y-axis?
                    distance: 0, // Distance to the wall
                    textureIndex: 0, // index of texture for this wall
                    textureX: 0             // X coordinate of the texture scanline to draw
                };
            },
            keyButton: function(code)
            {
                return {
                    code: code,
                    down: false
                };
            },
            // Represents an angle and implements some helpers to manipulate the angle
            angle: function(degrees)
            {
                var _degrees;

                var setValue = function(v) {
                    _degrees = parseFloat(v);

                    if (_degrees < 0) {
                        _degrees += 359;
                    }
                    else if (_degrees > 359) {
                        _degrees -= 360;
                    }
                };

                var getValue = function() {
                    return parseFloat(_degrees);
                };

                var toRadians = function() {
                    if (_degrees === 90) {
                        return Math.PI / 2;
                    }
                    else if (_degrees === 270) {
                        return 3 * Math.PI / 2;
                    }
                    return _degrees * (Math.PI / 180);
                };

                var turn = function(degrees) {
                    setValue(_degrees + degrees);
                };

                var facingNorth = function() {
                    return _degrees < 180 && _degrees > 0;
                };

                var facingSouth = function() {
                    return _degrees > 180 && _degrees <= 359;
                };

                var facingEast = function() {
                    return (_degrees < 90 && _degrees >= 0) || (_degrees > 270 && _degrees <= 359);
                };

                var facingWest = function() {
                    return _degrees > 90 && _degrees < 270;
                };

                setValue(degrees);

                // Reveal public members
                return {
                    setValue: setValue, // Set the value of this angle
                    getValue: getValue, // Get the value of this angle
                    turn: turn, // Turn the angle with n degrees
                    toRadians: toRadians, // Converts the angle from degrees to radians
                    facingNorth: facingNorth, // Does the angle face north?
                    facingSouth: facingSouth, // Does the angle face south?
                    facingEast: facingEast, // Does the angle face east?
                    facingWest: facingWest      // Does the angle face west?
                };
            }
        };

// Define objects used throughout the application 
var objects =
        {
            // Defines player values
            player:
                    {
                        x: 200,
                        y: 200,
                        angle: new classes.angle(290)
                    },
            centerOfScreen:
                    {
                        x: constants.screenWidth / 2,
                        y: constants.screenHeight / 2
                    },
            // Access the setting checkboxes
            settings:
                    {
                        renderTextures: function() {
                            return document.getElementById("chkTextures").checked;
                        },
                        renderLighting: function() {
                            return document.getElementById("chkLighting").checked;
                        },
                        renderShadow: function() {
                            return document.getElementById("chkShadow").checked;
                        }
                    },
             // Definition of the world map, uses phaser tilemap
            walls: mapArray,
          
           
           
            // Definition of keyboard buttons
            keys: {
                arrowLeft: new classes.keyButton(37),
                arrowUp: new classes.keyButton(38),
                arrowRight: new classes.keyButton(39),
                arrowDown: new classes.keyButton(40),
                esc: new classes.keyButton(27)
            },
            // Reference to the canvas context
            context: null,
            gameloopInterval: null,
            redrawScreen: true,
            // Array with Image objects containing the textures
            textures: null,
            // Loads the texture images in memory
            loadTextures: function()
            {
                objects.textures = new Array();

                for (var i = 0; i < constants.texturesFiles.length; i++) {
                    objects.textures[i] = new Image();
                    objects.textures[i].src = constants.texturesFiles[i];
                }
            }
        };



// Contains all functions related to rendering
var rendering = function()
{
    // Basic drawing functions
    var drawing =
            {
                // Clear the screen
                clear: function()
                {
                    objects.context.clearRect(0, 0, objects.context.canvas.width, objects.context.canvas.height);
                },
                // Get rgb() color string
                colorRgb: function(r, g, b)
                {
                    return "rgb(" + r + ", " + g + ", " + b + ")";
                },
                // Get rgba() color string
                colorRgba: function(r, g, b, a)
                {
                    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
                },
                // Draws a circle
                circle: function(x, y, radius, color)
                {
                    objects.context.beginPath();
                    objects.context.fillStyle = color;
                    objects.context.arc(x, y, radius, 0, Math.PI * 2, true);
                    objects.context.fill();
                    objects.context.closePath();
                },
                // Draws a square
                square: function(x, y, width, height, color)
                {
                    objects.context.beginPath();
                    objects.context.fillStyle = color;
                    objects.context.fillRect(x, y, width, height);
                    objects.context.closePath();
                },
                // Draws a line
                // Note: for some reason lineTo() and stroke() result in a semi-transparent line
                // If you want to be sure the line is of solid color, use lineSquare() instead
                line: function(x, y, x2, y2, color)
                {
                    objects.context.beginPath();
                    objects.context.moveTo(x, y);
                    objects.context.lineTo(x2, y2);
                    objects.context.strokeStyle = color;
                    objects.context.stroke();
                    objects.context.closePath();
                },
                lineSquare: function(x, y, x2, y2, color)
                {
                    drawing.square(x, y, 1, y2 - y, color);
                }
            };

    // Raycasting functions
    var raycasting = function()
    {
        // Converts world coordinates to map coordinates (array indexes)
        var coordsToMap = function(coordX, coordY)
        {
            return new classes.point(parseInt(coordX / constants.wallSize), parseInt(coordY / constants.wallSize));
        };

        // Determines if specified world coordinates are out of bounds
        var isOutOfBounds = function(coordX, coordY)
        {
            var mapPoint = coordsToMap(coordX, coordY);
            return mapPoint.y < 0 || mapPoint.y >= objects.walls.length
                    || mapPoint.x < 0 || mapPoint.x >= objects.walls[0].length;
        };

        // Determines wether specified world coordinates contains a wall
        var containsWall = function(coordX, coordY)
        {
            var mapPoint = coordsToMap(coordX, coordY);
            return !isOutOfBounds(coordX, coordY) && objects.walls[mapPoint.y][mapPoint.x] !== 0 &&
                    objects.walls[mapPoint.y][mapPoint.x] < 2;
        };
        
        var containsSprite = function(coordX, coordY)
        {
            var mapPoint = coordsToMap(coordX, coordY);
            return !isOutOfBounds(coordX, coordY) && objects.walls[mapPoint.y][mapPoint.x] >= 2;
        };

        // Choose the wall nearest to the player
        var chooseNearest = function(angle, wallX, wallY)
        {
            if (wallX !== null) {
                wallX.distance = Math.abs(Math.abs(objects.player.x - wallX.x) / Math.cos(angle.toRadians()));
            }

            if (wallY !== null) {
                wallY.distance = Math.abs(Math.abs(objects.player.x - wallY.x) / Math.cos(angle.toRadians()));
            }

            if (wallX === null) {
                return wallY;
            }
            else if (wallY === null) {
                return wallX;
            }

            return (wallX.distance < wallY.distance) ? wallX : wallY;
        };

        // Use raycasting to find the nearest wall at the specified angle
        var findWall = function(angle)
        {
            var angleTan = Math.tan(angle.toRadians()),
                    deltaX = constants.wallSize / angleTan,
                    deltaY = constants.wallSize * angleTan,
                    foundX = false,
                    foundY = false,
                    foundSpriteY = false,
                    foundSpriteX = false,
                    wallX = null,
                    wallY = null;

            if (angle.facingSouth()) {
                deltaX = -deltaX;
            }

            if (angle.facingEast()) {
                deltaY = -deltaY;
            }

            if (angle.facingNorth() || angle.facingSouth()) {
                while (wallX === null || (!foundX && !isOutOfBounds(wallX.x, wallX.y)&& !foundSpriteX)) {
                    if (wallX === null) {
                        wallX = new classes.wall();
                        wallX.intersectsWithX = true;
                        wallX.y = Math.floor(objects.player.y / constants.wallSize) * constants.wallSize;
                        wallX.y += angle.facingNorth() ? -0.001 : constants.wallSize;
                        wallX.x = objects.player.x + (objects.player.y - wallX.y) / angleTan;
                    }
                    else {
                        wallX.x = wallX.x + deltaX;
                        wallX.y += angle.facingNorth() ? -constants.wallSize : constants.wallSize;
                    }

                    foundX = containsWall(wallX.x, wallX.y);
                    foundSpriteX = containsSprite(wallX.x, wallX.y);
                }
            }

            if (angle.facingWest() || angle.facingEast()) {
                while (wallY === null || (!foundY && !isOutOfBounds(wallY.x, wallY.y)&& !foundSpriteY)) {
                    if (wallY === null) {
                        wallY = new classes.wall();
                        wallY.intersectsWithY = true;
                        wallY.x = Math.floor(objects.player.x / constants.wallSize) * constants.wallSize;
                        wallY.x += angle.facingWest() ? -0.001 : constants.wallSize;
                        wallY.y = objects.player.y + (objects.player.x - wallY.x) * angleTan;
                    }
                    else {
                        wallY.y = wallY.y + deltaY;
                        wallY.x += angle.facingWest() ? -constants.wallSize : constants.wallSize;
                    }

                    foundY = containsWall(wallY.x, wallY.y);
                    foundSpriteY = containsSprite(wallY.x, wallY.y);
                }
            }

            return chooseNearest(angle, wallX, wallY);
        };

        // Expose public members
        return {
            findWall: findWall
        };
    }();

    // Draw the mini map
    var drawMiniMap = function()
    {
        // Map is smaller than world, determine shrink factor
        var shrinkFactor = parseFloat(constants.wallSize / constants.mapBlockSize);

        var mapOffsetX = 10,
                mapOffsetY = 10;

        // Draw white background
        drawing.square(mapOffsetX, mapOffsetY,
                objects.walls[0].length * constants.mapBlockSize, objects.walls.length * constants.mapBlockSize,
                drawing.colorRgb(255, 255, 255));

        // Draw walls
        for (var y = 0; y < objects.walls.length; y++) {
            
            for (var x = 0; x < objects.walls[0].length; x++) {
             
                if (objects.walls[y][x] !== 0) {
                /*    dot[y][x].x=mapOffsetX + x * constants.mapBlockSize;
                    dot[y][x].y = mapOffsetY + y * constants.mapBlockSize;
                    dot[y][x].width = constants.mapBlockSize;
                    dot[y][x].height = constants.mapBlockSize; */
                    drawing.square(mapOffsetX + x * constants.mapBlockSize, mapOffsetY + y * constants.mapBlockSize,
                          constants.mapBlockSize, constants.mapBlockSize,
                           drawing.colorRgb(0, 0, 0));
                }
            }
        }

        // Draw player
        var playerX = mapOffsetX + Math.floor(objects.player.x / shrinkFactor),
                playerY = mapOffsetY + Math.floor(objects.player.y / shrinkFactor);
               //  playerSprite.x = playerX-4;
               //  playerSprite.y = playerY-4;
        drawing.circle(playerX, playerY, constants.mapBlockSize / 2, drawing.colorRgb(255, 0, 0));

        // Visualize the raycasting
        var angle = new classes.angle(objects.player.angle.getValue() + constants.fieldOfView / 2);
        for (var i = 0; i < constants.screenWidth; i++)
        {
            var wall = raycasting.findWall(angle),
                    deltaX = Math.floor(Math.cos(angle.toRadians()) * (wall.distance / shrinkFactor)),
                    deltaY = Math.floor(Math.sin(angle.toRadians()) * (wall.distance / shrinkFactor));

            drawing.line(playerX, playerY,
                    playerX + deltaX, playerY - deltaY, drawing.colorRgb(200, 200, 200));

            angle.turn(-constants.angleBetweenRays);
        }

    };

    // Draw 3D representation of the world
    var drawWorld = function()
    {
        drawing.clear();
        drawing.square(0, 0, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(60, 60, 60));
        drawing.square(0, constants.screenHeight / 2, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(120, 120, 120));

        var angle = new classes.angle(objects.player.angle.getValue() + constants.fieldOfView / 2);

        // Draw vertical scanlines for each 1px of the screen
        for (var i = 0; i < constants.screenWidth; i++)
        {
            var wall = raycasting.findWall(angle);

            // Remove distortion (counter fishbowl effect)
            var distortRemove = new classes.angle(constants.fieldOfView / 2);
            distortRemove.turn(-constants.angleBetweenRays * i);
            wall.distance *= Math.cos(distortRemove.toRadians());

            // Use distance to determine the size of the wall slice
            var wallHeight = Math.floor(constants.wallSize / wall.distance * constants.distanceToViewport);

            // If a wall slice is larger than the viewport height, we only need the visible section
            // skipPixels indicates how many pixels from top and bottom towards the center can be skipped during rendering
            var skipPixels = wallHeight > constants.screenHeight ? (wallHeight - constants.screenHeight) / 2 : 0,
                    scanlineStartY = parseInt(objects.centerOfScreen.y - (wallHeight - skipPixels * 2) / 2),
                    scanlineEndY = parseInt(objects.centerOfScreen.y + (wallHeight - skipPixels * 2) / 2);

            // Prevent the coordinates from being off screen
            scanlineStartY = scanlineStartY < 0 ? 0 : scanlineStartY;
            scanlineEndY = scanlineEndY > constants.screenHeight ? constants.screenHeight : scanlineEndY;

            if (objects.settings.renderTextures()) {
                // Determine which texture to use on this wall
                new classes.point(parseInt(wall.y / constants.wallSize), parseInt(wall.x / constants.wallSize));
               wall.textureIndex = objects.walls[parseInt(wall.y / constants.wallSize)][parseInt(wall.x / constants.wallSize)];
                wall.textureX = wall.intersectsWithX
                        ? parseInt(wall.x % constants.wallSize)
                        : parseInt(wall.y % constants.wallSize);

                // The visible scale of a wall compared to its original size
                var wallScale = wallHeight / constants.wallSize;

                var offsetY = (skipPixels > 0) ? skipPixels / wallScale : 0;
                if (offsetY >= constants.wallSize / 2) {
                    offsetY = constants.wallSize / 2 - 1;
                }


                var rect = new Phaser.Rectangle(wall.textureX, offsetY, 1, constants.wallSize - offsetY * 2);
                bmd.copyPixels2(constants.images[wall.textureIndex], rect, i, scanlineStartY, 1, scanlineEndY - scanlineStartY);

            }
            else {
                // Draw without textures
                drawing.lineSquare(i, scanlineStartY, i, scanlineEndY, drawing.colorRgb(128, 0, 0));
            }

            // Make one side of the walls darker to create a shadow effect
            // This is achieved by drawing a black scanline with 50% opacity
            if (objects.settings.renderShadow()) {
                if (wall.intersectsWithX) {
                    drawing.lineSquare(i, scanlineStartY, i, scanlineEndY, drawing.colorRgba(0, 0, 0, 0.5));
                }
            }

            // Make walls in the distance appear darker
            if (objects.settings.renderLighting()) {
                if (wall.distance > 100) {
                    var colorDivider = parseFloat(wall.distance / 200);
                    colorDivider = (colorDivider > 5) ? 5 : colorDivider;
                    var opacity = parseFloat(1 - 1 / colorDivider);

                    drawing.lineSquare(i, scanlineStartY, i, scanlineEndY, drawing.colorRgba(0, 0, 0, opacity));
                }
            }

            // Move on to next scanline
            angle.turn(-constants.angleBetweenRays);
        }
    };

 // Draw 3D representation of a sprite
    var drawSprite = function()
    {
        drawing.clear();
       // drawing.square(0, 0, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(60, 60, 60));
      //  drawing.square(0, constants.screenHeight / 2, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(120, 120, 120));

        var angle = new classes.angle(objects.player.angle.getValue() + constants.fieldOfView / 2);

        // Draw vertical scanlines for each 1px of the screen
        for (var i = 0; i < constants.screenWidth; i++)
        {
            var wall = raycasting.findWall(angle);

            // Remove distortion (counter fishbowl effect)
            var distortRemove = new classes.angle(constants.fieldOfView / 2);
            distortRemove.turn(-constants.angleBetweenRays * i);
            wall.distance *= Math.cos(distortRemove.toRadians());

            // Use distance to determine the size of the wall slice
            var wallHeight = Math.floor(constants.wallSize / wall.distance * constants.distanceToViewport);

            // If a wall slice is larger than the viewport height, we only need the visible section
            // skipPixels indicates how many pixels from top and bottom towards the center can be skipped during rendering
            var skipPixels = wallHeight > constants.screenHeight ? (wallHeight - constants.screenHeight) / 2 : 0,
                    scanlineStartY = parseInt(objects.centerOfScreen.y - (wallHeight - skipPixels * 2) / 2),
                    scanlineEndY = parseInt(objects.centerOfScreen.y + (wallHeight - skipPixels * 2) / 2);

            // Prevent the coordinates from being off screen
            scanlineStartY = scanlineStartY < 0 ? 0 : scanlineStartY;
            scanlineEndY = scanlineEndY > constants.screenHeight ? constants.screenHeight : scanlineEndY;

            if (objects.settings.renderTextures()) {
                // Determine which texture to use on this wall
                new classes.point(parseInt(wall.y / constants.wallSize), parseInt(wall.x / constants.wallSize));
                wall.textureIndex = objects.walls[parseInt(wall.y / constants.wallSize)][parseInt(wall.x / constants.wallSize)];
                wall.textureX = wall.intersectsWithX
                        ? parseInt(wall.x % constants.wallSize)
                        : parseInt(wall.y % constants.wallSize);

                // The visible scale of a wall compared to its original size
                var wallScale = wallHeight / constants.wallSize;

                var offsetY = (skipPixels > 0) ? skipPixels / wallScale : 0;
                if (offsetY >= constants.wallSize / 2) {
                    offsetY = constants.wallSize / 2 - 1;
                }


                var rect = new Phaser.Rectangle(wall.textureX, offsetY, 1, constants.wallSize - offsetY * 2);
                bmd.copyPixels2(constants.images[wall.textureIndex], rect, i, scanlineStartY, 1, scanlineEndY - scanlineStartY);

            }
            else {
                // Draw without textures
                drawing.lineSquare(i, scanlineStartY, i, scanlineEndY, drawing.colorRgb(128, 0, 0));
            }

            // Make one side of the walls darker to create a shadow effect
            // This is achieved by drawing a black scanline with 50% opacity
            if (objects.settings.renderShadow()) {
                if (wall.intersectsWithX) {
                    drawing.lineSquare(i, scanlineStartY, i, scanlineEndY, drawing.colorRgba(0, 0, 0, 0.5));
                }
            }

            // Make walls in the distance appear darker
            if (objects.settings.renderLighting()) {
                if (wall.distance > 100) {
                    var colorDivider = parseFloat(wall.distance / 200);
                    colorDivider = (colorDivider > 5) ? 5 : colorDivider;
                    var opacity = parseFloat(1 - 1 / colorDivider);

                    drawing.lineSquare(i, scanlineStartY, i, scanlineEndY, drawing.colorRgba(0, 0, 0, opacity));
                }
            }

            // Move on to next scanline
            angle.turn(-constants.angleBetweenRays);
        }
    };
    var redraw = function()
    {
        objects.redrawScreen = true;

    };

    // Execute all rendering tasks
    var update = function()
    {
        if (objects.redrawScreen) {
            drawWorld();
            //drawSprite();
            if (mapToggle()) {
                drawMiniMap();

            }
            // objects.redrawScreen = false;
        }
    };

    // Expose public members
    return {
        redraw: redraw,
        update: update
    };
}();

// Contains all movement related functions
var movement = function()
{
    var turn = function(angle)
    {
        objects.player.angle.turn(angle);
        rendering.redraw();
    };

    var walk = function(forward)
    {
        step = forward ? constants.movementStep : -constants.movementStep;

        var deltaX = Math.cos(objects.player.angle.toRadians()) * step,
                deltaY = Math.sin(objects.player.angle.toRadians()) * step,
                newMapX = parseInt((objects.player.x + deltaX) / constants.wallSize),
                newMapY = parseInt((objects.player.y - deltaY) / constants.wallSize);
        // the === 0 handles collision
        if (objects.walls[newMapY][newMapX] === 0) {
            objects.player.x += deltaX;
            objects.player.y -= deltaY;
        }

        rendering.redraw();
    };



    // Update movement
    var update = function(dir)
    {
        if (dir === "right") {
            turn(-constants.turningStep);
        }
        if (dir === "left") {
            turn(constants.turningStep);
        }

        if (dir === "up") {
            walk(true);
        }

        if (dir === "down") {
            walk(false);
        }

        if (objects.keys.esc.down) {
            clearInterval(objects.gameloopInterval);
        }
    };

    // Bind the arrow keydown events
    var init = function()
    {
        var keyDownHandler = function(e) {
            var keyCode = e.keyCode || e.which;

            for (var name in objects.keys) {
                if (objects.keys[name].code === keyCode) {
                    objects.keys[name].down = true;
                }
            }
        };

        var keyUpHandler = function(e) {
            var keyCode = e.keyCode || e.which;

            for (var name in objects.keys) {
                if (objects.keys[name].code === keyCode) {
                    objects.keys[name].down = false;
                }
            }
        };

        window.addEventListener('keydown', keyDownHandler, false);
        window.addEventListener('keyup', keyUpHandler, false);

        // Bind key icons for mobile support
        var keys = document.getElementsByClassName("keys");

        for (var i = 0, n = keys.length; i < n; ++i) {
            var key = keys[i];
            var keyCode = parseInt(key.getAttribute("data-code"), 0);
            (function(k, kc) {
                k.addEventListener("mousedown", function() {
                    keyDownHandler({keyCode: kc});
                    return false;
                }, false);
                k.addEventListener("mouseup", function() {
                    keyUpHandler({keyCode: kc});
                    return false;
                }, false);
            }(key, keyCode));
        }

        // Redraw when settings change
        document.getElementById("chkTextures").addEventListener('change', rendering.redraw);
        document.getElementById("chkLighting").addEventListener('change', rendering.redraw);
        document.getElementById("chkShadow").addEventListener('change', rendering.redraw);
    };

    return {
        init: init,
        update: update
    };
}();

// Initializes the raycaster application
var init = function()
{
    // Setup the canvas
    var canvas = bmd;

    //  var canvas = document.getElementById(canvasId);
    // objects.context = canvas.getContext("2d");
    objects.context = canvas.context;

    constants.distanceToViewport = Math.round(constants.screenWidth / 2 / Math.tan(constants.fieldOfView / 2 * (Math.PI / 180)));

    // Load texture files
    objects.loadTextures();

    // Bind keyboard events
    movement.init();

    // Start the gameloop
    objects.gameloopInterval = setInterval(function() {
        movement.update();
        rendering.update();
    }, 50);
};

function arrows() {
    arrowRight = game.add.button(72, 355, 'arrowRight');
    arrowRight.fixedToCamera = true;
    arrowRight.events.onInputDown.add(function() {
        right = true;
    });
    arrowRight.events.onInputUp.add(function() {
        right = false;
    });

    arrowLeft = game.add.button(5, 355, 'arrowRight');
    arrowLeft.fixedToCamera = true;
    arrowLeft.anchor.setTo(1, 1);
    arrowLeft.angle = 180;
    arrowLeft.events.onInputDown.add(function() {
        left = true;
    });
    arrowLeft.events.onInputUp.add(function() {
        left = false;
    });

    arrowUp = game.add.button(70, 320, 'arrowRight');
    arrowUp.fixedToCamera = true;
    arrowUp.anchor.setTo(1, 1);
    arrowUp.angle = 270;
    arrowUp.events.onInputDown.add(function() {
        up = true;
    });
    arrowUp.events.onInputUp.add(function() {
        up = false;
    });

    arrowDown = game.add.button(38, 420, 'arrowRight');
    arrowDown.fixedToCamera = true;
    arrowDown.anchor.setTo(1, 1);
    arrowDown.angle = 90;
    arrowDown.events.onInputDown.add(function() {
        down = true;
    });
    arrowDown.events.onInputUp.add(function() {
        down = false;
    });
}

