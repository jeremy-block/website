/*
    canvas-animation.js
    load image function derived from: http://jsfiddle.net/3MPrT/1/
*/
//When the page has fully loaded, execute the eventWindowLoaded function
window.addEventListener("load", eventWindowLoaded, false);
//-----------------------------------------------------------
//eventWindowLoaded()
//Called when the window has been loaded it then calls the canvasapp() 
function eventWindowLoaded() {
	canvasApp();
} // eventWindowLoaded()
//-----------------------------------------------------------
//canvasSupport() 
//Check for Canvas Support using modernizr.js
function canvasSupport() {
	return Modernizr.canvas;
} // canvasSupport()
//-----------------------------------------------------------
//canvasApp() 
//The function where ALL our canvas code will go
function canvasApp() {
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
	/* Canvas Support */
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
	//-----------------------------------------------------------
	//Check to see if the canvas has a context 
	if (!canvasSupport()) {
		return; //Canvas not supported so exit the function
	}
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
	/* Object Variable Declaration */
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var canvasHeight = canvas.height; // - 16; //get the heigth of the canvas
	var canvasWidth = canvas.width; // - 16; //get the width of the canvas
	var canvasColor = "rgba(30, 30, 30, 0.1)"; // set the default canvas bg color
	var numberOfBoids = 200; //Starting Number of Boids to be decramented to 0
	var numberOfRaptors = 10; //starting number of Raptors on screen
	var boids; //Object array of boids
	var raptors; //Object array of raptors
	var timeoutTime = 65 / 3; // time between frames (65/3 ≈  30fps)
	var frameCounter = 0; //cntr for adding raptors every 2 seconds iniciallized to 0, incremented each frame.
	var minDist = 10; //how close each boids can get to one enother.
	var sight = 18; //how many pixels away from a  boids location can they see and react to a raptor.
	var maxSpeed = 1; //limits the objects from accelerating out of control
	/*sets the begining mouse location to the center of the canvas*/
	var mouseXlocation = (canvasWidth / 2);
	var mouseYlocation = (canvasHeight / 2);
	//     function ResizeCanvas()
	//     {
	//     	var cnv = document.getElementById("canvas");
	//     	cnv.width = window.innerWidth - 16;
	//     	cnv.height = window.innerHeight - 16;	
	//     }
	// Init
	function StartBoids() {
		boids = new Array();
		raptors = new Array();
		for (var i = 0; i < numberOfBoids; i++) boids.push(new Boid(-1, -1));
		for (var j = 0; j < numberOfRaptors; j++) raptors.push(new Raptor(-1, 2));
		//        requestAnimationFrame(Run);
		setTimeout(Run, timeoutTime);
	}

	function GameOver() {
		var finishTime = (raptors.length - numberOfRaptors) * 2
		ctx.fillStyle = "#c44d23";
		ctx.shadowColor = "#000000";
		ctx.shadowBlur = 30;
		ctx.font = "bold 50px 'Josefin Sans', sans-serif";
		ctx.fillText("GAME OVER", canvasWidth / 2 - 130, canvasHeight / 2 + 30);
		ctx.font = "bold 20px 'Josefin Sans', sans-serif";
		ctx.fillText("You survived for: " + finishTime + " Seconds", canvasWidth / 2 - 96, canvasHeight / 2 + 60);
	}

	function ClearCanvas(color) {
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		ctx.closePath;
	}
	// Calculates and paints boids and raptors
	function Run() {
		frameCounter++;
		if (frameCounter % 160 == 0 && numberOfBoids > 0) {
			console.log("Adding a Raptor!!!!!!!!!");
			var index = raptors.length;
			raptors.push(new Raptor(-1, 2, index));
		}
		//        var fpsTimer = (new Date()).getTime();
		ClearCanvas(canvasColor); //ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Calculate
		UpdatePositions();
		checkCollicions();
		// Paint all boids
		boids.forEach(function (boid) {
			if (boid.isAlive) {
				boid.Paint();
			} //if
		});
		// Paint all raptors
		raptors.forEach(function (raptor) {
			raptor.Paint();
		});
		//If all the boids are dead
		if (numberOfBoids <= 0) {
			GameOver();
		}
		// Show info
		ctx.fillStyle = "#fff";
		ctx.font = "bold 20px 'Josefin Sans', sans-serif";
		ctx.shadowBlur = 0;
		// Show number of boids
		ctx.fillText("Number of Boids: " + numberOfBoids, 5, 22);
		ctx.fillText("Number of Raptors: " + raptors.length, 5, 45);
		setTimeout(Run, timeoutTime);
	}

	function UpdatePositions() {
		var flockCenter = {};
		flockCenter.x = 0;
		flockCenter.y = 0;
		for (var i = 0; i < boids.length; i++) {
			flockCenter.x = (i * flockCenter.x + boids[i].x) / (i + 1);
			flockCenter.y = (i * flockCenter.y + boids[i].y) / (i + 1);
		}
		flockCenter.x = mouseXlocation;
		flockCenter.y = mouseYlocation;
		// Calculate new speed and position
		boids.forEach(function (boid) {
			var dx = 0;
			var dy = 0;
			// Move towards flock center
			boid.dx += (flockCenter.x - boid.x) / 110;
			boid.dy += (flockCenter.y - boid.y) / 110;
			boids.forEach(function (b) {
				var dist = boid.Distance(b);
				if (dist < minDist) {
					// Not too close
					boid.dx += (boid.x - b.x) / 40;
					boid.dy += (boid.y - b.y) / 40;
				}
				if (dist < sight) {
					// Align directions
					boid.dx += b.dx / 300;
					boid.dy += b.dy / 300;
				}
			});
			// Avoid raptors
			raptors.forEach(function (raptor) {
				dist = boid.Distance(raptor);
				if (dist < sight) {
					boid.dx += (boid.x - raptor.x) * 1.5;
					boid.dy += (boid.y - raptor.y) * 1.5
				}
			});
			// Check boundaries
			if (boid.x < sight) boid.dx += (sight - boid.x) * 0.4;
			if (boid.x > canvas.width - sight) boid.dx -= (canvas.width - boid.x) * 0.4;
			if (boid.y < sight) boid.dy += (sight - boid.y) * 0.4;
			if (boid.y > canvas.height - sight) boid.dy -= (canvas.height - boid.y) * 0.4;
			boid.Move();
			// If outside, move back in
			if (boid.x < 0) boid.x = 0;
			if (boid.x > canvas.width) boid.x = canvas.width;
			if (boid.y < 0) boid.y = 0;
			if (boid.y > canvas.height) boid.y = canvas.height;
		});
		raptors.forEach(function (raptor) {
			raptor.Move();
			// If outside, move back in
			if (raptor.x < 0)
			// raptor.x = 0;
				raptor.dx = raptor.dx * -1;
			if (raptor.x >= canvas.width) raptor.dx = raptor.dx * -1; // = canvas.width;
			if (raptor.y < 0) raptor.dy = raptor.dy * -1;
			if (raptor.y > canvas.height) raptor.dy = raptor.dy * -1;
		});
	}

	function checkCollicions() {
		raptors.forEach(function (raptor) {
			boids.forEach(function (boid) {
				if (boid.isAlive) {
					if (raptor.x < boid.x + boid.sizeX && raptor.x + raptor.sizeX > boid.x && raptor.y < boid.y + boid.sizeY && raptor.y + raptor.sizeY > boid.y) {
						//delete boids
						boid.isAlive = false;
						numberOfBoids--;
					} //End If Collision
				} //End If Is Alive
			});
		});
	}
	// Boid object
	function Boid(x, y) {
		if (x == -1 || y == -1) {
			this.x = Math.round(Math.random() * canvas.width * 0.8 + 100);
			this.y = Math.round(Math.random() * canvas.height * 0.8 + 100);
		}
		else {
			this.x = x;
			this.y = y;
		}
		this.isAlive = true;
		this.sizeX = 3;
		this.sizeY = 3;
		this.dx = Math.random() * 2 - 1;
		this.dy = Math.random() * 2 - 1;
	}
	Boid.prototype.Paint = function () {
		ctx.fillStyle = "#fff";
		ctx.shadowColor = "#ed5c29";
		ctx.shadowBlur = 15;
		ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);
	}
	Boid.prototype.Move = function () {
		var spd = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		if (spd > maxSpeed) {
			this.dx /= spd * 0.38;
			this.dy /= spd * 0.38;
		}
		this.x += this.dx;
		this.y += this.dy;
	}
	Boid.prototype.Distance = function (b) {
			var difX = this.x - b.x;
			var difY = this.y - b.y;
			return Math.sqrt(difX * difX + difY * difY);
		}
		// Raptor object
	function Raptor(x, y) {
		if (x == -1) {
			this.x = Math.round(Math.random() * canvas.width * 0.8 + 100);
		}
		else {
			this.x = x;
		}
		if (y == -1) {
			this.y = Math.round(Math.random() * canvasHeight + 100);
		}
		else {
			this.y = y;
		}
		this.sizeX = 15;
		this.sizeY = 15;
		this.dx = Math.random() * 2 - 2;
		this.dy = Math.random() * 2 - 2;
	}
	Raptor.prototype.Paint = function () {
		ctx.beginPath();
		ctx.fillStyle = "#ed5c29";
		ctx.shadowColor = "#222";
		ctx.shadowBlur = 80;
		ctx.arc(this.x, this.y, (this.sizeX / 2), 0, (Math.PI * 2));
		ctx.fill();
		ctx.closePath();
		//        ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);
	}
	Raptor.prototype.Move = function () {
		var spd = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		if (spd > maxSpeed * 200) {
			this.dx /= spd * 0.08;
			this.dy /= spd * 0.08;
		}
		this.x += this.dx;
		this.y += this.dy;
	}
	Raptor.prototype.Distance = function (b) {
		var difX = this.x - b.x;
		var difY = this.y - b.y;
		return Math.sqrt(difX * difX + difY * difY);
	}
	canvas.onmousemove = function (event) {
		//        console.log(event.x + " : " + event.y);
		mouseYlocation = event.y;
		mouseXlocation = event.x;
	}
	StartBoids();
	Run();
} //Canvas App