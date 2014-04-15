var Tetris = function(){
	/********************************************* DEFINITION ********************************************************************************/
	var activeP, 
		pause, 
		nextP, 
		svgPreview, 
		svg, 
		interval,
		sqW = 30,
		sqH = 30,
		hP = 20,
		wP = 10,
		width  = sqW * wP,
	    height = sqH * hP,
	    to = 1000,
	    self = this,
	    figures = [];
	
	var pMat = [];
	
	var dispatch = d3.dispatch("finished");
	
	var rotations = {
			I: {
				0: [[1,2], [0,1], [-1,0], [-2,-1]],
				1: [[2,-2], [1,-1], [0,0], [-1,1]],
				2: [[-2,-1], [-1,0], [0,1], [1,2]],
				3: [[-1,1], [0,0], [1,-1], [2,-2]]
			},
			J: {
				0: [[1,2], [0,1], [-1,0], [0,-1]],
				1: [[1,-1], [0,0], [-1,1], [-2,0]],
				2: [[-1,-1], [0,0], [1,1], [0,2]],
				3: [[-1,0], [0,-1], [1,-2], [2,-1]]
			},
			L: {
				0: [[2,1], [1,2], [0,1], [-1,0]],
				1: [[0,-2], [1,-1], [0,0], [-1,1]],
				2: [[-2,0], [-1,-1], [0,0], [1,1]],
				3: [[0,1], [-1,0], [0,-1], [1,-2]]
			},
			O: {
				0: [[0,0], [0,0], [0,0], [0,0]],
				1: [[0,0], [0,0], [0,0], [0,0]],
				2: [[0,0], [0,0], [0,0], [0,0]],
				3: [[0,0], [0,0], [0,0], [0,0]]
			},
			S: {
				0: [[2,1], [1,0], [0,1], [-1,0]],
				1: [[-2,-1], [-1,0], [0,-1], [1,0]],
				2: [[2,1], [1,0], [0,1], [-1,0]],
				3: [[-2,-1], [-1,0], [0,-1], [1,0]]
				
			},
			T: {
				0: [[1,1], [0,0], [1,-1], [-1,-1]],
				1: [[1,-1], [0,0], [-1,-1], [-1,1]],
				2: [[-1,-1], [0,0], [-1,1], [1,1]],
				3: [[-1,1], [0,0], [1,1], [1,-1]]
			},
			Z: {
				0: [[1,2], [0,1], [1,0], [0,-1]],
				1: [[-1,-2], [0,-1], [-1,0], [0,1]],
				2: [[1,2], [0,1], [1,0], [0,-1]],
				3: [[-1,-2], [0,-1], [-1,0], [0,1]]
			},
	};
	
	figures.push({coord: [[3, 0], [4, 0], [5, 0], [6, 0]],	color: 'cyan', l: 3, r: 6, b: 0, t: 0, tp:'I'}); //I
	figures.push({coord: [[4, 0], [5, 0], [6, 0], [6, 1]],	color: 'blue', l: 4, r: 6, b: 1, t: 0, tp:'J'}); //J
	figures.push({coord: [[4, 1], [4, 0], [5, 0], [6, 0]],	color: 'orange', l: 4, r: 6, b: 1, t: 0, tp:'L'}); //L
	figures.push({coord: [[4, 0], [5, 0], [4, 1], [5, 1]],	color: 'yellow', l: 4, r: 5, b: 1, t: 0, tp:'O'}); //O
	figures.push({coord: [[4, 1], [5, 1], [5, 0], [6, 0]],	color: 'lime', l: 4, r: 6, b: 1, t: 0, tp:'S'}); //S
	figures.push({coord: [[4, 0], [5, 0], [5, 1], [6, 0]],	color: 'RGB(139, 0, 139)', l: 4, r: 6, b: 1, t: 0, tp:'T'}); //T
	figures.push({coord: [[4, 0], [5, 0], [5, 1], [6, 1]],	color: 'red', l: 4, r: 6, b: 1, t: 0, tp:'Z'}); //Z
	
	
	
	for (var i = 0; i < wP; i++){
		pMat[i] = new Array(hP);
	}
	
	/************************************************** FUNCTIONS *************************************************************************************/
	
	/**
	 * Main function
	 */
	this.main = function(){
		svg = d3.select('body')
			.append('svg')
			.attr('id', 'tetris')
			.attr('width', width)
			.attr('height', height);
		
		svgPreview = d3.select('body')
			.append('svg')
			.attr('id', 'preview')
			.attr('width', 130)
			.attr('height', 70);
		
		this.drawP(figures[Math.floor(Math.random() * figures.length)]) && runPiece();
		
		
		d3.select('body').on('keydown', function(){
			self.move(d3.event.keyCode);
		});
		
		dispatch.on('finished', function(d,v){
			clearInterval(interval);
			
			var tmpY = [];
			for (var i = 0; i < 4; i++){
				pMat[activeP.coord[i][0]][activeP.coord[i][1]] = activeP.rect[i];
				if (-1 == tmpY.indexOf(activeP.coord[i][1])) tmpY.push(activeP.coord[i][1]);
			}
			
			tmpY.sort(function(a, b){
				 if (a < b)
				     return 1;
				  if (a > b)
				     return -1;
				  return 0;
			});
			
			var shift = 0;
			for(var i = 0; i < tmpY.length; i++){
				var fill = true;
				for (var k = 0; k < wP; k++){
					if (undefined == pMat[k][tmpY[i] + shift]){
						fill = false;
						break;
					}
				}
				if (fill){
					for (var j = 0; j < wP; j++){
						pMat[j][tmpY[i] + shift].remove();
					}
					for (var k = tmpY[i] + shift; k > shift; k--){
						for (var j = 0; j < wP; j++){
							if (pMat[j][k - 1]){
								pMat[j][k - 1].transition().delay(10).duration(20).attr("y", k * sqH);
								pMat[j][k] = pMat[j][k - 1];
							} else {
								pMat[j][k] = undefined;
								
							}
						}
					}
					
					for (var k = 0; k < wP; k++){
						pMat[k][0] = undefined;
					}
					shift++;

				}
			}
			activeP = {};
			//Start new piece
			self.drawP(figures[Math.floor(Math.random() * figures.length)]) && runPiece();
			//self.drawP(figures[0]) && runPiece();
			
		});
	}
	
	/**
	 * Draw piece
	 * @param f
	 * returns boolean
	 */
	this.drawP = function(fi){
		
		if (!nextP){
			f = figures[Math.floor(Math.random() * figures.length)];
		} else {
			f = nextP;
		}
		
		nextP = fi;
		
		svgPreview.selectAll('rect').remove();
		for (var i = 0; i < nextP.coord.length; i++){
			var rectangle = svgPreview.append("rect")
				.attr("x", (nextP.coord[i][0] - 3) * sqW + 5)
				.attr("y", nextP.coord[i][1] * sqH + 5)
				.attr("stroke", 'black')
				.attr("stroke-width", 0.5)
				.attr("fill", nextP.color)
				.attr("width", sqW)
				.attr("height", sqH);
		}
		
		
		activeP = {};
		activeP.rect = {};
		activeP.coord = {};
		
		for (var i = 0; i < f.coord.length; i++){
			var rectangle = svg.append("rect")
				.attr("x", f.coord[i][0] * sqW)
				.attr("y", f.coord[i][1] * sqH)
				.attr("stroke", 'black')
				.attr("stroke-width", 0.5)
				.attr("fill", f.color)
				.attr("width", sqW)
				.attr("height", sqH);
			activeP.rect[i] = rectangle;
			activeP.coord[i] = [];
			activeP.coord[i][0] = f.coord[i][0];
			activeP.coord[i][1] = f.coord[i][1];
		}
		
		for (var i = 0; i < f.coord.length; i++){
			if (pMat[f.coord[i][0]][f.coord[i][1]]){
				alert('Game Over');
				return false;
			}
		}
		
		activeP.color = f.color;
		activeP.tp = f.tp;
		activeP.pos = 0;
		return true;
	}
	
	
	/**
	 * Move piece depend of action
	 */
	this.move = function(keyCode){
		
		if (!activeP.coord) return;
		switch (keyCode){
			case 38:	//UP
				//clearInterval(interval);
				unPause();
				(function(){
					var tmpCoord = [];
					for (var i = 0; i < 4; i++){
						tmpCoord[i] = [];
						tmpCoord[i][0] = activeP.coord[i][0] + rotations[activeP.tp][activeP.pos][i][0];
						tmpCoord[i][1] = activeP.coord[i][1] + rotations[activeP.tp][activeP.pos][i][1];

						if (tmpCoord[i][0] < 0 || tmpCoord[i][0] > wP || tmpCoord[i][1] < 0 || tmpCoord[i][0] > hP || pMat[tmpCoord[i][0]] == undefined || pMat[tmpCoord[i][0]][tmpCoord[i][1]]) return ;
					
					}
					
					for (var i = 0; i < 4; i++){
						
						activeP.coord[i][0] = tmpCoord[i][0];
						activeP.coord[i][1] = tmpCoord[i][1];
						
						activeP.rect[i].transition().delay(10).duration(20).attr("x", tmpCoord[i][0] * sqH).attr("y", tmpCoord[i][1] * sqH);
					}
					activeP.pos = (activeP.pos + 1) % 4;
				})();
				
				//runPiece();
				break;
			case 32:	//SPACE
			case 40:	//DOWN
				runPiece(0);
				break;
			case 37:	//LEFT
				unPause()
				var tmpCoord = [];
				for (var i = 0; i < 4; i++){
					tmpCoord[i] = [];
					tmpCoord[i][0] = activeP.coord[i][0] - 1;
					tmpCoord[i][1] = activeP.coord[i][1];
					if (tmpCoord[i][0] < 0 || pMat[tmpCoord[i][0]][tmpCoord[i][1]]){
						return;
					}
				}
				
				//clearInterval(interval);
				for (var i = 0; i < 4; i++){
					activeP.coord[i][0] = tmpCoord[i][0];
					activeP.rect[i].transition().delay(to / 8).duration(to / 6).attr("x", activeP.coord[i][0] * sqW).attr("y", activeP.coord[i][1] * sqH);
				}
				//runPiece();
				break;
			case 39:	//RIGHT
				unPause()
				var tmpCoord = [];
				for (var i = 0; i < 4; i++){
					tmpCoord[i] = [];
					tmpCoord[i][0] = activeP.coord[i][0] + 1;
					tmpCoord[i][1] = activeP.coord[i][1];
					if (tmpCoord[i][0] >= wP || pMat[tmpCoord[i][0]][tmpCoord[i][1]]){
						return;
					}
				}
				
				//clearInterval(interval);
				for (var i = 0; i < 4; i++){
					activeP.coord[i][0] = tmpCoord[i][0];
					activeP.rect[i].transition().delay(to / 8).duration(to / 6).attr("x", activeP.coord[i][0] * sqW).attr("y", activeP.coord[i][1] * sqH);
				}
				//runPiece();
				break;
			case 80:	//Pause
				if (!unPause()){
					clearInterval(interval);
					pause = true;
				}
				break;
		}
	}
	
	function unPause(){
		if (pause){
			runPiece();
			pause = false;
			return true;
		}
		return false;
	}
	
	/**
	 * Run piece (move down)
	 * @param timeout
	 * @returns
	 */
	function runPiece(timeout){
		pause = false;
		clearInterval(interval);
		if (timeout == undefined) timeout = to;
		interval = setInterval(function(){
			
			var tmpCoord = [];
			for (var i = 0; i < 4; i++){
				tmpCoord[i] = [];
				tmpCoord[i][0] = activeP.coord[i][0];
				tmpCoord[i][1] = activeP.coord[i][1] + 1;
				if (tmpCoord[i][1] >= hP || pMat[tmpCoord[i][0]][tmpCoord[i][1]]){
					dispatch.finished();
					return;
				}
			}
			for (var i = 0; i < 4; i++){
				activeP.coord[i][1] = tmpCoord[i][1];
				activeP.rect[i].transition().delay(timeout / 4).duration(timeout / 2).attr("y", activeP.coord[i][1] * sqH).attr("x", activeP.coord[i][0] * sqW);
			}
		}, timeout);
	}
}
