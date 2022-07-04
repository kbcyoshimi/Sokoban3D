import { Piece } from "./piece";
import { extract } from "./functions";

export class Game{
	
	_orgData;
	_player;
	_boxs;
	_map;

	_mapLength;

	_preparedAnimation;

	_animation;
	//[turn]
	_mapHistories;
	//piece
	_pieceHistories;

	_turn;

	constructor (data){
		//ターンの初期化
		this._turn = 0;

		this._orgData = JSON.parse(JSON.stringify(data));
		this._player = new Piece(data.start.x, data.start.z, "Player", 0);
		this._boxs = [];
		for(let i = 0; i < data.boxs.length; i++){
			this._boxs[i] = new Piece(data.boxs[i].x, data.boxs[i].z, "Box", (i + 1));
		}
		this._map = Array.from(data.map);

		//正方形チェック
		if(this._map.length !== this._map[0].length){
			throw "ステージが正方形ではありません。";
		}
		this._mapLength = this._map.length;

		this._preparedAnimation = null;
		this._animation = null;

		this._mapHistories = new Array();
		this._mapHistories[0] = JSON.parse(JSON.stringify(this._map));

		this._pieceHistories = new Array();
		this.generatePiecePositions();

		//ゴールチェック用
		let goals = this.searchPositions(10010);
		for(let i = 0; i < goals.length; i++){
			console.log((i + 1) + "つ目のゴールの位置 : " + JSON.stringify(goals[i]));
		}
		//ターンを進める
		this._turn = 1;
	}

	get orgData(){
		let result = JSON.parse(JSON.stringify(this._orgData));

		return result;
	}

	//プレイヤーがどの方向に動けるかチェック
	moveCheck(){
		let x = this._player.x;
		let z = this._player.z;
		let result = {
			"right" : {
				"isPassing" : false,
				"position" : {"x" : x + 1, "z" : z},
				"boxDestination" : {"x" : x + 2, "z" : z}
			},
			"left" : {
				"isPassing" : false,
				"position" : {"x" : x - 1, "z" : z},
				"boxDestination" : {"x" : x - 2, "z" : z}
			},
			"down" : {
				"isPassing" : false,
				"position" : {"x" : x, "z" : z + 1},
				"boxDestination" : {"x" : x, "z" : z + 2}
			},
			"up" : {
				"isPassing" : false,
				"position" : {"x" : x, "z" : z - 1},
				"boxDestination" : {"x" : x, "z" : z - 2}
			}
		}

		//プレイヤーの上下左右をチェック
		for(let direction in result){
			let destination = result[direction].position;
			let isPassing = true;

			//ブロックをチェック
			let tile = this.getTile(destination.x, destination.z);
			let passing = extract(tile, 4);
			if(passing !== 0){
				isPassing = false;
			}
			//荷物をチェック
			for(const box of this._boxs){
				if(!box._isDrop){
					if(box.comparePosition(destination.x, destination.z)){
						let boxDestination = result[direction].boxDestination;
						if(!this.checkPassing(boxDestination.x, boxDestination.z, true)){
							//console.log(direction + "に荷物はありますが運ぶことは出来ません。")
							isPassing = false;
						}
					}
				}
			}
			result[direction]["isPassing"] = isPassing;
		}
		return result;
	}

	//プレイヤー移動処理
	move(direction){
		console.log(this._turn + "ターン目開始")
		//animation 初期化
		this._preparedAnimation = new Array();
		this._animation = new Array();
		for(let i = 0; i < this._boxs.length + 1; i++){
			this._animation[i] = new Array();
		}
		//プレイヤーが移動できるか確認
		let ways = this.moveCheck();
		let way = ways[direction];
		if(!way.isPassing){
			throw "その方向には動けません。";
		}
		let directionNum = 0;
		switch(direction){
			case "left":
				directionNum = 1;
				break;
			case "up":
				directionNum = 2;
				break;
			case "right":
				directionNum = 3;
				break;
			case "down":
				directionNum = 4;
				break;
			default:
				throw "不適切な方向です。";
		}

		//荷物の移動を伴うか確認
		let ConveyBox = null;
		let playerDestination = way.position;
		for(const box of this._boxs){
			if(box._isDrop){
				continue;
			}
			let isSame = box.comparePosition(playerDestination.x, playerDestination.z);
			if(isSame){
				//console.log("Playerの行先にBoxがあります")
				ConveyBox = box;
				break;
			}
		}

		//荷物の移動
		if(ConveyBox){
			//console.log("荷物動きます");
			this.convey(ConveyBox,directionNum);
		}
		//プレイヤーの移動
		this.convey(this._player,directionNum);
		this.turnend();

		//mapの状態を記録
		this._mapHistories[this._turn] = JSON.parse(JSON.stringify(this._map));

		//pieceの座標を保存
		this.generatePiecePositions();

		//アニメーション情報の形式を整える
		this.convertAnimation();

		//アニメーション情報を返す
		console.log((this._turn) + "ターン目終了");
		//.log((this._turn) + "ターン目終了時のアニメーション情報");
		//console.log(this._animation);
		//console.log(this._map);
		this._turn ++;
		return Array.from(this._animation);
	}

