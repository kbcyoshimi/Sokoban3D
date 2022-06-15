import * as THREE from "../modules/three.module.js";
import { FirstPersonControls } from "../modules/FirstPersonControls.js";
import { Canvas } from "./canvas";

//円の半径
const RADIUS = 5;
//正方形の1辺の長さ
const SIDE = 100;
const DIRECTION = [null, 270, 180, 90, 0];

//度をラジアンに変換する関数
const degToRad = THREE.MathUtils.degToRad;

export class MainCanvas extends Canvas{

	_controls = null;

	_move = false;
	_moveMouseBind;
	_moveStartBind;
	_moveEndBind;

	_basisPosition = {
		"x" : 0,
		"z" : 0
	};

	_mouseX = 0;
	_last = 0;
	_theta = 0;

	constructor (){
    	super('#mainCanvas');
		this._camera = new THREE.PerspectiveCamera(90, this._canvas.clientWidth / this._canvas.clientHeight);
  	}

	moveCamera (direction, distance){
		let result = super.moveCamera(direction, distance);
		this._basisPosition.x += result.x;
		this._basisPosition.z += result.z;
	}

	startStageMode (data){
		if(this._mode !== null) return;

		this._camera = new THREE.PerspectiveCamera(60, this._canvas.clientWidth / this._canvas.clientHeight);

		//カメラの向きをコントロールするクラスを取得
		this._controls = new FirstPersonControls(this._camera, this._canvas);
		this._controls.movementSpeed = 0;
		this._controls.lookVertical = false;

		//カメラの基準座標を設定
		this._basisPosition.x = data.start.x * SIDE;
		this._basisPosition.z = data.start.z * SIDE;

		let x = this._basisPosition.x,
			z = this._basisPosition.z;

		//向きから補正座標を計算する
		let rad = degToRad(DIRECTION[data.dir]),
			xd = RADIUS * Math.sin(rad),
			zd = RADIUS * Math.cos(rad);	

		let phi = degToRad(90),
			theta = rad;
		this._theta = rad;

		//座標の反映
		this._camera.position.set(x + xd, 0, z + zd);
		let position = this._camera.position;
		let dir = new THREE.Vector3();

		//カメラの向きをコントロールに伝える
		dir.setFromSphericalCoords(1, phi, theta).add(position);
		this._controls.lookAt(dir);

		//カメラの向きを取得しておく
		this._last = this._camera.rotation.y;

		//イベントの登録
		this._moveMouseBind = this._mouseMove.bind(this);
		this._moveStartBind = this._mouseMoveStart.bind(this);
		this._moveEndBind = this._mouseMoveEnd.bind(this);
		this._canvas.addEventListener("mousemove", this._moveMouseBind);
		this._canvas.addEventListener("mousedown", this._moveStartBind);
		this._canvas.addEventListener("mouseup", this._moveEndBind);
		this._canvas.addEventListener("mouseleave", this._moveEndBind);

		super.startStageMode();
	}

	endStageMode (){
		this._canvas.removeEventListener("mousemove", this._moveMouseBind);
		this._canvas.removeEventListener("mousedown", this._moveStartBind);
		this._canvas.removeEventListener("mouseup", this._moveEndBind);
		this._canvas.removeEventListener("mouseleave", this._moveEndBind);

		this._controls.dispose();
		this._controls = null;

		super.endStageMode();
	}

	render (scene){
		if (this._move && this._mode === "Stage") {
			this._controls.update(1);

			//カメラの向きの変化を取得（Y軸基準）
			let diff = Math.abs(this._camera.rotation.y - this._last);
			//変化の方向に応じて角度を加減算する
			this._mouseX < 0 ? this._theta += diff : this._theta -= diff;
			//角度を0~360の範囲で維持する
			let deg360 = degToRad(360);
			if (this._theta < 0) this._theta += deg360;
			if (this._theta > deg360) this._theta -= deg360;
			//１つ前の角度を保持
			this._last = this._camera.rotation.y;

			console.log(THREE.MathUtils.radToDeg(this._theta));

			//座標の計算
			let x = this._basisPosition.x,
				z = this._basisPosition.z,
				xd = RADIUS * Math.sin(this._theta),
				zd = RADIUS * Math.cos(this._theta);

			//座標の反映
			this._camera.position.x = x + xd;
			this._camera.position.z = z + zd;
			
		}
		super.render(scene);
	}

	//キャンバス内でのマウスのX座標を取得
	_mouseMove (event){
		this._mouseX = event.pageX - this._canvas.offsetLeft - this._canvas.offsetWidth / 2;
	}

	//ドラッグの開始
	_mouseMoveStart (){
		this._move = true;
	}

	//ドラッグの終了
	_mouseMoveEnd (){
		this._move = false;
	}
}

/*残骸置き場

	// for (let i = 1; i <= 360; i++){
	// 	let r = i * Math.PI / 180;
	// 	let cos = 30 * Math.cos(r);
	// 	let sin = 30 * Math.sin(r);
	// 	console.log("角度（オイラー） : " + i + " cos : " + cos + " sin : " + sin);
	// }

	//this._camera.rotation.z += 1 * Math.PI / 180;
	//console.log(this._camera.quaternion);

	//console.log("x : " + this._camera.rotation.x * 180 / Math.PI + " y : " + this._camera.rotation.y * 180 / Math.PI + " z : " + this._camera.rotation.z * 180 / Math.PI);
	//console.log(" x : " + (this._camera.rotation.x * 180 / Math.PI + 90));
	//console.log(Math.asin(this._camera.quaternion.x) * 2);
	// console.log(" x : " + this._camera.rotation.x);
	// console.log(this._camera.quaternion.x);
	// this._offset = 90 * Math.PI / 180;
	// let sinTheta = this._camera.rotation.y;
	// let cosTheta = this._camera.rotation.y - offset;

	//this._theta += Math.abs(this._camera.rotation.y - this._last);

	// this.testnum += 1;

	// let quaternion = new THREE.Quaternion(this._camera.position.x, this._camera.position.y, this._camera.position.z);
	// let target = new THREE.Quaternion();
	// let axis = new THREE.Vector3(0, 1, 0).normalize();
	// target.setFromAxisAngle(axis, 0);
	// let r = target.conjugate();
	// r.multiply(quaternion);
	// quaternion.multiply(target);

	// let vec = new THREE.Vector3(400, 0, 300);
	// vec.applyQuaternion(quaternion);
	// console.log(vec);

	//this._camera.position.applyQuaternion(quaternion);

	//let y = 30 * Math.sin(theta);

	//this._camera.position.y = y;

	//console.log(this._test.position);
	//this._test.position.x = x + 400;
	//this._test.position.y = y;
	//this._test.position.z = z + 300;

	// this._test3 += 1;
	// if(this._test3 % 120 === 0){
	// 	console.log(this._test2 % 360);
		

	//  	// X座標 = 半径 x Cosθ  
	//  	let x = 30 * Math.sin(this._camera.rotation.y);
	//  	// z座標 = 半径 x Sinθ  
	//  	let z = 30 * Math.cos(this._camera.rotation.y) * -1;

	//  	this._camera.position.x = x + 400;
	//  	this._camera.position.z = z + 300;
	// 	 console.log(this._camera.position);

	//  	this._test2 += 45;
	// 	this._camera.rotation.y = this._test2 * Math.PI / 180;
	// }
*/