export class Game{
	
	_orgData;
	_player;
	_boxs;
	_map;

	constructor (data){
		this._orgData = JSON.parse(JSON.stringify(data));
		this._player = data.start;
		this._boxs = data.boxs;
		this._map = Array.from(data.map);
	}

	//プレイヤーがどの方向に動けるかチェック
	moveCheck(){
		let x = this._player.x;
		let z = this._player.z;
		let result = {
			"right" : {
				"isPassing" : false,
				"position" : {"x" : x + 1, "z" : z}
			},
			"left" : {
				"isPassing" : false,
				"position" : {"x" : x - 1, "z" : z}
			},
			"down" : {
				"isPassing" : false,
				"position" : {"x" : x, "z" : z + 1}
			},
			"up" : {
				"isPassing" : false,
				"position" : {"x" : x, "z" : z - 1}
			}
		}

		for(let direction in result){
			let destination = result[direction].position;
			result[direction]["isPassing"] = this.checkPassing(destination.x, destination.z);
		}
		return result;
	}
	//ターンエンド時
	turnend(){
		//荷物のチェック
		for(let i = 0; i < this._boxs.length; i++){
			let x = this._boxs[i].x;
			let z = this._boxs[i].z;
			this.objectsMove(this._boxs[i]);
		}
		this.objectsMove(this._player,true);
		
	}

	objectsMove(object, isPlayer = false){
		let tile = this._map[object.z][object.x];
		switch(this.extract(tile,5)){
			//ベルトコンベアー
			case 4:
				let direction = this.extract(tile,3);
				this.convey(object,direction);
				break;
			//テレポート
			case 5:
				if(this.extract(tile,3) === 8) return;
				if(isPlayer) return;
				let teleportId = this.extract(tile,1);
				this.teleport(object, teleportId);
				break;
			default:
				break;
		}
	}

	//positionで指定したものをdirectionの方向へ動かす。
	convey(position, direction){
		//移動先の特定
		let destination = JSON.parse(JSON.stringify(position));
		switch(direction) {
			case 1:
				destination.x -= 1;
				break;
			case 2:
				destination.z -= 1;
				break;
			case 3:
				destination.x += 1;
				break;
			case 4:
				destination.z += 1;
				break;
			default:
				throw "不適切な方向です。";
				break;
		}

		//移動先に障害物があるか確認
		if(!this.checkPassing(destination.x, destination.z)) return;

		//対象物を移動させる
		console.log("\u001b[32m" + JSON.stringify(position) + "から");
		position.x = destination.x;
		position.z = destination.z;
		console.log("\u001b[32m" + JSON.stringify(position) + "へ移動しました。");
	}

	//positionにある物をteleportIdが対応する場所へテレポートさせる。
	teleport(position, teleportId){
		for(let z = 0; z < this._map.length; z++){
			for(let x = 0; x < this._map[z].length; x++){
				let tile = this._map[z][x];
				if(teleportId === this.extract(tile, 1)){
					if(this.extract(tile, 3) === 7) continue;
					let destination = {"x": x, "z": z};
					console.log("対応先を発見" + JSON.stringify(destination));

					//移動先に障害物があるか確認
					if(!this.checkPassing(destination.x, destination.z, true)) return;
					//対象物を移動させる
					console.log("\u001b[32m" + JSON.stringify(position) + "から");
					position.x = destination.x;
					position.z = destination.z;
					console.log("\u001b[32m" + JSON.stringify(position) + "へ移動しました。");
					return;
				}
			}
		}
	}

	//指定した桁を取得する
	extract(tile, digit){
		let maxDigit = 5;
		if(maxDigit < digit) throw "不適切な値です。";
		let num = Math.floor(tile / (10 ** (digit - 1))) % 10;
		//console.log(tile + "の" + digit + "桁目は" + num);
		return num;
	}

	//指定した座標が通行可能かを確認 荷物、プレイヤーが存在していたり、通行不可ブロックだとFalseを返す。
	//荷物だけ通れる障害物を通れるとするならisBox引数にTrueを挿入する。
	checkPassing(x, z, isBox){
		//ブロックをチェック
		let tile = this._map[z][x];
		let passing = this.extract(tile, 4);
		if(passing !== 0){
			if(!(passing === 2 && isBox)){
				console.log(passing);
				return false;
			}
		}
		//荷物をチェック
		for(const box of this._boxs){
			if(box.x === x && box.z === z){
				return false;
			}
		}
		//プレイヤーをチェック
		if(this._player.x === x && this._player.z === z){
			return false;
		}
		console.log("x = " + x + " z = " + z + " は通行可能です。")
		return true;
	}

}