	//ターンエンド時
	turnend(){
		//荷物
		for(let box of this._boxs){
			if(!box._isDrop){
				this.pieceMove(box);
			}
		}
		//プレイヤー
		this.pieceMove(this._player);
		//スイッチON
		//ここの機構は関数化して外に出すべきかもしれない。
		const maxSwitchId = 9;
		const OFFSwitchTile = 60020;
		for(let id = 0; id <= maxSwitchId; id++){
			let target = this.searchPosition(OFFSwitchTile + id);
			//OFFになっているスイッチを見つけたら
			if(target){
				let x = target.x;
				let z = target.z;
				//かつ上に荷物があったら
				if(this.existsBox(x, z)){
					this.switchON(x, z);
				}
			}
		}
		//スイッチOFF
		const ONSwitchTile = 60010;
		for(let id = 0; id <= maxSwitchId; id++){
			let target = this.searchPosition(ONSwitchTile + id)
			//ONになっているスイッチを見つけたら
			if(target){
				let x = target.x;
				let z = target.z;
				//かつ上に荷物がなかったら
				if(!this.existsBox(x, z)){
					this.switchOFF(x, z);
				}
			}
		}
		//ゴールチェック
		let goals = this.searchPositions(10010);
		let goalFlag = true;
		for(let goal of goals){
			let x = goal.x;
			let z = goal.z;
			if(!this.existsBox(x, z)){
				goalFlag = false;
			}else{
				//console.log("\x1b[33m" + JSON.stringify(goal) + "の上に荷物あります。")
			}
		}
		//ゴール処理
		if(goalFlag){
			console.log("\x1b[33m" + "ゲームクリア！！");
		}
	}

	//pieceに送る命令を振り分ける関数
	pieceMove(piece){
		let isBox = piece.code == "Box"
		let tile = this.getTile(piece.x, piece.z);
		switch(extract(tile, 5)){
			//ベルトコンベアー
			case 4:
				let direction = extract(tile,3);
				this.convey(piece, direction);
				break;
			//テレポート
			case 5:
				//出口ならば処理をやめる。
				if(extract(tile, 3) === 8) return;
				if(!isBox){
					throw "Playerがテレポートマスにいます。";
				}
				let teleportId = extract(tile, 1);
				this.teleport(piece, teleportId);
				break;
			//穴
			case 8:
				this.drop(piece);
				break;
			default:
				break;
		}
	}

	//pieceに移動の命令を送る関数
	convey(piece, direction){
		//移動先の特定
		let destinationX = piece.x;
		let destinationZ = piece.z;
		switch(direction) {
			case 1:
				destinationX -= 1;
				break;
			case 2:
				destinationZ -= 1;
				break;
			case 3:
				destinationX += 1;
				break;
			case 4:
				destinationZ += 1;
				break;
			default:
				throw "不適切な方向です。";
				break;
		}

		//移動できるか確認
		if(!this.checkPassing(destinationX, destinationZ, piece.code == "Box")){
			//console.log("コンベアの先に障害物があります。");
			return;
		} 

		//対象物を移動させる
		piece.move(destinationX, destinationZ);

		this.generateAnimationD("move", destinationX, destinationZ, piece.number)
	}

	//pieceにテレポートの命令を送る関数
	teleport(piece, teleportId){
		const teleportTile = 50810
		let tile = teleportTile + teleportId;
		let position = this.searchPosition(tile);
		//console.log("teleport" + JSON.stringify(position))
		let destinationX = position.x;
		let destinationZ = position.z;
		//移動先に障害物があるか確認
		if(!this.checkPassing(destinationX, destinationZ, true)){
			//console.log("テレポートできません。")
			return;
		} 
		//console.log("対応先を発見");
		//対象物を移動させる
		//console.log("\x1b[31m" + JSON.stringify(piece) + "から");
		piece.move(destinationX, destinationZ);
		//console.log("\x1b[31m" + JSON.stringify(piece) + "へテレポートしました。");

		this.generateAnimationD("teleport", destinationX, destinationZ, piece.number);
		return;
	}

