# Recipe Library 🍲

A simple yet powerful recipe library application that allows users to search, filter, and sort recipes using the Spoonacular API. This project was built to demonstrate proficiency in handling API requests, DOM manipulation, and modern CSS styling.

## 🚀 Live Demo
[View the Live Site on Netlify](https://js-project-recipe-library-site.netlify.app/)

## ✨ Features

*   **🔍 Search Recipes**: Quickly find recipes by recipe name or ingredient keyword.
*   **🥘 Filter by Cuisine**: Filter recipes by cuisine type (American, Asian, European, Mexican).
*   **⏱️ Sort by Time**: Sort recipes by cooking time in ascending or descending order.
*   **🎲 Surprise Me**: Get a random recipe recommendation when you can't decide!
*   **❤️ Favorites**: Save your favorite recipes to your personal collection (persisted via LocalStorage).
*   **📱 Responsive Design**: optimized for both desktop and mobile devices.

## 🛠️ Technologies Used

*   **HTML5**: Semantic markup for structure.
*   **CSS3**: Custom styling with Flexbox and Grid, including responsive design.
*   **JavaScript (ES6+)**: Logic for API fetching, filtering, sorting, and DOM updates.
*   **Spoonacular API**: External API used to fetch recipe data.

## ⚙️ Setup & Installation

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd js-project-recipe-library
    ```

2.  **Open `index.html`**:
    Simply open the `index.html` file in your preferred browser.
    
    *OR*
    
    Use a live server extension (like Live Server in VS Code) for a better development experience.

3.  **API Key Configuration**:
    This project uses the Spoonacular API. The API key is currently hardcoded in `script.js` for demonstration purposes.
    *   *Note: If the API limit is reached, you may need to generate your own free API key from [Spoonacular](https://spoonacular.com/food-api/console#Profile) and replace the key in the `URL` constant in `script.js`.*

## 📚 API Reference

This project uses the [Spoonacular API](https://spoonacular.com/food-api).

**Endpoints used:**
*   `GET /recipes/complexSearch`: To fetch recipes with filtering, sorting, and instruction details.