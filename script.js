// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image');
var ctx = canvas.getContext('2d');
const input = document.getElementById("image-input");
const form = document.getElementById("generate-meme");
const generate = document.querySelector("[type='submit']")
const clear = document.querySelector("[type='reset']");
const read = document.querySelector("[type='button']");
const volumeGroup = document.querySelector("[type='range']");

var synth = window.speechSynthesis;

window.addEventListener("load", (event) => {
  event.preventDefault();

  let voiceSelect = document.querySelector('select');
  voiceSelect.disabled = false;
  let voices = synth.getVoices();

  for(let i = 0; i < voices.length ; i++) {
    let option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  generate.disabled = false;
  clear.disabled = true;
  read.disabled = true;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);
});

input.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const url = URL.createObjectURL(file);
  img.src = url;

  img.alt = file.name;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  let topText = document.getElementById("text-top").value;
  let bottomText = document.getElementById("text-bottom").value;

  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  ctx.font = '48px impact';
  ctx.textAlign = 'center';
  ctx.fillText(topText, canvas.width/2 , 50);
  ctx.fillText(bottomText, canvas.width/2 , canvas.height - 20);

  generate.disabled = true;
  clear.disabled = false;
  read.disabled = false;
});

clear.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  generate.disabled = false;
  clear.disabled = true;
  read.disabled = true;
});

read.addEventListener('click', (event) => {
  event.preventDefault();

  let voiceSelect = document.querySelector('select');
  voiceSelect.disabled = false;
  let voices = synth.getVoices();

  let topText = document.getElementById("text-top").value;
  let bottomText = document.getElementById("text-bottom").value;

  let utterThis = new SpeechSynthesisUtterance(topText+bottomText);
  let selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(let i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }
  utterThis.volume = volumeGroup.value/100;
  synth.speak(utterThis);
});

volumeGroup.addEventListener('click', () => {
  const icon = document.getElementById("volume-group").getElementsByTagName("img")[0];

  if (volumeGroup.value == 0) {
    icon.src = "icons/volume-level-0.svg";
    icon.alt = "Volume Level 0";
  }
  else if (volumeGroup.value < 34) {
    icon.src = "icons/volume-level-1.svg";
    icon.alt = "Volume Level 2";
  }
  else if (volumeGroup.value < 67) {
    icon.src = "icons/volume-level-2.svg";
    icon.alt = "Volume Level 2";
  }
  else {
    icon.src = "icons/volume-level-3.svg";
    icon.alt = "Volume Level 3";
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
