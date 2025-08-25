// cook.js

// Key and values for filter buttons
const obj = {
    "china-btn": "chinese",
    "italy-btn": "italian",
    "usa-btn": "american",
    "all-btn": "all",
    "asia-btn": "asian",
    "popular-btn": "popular",
    "vegetarian-btn": "vegetarian",
    "hightolowbtn": "hightolow",
    "sort-price-btn": "sort-price",
    "random-btn": "random"
};

Object.keys(obj).forEach(buttonId => {
  const button = document.getElementById(buttonId);
  button.addEventListener("click", () => {
      const targetElementId = obj[buttonId];
      console.log(`Filtering for: ${targetElementId}`);

      document.querySelectorAll(".card").forEach(card => {
          const cuisines = card.getAttribute("data-cuisines")?.toLowerCase().split(",") || []; // Store cuisines in a data attribute
          const isVegetarian = card.classList.contains("vegetarian");
          const isVeryPopular = card.classList.contains("very-popular");

          // Show all recipes
          if (targetElementId === "all") {
              card.style.display = "block";
          }
          // Show vegetarian recipes
          else if (targetElementId === "vegetarian" && isVegetarian) {
              card.style.display = "block";
          }
          // Show recipes that match cuisine
          else if (cuisines.includes(targetElementId.toLowerCase())) {
              card.style.display = "block";
          }
          // Show very popular recipes
          else if (targetElementId === "popular" && isVeryPopular) {
              card.style.display = "block";
          }
          // Hide all other cards
          else {
              card.style.display = "none";
          }
      });
  });
});


// Example clock function to display the current time in the console. not being used right now 
const clock = () => {
    let currentTime = new Date(); //to get the current time
    let hrs = (currentTime.getHours() < 10 ? "0" : "") + currentTime.getHours(); //to display hours and give double digit output
    let mins = (currentTime.getMinutes() < 10 ? "0" : "") + currentTime.getMinutes(); //to display minutes and give double digit output
    let sec = (currentTime.getSeconds() < 10 ? "0" : "") + currentTime.getSeconds(); //to display seconds and give double digit output
    
    console.clear(); //clear the console to continuously update the time
    console.log(hrs +':'+ mins +':'+ sec); //display the current time 
};
