// carnival.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.carnival = {
    	// CONSTANT properties

		// variable properties
		renderer: undefined,
		scene: undefined,
		camera: undefined,
		light: undefined,
		ferisWheel: undefined,
		//myobjects: [],
		myavatars: [],
		mytrees: [],
		paused: false,
		dt: 1/60,
		controls: undefined,
		treeDown:false,

  	init : function(fov,height,width,aspect,near,far) {
  		console.log('init called');
  		this.setupThreeJS(fov,height,width,aspect,near,far);
     	app.ferrisWheel.initCamera( fov, aspect, near, far );
     	app.GameStand.initCamera(fov, aspect, near, far);
  		this.setupWorld();
  		this.update();
  	},


    update: function(){
    	// schedule next animation frame
		app.stats.update();
    	app.animationID = requestAnimationFrame(this.update.bind(this));

		// PAUSED?
		if (app.paused){
			this.drawPauseScreen();
			return;
		 }

		// UPDATE
		
		
		
		// Update sky color
		//this.renderer.setClearColor( 0xffffff, 1);
		TWEEN.update();
		this.light.intensity = app.skytween.getSunLightIntensity() + 0.5;

		// update ferrisWheel
		app.ferrisWheel.Update(this.light.intensity);

    	// update game stand
    	app.GameStand.update();
		
		// update avatars
		for(var i=0; i<this.myavatars.length; i++)
		{
			this.myavatars[i].move();
		}
    	
    	// update corn dog
    	if(app.FoodStand.foodObjectActive)
    	{
			app.FoodStand.foodObject.scale.x = 0.3;
			app.FoodStand.foodObject.scale.y = 0.3;
			app.FoodStand.foodObject.scale.z = 0.3;
			
			app.FoodStand.foodObject.position.x = this.camera.position.x + ( (10)*(Math.cos((this.controls.lon+30)*(Math.PI/180))));
			app.FoodStand.foodObject.position.z = this.camera.position.z + ( (10)*(Math.sin((this.controls.lon+30)*(Math.PI/180))));
    		app.FoodStand.foodObject.position.y = this.camera.position.y - 5;
			
			// this isn't working????
			if(app.ferrisWheel.active || app.GameStand.active)
			{
				app.FoodStand.foodObject.scale.x = 1.0;
				app.FoodStand.foodObject.scale.y = 1.0;
				app.FoodStand.foodObject.scale.z = 1.0;
				
				var pos = app.FoodStand.object.position;
				
				app.FoodStand.foodObject.position.x = pos.x + 10;
				app.FoodStand.foodObject.position.z = pos.y + 10;
				app.FoodStand.foodObject.position.y = pos.z + 30;
			}
			
    	}

		// DRAW
		if(app.ferrisWheel.active)
		{
			this.renderer.render(this.scene, app.ferrisWheel.camera);
			app.ferrisWheel.controls.update(this.dt);
		}
		else if(app.GameStand.active)
		{
		  this.renderer.render(this.scene, app.GameStand.camera);
		  //app.ferrisWheel.controls.update(this.dt);
		}
		else
		{
			this.renderer.render(this.scene, this.camera);
			this.controls.update(this.dt);
		}
		
		app.FoodStand.update();
		
		//camera constraints
		if(this.camera.position.y != 35)
		{
			this.camera.position.y = 35;
		}
		if(this.camera.position.x > 900)
		{
			this.camera.position.x = 900;
		}
		if(this.camera.position.x < -900)
		{
			this.camera.position.x = -900;
		}
		
		if(this.camera.position.z > 900)
		{
			this.camera.position.z = 900;
		}
		if(this.camera.position.z < -900)
		{
			this.camera.position.z = -900;
		}
		
		//reset camera
		if(app.keydown[82])
		{
			this.camera.position.set(-800,35,0);

			this.controls.lon = -30;
			this.controls.lat = 0;
			
			app.FoodStand.resetFood();
			app.ferrisWheel.active = false;
		}
		//move light
		if(app.keydown[73])
		{
			this.light.position.z+=10;
			if(this.light.position.z > 1200)
			{
				this.light.position.z = 1200;
			}
		}
		//move light 2
		if(app.keydown[79])
		{
			this.light.position.z-=10;
			if(this.light.position.z < -1200)
			{
				this.light.position.z = -1200;
			}
		}
		//make a tree
		if(app.keydown[80]&& !this.treeDown)
		{
			if(!(app.ferrisWheel.active || app.GameStand.active))
			{
				var numTrees = this.mytrees.length;
				this.mytrees[numTrees] = new app.Tree();
				this.mytrees[numTrees].mesh.position.x = this.camera.position.x+ ( (100)*(Math.cos((this.controls.lon)*(Math.PI/180))));
				this.mytrees[numTrees].mesh.position.z = this.camera.position.z+ ( (100)*(Math.sin((this.controls.lon)*(Math.PI/180))));
				
				this.treeDown = true;
				this.scene.add(this.mytrees[numTrees].mesh);
			}
		}
		// don't spam trees
		if(app.keydown[80]!=this.treeDown)
		{
			this.treeDown = app.keydown[80];
		}
	},

	setupThreeJS: function(fov,height,width,aspect,near,far) {
				this.scene = new THREE.Scene();
				//this.scene.fog = new THREE.FogExp2(0x9db3b5, 0.002);

				this.camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
				this.camera.position.y = 35;
				this.camera.position.z = 0;
				this.camera.position.x = -800;

				this.renderer = new THREE.WebGLRenderer({antialias: true});
				this.renderer.setSize( width, height );
				this.renderer.shadowMapEnabled = true;
				document.body.appendChild(this.renderer.domElement );

				this.controls = new THREE.FirstPersonControls(this.camera);

				this.controls.movementSpeed = 100;
				this.controls.lookSpeed = 0.18;
				this.controls.autoForward = false;
				this.controls.lon = -30;
			},

	setupWorld: function() {
		var geo = new THREE.PlaneGeometry(2000, 2000, 40, 40);
		//var mat = new THREE.MeshPhongMaterial({color: 0x9db3b5, overdraw: true});

        var texture = THREE.ImageUtils.loadTexture( "textures/grass.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 8, 8 );

        var maxAST = this.renderer.getMaxAnisotropy();
        texture.anisotropy = maxAST;

        var mat = new THREE.MeshPhongMaterial({map:texture});

				var floor = new THREE.Mesh(geo, mat);
				floor.rotation.x = -0.5 * Math.PI;
				floor.receiveShadow = true;
				this.scene.add(floor);

        // sky colors
        app.skytween.init();

        // directional light to represent sun
        this.light = new THREE.DirectionalLight(0xf9f1c2, 1);
        this.light.position.set(-500, 1500, 1000);
        this.light.castShadow = true;
        this.light.shadowMapWidth = 2048;
        this.light.shadowMapHeight = 2048;

        // distance for near and far clipping planes
        var d = 1000;
        this.light.shadowCameraLeft = d;
        this.light.shadowCameraRight = -d;
        this.light.shadowCameraTop = d;
        this.light.shadowCameraBottom = -d;
        this.light.shadowCameraFar = 2500;
        //this.light.castShadow = true;
        this.scene.add(this.light);

        var ambientLight = new THREE.AmbientLight( 0x303030 ); // soft white light
        ambientLight.intensity = 0.01;
        this.scene.add( ambientLight );

		//ferris wheel
		app.ferrisWheel.init();
		app.ferrisWheel.all.position.set(1,app.ferrisWheel.PartitionLength*app.ferrisWheel.BaseLengthModifier,1);
		this.scene.add(app.ferrisWheel.all);
		
		// obj loader
		app.FoodStand.load('textures/foodstand.jpg', 'models/stand1.obj');
        app.GameStand.load('textures/gamestand.jpg', 'models/stand2.obj');
        app.Tent.load(null, 'models/tent2.obj');
        app.Tent.loadPizza('textures/pizza.jpg', 'models/pizza_box_v01.obj');
    
        for(var i=0; i<2; i++)
        {
            app.BackgroundTents.load(null, 'models/tent2.obj');
        }
		
		// people avatars
		for(var i=0; i<10; i++)
        {
            this.myavatars[i] = new app.Avatar();
			this.scene.add(this.myavatars[i].mesh);
        }
        
        // trees
        for(var i=0; i<15; i++)
        {
            this.mytrees[i] = new app.Tree();
			this.scene.add(this.mytrees[i].mesh);
        }
		
		//instructions
		var cylinderG = new THREE.CylinderGeometry(3,3,40,32);
		var cylinderM = new THREE.MeshLambertMaterial({color: 0xbb2222});
		var cylinder1 = new THREE.Mesh(cylinderG,cylinderM);
		var cylinder2 = new THREE.Mesh(cylinderG,cylinderM);
		cylinder1.position.set(-700,20,0);
		cylinder1.castShadow = true;
		cylinder2.position.set(-700,20,-40);
		cylinder2.castShadow = true;
		
		var plane = new THREE.PlaneGeometry(40, 30, 1, 1);
		var texture = THREE.ImageUtils.loadTexture( "textures/sign.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 1 );

        var maxAST = this.renderer.getMaxAnisotropy();
        texture.anisotropy = maxAST;

        var mat = new THREE.MeshPhongMaterial({map:texture});

		var sign1 = new THREE.Mesh(plane, mat);
		var sign2 = new THREE.Mesh(plane, mat);
		sign1.rotation.y = -Math.PI/2;
		sign1.position.set(-700-cylinder1.geometry.radiusTop,25,-20);
		sign1.castShadow = true;
		sign2.rotation.y = Math.PI/2;
		sign2.position.set(-700+cylinder1.geometry.radiusTop,25,-20);
		sign2.castShadow = true;
		this.scene.add(sign1);
		this.scene.add(sign2);
		this.scene.add(cylinder1);
		this.scene.add(cylinder2);
		
		
	},

  doRaycast: function(event) {
    event.preventDefault();
    var projector = new THREE.Projector();

    // Define the camera to use for raycasts
    var currentCam = this.camera;
    if(app.ferrisWheel.active)
    {
      currentCam = app.ferrisWheel.camera;
    } else if(app.GameStand.active) {
      currentCam = app.GameStand.camera;
    }

    // 2D point where we clicked on the screen
    var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) *
    2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
    //console.log("Vector is x=" + vector.x + ",y=" + vector.y + ",z=" + vector.z);

    // 2D point converted to 3D point in world
    projector.unprojectVector(vector, currentCam);
    //console.log("Unprojected Vector x=" + vector.x + ",y=" + vector.y +",z=" + vector.z);

    // cast a ray from the camera to the 3D point we clicked on
    var raycaster = new THREE.Raycaster(currentCam.position,
    vector.sub(currentCam.position).normalize());

    app.GameStand.doRaycast(raycaster);
    app.FoodStand.doRaycast(raycaster);

    // an array of objects we are checking for intersections
    // you’ll need to put your own objects here
    var intersects = raycaster.intersectObjects([app.GameStand.mesh]);


/*
    // See if the player clicked on the stand
    if (intersects.length > 0) {

      // if the player DID click on the Game Stand...
      if(intersects[0].object == app.GameStand.mesh)
      {
        // If playing mini game, toss ball
        if(app.GameStand.active)
        {
          app.GameStand.tossBall();
        }
        // Otherwise, start playing
        else
        {
          app.GameStand.active = true;
          app.ferrisWheel.active = false;
        }
      }
      // if the player clicked away from the game stand
      else
      {

      }
    }
    */
  },

	drawPauseScreen: function(){
		// do something pause-like if you want
	},
	
	startSoundtrack: function()
	{
		createjs.Sound.stop();
		createjs.Sound.play("soundtrack", {loop:-1, volume:0.5});
	}


};
