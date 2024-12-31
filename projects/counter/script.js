document.addEventListener("DOMContentLoaded", function() {
    let count = 0;
    let timerValue = 10; // Timer starts at 10 seconds
    let timerInterval; // To store the interval reference for clearing it

    const counterDisplay = document.getElementById("counter-display");
    const counterButton = document.getElementById("counter-button");
    const resetButton = document.getElementById("reset-button");
    const timerDisplay = document.getElementById("timer-display");
    const container = document.querySelector(".container");

    // Function to disable the button and remove animation
    function disableButton() {
        counterButton.disabled = true; // Disable the button
        counterButton.style.animation = "none"; // Remove button animation
        counterButton.style.cursor = "not-allowed"; // Change the cursor to indicate it's disabled
    }

    // Function to enable the button and restore animation
    function enableButton() {
        counterButton.disabled = false; // Enable the button
        counterButton.style.animation = "buttonClick 0.5s ease infinite"; // Restore button animation
        counterButton.style.cursor = "pointer"; // Reset cursor to normal
    }

    // Reset the game
    resetButton.addEventListener("click", function() {
        // Reset all values
        count = 0;
        timerValue = 10;

        // Clear the timer interval
        clearInterval(timerInterval);
        timerInterval = null;
        timerDisplay.textContent = `Time remaining: ${timerValue}`;

        // Reset the counter display
        counterDisplay.textContent = `You clicked ${count} times`;

        // Remove all balls
        const balls = document.querySelectorAll(".ball");
        balls.forEach(ball => ball.remove());

        // Enable the button and reset animation
        enableButton();
    });

    // Main counter button logic
    counterButton.addEventListener("click", function() {
        count++;
        counterDisplay.textContent = `You clicked ${count} times`;

        // If the timer isn't already running, start it
        if (!timerInterval) {
            timerInterval = setInterval(function() {
                if (timerValue > 0) {
                    timerValue--;
                    timerDisplay.textContent = `Time remaining: ${timerValue}`;
                } else {
                    clearInterval(timerInterval); // Stop the timer when it reaches 0
                    timerInterval = null; // Reset the timer interval reference
                    timerDisplay.textContent = "Time's up!";
                    disableButton(); // Disable the button and stop animation
                }
            }, 1000);
        }

        // Get the dimensions of the container
        const containerRect = container.getBoundingClientRect();

        // Calculate random position for the ball (outside of the container bounds)
        const randomX = Math.random() * (window.innerWidth - 50);
        const randomY = Math.random() * (window.innerHeight - 50);

        // Ensure the ball doesn't spawn inside the container
        if (randomX >= containerRect.left && randomX <= containerRect.right &&
            randomY >= containerRect.top && randomY <= containerRect.bottom) {
            if (randomX < window.innerWidth / 2) {
                randomX -= 100;
            } else {
                randomX += 100;
            }
            if (randomY < window.innerHeight / 2) {
                randomY -= 100;
            } else {
                randomY += 100;
            }
        }

        // Create a new ball element
        const ball = document.createElement("div");
        ball.classList.add("ball");

        // Set the random position
        ball.style.left = `${randomX}px`;
        ball.style.top = `${randomY}px`;

        // Add the ball to the body
        document.body.appendChild(ball);
    });
});
