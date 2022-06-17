export class Piece{
	_x;
	_z;
	//playerかboxか
	_code;

	_isDrop;
	_number;

	constructor (x, z, code, number){
		this._x = x;
		this._z = z;
		this._code = code;
		this._isDrop = false;
		this._number = number;
	}

	get x (){
		return this._x;
	}
	
	get z (){
		return this._z;
	}

	get code (){
		return this._code;
	}

	get number (){
		return this._number;
	}

	//指定した座標に移動
	move (x, z){
		this._x = x;
		this._z = z;
	}

	//穴に落ちる
	drop (){
		if(this._code == "Player"){
			throw "Playerが穴に落ちようとしています。";
		}
		this._isDrop = true;
	}

	checkPassing (x, z, map){

	}

	//引数の座標と同じポジションならTrueを返す
	comparePosition (x, z){
		if((x === this._x) && (z === this._z)){
			return true;
		}
		return false;
	}
}