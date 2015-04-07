(function(THREE) {
    //$('body').prepend(
    //    '<div id="blocker" style="display: -webkit-box;">'+
    //        '<div id="instructions" style="">'+
    //        '<span style="font-size:40px; cursor:pointer;">Click HERE to play</span>'+
    //        '<br/>'+
    //        '(W, A, S, D = Move, SPACE = Jump, MOUSE = Look around, ESC = Exit)'+
    //        '</div>'+
    //        '</br>'+
    //        '<input id="bounce" type="checkbox" value="bounce">bouncing boxes'+
    //        '</br>'+
    //        '<input id="spin" type="checkbox" value="spin">spin boxes'+
    //        '<br>'+
    //        '<input id="duckhunter" type="checkbox" value="bounce">duck hunter style'+
    //        '</br>'+
    //        '</div>'
    //);


    var camera, scene, renderer;
    var geometry, material, mesh;
    var controls;
    var crosshair;
    var objects = [];

    var raycaster;
    var inGame = false;
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );
    var bounceBoxes = false;
    var spinBoxes = false;
    var duckHunter = false;
    $('input#bounce').click(function(event){bounceBoxes = event.target.checked});
    $('input#spin').click(function(event){spinBoxes = event.target.checked});
    $('input#duckhunter').click(function(event){duckHunter = event.target.checked});


// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if ( havePointerLock ) {

        var element = document.body;

        var pointerlockchange = function ( event ) {

            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

                controls.enabled = true;
                inGame = true;
                blocker.style.display = 'none';

            } else {

                controls.enabled = false;
                inGame = false;
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';

            }

        }

        var pointerlockerror = function ( event ) {

            instructions.style.display = '';

        }

        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        instructions.addEventListener( 'click', function ( event ) {



            instructions.style.display = 'none';

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            if ( /Firefox/i.test( navigator.userAgent ) ) {

                var fullscreenchange = function ( event ) {

                    if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                        document.removeEventListener( 'fullscreenchange', fullscreenchange );
                        document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                        element.requestPointerLock();

                    }

                }

                document.addEventListener( 'fullscreenchange', fullscreenchange, false );
                document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

                element.requestFullscreen();

            } else {

                element.requestPointerLock();

            }

        }, false );

    } else {

        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

        var crosshairGeo = new THREE.SphereGeometry(1, 25, 25);
        crosshair = new THREE.Mesh(crosshairGeo,  new THREE.MeshPhongMaterial({color: 'red'}));


        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

        var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
        light.position.set( 1, 1, 1 );
        scene.add( light );

        var light = new THREE.DirectionalLight( 0xffffff, 0.75 );
        light.position.set( -1, - 0.5, -1 );
        scene.add( light );

        controls = new THREE.PointerLockControls( camera );
        scene.add( controls.getObject() );

        scene.add(crosshair);

        raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

        // floor

        geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

        for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

            var vertex = geometry.vertices[ i ];
            vertex.x += Math.random() * 20 - 10;
            vertex.y += Math.random() * 2;
            vertex.z += Math.random() * 20 - 10;

        }

        for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

            var face = geometry.faces[ i ];
            face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
            face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
            face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

        }

        material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

        mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

        // objects

        geometry = new THREE.BoxGeometry( 20, 20, 20 );

        for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

            var face = geometry.faces[ i ];
            face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
            face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
            face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

        }

        for ( var i = 0; i < 500; i ++ ) {

            material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );

            var mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
            mesh.position.y =  Math.floor( Math.random() * 20 ) * 20 + 10;
            mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
            scene.add( mesh );

            material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

            objects.push( mesh );

        }

        //

        //renderer = window.isWebglAvailable() ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
        //renderer=new THREE.CanvasRenderer();
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor( 0xffffff );
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( renderer.domElement );

        //

        window.addEventListener( 'resize', onWindowResize, false );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }


    var clickFunction= function(position){
        if(controls.enabled){
            var hits=[];
            var clickRay = new THREE.Raycaster(clickPos, controlDir);
            hits = clickRay.intersectObjects(objects);


            var bulletGeo = new THREE.SphereGeometry(1, 25, 25);
            var bullet = new THREE.Mesh(bulletGeo,  new THREE.MeshPhongMaterial());
            var bullRay =new THREE.Ray(clickPos, controlDir).clone();

            bullet.position.set(clickPos.x, clickPos.y, clickPos.z);

            var color = {
                r:Math.random(),
                g:Math.random(),
                b:Math.random()
            }



            var bulletPath = {
                distance:1000,
                target:null,
                ray:bullRay,
                rayPos:0,
                red: color.r,
                green:color.g,
                blue:color.b,
                bullet:bullet
            }


            ///dont think i need this at all
            if(hits[0]){
                bulletPath.target = hits[0];
                bulletPath.distance = hits[0].distance;
            }

            scene.add(bullet);
            bullet.material.color.setRGB(color.r, color.g, color.b);

            bulletPaths.push(bulletPath);
            console.log(bulletPath)


        }
    };

    var clickPos, controlDir, cameraPos;
    var bulletPaths = [];

    document.addEventListener( 'click', clickFunction );

