function BaseMarker(pos, imageFile) {
	var geom = new THREE.SphereGeometry(75, 20, 20);
	var texture = THREE.ImageUtils.loadTexture(imageFile, undefined);
	var meshMat = new THREE.MeshBasicMaterial({ map: texture, wireframe: false});

	THREE.Mesh.call(this, geom, meshMat);
	this.position.set(pos.x, pos.y, pos.z);
}

BaseMarker.prototype = Object.create(THREE.Mesh.prototype);

function NavMarker(position, target, element) {
	BaseMarker.call(this, position, 'img/audio.png');
	this.target = target;
	this.element = element;
}

NavMarker.prototype = Object.create(BaseMarker.prototype);
NavMarker.prototype.trigger = function () {
	var event = new CustomEvent('panoSwitch', {'detail': this.target});
	this.element.dispatchEvent(event);
};
