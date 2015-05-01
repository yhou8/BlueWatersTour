function Panorama (panoData, element) {
	this.navMarkers = [];
	this.load(panoData, element);
}

Panorama.prototype = {
	constructor: Panorama,
	
	load: function(panoData) {
		var image = panoData.imageFile;
		var texture = THREE.ImageUtils.loadTexture(image, undefined);
		var meshMat = new THREE.MeshBasicMaterial({ map: texture, wireframe: false });
		meshMat.side = THREE.DoubleSide;
		meshMat.overdraw = 0.5;
		var geom = new THREE.SphereGeometry(500, 60, 40);
		this.panoMesh = new THREE.Mesh(geom, meshMat);
		this.panoMesh.scale.x = -1;

		this.navMarkers.length = 0;
		for (var markerData of panoData.navMarkers) {
			var position = new THREE.Vector3(markerData.x, markerData.y, markerData.z);
			var rotation = new THREE.Vector3(markerData.rx, markerData.ry, markerData.rz);
			var marker = new NavMarker(position, rotation, markerData.target, element)
			this.navMarkers.push(marker);
		}

		this.audio = panoData.audio;

	},
	
	placeInScene: function(scene) {
		scene.add(this.panoMesh);
		for (var marker of this.navMarkers) {
			scene.add(marker);
		}
	},
	
	removeFromScene: function(scene) {
		scene.add(this.panoMesh);
		for (var marker of this.navMarkers) {
			scene.remove(marker);
		}
	}/*,
	
	setOpacity: function(opcty) {
		this.panoMesh.material.opacity = opcty;
		for (var marker of navMarkers) {
			marker.material.opacity = opcty;
		}
	}*/
	
};