//setting up the boxes moving
    var animateCount = 0;
    var switchSpot = 5000;
    var min = -1, max = 1.01;
    var objWithDirection=_.map(objects, function(box){
        return {
            box:box,
            direction:new THREE.Ray(box.position, new THREE.Vector3( Math.random() * (max - min) + min, Math.random() * (max - min) + min, Math.random() * (max - min) + min).normalize()),
            location:0,
            boxId:box.id,
            bouncing:true,
            spinning:true

        }
    });
    console.log(objWithDirection);



    var allVectors = [
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(1, 0, 1),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(1, 0, -1),
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(-1, 0, -1),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(-1, 0, 1)
    ];



/////////////////////////////////////////////////////////////////////////
//////ANIMATE!
    function animate() {

        requestAnimationFrame( animate );

        controls.isOnObject( false );
        clickPos = controls.getObject().position;
        controlDir = controls.getDirection(new THREE.Vector3(0,0,0));
        cameraPos = camera.position;


        ///////////////////////////////////////////////////////////////////
        //setting up the crosshair and the ray you shoot
        var hits = [];
        var clickRay = new THREE.Raycaster(clickPos, controlDir);
        hits = clickRay.intersectObjects(objects);
        if(hits[0]){
            crosshair.position.set(hits[0].point.x, hits[0].point.y, hits[0].point.z);
        }
        else{
            var defaultPos = new THREE.Ray(clickPos, controlDir).at(40)
            crosshair.position.set(defaultPos.x, defaultPos.y, defaultPos.z);
        }


        // send the bullets on their path
        _.each(bulletPaths,function(shot, index){

            var bulletRayCaster = new THREE.Raycaster(shot.bullet.position, shot.ray.direction, 0,16).intersectObjects(objects);


              if(bulletRayCaster.length<1){
                shot.bullet.position.set(shot.ray.at(shot.rayPos).x, shot.ray.at(shot.rayPos).y, shot.ray.at(shot.rayPos).z)
                shot.rayPos+=15;
            }
            else{
                if(shot.target) {
                    if(bounceBoxes ||spinBoxes || duckHunter){
                        scene.remove(shot.bullet);
                    }
                    else {
                        shot.bullet.position.set(bulletRayCaster[0].point.x, bulletRayCaster[0].point.y, bulletRayCaster[0].point.z);
                    }

                    bulletRayCaster[0].object.material.color.setRGB(shot.red, shot.green, shot.blue);

                    if(duckHunter){
                        var duck = _.findWhere(objWithDirection, {boxId:bulletRayCaster[0].object.id});
                        if(duck.spinning){
                            duck.spinning = false;
                        }
                        else{
                            duck.bouncing = false;
                        }
                    }

                }
                bulletPaths.splice(index, 1);
            }

        });


//make em bounce
        if(bounceBoxes ||duckHunter) {
            _.each(objWithDirection, function (box) {
                //bounce the x
                if(box.bouncing) {
                    if (box.box.position.x < -500 || box.box.position.x > 500) {
                        box.box.position.set(box.box.position.x > 0 ? 499.99 : -499.99, box.box.position.y, box.box.position.z);
                        box.direction = new THREE.Ray(
                            box.box.position,
                            new THREE.Vector3(
                                    box.direction.direction.x * (-1),
                                    Math.random() * (max - min) + min,
                                    Math.random() * (max - min) + min).normalize());
                        box.location = 1;
                    }
                    //bounce the y
                    if (box.box.position.y < 9 || box.box.position.y > 500) {
                        box.box.position.set(box.box.position.x, box.box.position.y > 10 ? 499.99 : 9.001, box.box.position.z)
                        box.direction = new THREE.Ray(
                            box.box.position,
                            new THREE.Vector3(
                                    Math.random() * (max - min) + min,
                                    box.direction.direction.y * (-1),
                                    Math.random() * (max - min) + min).normalize());
                        box.location = 1;
                    }
                    //bounce the z
                    if (box.box.position.z < -500 || box.box.position.z > 500) {
                        box.box.position.set(box.box.position.x, box.box.position.y, box.box.position.z > 0 ? 499.99 : -499.99);
                        box.direction = new THREE.Ray(
                            box.box.position,
                            new THREE.Vector3(
                                    Math.random() * (max - min) + min,
                                    Math.random() * (max - min) + min,
                                    box.direction.direction.z * (-1)).normalize());
                        box.location = 1;
                    }
                    box.box.position.set(box.direction.at(box.location).x, box.direction.at(box.location).y, box.direction.at(box.location).z);
                    box.location += .001;
                }
                else{
                    if(box.box.position.y>9) {
                        box.box.position.set(box.box.position.x, box.box.position.y -= 6, box.box.position.z);
                    }
                }

            });
        }

        if(spinBoxes || duckHunter) {
            _.each(objWithDirection, function (box) {
                if(box.spinning) {
                    var direction = 1;
                    if(Math.floor(Math.random()*(3-1)+1)%2===0&& animateCount%50===0){
                        direction = -1;
                    }

//                    box.box.rotation.x +=.03
                    box.box.rotation.x += direction*(Math.random() * (.03 - .003) + .003);
                    box.box.rotation.y += direction*(Math.random() * (.03 - .003) + .003);
                    box.box.rotation.z += direction*(Math.random() * (.03 - .003) + .003);
                }
            });

            //update the animatecount
            animateCount++;
            if(animateCount>switchSpot)
            animateCount = 0;
        }





        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects( objects );

        //standing on objects
        if ( intersections.length > 0 ) {
            controls.isOnObject( true );
        }


        controls.update();

        renderer.render( scene, camera );

    }
})(THREE);