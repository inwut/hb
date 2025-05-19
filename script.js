document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const stack = document.querySelector(".stack");
  const hb = document.querySelector(".hb");
  const instructions = document.querySelector(".instructions");
  const muteButton = document.getElementById("toggleMute");

  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];

  let audioContext;
  let micStream;
  let analyser;
  let microphone;
  let audio = new Audio('pavlo-zibrov-den-narodzhennya.mp3');

  muteButton.addEventListener("click", () => {
    audio.muted = !audio.muted;
    const icon = document.querySelector("#toggleMute i");
    icon.className = audio.muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
  });

  function setupSwipe(card) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      card.style.transition = "none";
    };

    const onMouseDown = (e) => {
      startX = e.clientX;
      isDragging = true;
      card.style.transition = "none";
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX - startX;
      card.style.transform = `translateX(${currentX}px) rotate(${currentX / 20}deg)`;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      currentX = e.clientX - startX;
      card.style.transform = `translateX(${currentX}px) rotate(${currentX / 20}deg)`;
    };

    const onTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      if (Math.abs(currentX) > 100) {
        const direction = currentX > 0 ? 1 : -1;
        card.style.transition = "transform 0.3s ease";
        card.style.transform = `translateX(${direction * 1000}px) rotate(${direction * 45}deg)`;
        setTimeout(() => {
          resetCard(card);
        }, 300);
      } else {
        card.style.transition = "transform 0.3s ease";
        card.style.transform = "translateX(0) rotate(0)";
      }
    };

    card.addEventListener("touchstart", onTouchStart);
    card.addEventListener("touchmove", onTouchMove);
    card.addEventListener("touchend", onTouchEnd);
    card.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onTouchEnd);
  }

  function resetCard(card) {
    stack.appendChild(card);
    setupStack();
  }

  function setupStack() {
    const cards = stack.querySelectorAll(".card");
    cards.forEach((card, index) => {
      card.style.zIndex = cards.length - index;
      if (index === 0) {
        card.style.transform = "none";
      } else if (index === 1) {
        card.style.transform = "rotate(-8deg)";
      } else if (index === 2) {
        card.style.transform = "rotate(-6deg)";
      } else if (index === 3) {
        card.style.transform = "rotate(-4deg)";
      } else if (index === 4) {
        card.style.transform = "rotate(-2deg)";
      } else if (index === 5) {
        card.style.transform = "rotate(2deg)";
      } else if (index === 6) {
        card.style.transform = "rotate(4deg)";
      } else if (index === 7) {
        card.style.transform = "rotate(6deg)";
      } else if (index === 8) {
        card.style.transform = "rotate(8deg)";
      } else if (index === 9) {
        card.style.transform = "rotate(10deg)";
      }
    });
  }

  function updateCandleCount() {
    candleCountDisplay.textContent = candles.filter(
        (candle) => !candle.classList.contains("out")
    ).length;
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 58;
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (candles.length > 0 && candles.some((candle) => !candle.classList.contains("out"))) {
      if (isBlowing()) {
        candles.forEach((candle) => {
          if (!candle.classList.contains("out") && Math.random() > 0.5) {
            candle.classList.add("out");
            blownOut++;
          }
        });
      }

      if (blownOut > 0) {
        updateCandleCount();
      }

      if (candles.every((candle) => candle.classList.contains("out"))) {
        setTimeout(function() {
          micStream?.getTracks().forEach(track => track.stop());
          triggerConfetti();
          endlessConfetti();
          cake.classList.add("invisible");
          instructions.classList.add("invisible");
          stack.classList.remove("invisible");
          hb.classList.remove("invisible");
          muteButton.classList.remove("invisible");
          const cards = document.querySelectorAll(".card");
          cards.forEach(setupSwipe);
          setupStack();

        }, 200);
        audio.play();
      }
    }
  }



  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        micStream = stream;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function endlessConfetti() {
  setInterval(function() {
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0 }
    });
  }, 1000);
}
