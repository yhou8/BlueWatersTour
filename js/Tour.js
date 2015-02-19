var camera, scene, renderer;
var effect, controls;
var element, container;
var fov = 70;
var panoList, activePano;
var ray;
var id;

var activePano, panoList;

function init(data) {
	renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
	element = renderer.domElement;
	container = document.getElementById('container');
	container.appendChild(element);
	$('#container', 0).css('background-color', 'black');

	effect = new THREE.StereoEffect(renderer);

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

	function setOrientationControls(e) {
		if (!e.alpha) {
			return;
		}
		controls = new THREE.DeviceOrientationControls(camera, true);
		controls.connect();
		controls.update();

//		element.removeEventListener('click', panoSwitch, true);
		element.addEventListener('click', fullscreen, false);
		window.removeEventListener('deviceorientation', setOrientationControls, true);
	}
	window.addEventListener('deviceorientation', setOrientationControls, true);

	panoList = {};
	for (var id in data.panoramas) {
		panoList[id] = new Panorama(data.panoramas[id], element);
	}
	activePano = panoList[data.initId];
	activePano.placeInScene(scene);
	$("<source id=\"audiosrc\" type=\"audio/mpeg\" src=\"" + activePano.audio + "\">").appendTo("#audios");
	document.getElementById("audios").play();


	renderer.sortObjects = false;
	window.addEventListener('resize', resize, false);
	element.addEventListener('panoSwitch', panoSwitch, false);
	setTimeout(resize, 1);
	animate();
}

function panoSwitch(event) {
	id = event.detail;
	if (id in panoList) {
		element.removeEventListener('panoSwitch', panoSwitch, false);
		$('canvas', 0).fadeOut('slow', fadeOutComplete);
		document.getElementById("audios").pause();
		document.getElementById("audiosrc").remove();
	}
}

function fadeOutComplete() {
	activePano.removeFromScene(scene);
	activePano = panoList[id];
	activePano.placeInScene(scene);
	$('canvas', 0).fadeIn('fast', fadeInComplete);
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
	if (mouse.x < 0) {
		mouse.x = mouse.x * 2 + 1;
	}
	else {
		mouse.x = mouse.x * 2 - 1;
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
	} else {
	}
	render();
}

function resize() {
	var width = container.offsetWidth;
	var height = container.offsetHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
	effect.setSize(width, height);
}

function update() {
  resize();
  camera.updateProjectionMatrix();
  controls.update();
}

function render() {
	effect.render(scene, camera);
}

function animate() {
	requestAnimationFrame(animate);
	update();
	render();
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

