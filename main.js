import * as THREE from 'three';

const scale = 10;
const nObjs = 9;
const matColors = [
  0xffffff,
  0xffc1fa,
  0x4286f4,
  0x9bf7da
];
const bgColors = [
  0xffc1fa,
  0x42f48f,
  0x3c0968,
  0xe2bbac,
  0xf43a3a
];
const textures = [
  'assets/texture.jpg',
  'assets/texture2.jpg',
  'assets/texture3.jpg',
  'assets/texture4.jpg',
  'assets/texture5.jpg',
  'assets/texture7.jpg',
  'assets/texture8.jpg',
];
const posRange = {
  x: [-25, 25],
  y: [-40, 40],
  z: [-50, 50]
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max));
}

function choice(opts) {
  var idx = Math.floor(Math.random() * opts.length);
  return opts[idx];
}

class Sine extends THREE.Curve {
  constructor(scale, a, b, c) {
    super();
    this.scale = scale;
    this.a = a;
    this.b = b;
    this.c = c;
  }
  getPoint(t) {
    var tx = t * this.a - 1.5;
    var ty = Math.sin(this.b * Math.PI * t);
    var tz = this.c;
    return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
  }
}

function randGeo() {
  var type = choice(['box', 'sphere', 'tube', 'tetra', 'torus', 'cylinder']);
  switch (type) {
      case 'box':
        return new THREE.BoxGeometry(rand(1, 30), rand(1, 30), rand(1, 30));
      case 'sphere':
        return new THREE.SphereGeometry(rand(1, 20), randInt(12, 50), randInt(12, 50));
      case 'tube':
        return new THREE.TubeGeometry(
          new Sine(rand(2,10), rand(3,8), rand(0,8), rand(2,8)),
          randInt(40,80),
          rand(1, 4),
          randInt(20,40),
          true);
      case 'tetra':
        return new THREE.TetrahedronGeometry(rand(3, 14));
      case 'torus':
        return new THREE.TorusGeometry(rand(10,20), rand(10,20), randInt(12,20), randInt(12,20), rand(Math.PI/2, 2*Math.PI));
      case 'cylinder':
        return new THREE.CylinderGeometry(rand(5,12), rand(5,12), rand(20, 40), randInt(12,36));
  }
}

function randMat() {
  var color = choice(matColors);
  var mats = [
    new THREE.MeshLambertMaterial({color: color, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3}),
    new THREE.MeshLambertMaterial({color: color, envMap: refractionCube, refractionRatio: 0.95})
  ];
  return choice(mats);
}

function randObj() {
  var geo = randGeo(),
      mat = randMat(),
      obj = new THREE.Mesh(geo, mat);
  obj.position.x = rand(posRange.x[0] * scale, posRange.x[1] * scale);
  obj.position.y = rand(posRange.y[0] * scale, posRange.y[1] * scale);
  obj.position.z = rand(posRange.z[0] * scale, posRange.z[1] * scale);
  obj.rotation.y = rand(-20, 20);
  obj.rotation.x = rand(-20, 20);
  obj.rotation.z = rand(-20, 20);
  obj.scale.set(scale, scale, scale);
  return obj;
}

// load cube textures
var path = choice(textures);
var urls = [path, path, path, path, path, path];
var reflectionCube = new THREE.CubeTextureLoader().load(urls);
reflectionCube.format = THREE.RGBFormat;
var refractionCube = new THREE.CubeTextureLoader().load(urls);
refractionCube.mapping = THREE.CubeRefractionMapping;
refractionCube.format = THREE.RGBFormat;

// setup scenes & lighting
var scene = new THREE.Scene();
var ambient = new THREE.AmbientLight(0xffffff);
var pointLight = new THREE.PointLight(0xffffff,2);
scene.add(ambient);
scene.add(pointLight);

// choose scene background
var backgrounds = bgColors.map(c => new THREE.Color(c));
// backgrounds.push(reflectionCube);
scene.background = choice(backgrounds);

// create objects
for (var i=0; i<nObjs; i++) {
  var obj= randObj();
  scene.add(obj);
}

// setup plumbing
var container = document.createElement('div');
document.body.appendChild(container);
var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 5000);
camera.position.z = 2000;
var renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// press 's' to save as a png
document.addEventListener('keydown', function(ev) {
  if (ev.key === 's') {
    window.open(renderer.domElement.toDataURL('image/png'), 'screenshot');
  }
});

// render/animate
function run() {
  requestAnimationFrame(run);
  renderer.render(scene, camera);
}
run();
