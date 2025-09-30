//sort by country
const allButton = document.getElementById("all")
const italyButton = document.getElementById("italy")
const usaButton = document.getElementById("usa")
const chinaButton = document.getElementById("china")
//sort by time
const sortByTimeAscButton = document.getElementById("highToLow")
const sortByTimeDecButton = document.getElementById("lowToHigh")
//other
const recepiesSection = document.getElementById("recepies")
const messageSection = document.getElementById("message")


//remove active class from buttons in a group
const removeActiveClass = (button) => {
    button.forEach(button=> button.classList.remove("active"))
}

//recepie

const recepie = {
    name: "Baked chicken",
    cuisineType: [ "American"],
    ingerdients: [
        "1 Chicken with skin",
        "1/2 tsp salt",
        "1/2 tsp Mrs. Dash sesoning",
        "1/4 tsp black pepper",
    ]
    source: "Martha Stewart",
    totalTime: 90,
    url: "http://www.marthastewart.com/318981/baked-chicken",
    imag: "chicken.webp",
}

//mesages when pressing the buttons
constupdateHTML = (filter, button, buttonGroup) =>{
    removeActiveClass(buttonGroup)

console.log(filter)
let mesage = ""
if (filter === "chinese") {
    message = "Peking duck?"
}else if (filter == "all") {
    message = "From sky, land and sea."
}else if (filter === "american") {
    message = "Turkey?"
} else if (filter === "italian") {
    message = "AlDente?"
}else if (filter === "ascending") {
    message = "In a hurry?"
}else  {
    message = "Big night ahead? "
}
messagesSection.innerHTML +=`<p>${message}</p>`
}