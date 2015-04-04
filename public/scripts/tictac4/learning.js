window.onload = function() {
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


    var renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    //console.log(renderer.domElement);
    document.body.appendChild(renderer.domElement);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshPhongMaterial({
        ambient: 0x030303,
        color: 0xFF0000,
        specular: 0xFF0000,
        shininess: 70,
        shading: THREE.FlatShading
    })
    var cube = new THREE.Mesh(geometry, material);

    var otherMaterial = new THREE.MeshLambertMaterial({
        ambient: 'dodgerblue',
        color: 'dodgerblue',
        specular: 'dodgerblue',
        reflectivity: 10,
        shading: THREE.FlatShading
    })
    var otherCube = new THREE.Mesh(geometry, otherMaterial);
    otherCube.position.x = 20;
    scene.add(otherCube);
    cube.position.z = 20;

    var cubePosition = {z: 20, y: 0, x: 0};
    var cubePositionArray = [cubePosition];

    var otherPosition = {z: 0, y: 0, x: 20};
    var otherCubePositionArray = [otherPosition];

    scene.add(cube);

    var light = new THREE.PointLight(0xFFFFFF, 1, 100);
    var backLight = new THREE.PointLight(0x9966FF, 1, 50);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(10, 15, 0);

    spotLight.castShadow = true;

    spotLight.target.position.x = 15;

    spotLight.shadowMapWidth = 1024;
    spotLight.shadowMapHeight = 1024;

    spotLight.shadowCameraNear = 500;
    spotLight.shadowCameraFar = 4000;
    spotLight.shadowCameraFov = 30;

    scene.add(spotLight);

    light.position.set(10, 10, 10);
    backLight.position.set(-15, -15, -15)
    scene.add(light);
    scene.add(backLight);


    camera.position.x = 10;


////////////////////////////////////////////////
//TIC TAC TOE
////////////////////////////////////////////////
    var projector;
    var mouse = {x: 0, y: 0, clicked: false};
    var selected;
    var renderWIDTH = window.innerWidth;
    var renderHEIGHT = window.innerHeight;
    var UNCLAIMED = 0;
    var RED = 1;
    var GREEN = 2;
    var currentMOVE = RED;
    var gameWON = false;
    var pos = [];
    var wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17],
        [18, 19, 20], [21, 22, 23], [24, 25, 26],
        [6, 15, 24], [7, 16, 25], [8, 17, 26], [3, 12, 21], [4, 13, 22], [5, 14, 23],
        [0, 9, 18], [1, 10, 19], [2, 11, 20],
        [18, 21, 24], [19, 22, 25], [20, 23, 26], [9, 12, 25], [10, 13, 16], [11, 14, 17],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [6, 16, 26], [8, 16, 24], [3, 13, 23], [5, 13, 21], [0, 10, 20], [2, 10, 18],
        [18, 22, 26], [20, 22, 24], [2, 14, 26], [8, 10, 20], [2, 4, 6], [0, 4, 8],
        [0, 12, 24], [6, 12, 18], [2, 13, 24], [6, 13, 20], [0, 13, 26], [8, 13, 18],
        [11, 13, 15], [9, 13, 17], [1, 13, 25], [7, 13, 19]
    ];
    var fourWin = [];//generated below

//var gameLight = new THREE.DirectionalLight(0xe0e0e0);
//gameLight.position.set(5,2,5).normalize();

//scene.add(gameLight);
    scene.add(new THREE.AmbientLight(0x101010));

    renderer.setSize(renderWIDTH, renderHEIGHT);


//the lines
//var base = new THREE.Geometry();
//for(var z=-1; z<1; z++){
//    base.vertices.push(
//        new THREE.Vector3(0, 0, z), new THREE.Vector3(3, 0, z),
//        new THREE.Vector3(0, 1, z), new THREE.Vector3(3, 1, z),
//        new THREE.Vector3(1, 2, z), new THREE.Vector3(1, -1, z),
//        new THREE.Vector3(2, 2, z), new THREE.Vector3(2, -1, z)
//    );
//}
//
//for(var x = 1; x < 3; x++){
//    base.vertices.push(
//        new THREE.Vector3(x, 1, 1), new THREE.Vector3(x, 1, -2),
//        new THREE.Vector3(x, 0, 1), new THREE.Vector3(x, 0, -2)
//    )
//}
//
//var cage = new THREE.Line(base, new THREE.LineBasicMaterial(), THREE.LinePieces);
//cage.position.set(-1.5, -.05,.05);


