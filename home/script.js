// Get the QrContainer element by its ID
const QrContainer = document.getElementById('Qr-container');

// Get the exit button element by its ID
const exit = document.getElementById('exit');

// Get the QR code element by its ID
const QR = document.getElementById('qr-code');

// Get the input field element by its ID
const input = document.getElementById('input');

// Get the submit button element by its ID
const submit = document.getElementById('submit');

// Get the loader element by its ID
const loader = document.getElementById("loader");

// Get the jpg download button element by its ID
const jpg = document.getElementById('forjpg');

// Get the png download button element by its ID
const png = document.getElementById('forpng');

// Get the svg download button element by its ID
const svg = document.getElementById('forsvg');

// Add an event listener to the submit button to handle click events
submit.addEventListener('click', () => {
  // Get the value of the input field
  const fetchedData = input.value.trim();

  // Check if the input field is empty
  if (fetchedData.length === 0) {
    // Add a shake animation class to the input field
    input.classList.add('shake-horizontal');
    // Remove the shake animation class after 500ms
    setTimeout(function() {
        input.classList.remove('shake-horizontal');
    }, 500);
    // Call the vibratePhone function
    vibratePhone();
  } else {
    // Add the exit-Qr class to the QrContainer element
    QrContainer.classList.add('exit-Qr');
    // Create the API link with the fetched data and set the QR code source to the link
    const apiLink = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=30&data=${fetchedData}`;
    QR.src = apiLink;
  }
});

// Add an event listener to the QR code to handle the load event
QR.addEventListener("load", function () {
  // Add the deactivate-loader class to the loader element
  loader.classList.add('deactivate-loader');
});

// Add an event listener to the document body to handle keypress events
document.body.addEventListener('keypress', (e) =>{
  // Check if the key pressed is the Enter key
  if(e.key === 'Enter'){
    const fetchedData = input.value.trim();

    // Check if the input field is empty
    if (fetchedData.length === 0) {
      // Add a shake animation class to the input field
      input.classList.add('shake-horizontal');
      // Remove the shake animation class after 500ms
      setTimeout(function() {
          input.classList.remove('shake-horizontal');
      }, 500);
      // Call the vibratePhone function
      vibratePhone();
    } else {
      // Add the exit-Qr class to the QrContainer element
      QrContainer.classList.add('exit-Qr');
      // Create the API link with the fetched data and set the QR code source to the link
      const apiLink = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=30&data=${fetchedData}`;
      QR.src = apiLink;
    }
  }
});

// Vibrate the phone if the input field is empty
function vibratePhone() {
  if (navigator.vibrate) {
    navigator.vibrate(500);
  } else {
    console.log("Vibration API is not supported in your browser.");
  }
}

// Download the QR code as a jpeg image
const fileName = 'qr_code.jpeg';
jpg.addEventListener('click',()=>{
  const imgPath = `${QR.src}&format=jpeg`;
  saveAs(imgPath, fileName);  
});

// Download the QR code as a png image
const fileName = 'qr_code.png';
png.addEventListener('click',()=>{
  const imgPath = `${QR.src}&format=png`;
  saveAs(imgPath, fileName);
});

// Download the QR code as a svg image
const fileName = 'qr_code.svg';
svg.addEventListener('click',()=>{
  const imgPath = `${QR.src}&format=svg`;
  saveAs(imgPath, fileName);
});

// Exit the QR code container
exit.addEventListener('click',()=>{
  QrContainer.classList.remove('exit-Qr');
  loader.classList.remove('deactivate-loader');
});
