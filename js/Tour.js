var camera, scene, renderer;
var effect, controls;
var element, container;
var fov = 70;
var panoList, activePano;
var ray;
var id;
var stereo;

var marking;
var fading;
var framecount;

var activePano, panoList;

function init(data) {
	renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
	element = renderer.domElement;
	container = document.getElementById('container');
	container.appendChild(element);
	$('#container', 0).css('background-color', 'black');

	scene = new THREE.Scene();
	
	var width = container.offsetWidth;
	var height = container.offsetHeight;
	
	camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1100);
	camera.position.set(-1, 0, 0);
	camera.target = new THREE.Vector3(0, 0, 0);

	controls = new THREE.OrbitControls(camera, element);
	controls.target = camera.target;
	controls.noZoom = true;
	controls.noPan = true;
	
	ray = new THREE.Raycaster();
	
	element.addEventListener('click', panoClick, true);

	stereo = false;

	function setOrientationControls(e) {
		if (!e.alpha) {
			return;
		}
		controls = new THREE.DeviceOrientationControls(camera, true);
		controls.connect();
		controls.update();
	
		renderer = new THREE.StereoEffect(renderer);
		stereo = true;

//		element.removeEventListener('click', panoSwitch, true);
		element.addEventListener('click', fullscreen, false);
		window.removeEventListener('deviceorientation', setOrientationControls, true);
//		$('#audios').attr('controls', 'controls');
	}
	window.addEventListener('deviceorientation', setOrientationControls, true);

	panoList = {};
	for (var id in data.panoramas) {
		panoList[id] = new Panorama(data.panoramas[id], element);
	}
	activePano = panoList[data.initId];
	activePano.placeInScene(scene);
	$("<source id=\"audiosrc\" type=\"audio/mpeg\" src=\"" + activePano.audio + "\">").appendTo("#audios");
	window.addEventListener('touchstart', userInput, true);
	window.addEventListener('click', rotate, true);


	renderer.sortObjects = false;
	window.addEventListener('resize', resize, false);
	element.addEventListener('panoSwitch', panoSwitch, false);
	setTimeout(resize, 1);
	fading = false;
	framecount = 0;
	animate();

}

function rotate(event) {
	for (marker of activePano.navMarkers) {
//		marker.rotation.y -= 0.05;
	}
}

function userInput(event) {
	document.getElementById("audios").play();
	window.removeEventListener('touchstart', userInput, true);
}

function panoSwitch(event) {
	id = event.detail;
	if (id in panoList) {
		element.removeEventListener('panoSwitch', panoSwitch, false);
		$('canvas', 0).fadeOut(1500, fadeOutComplete);
	}
}

function fadeOutComplete() {
	document.getElementById("audios").pause();
	document.getElementById("audiosrc").remove();
	activePano.removeFromScene(scene);
	activePano = panoList[id];
	activePano.placeInScene(scene);
	$('canvas', 0).fadeIn('fast', fadeInComplete);
	fading = false;
	marking = false;
}

function fadeInComplete () {
	element.addEventListener('panoSwitch', panoSwitch, false);
	$("<source id=\"audiosrc\" type=\"audio/mpeg\" src=\"" + activePano.audio + "\">").appendTo("#audios");
	document.getElementById("audios").load();
	document.getElementById("audios").play();
}

function panoClick(event) {
	var mouse = new THREE.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	if (stereo) {
		if (mouse.x < 0) {
			mouse.x = mouse.x * 2 + 1;
		}
		else {
			mouse.x = mouse.x * 2 - 1;
		}
	}
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	ray.setFromCamera(mouse, camera);
	var int = ray.intersectObject(activePano.panoMesh, false);
	if (int.length > 0) {
//		position to put marker
//		console.log(int[0].point);
	}
	
	var int = ray.intersectObjects(activePano.navMarkers, false);
	if (int.length > 0) {
		int[0].object.trigger(element);
		marking = true;
	} else {
	}
	render();
}

function checkMarker() {
	var mouse = new THREE.Vector2();
	if (stereo) {
		mouse.x = 0.5;
	}
	else {
		mouse.x = 0;
	}
	mouse.y = 0;
	ray.setFromCamera(mouse,camera);
	var int = ray.intersectObjects(activePano.navMarkers, false);

	if (int.length > 0 && !fading && !marking) {
		int[0].object.trigger(element);
		fading = true;
	}
	else if (int.length == 0 && fading && !marking) {
		fading = false;
		$('canvas', 0).stop(true).css('opacity', 1);
		element.addEventListener('panoSwitch', panoSwitch, false);
	}

}

function resize() {
	var width = container.offsetWidth;
	var height = container.offsetHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
}

function update() {
  resize();
  camera.updateProjectionMatrix();
  controls.update();
}

function render() {
	renderer.render(scene, camera);
}

function animate() {
	requestAnimationFrame(animate);
	update();
	render();
	framecount += 1;
	if (framecount === 10) {
		checkMarker();
		framecount = 0;
	}

}

function fullscreen() {
	if (container.requestFullscreen) {
		container.requestFullscreen();
	} else if (container.msRequestFullscreen) {
		container.msRequestFullscreen();
	} else if (container.mozRequestFullScreen) {
		container.mozRequestFullScreen();
	} else if (container.webkitRequestFullscreen) {
		container.webkitRequestFullscreen();
	}
}


$.getJSON('js/tourdata.json', init);
