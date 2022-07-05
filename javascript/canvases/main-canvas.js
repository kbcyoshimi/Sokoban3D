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

	setCamera (vector){
		this._basisPosition.x = vector.x;
		this._basisPosition.z = vector.z;

		let	xd = RADIUS * Math.sin(this._theta),
			zd = RADIUS * Math.cos(this._theta);

		vector.x += xd;
		vector.z += zd;

		super.setCamera(vector);
	}

	setDirection (direction){
		if (!direction) return;

		let x = this._basisPosition.x,
			z = this._basisPosition.z;

		//向きから補正座標を計算する
		let rad = degToRad(DIRECTION[direction]),
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

		this.setDirection(data.dir);

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
			this._mouseX < 0 ?
			this._theta += diff:
			this._theta -= diff;
			//角度を0~360の範囲で維持する
			let deg360 = degToRad(360);
			if (this._theta < 0) this._theta += deg360;
			if (this._theta > deg360) this._theta -= deg360;
			//１つ前の角度を保持
			this._last = this._camera.rotation.y;

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