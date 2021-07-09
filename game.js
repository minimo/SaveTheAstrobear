/*
	Save the astrobear
	2012/04/21
*/

window.focus();
window.addEventListener("mousedown", () => window.focus());

enchant();

window.onload = function() {
	var game = new Game( 320, 320 );
	game.rootScene.backgroundColor = "#000000";
	game.fps = 30;
	var sec = function( time ){ return game.fps * time; }
	var rand = function( max ){ return ~~(Math.random() * max); }

	game.preload('chara1.gif','map2.gif','space.jpg','h2a_rocket.gif','effect.gif');
	game.onload = function () {
		var score = 0;
		
		//ステージ管理
		/////////////////////////////////////////////////////////////////////////////
		var stage = new Group();
		stage.time=0;
		stage.onenterframe = function(){
			if( this.time % 15 == 0 ){
				enterObj();
			}
			this.time++;
		}
		game.rootScene.addChild(stage);

		//バックグラウンド
		/////////////////////////////////////////////////////////////////////////////
		var bg = new Sprite(320,320);
		bg.imgae = game.assets['space.jpg'];
		bg.x = 0;
		bg.y = 0;
		game.rootScene.addChild( bg );

		//スコア表示
		/////////////////////////////////////////////////////////////////////////////
		var scoreLabel = new Label( "SCORE : " + score );
		scoreLabel.x = 5;
		scoreLabel.y = 5;
		scoreLabel.color = "#ffffff";
		scoreLabel.font = "bold";
		scoreLabel.onenterframe=function(){
			this.text = "SCORE : " + score;
		}
		game.rootScene.addChild( scoreLabel );

		//時間表示
		/////////////////////////////////////////////////////////////////////////////
		var maxTime = 30;		//制限時間
		var nowTime = maxTime;	//現在時間
		var timeLabel = new Label( "TIME : " + nowTime.toFixed(2) );
		timeLabel.x = 251;
		timeLabel.y = 5;
		timeLabel.color = "#ffffff";
		timeLabel.font = "bold";
		timeLabel.start = new Date().getTime();
		timeLabel.addEventListener('enterframe', function(){
			var now = new Date().getTime();
			var sec = ((now - this.start)/1000);
			nowTime = maxTime - sec.toFixed(2);
			this.text = "TIME : " + nowTime.toFixed(2);
			if( nowTime <= 0 ){
				this.text = "TIME : 0.00";
				game.end( score, "SCORE :"+score );
			}
		});
		stage.addChild( timeLabel );
		
		//プレイヤ管理
		/////////////////////////////////////////////////////////////////////////////
		var shot = false;
		var player = new Sprite(32,32);
		player.image = game.assets['chara1.gif']
		player.frame = 15;
		player.x = 160-16;
		player.y = 280;
		player.time = 0;
		player.onenterframe=function(){
			if( game.input.left ){
				this.x-=3;
				this.scaleX = -1;
				if( this.x < 0 )this.x = 0;
			}
			if( game.input.right ){
				this.x+=3;
				this.scaleX = 1;
				if( this.x > 320-32)this.x = 320-32;
			}
			if( game.input.left || game.input.right ){
				this.frame++;
				if( this.frame == 18)this.frame=15;
			}else{
				this.frame = 15;
			}
			if( game.input.up  && !shot ){
				shot = true;
				h2.x = this.x;
				h2.y = this.y-32;
				h2.count = 0;
				stage.addChild(h2);
			}
			this.time++;
		}
		stage.addChild(player);

		//救出用ロケット
		/////////////////////////////////////////////////////////////////////////////
		var h2 = new Sprite(32,64);
		h2.image = game.assets['h2a_rocket.gif']
		h2.x = 0;
		h2.y = -100;
		h2.col = new Sprite(16,48);
		h2.col.y = -100;
		h2.onenterframe = function(){
			if( game.input.down ){
				this.y-=1;
			}else if( game.input.up ){
				this.y-=8;
			}else{
				this.y-=4;
			}
			if( this.y < -62 ){
				shot = false;
				stage.removeChild(this);
			}
			this.col.x = this.x+8;
			this.col.y = this.y+8;
		}

		//オブジェクト投入
		/////////////////////////////////////////////////////////////////////////////
		var enterObj = function(){
			var dice = rand(4);
			switch(dice){
				case 0:
				case 1:
					var bear = new Sprite(32,32);
					bear.image = game.assets['chara1.gif']
					bear.frame = 18;
					bear.x = -32;
					bear.y = rand(100)+32;
					bear.vx = rand(2)+1;
					bear.sy = bear.y;
					bear.rad = 0;
					bear.rotation = rand(360);
					bear.dir = rand(4);
					bear.onenterframe=function(){
						this.y = Math.sin(this.rad*0.05)*20+this.sy;
						this.x+=this.vx;
						this.rad++;
						if( this.x > 320 )stage.removeChild(this);
						if( this.intersect(h2) ){
							stage.removeChild(this);
							h2.count++;
							score+=100 * h2.count;
							var pt = new Text( this.x, this.y, ""+100*h2.count );
							pt.count = 10;
							pt.addEventListener( 'enterframe', function() {
								this.y--;
								this.count--;
								this.opacity -= 0.1;
								if( this.count == 0 )stage.removeChild( this );
							});
							stage.addChild(pt);

                            //救出後くま表示
                            var res_bear = new Sprite(32,32);
                            res_bear.image = game.assets['chara1.gif']
                            res_bear.frame = 16;
                            res_bear.x = this.x;
                            res_bear.y = this.y;
							res_bear.vx = -1;
							if( this.x < h2.x )res_bear.vx = 1;
                            res_bear.yPrev = this.y;
                            res_bear.F = 9;
                            res_bear.onenterframe = function(){
								this.x += this.vx;
								var yTemp = this.y;
								var yTemp2 = ( this.yPrev - this.y ) + this.F;
								this.y -= yTemp2;
								this.F = -1;
								this.yPrev = yTemp;
								this.opacity-=0.05;
								if( this.opacity < 0 )stage.removeChild(this);
                            }
							stage.addChild(res_bear);
                            

						}
					}
					stage.addChild(bear);
					break;
				case 2:
				case 3:
					var meteor = new Sprite(16,16);
					meteor.image = game.assets['map2.gif'];
					meteor.frame = 9;
					meteor.x = -32;
					meteor.y = rand(100)+32;
					meteor.vx = rand(2)+1;
					meteor.vy = 0;
					meteor.scaleX = 1;
					meteor.scaleY = 1;
					meteor.rotation = rand(360);
					meteor.onenterframe=function(){
						this.x+=this.vx;
						this.y+=this.vy;
						this.rotation++;
						if( this.x > 320 )stage.removeChild(this);
						if( this.intersect(h2.col) ){
							score-=500;
							if( score < 0 )score = 0;
							stage.removeChild(this);

							var explode = new Sprite( 16, 16 );
							explode.image = game.assets['effect.gif'];
							explode.frame = 0;
							explode.point = 0;
							explode.x = h2.x;
							explode.y = h2.y;
							explode.scaleX = 2;
							explode.scaleY = 2;
							explode.count = 0;
							stage.addChild( explode );
							explode.addEventListener( 'enterframe', function(){
								this.count++;
								if( this.count % 2 == 0 )this.frame++;
								if( this.frame> 4 )stage.removeChild( this );
							});

							shot = false;
							stage.removeChild(h2);
							h2.x = 0;
							h2.y = -200;
							h2.col.y = -200;

							var pt = new Text( this.x, this.y, "-500" );
							pt.count = 20;
							pt.addEventListener( 'enterframe', function() {
								this.y++;
								this.count--;
								this.opacity -= 0.05;
								if( this.count == 0 )stage.removeChild( this );
							});
							stage.addChild(pt);
						}
					}
					stage.addChild(meteor);
					break;
			}
		}
	}
	game.start();
};

