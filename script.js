
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 75;
let angle = 0;
let previousAngle = angle;
const arrowLength = 80;

const arcRadius = radius + 45; // Arcs will be drawn at this distance from the center
const numArcs = 1; // Number of arcs to be drawn
const minArcAngle = Math.PI / 7; // Minimum angle for the arcs
// things that get reset
let minArcLength = Math.PI / 4;
let arcLength = Math.PI / 6;
let rotationSpeed = 0.014;
let minDistanceFromArrow = Math.PI / 4; // Minimum distance from the arrow for new arcs
let remainingCount = 50;
let isUpdating = false; // flag to check if the game is updating
let gameStarted = false;
let arc = 0;
///// 

let time = 0;
let timmeofclick = time;
let animationFrameId;

let onGameOverScreen = true;


const gameMusic = document.getElementById('gameMusic');
//gameMusic.play();
const epsilon = 0.13; // allowed difference between curPos and newPos


function drawCircle() {
  // Update the time variable
  time += 0.05;

  // Calculate a pulsating radius
  const pulsatingRadius = radius + 5 * Math.sin(time);

  ctx.beginPath();
  ctx.arc(centerX, centerY, pulsatingRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#004C9C';
  ctx.fill();
  ctx.closePath();

  // Display the remaining count
  ctx.font = 'bold 56px Consolas';  // Make the font bold
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle'; // Vertically center the text
  ctx.fillText(remainingCount, centerX, centerY);
}

function drawArrow() {
  const startX = centerX + (radius + 5 * Math.sin(time))* Math.cos(angle);
  const startY = centerY + (radius + 5 * Math.sin(time)) * Math.sin(angle);
  const tipX = startX + arrowLength * Math.cos(angle);
  const tipY = startY + arrowLength * Math.sin(angle);

  ctx.beginPath();
  ctx.moveTo(startX, startY); // Start from the edge of the circle
  ctx.lineTo(tipX, tipY); // Draw to the tip of the arrow
  ctx.strokeStyle = '#9C004C';
  ctx.lineWidth = 15;
  ctx.stroke();
  ctx.closePath();
}


function mod(a, n) {
  return ((a % n) + n) % n;
}
function angularDistance(theta1, theta2) {
  // Ensure the angles are in [0, 2π) range
  theta1 = ((theta1 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  theta2 = ((theta2 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Calculate the absolute difference
  const diff = Math.abs(theta1 - theta2);

  // Find the smallest angular distance
  const deltaTheta = Math.min(diff, 2 * Math.PI - diff);

  return deltaTheta;
}
function regenerateArc() {
  
  const arcMiddle = mod((angle + Math.sign(rotationSpeed)*(arcLength + minDistanceFromArrow + Math.random() * Math.PI)), (2 * Math.PI));
  let left = mod((arcMiddle - arcLength), (2 * Math.PI));
  if (left < 0) {
    left += 2 * Math.PI;
  }
  //let right = mod((arcMiddle + arcLength), (2 * Math.PI));
 // console.log(`Arrow angle: ${angle.toFixed(2)} rad`);
  //console.log( "left = ",left.toFixed(2) ,"Middle = ", arcMiddle.toFixed(2),"right = ", right.toFixed(2));
  //console.log("ang dist: ",angularDistance(arcMiddle, angle));
  //console.log("min dist: ",minDistanceFromArrow);
  arc = arcMiddle;
  minDistanceFromArrow = minDistanceFromArrow *0.95;
  minArcLength = minArcLength *0.99;
  arcLength = minArcLength + (Math.random() * (remainingCount/50) + 0.3) * (Math.PI/6);
  rotationSpeed = rotationSpeed * 1.002;
}
function drawArc() {
  ctx.beginPath();
  ctx.arc(centerX, centerY, arcRadius, arc - (arcLength - epsilon*2), arc + (arcLength - epsilon*2) );
  ctx.strokeStyle = '#009C51';
  ctx.lineWidth = 35;
  ctx.stroke();
  ctx.closePath();
}
function restartGame() {
  
  startGame()  // Start the game loop again
}

function captureScreenshot(filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
}
function toggleDirection(event) {
    if (gameStarted) return; // Ignore the event if the game just started
    isUpdating = true;  // set the flag to true
    if ((event.type === 'keydown' && event.code === 'Space') || (event.type === 'click' && event.button === 0)) {
        const canvas = document.getElementById('gameCanvas');
        const boopSound = document.getElementById('boopSound');
        if (!onGameOverScreen){
          boopSound.volume = 0.6;
          boopSound.play();
        }
        canvas.style.backgroundColor = '#0300BC'; // Flash this color
        setTimeout(() => {
            canvas.style.backgroundColor = '#02009c'; // Smoothly revert back to the original color
        }, 150);  // Adjust this delay as needed to control the flash duration
        console.log("ang: ",angle);
        console.log("arc: ",arc);
        console.log("arcLength: ",arcLength);
        console.log("dist: ",angularDistance(arc, angle));
        console.log("right: ",arc + arcLength);
        console.log("left: ",arc - arcLength);
        console.log(arcLength);
    if (angularDistance(arc, angle) < arcLength ) {
      remainingCount--; // Decrement the count
      if (remainingCount === 0) {
        displayWinningScreen();
        //restartGame(); // Restart the game or navigate to a winning screen
        return;
      }
	  // HERE is correct hit within arc
      rotationSpeed = -rotationSpeed * 1.015;
      previousAngle = angle; // Store the current angle before updating it
      timmeofclick = time;
      regenerateArc();
      
       // Check if the arrow is within an arc and regenerate it if necessary
    } else {
      if (!onGameOverScreen){
        displayGameOverScreen();
      }
      return;
    }
  }
  isUpdating = false;  // set the flag to true
  console.log(isUpdating);
}
function startGame() {
  onGameOverScreen = false;
  rotationSpeed = 0.014;
  remainingCount = 50; // Reset the remaining count

  minArcLength = Math.PI / 4;
  arcLength = Math.PI / 6;
  // Regenerate arc
  regenerateArc();

  console.log('Restarting game...');
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  gameStarted = true; // Set the flag to true when the game starts
  setTimeout(() => {
    gameStarted = false; // Reset the flag after a short delay
  }, 10); // Delay in milliseconds (500 ms = 0.5 seconds)
  // Hide the start screen
  const startScreen = document.getElementById('startScreen');
  startScreen.style.display = 'none';

  // Play the game music if you have it
  if (gameMusic) {
    gameMusic.volume = 0.4; // Set volume to 50%
    gameMusic.play();
  }
  

  // Initialize and start the game
  regenerateArc();

  draw(); // Start the game loop
}
function drawPrevAngle() {
  const startX = centerX + (radius + 5 * Math.sin(timmeofclick))* Math.cos(previousAngle);
  const startY = centerY + (radius + 5 * Math.sin(timmeofclick)) * Math.sin(previousAngle);
  const tipX = startX + arrowLength * Math.cos(previousAngle);
  const tipY = startY + arrowLength * Math.sin(previousAngle);

  ctx.beginPath();
  ctx.moveTo(startX, startY); // Start from the edge of the circle
  ctx.lineTo(tipX, tipY); // Draw to the tip of the arrow
  ctx.strokeStyle = '#9C004C';
  ctx.lineWidth = 15;
  ctx.stroke();
  ctx.closePath();
}

function regen(){
		if (event.key.toLowerCase() === 'k') {
			regenerateArc();
			return;
		}
	}

function isGameOver() {
  if (isUpdating) return false;
  const target = mod((arc + arcLength), (2 * Math.PI));
   // The allowed difference
  if (Math.sign(rotationSpeed) > 0) {
    if (Math.abs(angle - target) <= epsilon) {
      console.log("ang: ",angle);
      console.log("arc: ",arc);
      console.log("arcLength: ",arcLength);
      console.log("dist: ",angularDistance(arc, angle));
      console.log("greater: ", mod((arc + arcLength), (2 * Math.PI)));
      console.log("right: ",arc + arcLength);
      console.log("left: ",arc - arcLength);
      return true;
    }
  }
 /* if (Math.sign(rotationSpeed) > 0) {
    if (angle ==  mod(( arc + arcLength), (2 * Math.PI))) {
      
    }
  }*/ 
  const target2 = mod((arc - arcLength), (2 * Math.PI));
  if (Math.sign(rotationSpeed) < 0) {
    console.log("negative ");
    if (Math.abs(angle - target2) <= epsilon) {
      console.log("ang: ",angle);
      console.log("arc: ",arc);
      console.log("arcLength: ",arcLength);
      console.log("dist: ",angularDistance(arc, angle));
      console.log("lesser: ", mod((arc - arcLength), (2 * Math.PI)));
      console.log("right: ",arc + arcLength);
      console.log("left: ",arc - arcLength);
      return true;
    }
  }
 /* if (Math.sign(rotationSpeed) < 0) {
    if (angle == mod(( arc - arcLength), (2 * Math.PI))) {

    }
  }*/
  return false;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCircle();
  drawArc();
  drawArrow();
  drawPrevAngle()

  previousAngle = angle;
  angle += rotationSpeed;
  angle = (angle + 2 * Math.PI) % (2 * Math.PI); // Normalize angle to [0, 2 * Math.PI]
  //console.log("dist: ",angularDistance(previousAngle, angle));
  //console.log("ang dist: ",angularDistance(arc, angle));
  //regenerateArc();
  //drawDebugInfo();

  if (!isUpdating && isGameOver()) {
    restartGame();  // Reset game state
    displayGameOverScreen();  // Show game-over screen
    return;  // Exit the function immediately to stop the game loop
  }
  

  animationFrameId = imationFrame(draw);
}


document.addEventListener('keydown', toggleDirection);
document.addEventListener('click', toggleDirection);
document.addEventListener('keydown', regen);

function displayWinningScreen() {
  console.log("Displaying Winning screen");

  cancelAnimationFrame(animationFrameId); // Cancel the current animation frame (stop the game loop)

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.fillStyle = 'green'; // Set the background color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with black
  ctx.font = '72px Arial'; // Set the font size and style
  ctx.fillStyle = 'white'; // Set the text color to white
  ctx.textAlign = 'center'; // Center the text
  ctx.fillText('You Win!', centerX, centerY); // Write "You Win!" at the center of the canvas

  console.log("Winning screen been displayed");
}

function displayGameOverScreen() {
  onGameOverScreen = true;
  if (gameMusic) {
    gameMusic.pause();  // Pause the music
    gameMusic.currentTime = 0;  // Rewind to the beginning
  }
  gameStarted = false;
	//captureScreenshot('screenshot.png');
  console.log("Displaying Game Over screen");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.fillStyle = 'black'; // Set the background color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with black
  ctx.font = '128px Arial'; // Set the font size and style
  ctx.fillStyle = 'white'; // Set the text color to white
  ctx.textAlign = 'center'; // Center the text
  cancelAnimationFrame(animationFrameId); // Cancel the current animation frame (stop the game loop)
  
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.fillStyle = 'black'; // Set the background color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with black
  ctx.font = '72px Arial'; // Set the font size and style
  ctx.fillStyle = 'white'; // Set the text color to white
  ctx.textAlign = 'center'; // Center the text
  ctx.fillText('Game Over', centerX, centerY); // Write "Game Over" at the center of the canvas
  console.log("Game Over screen been displayed");
  const restartButton = document.createElement("button");
  restartButton.innerHTML = "Restart Game";
  restartButton.style.position = "absolute";
  restartButton.style.top = "50%";
  restartButton.style.left = "50%";
  restartButton.style.transform = "translate(-50%, 200%)";
  restartButton.style.padding = "10px 20px";
  restartButton.style.fontSize = "20px";

  // Add click event listener to the button
  restartButton.addEventListener("click", function() {
    // Remove the button
    document.body.removeChild(restartButton);

    // Clear the canvas and other UI elements
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onGameOverScreen = false;
    // Restart the game
    startGame();
  });

  // Append button to the DOM
  document.body.appendChild(restartButton);
}