//the spheres
    var geo = new THREE.SphereGeometry(0.3, 25, 25);

    var range = [-1.5, 0, 1.5, 3];

    var idx = 0;

    range.forEach(function (x) {
        range.forEach(function (y) {
            range.forEach(function (z) {
                var tempS = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color: 'white'}))
                tempS.id = idx++;
                tempS.claim = UNCLAIMED;
                pos.push(tempS);
                tempS.position.set(x, y, z);
                scene.add(tempS);
            })
        })
    });

    function resetGame() {
        pos.forEach(function (position) {
            position.claim = UNCLAIMED;
            position.material.color.setHex(0xFFFFFF);
        })
        currentMOVE = ((currentMOVE == RED) ? GREEN : RED)
    }


    function countClaim(comb) {

        var redCount = 0;
        var greenCount = 0;

        comb.forEach(function (idx) {
            if (pos[idx].claim == RED) {
                redCount++;
            }
            if (pos[idx].claim == GREEN) {
                greenCount++;
            }
        });

        return {"red": redCount, "green": greenCount};
    }


    function checkWin(color) {
        var won = false;
        var breakEx = {};

        try {
            fourWin.forEach(function (winCombo) {
                var count = 0;
                winCombo.forEach(function (idx) {

                    if (pos[idx].claim === color) {
                        //console.log(pos[idx].claim, color)
                        count++;
                    }
                });
                if (count === 4) {
                    won = true;
                    throw breakEx
                }
            })
        }
        catch (ex) {
            if (ex != breakEx)throw ex;
        }
        return won;
    }


    function createPosition(posArray, obj) {
        function quickNewPosition() {
            return {
                z: Math.floor(Math.random() * (obj.zMax - obj.zMin) + obj.zMin),
                y: 0,
                x: Math.floor(Math.random() * (obj.xMax - obj.xMin) + obj.xMin)
            }
        }

        var newPosition = quickNewPosition();
        var unique = false;
        posArray.forEach(function (myPos) {
            if (myPos === newPosition || (Math.abs(myPos.z - newPosition.z) < 2 && Math.abs(myPos.x - newPosition.x) < 2)) {
                createPosition(posArray);
            }
            else {
                unique = true;
            }
        });
        if (unique) {
            //console.log("unique: ", newPosition);

            posArray.push(newPosition);
            //console.log(posArray);
            return newPosition
        }
    }


    function updateWin(color) {
        if (checkWin(color)) {
//        document.getElementById("status").innerHTML =
//            ((currentMOVE == RED) ? "RED won!!" : "GREEN won!!");

            if (currentMOVE === RED) {
                var pointRed = new THREE.Mesh(geometry, material);
                pointRed.position = createPosition(cubePositionArray, {zMin: 15, zMax: 30, xMin: -10, xMax: 10});
                scene.add(pointRed);
            }
            if (currentMOVE === GREEN) {
                var pointBlue = new THREE.Mesh(geometry, otherMaterial);
                pointBlue.position = createPosition(otherCubePositionArray, {zMin: -10, zMax: 10, xMin: 15, xMax: 30});
                scene.add(pointBlue);
            }
            gameWON = true;

        } else {
            currentMOVE = ((currentMOVE == RED) ? GREEN : RED);
//        document.getElementById("status").innerHTML =
//            ((currentMOVE == RED) ? "Move: RED" : "Move: GREEN");

        }

    }


    function updateControls() {
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        projector.unprojectVector(vector, camera);
        var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var hits = ray.intersectObjects(pos);

        if (mouse.clicked) {
            if (gameWON) {
                resetGame();
                gameWON = false;
                mouse.clicked = false;
                return;
            }
            if (hits.length > 0 && hits[0].object.claim === 0) {
                //console.log(hits[0].object);
                hits[0].object.material.color.setHex((currentMOVE == RED) ? 0xFF0000 : 0x0066FF);

                hits[0].object.claim = currentMOVE;
                updateWin(currentMOVE);
            }
            mouse.clicked = false;
        } else {//mousemove
            if (hits.length > 0) {
                if (hits[0].object != selected) {
                    if (selected && (selected.claim == UNCLAIMED)) {
                        selected.material.color.setHex(selected.currentHex);
                    }
                    selected = hits[0].object;
                    if (selected.claim == UNCLAIMED) {
                        selected.currentHex = selected.material.color.getHex();
                        selected.material.color.setHex(0xffd700);
                    }
                }
            } else {
                if ((selected) && (selected.claim == UNCLAIMED))
                    selected.material.color.setHex(selected.currentHex);
                selected = null;

            }
        }
    }


    function onDocumentMouseMove(event) {
        mouse.x = (event.clientX / renderWIDTH) * 2 - 1;
        mouse.y = -(event.clientY / renderHEIGHT) * 2 + 1;
    }

    function onDocumentMouseDown(event) {
        mouse.x = ( event.clientX / renderWIDTH ) * 2 - 1;
        mouse.y = -( event.clientY / renderHEIGHT ) * 2 + 1;
        mouse.clicked = true;

    }

    projector = new THREE.Projector();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);


    function generateWins() {
        //start off easy;
        for (var num = 0; num < 64; num += 4) {
            var myWin = [];

            for (var j = num; j < num + 4; j++) {
                myWin.push(j);
            }
            fourWin.push(myWin);

        }

        //still easy// flat horizontal
        for (var num = 0; num < 16; num++) {
            var myWin = [];

            for (var j = num; j < 64; j += 16) {
                myWin.push(j);
            }
            fourWin.push(myWin);
        }

        //flat diagonals. from topleft to bottom right
        for (var num = 0; num < 16; num += 4) {
            var myWin = [];

            for (var j = num; j < 64; j += 17) {
                myWin.push(j);
            }
            fourWin.push(myWin);
        }

        //flat diagonals. from botleft to top right
        for (var num = 3; num < 16; num += 4) {
            var myWin = [];

            for (var j = num; j < 63; j += 15) {
                myWin.push(j);
            }
            fourWin.push(myWin);
        }


        //vertical straight up
        for (var botLvlRow = 0; botLvlRow < 4; botLvlRow++) {

            for (var num = botLvlRow; num < 52; num += 16) {

                var myWin = [];

                for (var j = num; j < num + 13; j += 4) {
                    myWin.push(j);
                }
                fourWin.push(myWin);
            }
        }

        //vertical diagonals. starting at top row going to bottom row
        for (var topRow = 0; topRow < 49; topRow += 16) {
            var myWin = [];

            for (var j = topRow; j < topRow + 16; j += 5) {
                myWin.push(j);
            }
            fourWin.push(myWin);

        }

        //vertical diagonals. starting at bot row going to top row
        for (var botRow = 3; botRow < 52; botRow += 16) {
            var myWin = [];

            for (var j = botRow; j < botRow + 10; j += 3) {
                myWin.push(j);
            }
            fourWin.push(myWin);
        }

        //vertical diagonals. starting at botLeft col going to top RightCol
        for (var botCol = 0; botCol < 4; botCol++) {
            var myWin = [];

            for (var j = botCol; j < botCol + 61; j += 20) {
                myWin.push(j);
            }
            fourWin.push(myWin);
        }

        //vertical diagonals. starting at botRight col going to top LeftCol
        for (var botCol = 48; botCol < 52; botCol++) {
            var myWin = [];

            for (var j = botCol; j > botCol - 37; j -= 12) {
                myWin.push(j);
            }
            fourWin.push(myWin);
        }

        //last four diagonals
        fourWin.push([0, 21, 42, 63], [3, 22, 41, 60], [48, 37, 26, 15], [51, 38, 25, 12])


    }

    generateWins();
    //console.log(fourWin.length);


    var controls;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', updateControls);

    //console.log(controls);

    //console.log(camera)
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        updateControls();

//    camera.rotation.y +=.03
//    cube.rotation.z+=.04;
//    cube.rotation.y+=.04;
//    cube.rotation.x+=.04;

//    otherCube.rotation.z +=.04
    }

    render();
};