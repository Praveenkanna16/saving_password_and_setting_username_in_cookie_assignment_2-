const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// Store in localStorage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Retrieve from localStorage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Clear localStorage
function clearStorage() {
  localStorage.clear();
}

// Generate a random 3-digit number
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate SHA256 hash
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Get or generate a SHA256 hash for a 3-digit number
async function getSHA256Hash() {
  let originalNumber = retrieve('originalNumber');
  let cachedHash = retrieve('sha256');

  // If already stored, return existing values
  if (originalNumber && cachedHash) {
    return cachedHash;
  }

  // Generate a new random 3-digit number
  originalNumber = getRandomNumber(MIN, MAX);
  const hash = await sha256(originalNumber.toString());

  // Store both number and hash
  store('originalNumber', originalNumber);
  store('sha256', hash);

  return hash;
}

// Initialize the displayed hash
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// Check if the entered PIN is correct
async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Not 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const hashedPin = await sha256(pin);
  const storedHash = retrieve('sha256');

  if (hashedPin === storedHash) {
    resultView.innerHTML = '🎉 Success!';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = '❌ Failed!';
  }
  resultView.classList.remove('hidden');
}

// Ensure pinInput only accepts numbers and is 3 digits long
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// Attach test function to button
document.getElementById('check').addEventListener('click', test);

main();