export class Piece{
	_x;
	_z;
	//playerかboxか
	_code;

	_isDrop;
	_isConvey;
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

	get position (){
		return {"x" : this._x, "z" : this._z};
	}

	get isDrop (){
		return this._isDrop;
	}

	get isConvey (){
		return this._isConvey;
	}

	get code (){
		return this._code;
	}

	get number (){
		return this._number;
	}

	//isDropの値を変更
	changeIsDrop (value){
		this._isDrop = value;
	}

	//isConveyの値を変更
	changeIsConvey (value){
		this._isConvey = value;
	}

	//指定した座標に移動
	move (x, z){
		//console.log("\u001b[32m" + JSON.stringify(this) + "から");
		this._x = x;
		this._z = z;
		//console.log("\u001b[32m" + JSON.stringify(this) + "へ移動しました。");
	}

	//穴に落ちる
	drop (){
		if(this._code == "Player"){
			throw "Playerが穴に落ちようとしています。";
		}
		this.changeIsDrop(true);
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