	//x,zのスイッチ操作
	switchON(x, z){
		//対象のドアを探す。
		let tile = this.getTile(x, z);
		let pairPosition = this.searchPairPosition(tile);
		if(pairPosition){
			this.openDoor(pairPosition.x, pairPosition.z)
			const pushSwitchNum = 10;
			let changedTile = tile - pushSwitchNum;
			this.changeTile(x, z, changedTile)
			this.generateAnimationP("push", x, z);
			//console.log("open door");
			return;
		}
		throw "スイッチに対応するドアがありません";
	}

	//x,zのスイッチの状態をOFFに
	switchOFF(x, z){
		//対象のドアを探す。
		let tile = this.getTile(x, z);
		let pairPosition = this.searchPairPosition(tile);
		if(pairPosition){
			this.closeDoor(pairPosition.x, pairPosition.z)
			const pullSwitchNum = 10;
			let changedTile = tile + pullSwitchNum;
			this.changeTile(x, z, changedTile);
			this.generateAnimationP("pull", x, z);
			//console.log("close door");
			return;
		}
		throw "スイッチに対応するドアがありません";
	}

	//pieceを穴に落とす関数
	drop(piece){
		let x = piece.x;
		let z = piece.z;
		let tile = this.getTile(x, z);
		let hasBox = extract(tile,2);
		if(hasBox === 1){
			//console.log("既にBOXがあります")
			return;
		}
		//対象のタイルを変更
		const dropNum = 2010;
		let changedTile = tile - dropNum;
		this.changeTile(x, z, changedTile);

		//対象の荷物を削除
		// this._boxs = this._boxs.filter(function(box) {
		// 	return box !== piece;
		// });
		piece.drop();
		//console.log("穴に箱が落ちました。")

		this.generateAnimationI("fall", piece.number);
	}

	//x,zのドアを開ける関数
	openDoor(x, z){
		const openDoorNum = -1010;
		let tile = this.getTile(x, z);
		let changedTile = tile + openDoorNum;
		this.changeTile(x, z, changedTile);
		this.generateAnimationP("open", x, z);
	}

	//x,zのドアを閉める関数
	closeDoor(x, z){
		const closeDoorNum = 1010;
		let tile = this.getTile(x, z);
		let changedTile = tile + closeDoorNum;
		this.changeTile(x, z, changedTile);
		this.generateAnimationP("close", x, z);
	}

	//tileAと一致する座標を返す
	searchPosition(tileA){
		let result = false;
		for(let z = 0; z < this._mapLength; z++){
			for(let x = 0; x < this._mapLength; x++){
				let tileB = this.getTile(x, z);
				if(tileA === tileB){
					if(result){
						throw "一致する座標が複数見つかりました。";
					}
					result = {"x" : x, "z" : z};
				}
			}
		}
		return result;
	}

	//tileAと一致する座標を配列にして返す
	searchPositions(tileA){
		let result = [];
		for(let z = 0; z < this._mapLength; z++){
			for(let x = 0; x < this._mapLength; x++){
				let tileB = this.getTile(x, z);
				if(tileA === tileB){
					let position = {"x" : x, "z" : z};
					result.push(position);
				}
			}
		}
		//console.log(result);
		return (result ? result : false);
	}

	//tileAとIDの一致するタイルの座標を返す
	searchPairPosition(tileA){
		let idA = extract(tileA, 1);
		for(let z = 0; z < this._mapLength; z++){
			for(let x = 0; x < this._mapLength; x++){
				let tileB = this.getTile(x, z);
				let idB = extract(tileB, 1);
				if(idA === idB){
					if(tileA === tileB){
						continue;
					}
					//console.log("ペアのタイルの座標を見つけました。");
					let result = {"x" : x, "z" : z};
					return result;
				}
			}
		}
		return false;
	}

	//x,zにboxがあるか
	existsBox(x, z){
		for(const box of this._boxs){
			if(box.comparePosition(x, z)){
				if(!box._isDrop){
					//console.log("x = " + x + " z = " + z + " に荷物があります。")
					return true;
				}
			}
		}
		return false;
	}

	//x,zのタイルをvalueに変更する
	changeTile(x, z, value){
		this._map[z][x] = value;
	}

