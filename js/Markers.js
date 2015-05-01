function BaseMarker(pos, rot, imageFile) {
	var geom = new THREE.PlaneGeometry(100,75);
	var texture = THREE.ImageUtils.loadTexture(imageFile, undefined);
	var meshMat = new THREE.MeshBasicMaterial({ map: texture, wireframe: false, transparent:true});

	THREE.Mesh.call(this, geom, meshMat);
	this.position.set(pos.x, pos.y, pos.z);
	this.rotation.set(rot.x, rot.y, rot.z);
}

BaseMarker.prototype = Object.create(THREE.Mesh.prototype);

function NavMarker(position, rotation, target, element) {
	BaseMarker.call(this, position, rotation, 'img/arrows.png');
	this.target = target;
	this.element = element;
}

NavMarker.prototype = Object.create(BaseMarker.prototype);
NavMarker.prototype.trigger = function () {
	var event = new CustomEvent('panoSwitch', {'detail': this.target});
	this.element.dispatchEvent(event);
};
