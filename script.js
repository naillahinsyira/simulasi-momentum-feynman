const state = {
  massA: 2,
  massB: 3,
  velocityA: 6,
  velocityB: 0,
  observerSpeed: 2.5,
  time: 0,
  running: false,
  lastTimestamp: null,
  collisionShown: false
};

const elements = {
  massA: document.querySelector('#massA'),
  massB: document.querySelector('#massB'),
  velocityA: document.querySelector('#velocityA'),
  velocityB: document.querySelector('#velocityB'),
  observerSpeed: document.querySelector('#observerSpeed'),
  massAValue: document.querySelector('#massAValue'),
  massBValue: document.querySelector('#massBValue'),
  velocityAValue: document.querySelector('#velocityAValue'),
  velocityBValue: document.querySelector('#velocityBValue'),
  observerSpeedValue: document.querySelector('#observerSpeedValue'),
  totalMomentum: document.querySelector('#totalMomentum'),
  afterMomentum: document.querySelector('#afterMomentum'),
  timeValue: document.querySelector('#timeValue'),
  playButton: document.querySelector('#playButton'),
  playLabel: document.querySelector('#playLabel'),
  playIcon: document.querySelector('.play-icon'),
  resetButton: document.querySelector('#resetButton'),
  stepButton: document.querySelector('#stepButton'),
  movingFrameChip: document.querySelector('#movingFrameChip'),
  restObjectA: document.querySelector('#restObjectA'),
  restObjectB: document.querySelector('#restObjectB'),
  movingObjectA: document.querySelector('#movingObjectA'),
  movingObjectB: document.querySelector('#movingObjectB'),
  restBadgeA: document.querySelector('#restBadgeA'),
  restBadgeB: document.querySelector('#restBadgeB'),
  movingBadgeA: document.querySelector('#movingBadgeA'),
  movingBadgeB: document.querySelector('#movingBadgeB'),
  restPosition: document.querySelector('#restPosition'),
  movingPosition: document.querySelector('#movingPosition'),
  observerLine: document.querySelector('#observerLine'),
  restFlash: document.querySelector('#restFlash'),
  movingFlash: document.querySelector('#movingFlash'),
  insightText: document.querySelector('#insightText'),
  momentumFormulaA: document.querySelector('#momentumFormulaA'),
  momentumFormulaB: document.querySelector('#momentumFormulaB'),
  forceAnalysis: document.querySelector('#forceAnalysis')
};

const initialPositions = { a: 1, b: 6 };
const collisionTime = 0.833;
const sceneRange = { min: -3, max: 10 };

