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
	}

}