let mediaRecorder;
let recordedChunks = [];
let stream;
let usingFrontCamera = true;
let timerInterval;
let seconds = 0;

const preview = document.getElementById("preview");
const recordBtn = document.getElementById("recordBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const downloadLink = document.getElementById("downloadLink");
const playback = document.getElementById("playback");
const timer = document.getElementById("timer");

function updateTimer() {
  seconds++;
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  timer.textContent = `${mins}:${secs}`;
}

async function setupCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: usingFrontCamera ? "user" : "environment" },
    audio: true
  });
  preview.srcObject = stream;
}

switchCameraBtn.addEventListener("click", async () => {
  usingFrontCamera = !usingFrontCamera;
  await setupCamera();
});

recordBtn.addEventListener("mousedown", () => {
  recordedChunks = [];
  seconds = 0;
  timer.textContent = "00:00";
  timer.style.display = "block";
  timerInterval = setInterval(updateTimer, 1000);
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = () => {
    clearInterval(timerInterval);
    timer.style.display = "none";
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    playback.src = url;
    playback.style.display = "block";
    downloadLink.href = url;
    downloadLink.style.display = "inline";
  };
  mediaRecorder.start();
});

recordBtn.addEventListener("mouseup", () => {
  mediaRecorder.stop();
});

setupCamera();