function formatNumber(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}`;
}

function describeMotion(velocity) {
  if (velocity === 0) return 'diam';
  return velocity > 0 ? 'bergerak ke kanan' : 'bergerak ke kiri';
}

function formatMomentumFormula(label, mass, velocity) {
  const momentum = mass * velocity;
  return `p<sub>${label}</sub> = ${mass.toFixed(1)} kg × (${formatNumber(velocity)} m/s) = ${formatNumber(momentum)} kg·m/s`;
}

function collisionVelocities() {
  const { massA, massB, velocityA, velocityB } = state;
  const denominator = massA + massB;
  return {
    a: ((massA - massB) * velocityA + 2 * massB * velocityB) / denominator,
    b: (2 * massA * velocityA + (massB - massA) * velocityB) / denominator
  };
}

function positionAt(object, time, frameSpeed = 0) {
  const before = object === 'a' ? state.velocityA : state.velocityB;
  const after = collisionVelocities()[object];
  const start = initialPositions[object];
  const collisionPosition = initialPositions.a + state.velocityA * collisionTime;
  const position = time <= collisionTime
    ? start + before * time
    : collisionPosition + after * (time - collisionTime);
  return position - frameSpeed * time;
}

function positionToPercent(position) {
  return `${Math.max(3, Math.min(97, ((position - sceneRange.min) / (sceneRange.max - sceneRange.min)) * 100))}%`;
}

function setTextAndState() {
  const total = state.massA * state.velocityA + state.massB * state.velocityB;
  const after = collisionVelocities();
  const beforeRelative = [state.velocityA - state.observerSpeed, state.velocityB - state.observerSpeed];
  const afterRelative = [after.a - state.observerSpeed, after.b - state.observerSpeed];

  elements.massAValue.textContent = `${state.massA.toFixed(1)} kg`;
  elements.massBValue.textContent = `${state.massB.toFixed(1)} kg`;
  elements.velocityAValue.textContent = `${state.velocityA.toFixed(1)} m/s`;
  elements.velocityBValue.textContent = `${state.velocityB.toFixed(1)} m/s`;
  elements.observerSpeedValue.textContent = `${formatNumber(state.observerSpeed)} m/s`;
  elements.totalMomentum.textContent = `${total.toFixed(1)} kg·m/s`;
  elements.afterMomentum.textContent = `${total.toFixed(1)} kg·m/s`;
  elements.movingFrameChip.textContent = `V = ${formatNumber(state.observerSpeed)}`;

  const restVelocities = state.time <= collisionTime ? [state.velocityA, state.velocityB] : [after.a, after.b];
  const activeRelative = state.time <= collisionTime ? beforeRelative : afterRelative;
  elements.restBadgeA.textContent = formatNumber(restVelocities[0]);
  elements.restBadgeB.textContent = formatNumber(restVelocities[1]);
  elements.movingBadgeA.textContent = formatNumber(activeRelative[0]);
  elements.movingBadgeB.textContent = formatNumber(activeRelative[1]);

  const restA = positionAt('a', state.time);
  const restB = positionAt('b', state.time);
  const movingA = positionAt('a', state.time, state.observerSpeed);
  const movingB = positionAt('b', state.time, state.observerSpeed);
  elements.restObjectA.style.left = positionToPercent(restA);
  elements.restObjectB.style.left = positionToPercent(restB);
  elements.movingObjectA.style.left = positionToPercent(movingA);
  elements.movingObjectB.style.left = positionToPercent(movingB);
  elements.observerLine.style.left = positionToPercent(-state.observerSpeed * state.time);
  elements.restPosition.textContent = `A ${restA.toFixed(1)} m · B ${restB.toFixed(1)} m`;
  elements.movingPosition.textContent = `A ${movingA.toFixed(1)} m · B ${movingB.toFixed(1)} m`;
  elements.timeValue.textContent = `${state.time.toFixed(2)} s`;

  if (state.time > collisionTime + 0.05 && !state.collisionShown) {
    state.collisionShown = true;
    elements.restFlash.classList.remove('active');
    elements.movingFlash.classList.remove('active');
    void elements.restFlash.offsetWidth;
    elements.restFlash.classList.add('active');
    elements.movingFlash.classList.add('active');
  }
  if (state.time < collisionTime) state.collisionShown = false;

  const activeVelocities = state.time <= collisionTime
    ? [state.velocityA, state.velocityB]
    : [after.a, after.b];
  const momentumA = state.massA * activeVelocities[0];
  const momentumB = state.massB * activeVelocities[1];
  const describeObject = (label, velocity, momentum) => velocity === 0
    ? `Benda ${label} diam (v = 0), sehingga momentumnya p = m × 0 = 0 kg·m/s. Sesuai Hukum I Newton, benda mempertahankan keadaan diam jika resultan gaya padanya nol.`
    : `Benda ${label} ${describeMotion(velocity)} dengan momentum ${formatNumber(momentum)} kg·m/s. Nilai dan arah ini berasal dari massa ${state[`mass${label}`].toFixed(1)} kg dikalikan kecepatan ${formatNumber(velocity)} m/s; tanda momentum menunjukkan arahnya.`;
  elements.insightText.textContent = `${describeObject('A', activeVelocities[0], momentumA)} ${describeObject('B', activeVelocities[1], momentumB)}`;
  elements.momentumFormulaA.innerHTML = formatMomentumFormula('A', state.massA, activeVelocities[0]);
  elements.momentumFormulaB.innerHTML = formatMomentumFormula('B', state.massB, activeVelocities[1]);
  elements.forceAnalysis.textContent = state.time > collisionTime
    ? 'Saat tumbukan, gaya interaksi mengubah momentum: F_net = Δp/Δt. Model ini menganggap tumbukan berlangsung seketika, jadi nilai gaya dan lama kontak tidak dihitung. Setelah tumbukan, resultan gaya nol dan momentum total sistem tetap.'
    : 'Hukum II Newton dalam bentuk momentum: F_net = Δp/Δt (atau F_net = dp/dt). Saat resultan gaya nol, momentum tetap; selama tumbukan, gaya interaksi mengubah momentum tiap benda.';
}

function togglePlay() {
  state.running = !state.running;
  elements.playLabel.textContent = state.running ? 'jeda' : 'mulai';
  elements.playIcon.textContent = state.running ? 'Ⅱ' : '▶';
  if (state.running) { state.lastTimestamp = null; requestAnimationFrame(animate); }
}

function animate(timestamp) {
  if (!state.running) return;
  if (state.lastTimestamp === null) state.lastTimestamp = timestamp;
  state.time += Math.min((timestamp - state.lastTimestamp) / 1000, 0.05);
  state.lastTimestamp = timestamp;
  if (state.time >= 2.5) { state.time = 0; state.collisionShown = false; }
  setTextAndState();
  requestAnimationFrame(animate);
}

function reset() {
  state.time = 0;
  state.running = false;
  state.collisionShown = false;
  elements.playLabel.textContent = 'mulai';
  elements.playIcon.textContent = '▶';
  setTextAndState();
}

function step() {
  state.running = false;
  state.time = Math.min(2.5, state.time + 0.1);
  elements.playLabel.textContent = 'mulai';
  elements.playIcon.textContent = '▶';
  setTextAndState();
}

['massA', 'massB', 'velocityA', 'velocityB', 'observerSpeed'].forEach((key) => {
  elements[key].addEventListener('input', () => {
    state[key] = Number(elements[key].value);
    setTextAndState();
  });
});
elements.playButton.addEventListener('click', togglePlay);
elements.resetButton.addEventListener('click', reset);
elements.stepButton.addEventListener('click', step);
setTextAndState();
