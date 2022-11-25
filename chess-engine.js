//WeeBee Ch355 engine 1.0 - 2015, April 1st
//by Wilson Pereira Jr. (email = wilsonjamm [at] gmail [dot] com)

wK = String.fromCharCode(0x2654); //white King
wQ = String.fromCharCode(0x2655); //white Queen
wR = String.fromCharCode(0x2656); //white Rook
wB = String.fromCharCode(0x2657); //white Bishop
wN = String.fromCharCode(0x2658); //white Knight
wp = String.fromCharCode(0x2659); //white Pawn
white = [wK, wQ, wR, wB, wN, wp]; //white group
bK = String.fromCharCode(0x265a); //black King
bQ = String.fromCharCode(0x265b); //black Queen
bR = String.fromCharCode(0x265c); //black Rook
bB = String.fromCharCode(0x265d); //black Bishop
bN = String.fromCharCode(0x265e); //black Knight
bp = String.fromCharCode(0x265f); //black Pawn
black = [bK, bQ, bR, bB, bN, bp]; //black group

/*** Board ***
Algebraic Notation [columns == files(letters); lines == ranks(numbers)]
-------------------------
a8 b8 c8 d8 e8 f8 g8 h8	|	black rank
a7 b7 c7 d7 e7 f7 g7 h7	|	black rank
a6 b6 c6 d6 e6 f6 g6 h6	|
a5 b5 c5 d5 e5 f5 g5 h5	|
a4 b4 c4 d4 e4 f4 g4 h4	|
a3 b3 c3 d3 e3 f3 g3 h3	|
a2 b2 c2 d2 e2 f2 g2 h2	|	white rank
a1 b1 c1 d1 e1 f1 g1 h1	|	white rank
------------------------- ***/

board = {};
board.a = [];
board.b = [];
board.c = [];
board.d = [];
board.e = [];
board.f = [];
board.g = [];
board.h = [];

function reset() {
	board.a[0] = wR;
	board.b[0] = wN;
	board.c[0] = wB;
	board.d[0] = wQ;
	board.e[0] = wK;
	board.f[0] = wB;
	board.g[0] = wN;
	board.h[0] = wR;
	board.a[1] = wp;
	board.b[1] = wp;
	board.c[1] = wp;
	board.d[1] = wp;
	board.e[1] = wp;
	board.f[1] = wp;
	board.g[1] = wp;
	board.h[1] = wp;
	for (var i=2; i<=5; i++) {
		board.a[i] = '';
		board.b[i] = '';
		board.c[i] = '';
		board.d[i] = '';
		board.e[i] = '';
		board.f[i] = '';
		board.g[i] = '';
		board.h[i] = '';
	}
	board.a[6] = bp;
	board.b[6] = bp;
	board.c[6] = bp;
	board.d[6] = bp;
	board.e[6] = bp;
	board.f[6] = bp;
	board.g[6] = bp;
	board.h[6] = bp;
	board.a[7] = bR;
	board.b[7] = bN;
	board.c[7] = bB;
	board.d[7] = bQ;
	board.e[7] = bK;
	board.f[7] = bB;
	board.g[7] = bN;
	board.h[7] = bR;
	refresh();
	board.mr = ''; //move record
	board.wCastling = true; //must be 'true' only while white King isn't moved
	board.bCastling = true; //must be 'true' only while black King isn't moved
	board.enPassant = false;
	board.wTurn = true;
	board.moving = false;
	board.srcFile = '';
	board.srcRank = 0;
	board.aimFile = '';
	board.aimRank = 0;
	board.aim = '';
}

function newGame() {
	var table = ce('table');
	for (var i=7;i>=0;i--) {
		var rank = ce('tr');
		for (var j=0x61;j<=0x68;j++) {
			var square = ce('td');
			square.setAttribute('id', String.fromCharCode(j) + (i+1));
			square.setAttribute('onclick', 'checkState(\'' + String.fromCharCode(j) + (i+1) + '\')');
			if (!((i+1)%2)) {
				if (!(j%2))
					square.setAttribute('class', 'gray');
			}
			else {
				if (j%2)
					square.setAttribute('class', 'gray');
			}
			rank.appendChild(square);
		}
		table.appendChild(rank);
	}
	get('container').appendChild(table);
	reset();
}