	//x,zのタイルを取得する
	getTile(x, z){
		let result = this._map[z][x];
		return result;
	}

	//x,zが通行可能かを確認　可能ならTrueを返す。
	//対象が追うレイヤーではなく荷物ならisBox引数にTrueを挿入する。
	checkPassing(x, z, isBox = false){
		//ブロックをチェック
		let tile = this.getTile(x, z);
		let passing = extract(tile, 4);
		if(passing !== 0){
			if(!(passing === 2 && isBox)){
				//console.log(passing);
				return false;
			}
		}
		//荷物をチェック
		for(const box of this._boxs){
			if(box.comparePosition(x, z)){
				if(!box._isDrop){
					return false;
				}
			}
		}
		//プレイヤーをチェック
		if(this._player.comparePosition(x, z)){
			return false;
		}
		//console.log("x = " + x + " z = " + z + " は通行可能です。")
		return true;
	}

	//アニメーション情報を追加する関数
	generateAnimationD(key, x, z, number){
		let template = {
			"key" : key,
			"destination" : {
				"x" : x,
				"z" : z
			}
		};

		this._animation[number].push(template);
	}

	//アニメーション情報を追加する関数
	generateAnimationI(key, number){
		let template = {
			"key" : key
		};
		
		this._animation[number].push(template);
	}

	//スイッチやドアなどのpieceを伴わない物体のアニメーション情報を追加する関数
	generateAnimationP(key, x, z){
		let template = {
			"key" : key,
			"position" : {
				"x" : x,
				"z" : z
			}
		}
		this._preparedAnimation.push([null, template]);
	}

	//preparedAnimationを変換する関数
	convertAnimation(){
		//console.log(JSON.parse(JSON.stringify(this._preparedAnimation)));
		
		//this._preparedAnimation = 

		// this._preparedAnimation.sort((a, b) => {
		// 	if(a.order < b.order) return -1;
		// 	if(a.order > b.order) return 1;
		// 	return 0;
		// });

		//this._preparedAnimation.sort((a, b) => b.order - a.order || b.order - a.order);
		
		//console.log(JSON.parse(JSON.stringify(this._preparedAnimation)));

		this._animation = this._animation.concat(this._preparedAnimation);

		//console.log(JSON.parse(JSON.stringify(this._animation)))
	}

	//履歴にpiece達の座標情報を追加する関数
	generatePiecePositions(){
		let result = {
			"player" : {
				"x" : this._player.x,
				"z" : this._player.z
			},
			"boxs" : []
		}

		for(const box of this._boxs){
			let tmp = {
				"x" : box.x,
				"z" : box.z,
				"isDrop" : box.isDrop
			}
			result.boxs.push(tmp);
		}
		this._pieceHistories[this._turn] = result;
	}

	//手戻り操作
	//指定turnの"開始前"の状態に戻る（終了後ではなく開始前）
	back(turn = this._turn - 2){
		if(turn < 0){
			throw "turnの値が不適切です。"
		}
		let mapHistory = JSON.parse(JSON.stringify(this._mapHistories[turn]));

		//mapの手戻り
		this._map = Array.from(mapHistory);

		//pieceの手戻り
		let result = new Array();

		let piecePositions = this._pieceHistories;
		let player = this._player;
		player.move(piecePositions[turn]['player'].x, piecePositions[turn]['player'].z);
		result.push(player.position);

		for(let i = 0; i < this._boxs.length; i++){
			//console.log(this._pieceHistories[turn])
			let piece = this._boxs[i];
			piece.move(piecePositions[turn]['boxs'][i].x, piecePositions[turn]['boxs'][i].z);
			result.push(piece.position);
			piece.changeIsDrop(piecePositions[turn]['boxs'][i].isDrop);
		}
		console.log((turn) + "ターン目終了時にに戻りました。")
		this._turn = turn + 1;

		let flags = this.generateBackResult();
		result = result.concat(flags);
		
		//console.log("back result = " + JSON.stringify(result));
		return result;
	}

	generateBackResult(){
		let result = new Array();
		for(let z = 0; z < this._mapLength; z++){
			for(let x = 0; x < this._mapLength; x++){
				let tile = this.getTile(x, z);
				let species = extract(tile, 5);
				if(species === 6 || species === 9){
					let flag = extract(tile, 2);
					result.push(flag);
				}
			}
		}
		return result;
	}


	//コンソール表示
	dataPrint(){
		console.log("print");
		console.log(this._boxs);
	}
}