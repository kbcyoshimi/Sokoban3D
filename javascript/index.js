// ページの読み込みを待つ
window.addEventListener('DOMContentLoaded', init);

function init() {

  // サイズを指定
  const width = 960;
  const height = 540;

  const mainCanvas = document.querySelector('#mainCanvas');
  const mapCanvas = document.querySelector('#mapCanvas');

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: mainCanvas//document.querySelector('#mainCanvas')
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(mainCanvas.clientWidth, mainCanvas.clientHeight);

  const subRenderer = new THREE.WebGLRenderer({
    canvas: mapCanvas//document.querySelector('#mapCanvas')
  });
  subRenderer.setPixelRatio(window.devicePixelRatio);
  subRenderer.setSize(mapCanvas.clientWidth, mapCanvas.clientHeight);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  //const cameras = [];

  const camera1 = new THREE.PerspectiveCamera(45, mainCanvas.clientWidth / mainCanvas.clientHeight);
  //camera1.viewport = new THREE.Vector4(0, 0, width, height);
  camera1.position.set(0, 0, +1000);
  //camera1.updateMatrixWorld();
  //cameras.push(camera1);

  const camera2 = new THREE.OrthographicCamera(-1000, +1000, +1000, -1000);
  //camera2.viewport = new THREE.Vector4(Math.floor(width / 2), Math.floor(height / 2), Math.ceil(width / 2), Math.ceil(height / 2));
  camera2.position.set(0, +1000, 0);
  camera2.lookAt(new THREE.Vector3(0, 0, 0));
  //camera2.updateMatrixWorld();
  //cameras.push(camera2);

  //const camera = new THREE.ArrayCamera(cameras);

  // 箱を作成
  const boxGeometry = new THREE.BoxGeometry(100, 100, 100);
  const boxMaterial = new THREE.MeshNormalMaterial();
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  //box.rotation.y += (45 * Math.PI) / 180;
  scene.add(box);
  const box2 = new THREE.Mesh(boxGeometry, boxMaterial);
  box2.position.set(100, 0, 0);
  scene.add(box2);
  const box3 = new THREE.Mesh(boxGeometry, boxMaterial);
  box3.position.set(0, 0, -900);
  scene.add(box3);

  const gridHelper = new THREE.GridHelper( 1900, 19 );
  gridHelper.position.y = 999;
  scene.add( gridHelper );

  tick();  

  var rot = 0;
  // 毎フレーム時に実行されるループイベントです
  function tick() {
    //box.rotation.x += 0.01;
    //box.rotation.y += 0.01;
    //box.rotation.z += 0.01;

    //rot += 0.5; // 毎フレーム角度を0.5度ずつ足していく
    // ラジアンに変換する
    //const radian = (rot * Math.PI) / 180;
    // 角度に応じてカメラの位置を設定
    //camera.position.x = 1000 * Math.sin(radian);
    //camera.position.z = 1000 * Math.cos(radian);
    // 原点方向を見つめる
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer.render(scene, camera1); // レンダリング
    subRenderer.render(scene, camera2);

    requestAnimationFrame(tick);
  }
}

function setBox() {

}