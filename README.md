# Recipe Library

A progressive recipe discovery app built over Weeks 5-7 of the Web Development Bootcamp. Features Spoonacular API integration, intelligent caching, search functionality, favorites system, and pagination.

## Live Demo & Screenshot

- **Live App:** https://recipelibrarya.netlify.app
- **Screenshot:**

![Recipe Library Screenshot](/screenshot/screenshot.png)

## Features

### Core Functionality
- **Responsive Design** - Mobile-first layout (320px to 1600px+)
- **Dynamic Recipe Display** - Template literal-based card generation
- **Multi-Filter System** - Diet, cuisine, and sorting filters work together
- **Search** - Real-time search by title and ingredients with 300ms debouncing
- **Random Recipe** - Discover new recipes with dice button
- **Empty States** - Helpful guidance when no results found

### Advanced Features
- **Spoonacular API Integration** - Fetches up to 100 fresh recipes
- **Smart Caching** - 24-hour localStorage cache with backup fallback
- **Favorites System** - Save/unsave recipes with localStorage persistence
- **Pagination** - 15 recipes per page with navigation controls
- **Loading States** - Clear feedback during async operations
- **Progressive Enhancement** - Works offline with backup data (19 recipes)

## Technical Implementation

### Data Flow
```
Spoonacular API → localStorage Cache → Backup Data
         ↓
Data Normalization (mapSpoonacularToLocal)
         ↓
Filter Chain: Search → Filter → Sort → Display
```

### Key Technologies
- **Vanilla JavaScript** - ES6+ with async/await, template literals, array methods
- **CSS Grid + Flexbox** - Modern responsive layout
- **CSS Custom Properties** - Centralized theming system
- **Fetch API** - External data integration with error handling

### Performance Optimizations
- Debounced search input (300ms)
- Pagination for large datasets
- Lazy image loading
- Intelligent caching strategy
- Loading messages with 2-second minimum display time to showcase

## Getting Started
1. Clone the repository and open `index.html` in your browser.
2. The app functions fully with live API data, cached recipes, and backup recipes for offline or quota-exceeded scenarios.

## File Structure

```
├── index.html          # Main application
├── script.js           # Core logic (~800 lines)
├── styles.css          # Responsive styling (~531 lines)
└── backupdata.js       # Fallback recipes (19 items)
```

## Requirements Met

**Week 5-7 Core Requirements**: ✅ All completed
- Responsive HTML/CSS structure
- Filter and sorting functionality  
- Array manipulation and recipe display
- API integration with error handling
- localStorage caching

**Stretch Goals Achieved**: ✅ 6/6 completed
- Multiple filters working together
- Search functionality for specific recipe names or         ingredients with debouncing
- Favorites system with persistence
- Pagination for performance
- Loading states and error handling
- Local storage caching