function checkState(id) {
	if (!board.moving) {
		board.moving = true;
		board.from = id;
		if (get(id).innerHTML) {
			showLegalMoves(id);
		}
		else{
			board.moving = false;
			board.from = '';
			clearLegalMoves();
		}
	}
	else {
		move(get(board.from).innerHTML, board.from, id);
		board.moving = false;
		board.from = '';
		clearLegalMoves();
	}
}

function showLegalMoves(source) {
	board.srcFile = source.charAt(0);
	board.srcRank = source.charAt(1);
	switch (get(source).innerHTML) {
		case wp:
			if (board.srcRank == 2) {
				//1 or 2 moves ahead
				board.aimFile = board.srcFile;
				board.aimRank = [3, 4];
				for (var i=0; i<=board.aimRank.length-1; i++) {
					board.aim = board.aimFile + board.aimRank[i];
					if (!get(board.aim).innerHTML) {
						get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
					}
					else
					{
						break; // <--- prevents Pawn from jump pieces
					}
				}
				//check diagonals (capture)
				board.aimFile = [-1, 1];
				board.aimRank = [ 1, 1];
				for (var i=0; i<=1; i++) {
					var af = board.srcFile.charCodeAt(0);
					af += board.aimFile[i];
					if (af < 97 || af > 104) {
						continue;
					}
					var ar = board.srcRank.charCodeAt(0);
					ar += board.aimRank[i];
					if (ar < 49 || ar > 56) {
						continue;
					}
					board.aim = board[String.fromCharCode(af)][String.fromCharCode(ar-1)];
					for (var j=0; j<=black.length-1;j++) {
						if (board.aim == black[j]) {
							get(String.fromCharCode(af) + String.fromCharCode(ar)).style.cssText = 'background-color: rgb(136, 102, 102);';
							break;
						}
					}
				}
			}
			else {
				//one move ahead or capture
				board.aimFile = 0;
				board.aimRank = 1;
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile;
				if (af < 97 || af > 104) {
					break;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank;
				if (ar < 49 || ar > 56) {
					break;
				}
				if (!get(String.fromCharCode(af) + String.fromCharCode(ar)).innerHTML) {
					get(String.fromCharCode(af) + String.fromCharCode(ar)).style.cssText = 'background-color: rgb(102, 102, 136);';
					//get(String.fromCharCode(af) + String.fromCharCode(ar)).style.boxShadow = '2px 2px 2px #fff inset;';
				}
				//check diagonals (capture)
				board.aimFile = [-1, 1];
				board.aimRank = [1, 1];
				for (var i=0; i<=1; i++) {
					var af = board.srcFile.charCodeAt(0);
					af += board.aimFile[i];
					if (af < 97 || af > 104) {
						continue;
					}
					var ar = board.srcRank.charCodeAt(0);
					ar += board.aimRank[i];
					if (ar < 49 || ar > 56) {
						continue;
					}
					board.aim = board[String.fromCharCode(af)][String.fromCharCode(ar-1)];
					for (var j=0; j<=black.length-1;j++) {
						if (board.aim == black[j]) {
							get(String.fromCharCode(af) + String.fromCharCode(ar)).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
				//the 'En passant' move
				if (board.srcRank == 5) {
					var epFile = board.srcFile.charCodeAt(0);
					var lm = board.mr.slice(-4);
					epFile = epFile - 1;
					if ((epFile >= 97 && epFile <= 104) && (board[String.fromCharCode(epFile)][board.srcRank-1] == bp)) {
						epFile = String.fromCharCode(epFile);
						if (lm == epFile + '7' + epFile + '5') {
							get(epFile + '6').style.cssText = 'background-color: rgb(136, 102, 102);';
							board.enPassant = true;
							console.log('En passant!'); //debug
						}
					}
					epFile = board.srcFile.charCodeAt(0);
					epFile += 1;
					if ((epFile >= 97 && epFile <= 104) && (board[String.fromCharCode(epFile)][board.srcRank-1] == bp)) {
						epFile = String.fromCharCode(epFile);
						if (lm == epFile + '7' + epFile + '5') {
							get(epFile + '6').style.cssText = 'background-color: rgb(136, 102, 102);';
							board.enPassant = true;
							console.log('En passant!'); //debug
						}
					}
				}
			}
			break;
		case wN:
			board.aimFile = [-2,-2,-1,-1, 1, 1, 2, 2];
			board.aimRank = [-1, 1,-2, 2,-2, 2,-1, 1];
			for (var i=0; i<=7; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
			}
			break;
		case wB:
			//superior right (positive, positive axis)
			board.aimFile = [1, 2, 3, 4, 5, 6, 7];
			board.aimRank = [1, 2, 3, 4, 5, 6, 7];
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if(!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//superior left (negative, positive axis)
			board.aimFile = [-1,-2,-3,-4,-5,-6,-7];
			board.aimRank = [ 1, 2, 3, 4, 5, 6, 7];
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if(get(board.aim).innerHTML == '') {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//inferior right (positive, negative axis)
			board.aimFile = [ 1, 2, 3, 4, 5, 6, 7];
			board.aimRank = [-1,-2,-3,-4,-5,-6,-7];
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if(!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//inferior left (negative, negative axis)
			board.aimFile = [-1,-2,-3,-4,-5,-6,-7];
			board.aimRank = [-1,-2,-3,-4,-5,-6,-7];
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if(!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			break;
		case wR:
			//up
			board.aimFile = board.srcFile;
			board.aimRank = [1, 2, 3, 4, 5, 6, 7];
			for (var i=0; i<=6; i++) {
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = board.aimFile + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//down
			board.aimFile = board.srcFile;
			board.aimRank = [-1,-2,-3,-4,-5,-6,-7];
			for (var i=0; i<=6; i++) {
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = board.aimFile + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//left
			board.aimFile = [-1,-2,-3,-4,-5,-6,-7];
			board.aimRank = board.srcRank;
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				board.aim = String.fromCharCode(af) + board.aimRank;
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1; j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//right
			board.aimFile = [1, 2, 3, 4, 5, 6, 7];
			board.aimRank = board.srcRank;
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				board.aim = String.fromCharCode(af) + board.aimRank;
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1; j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			break;
		case wQ:
			//superior right (positive, positive axis)
			board.aimFile = [1, 2, 3, 4, 5, 6, 7];
			board.aimRank = [1, 2, 3, 4, 5, 6, 7];
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if(!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//superior left (negative, positive axis)
			board.aimFile = [-1,-2,-3,-4,-5,-6,-7];
			board.aimRank = [ 1, 2, 3, 4, 5, 6, 7];
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if(!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//inferior right (positive, negative axis)
			board.aimFile = [ 1, 2, 3, 4, 5, 6, 7];
			board.aimRank = [-1,-2,-3,-4,-5,-6,-7];
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if(!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//inferior left (negative, negative axis)
			board.aimFile = [-1,-2,-3,-4,-5,-6,-7];
			board.aimRank = [-1,-2,-3,-4,-5,-6,-7];
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if(!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//up
			board.aimFile = board.srcFile;
			board.aimRank = [1, 2, 3, 4, 5, 6, 7];
			for (var i=0; i<=6; i++) {
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = board.aimFile + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//down
			board.aimFile = board.srcFile;
			board.aimRank = [-1,-2,-3,-4,-5,-6,-7];
			for (var i=0; i<=6; i++) {
				var ar = board.srcRank.charCodeAt(0);
				ar += board.aimRank[i];
				if (ar < 49 || ar > 56) {
					continue;
				}
				board.aim = board.aimFile + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1;j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//left
			board.aimFile = [-1,-2,-3,-4,-5,-6,-7];
			board.aimRank = board.srcRank;
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				board.aim = String.fromCharCode(af) + board.aimRank;
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1; j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			//right
			board.aimFile = [1, 2, 3, 4, 5, 6, 7];
			board.aimRank = board.srcRank;
			for (var i=0; i<=6; i++) {
				var af = board.srcFile.charCodeAt(0);
				af += board.aimFile[i];
				if (af < 97 || af > 104) {
					continue;
				}
				board.aim = String.fromCharCode(af) + board.aimRank;
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var j=0; j<=black.length-1; j++) {
						if (black[j] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
					break;
				}
			}
			break;
		case wK:
			//superior right
			board.aimFile = 1;
			board.aimRank = 1;
			var af = board.srcFile.charCodeAt(0);
			af += board.aimFile;
			var ar = board.srcRank.charCodeAt(0);
			ar += board.aimRank;
			if ((af >= 97 && af <= 104) && (ar >= 49 && ar <= 56)) {
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var i=0; i<=black.length-1; i++) {
						if (black[i] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
			}
			//right
			board.aimFile = 1;
			board.aimRank = 0;
			var af = board.srcFile.charCodeAt(0);
			af += board.aimFile;
			var ar = board.srcRank.charCodeAt(0);
			ar += board.aimRank;
			if ((af >= 97 && af <= 104) && (ar >= 49 && ar <= 56)) {
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var i=0; i<=black.length-1; i++) {
						if (black[i] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
			}
			//inferior right
			board.aimFile = 1;
			board.aimRank = -1;
			var af = board.srcFile.charCodeAt(0);
			af += board.aimFile;
			var ar = board.srcRank.charCodeAt(0);
			ar += board.aimRank;
			if ((af >= 97 && af <= 104) && (ar >= 49 && ar <= 56)) {
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var i=0; i<=black.length-1; i++) {
						if (black[i] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
			}
			//down
			board.aimFile = 0;
			board.aimRank = -1;
			var af = board.srcFile.charCodeAt(0);
			af += board.aimFile;
			var ar = board.srcRank.charCodeAt(0);
			ar += board.aimRank;
			if ((af >= 97 && af <= 104) && (ar >= 49 && ar <= 56)) {
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var i=0; i<=black.length-1; i++) {
						if (black[i] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
			}
			//inferior left
			board.aimFile = -1;
			board.aimRank = -1;
			var af = board.srcFile.charCodeAt(0);
			af += board.aimFile;
			var ar = board.srcRank.charCodeAt(0);
			ar += board.aimRank;
			if ((af >= 97 && af <= 104) && (ar >= 49 && ar <= 56)) {
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var i=0; i<=black.length-1; i++) {
						if (black[i] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
			}
			//left
			board.aimFile = -1;
			board.aimRank = 0;
			var af = board.srcFile.charCodeAt(0);
			af += board.aimFile;
			var ar = board.srcRank.charCodeAt(0);
			ar += board.aimRank;
			if ((af >= 97 && af <= 104) && (ar >= 49 && ar <= 56)) {
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var i=0; i<=black.length-1; i++) {
						if (black[i] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
			}
			//superior left
			board.aimFile = -1;
			board.aimRank = 1;
			var af = board.srcFile.charCodeAt(0);
			af += board.aimFile;
			var ar = board.srcRank.charCodeAt(0);
			ar += board.aimRank;
			if ((af >= 97 && af <= 104) && (ar >= 49 && ar <= 56)) {
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var i=0; i<=black.length-1; i++) {
						if (black[i] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
			}
			//up
			board.aimFile = 0;
			board.aimRank = 1;
			var af = board.srcFile.charCodeAt(0);
			af += board.aimFile;
			var ar = board.srcRank.charCodeAt(0);
			ar += board.aimRank;
			if ((af >= 97 && af <= 104) && (ar >= 49 && ar <= 56)) {
				board.aim = String.fromCharCode(af) + String.fromCharCode(ar);
				if (!get(board.aim).innerHTML) {
					get(board.aim).style.cssText = 'background-color: rgb(102, 102, 136);';
				}
				else {
					for (var i=0; i<=black.length-1; i++) {
						if (black[i] == get(board.aim).innerHTML) {
							get(board.aim).style.cssText = 'background-color: rgb(136, 102, 102);';
						}
					}
				}
			}
			//Castling
			if (board.wCastling) {
				if (board.mr.indexOf('a1') == -1) {
					board.aimFile = [-1,-2,-3];
					for (var i=0; i<=board.aimFile.length-1; i++) {
						var af = board.srcFile.charCodeAt(0);
						af += board.aimFile[i];
						var ar = board.srcRank;
						if (board[String.fromCharCode(af)][ar-1]) {
							clearCastling('l');
							break;
						}
						else if (i == board.aimFile.length-2) {
							get(String.fromCharCode(af) + ar).style.cssText = 'background-color: rgb(102, 136, 102);';
						}
					}
				}
				if (board.mr.indexOf('h1') == -1) {
					board.aimFile = [1, 2];
					for (var i=0; i<=board.aimFile.length-1; i++) {
						var af = board.srcFile.charCodeAt(0);
						af += board.aimFile[i];
						var ar = board.srcRank;
						if (board[String.fromCharCode(af)][ar-1]) {
							clearCastling('r');
							break;
						}
						else if (i == board.aimFile.length-1) {
							get(String.fromCharCode(af) + ar).style.cssText = 'background-color: rgb(102, 136, 102);';
						}
					}
				}
			}
			break;
		default:
			break;
	}
}

function move(piece, from, to) {
	if (get(to).style.cssText) {
		var fromFile = from.charAt(0);
		var fromRank = from.charAt(1);
		var toFile = to.charAt(0);
		var toRank = to.charAt(1);
		board[fromFile][fromRank-1] = '';
		if (board.enPassant && !board[toFile][toRank-1]) {
			board[toFile][toRank-2] = '';
		}
		board[toFile][toRank-1] = piece;
		if (piece == wp) {

			if (toRank == 8)
				board[toFile][toRank-1] = wQ;
		}
		else if (piece == wK) {
			if (from == 'e1' && to == 'c1') {
				console.log('Castling!'); //debug
				board.a[0] = '';
				board.d[0] = wR;
			}
			else if (from == 'e1' && to == 'g1') {
				console.log('Castling!'); //debug
				board.h[0] = '';
				board.f[0] = wR;
				refresh();
			}
			board.wCastling = false;
		}
		refresh();
		board.mr += piece + from + to;
		board.enPassant = false;
		board.wTurn = board.wTurn?false:true;
		//if (piece == bK) {
		//	board.bCastling = false;
		//}
		console.log(board.mr); //debug
	}
	else
		console.log('warning: invalid move'); //debug
	board.moving = false;
}

function refresh() {
	for (var x=0; x<=7; x++) {
		get('a' + (x+1)).innerHTML = board.a[x];
		get('b' + (x+1)).innerHTML = board.b[x];
		get('c' + (x+1)).innerHTML = board.c[x];
		get('d' + (x+1)).innerHTML = board.d[x];
		get('e' + (x+1)).innerHTML = board.e[x];
		get('f' + (x+1)).innerHTML = board.f[x];
		get('g' + (x+1)).innerHTML = board.g[x];
		get('h' + (x+1)).innerHTML = board.h[x];
	}
}

function clearLegalMoves() {
	for (var i=0;i<=7;i++) {
		var a = 'a' + (i+1);
		var b = 'b' + (i+1);
		var c = 'c' + (i+1);
		var d = 'd' + (i+1);
		var e = 'e' + (i+1);
		var f = 'f' + (i+1);
		var g = 'g' + (i+1);
		var h = 'h' + (i+1);
		get(a).style.cssText = '';
		get(b).style.cssText = '';
		get(c).style.cssText = '';
		get(d).style.cssText = '';
		get(e).style.cssText = '';
		get(f).style.cssText = '';
		get(g).style.cssText = '';
		get(h).style.cssText = '';
	}
}

function clearCastling(side) {
	get(side=='l'?'c1':'g1').style.cssText = '';
}

//shorten methods
function get(id) {
	return document.getElementById(id);
}

function ce(e) {
	return document.createElement(e);
}
