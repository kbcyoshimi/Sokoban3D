export class Game{
	
	_data;
	_position;
	_map;
	_orgMap;

	constructor (data){
		this._data = data;
		this._position = data.start;
		this._map = Array.from(data.map);
		this._orgMap = Array.from(data.map);
	}

	//プレイヤーがどの方向に動けるかチェック
	moveCheck(){
		let x = this._position.x;
		let z = this._position.z;
		let positions = {
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

		let map = this._map;
		Object.keys(positions).forEach(function (key) {
			let tile = map[this[key].position.z][this[key].position.x];
			this[key].isPassing = Math.round(tile / 1000) % 10 === 0;
		},positions)
		console.log(positions)
		return positions;
	}

}