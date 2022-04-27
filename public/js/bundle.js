/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ (() => {

eval("// ページの読み込みを待つ\r\nwindow.addEventListener('DOMContentLoaded', init);\r\n\r\nfunction init() {\r\n\r\n  // サイズを指定\r\n  const width = 960;\r\n  const height = 540;\r\n\r\n  const mainCanvas = document.querySelector('#mainCanvas');\r\n  const mapCanvas = document.querySelector('#mapCanvas');\r\n\r\n  // レンダラーを作成\r\n  const renderer = new THREE.WebGLRenderer({\r\n    canvas: mainCanvas//document.querySelector('#mainCanvas')\r\n  });\r\n  renderer.setPixelRatio(window.devicePixelRatio);\r\n  renderer.setSize(mainCanvas.clientWidth, mainCanvas.clientHeight);\r\n\r\n  const subRenderer = new THREE.WebGLRenderer({\r\n    canvas: mapCanvas//document.querySelector('#mapCanvas')\r\n  });\r\n  subRenderer.setPixelRatio(window.devicePixelRatio);\r\n  subRenderer.setSize(mapCanvas.clientWidth, mapCanvas.clientHeight);\r\n\r\n  // シーンを作成\r\n  const scene = new THREE.Scene();\r\n\r\n  // カメラを作成\r\n  //const cameras = [];\r\n\r\n  const camera1 = new THREE.PerspectiveCamera(45, mainCanvas.clientWidth / mainCanvas.clientHeight);\r\n  //camera1.viewport = new THREE.Vector4(0, 0, width, height);\r\n  camera1.position.set(0, 0, +1000);\r\n  //camera1.updateMatrixWorld();\r\n  //cameras.push(camera1);\r\n\r\n  const camera2 = new THREE.OrthographicCamera(-1000, +1000, +1000, -1000);\r\n  //camera2.viewport = new THREE.Vector4(Math.floor(width / 2), Math.floor(height / 2), Math.ceil(width / 2), Math.ceil(height / 2));\r\n  camera2.position.set(0, +1000, 0);\r\n  camera2.lookAt(new THREE.Vector3(0, 0, 0));\r\n  //camera2.updateMatrixWorld();\r\n  //cameras.push(camera2);\r\n\r\n  //const camera = new THREE.ArrayCamera(cameras);\r\n\r\n  // 箱を作成\r\n  const boxGeometry = new THREE.BoxGeometry(100, 100, 100);\r\n  const boxMaterial = new THREE.MeshNormalMaterial();\r\n  const box = new THREE.Mesh(boxGeometry, boxMaterial);\r\n  //box.rotation.y += (45 * Math.PI) / 180;\r\n  scene.add(box);\r\n  const box2 = new THREE.Mesh(boxGeometry, boxMaterial);\r\n  box2.position.set(100, 0, 0);\r\n  scene.add(box2);\r\n  const box3 = new THREE.Mesh(boxGeometry, boxMaterial);\r\n  box3.position.set(0, 0, -900);\r\n  scene.add(box3);\r\n\r\n  const gridHelper = new THREE.GridHelper( 1900, 19 );\r\n  gridHelper.position.y = 999;\r\n  scene.add( gridHelper );\r\n\r\n  tick();  \r\n\r\n  var rot = 0;\r\n  // 毎フレーム時に実行されるループイベントです\r\n  function tick() {\r\n    //box.rotation.x += 0.01;\r\n    //box.rotation.y += 0.01;\r\n    //box.rotation.z += 0.01;\r\n\r\n    //rot += 0.5; // 毎フレーム角度を0.5度ずつ足していく\r\n    // ラジアンに変換する\r\n    //const radian = (rot * Math.PI) / 180;\r\n    // 角度に応じてカメラの位置を設定\r\n    //camera.position.x = 1000 * Math.sin(radian);\r\n    //camera.position.z = 1000 * Math.cos(radian);\r\n    // 原点方向を見つめる\r\n    //camera.lookAt(new THREE.Vector3(0, 0, 0));\r\n    renderer.render(scene, camera1); // レンダリング\r\n    subRenderer.render(scene, camera2);\r\n\r\n    requestAnimationFrame(tick);\r\n  }\r\n}\r\n\r\nfunction setBox() {\r\n\r\n}\n\n//# sourceURL=webpack:///./index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./index.js"]();
/******/ 	
/******/ })()
;