// recipes.js
const fallbackRecipes = [
  // === FRENCH ===
  {
    title: "French Onion Soup",
    readyInMinutes: 45,
    cuisines: ["French"],
    image: "https://via.placeholder.com/300x200?text=French+Onion+Soup",
    extendedIngredients: [
      { name: "onion", measures: { metric: { amount: 4, unitShort: "pcs" } } },
      { name: "beef broth", measures: { metric: { amount: 500, unitShort: "ml" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Slice onions." }, { step: "Simmer in broth." } ] }
    ]
  },
  {
    title: "Croque Monsieur",
    readyInMinutes: 20,
    cuisines: ["French"],
    image: "https://via.placeholder.com/300x200?text=Croque+Monsieur",
    extendedIngredients: [
      { name: "bread", measures: { metric: { amount: 2, unitShort: "slices" } } },
      { name: "cheese", measures: { metric: { amount: 50, unitShort: "g" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Assemble sandwich." }, { step: "Grill until golden." } ] }
    ]
  },

  // === ITALIAN ===
  {
    title: "Spaghetti Carbonara",
    readyInMinutes: 25,
    cuisines: ["Italian"],
    image: "https://via.placeholder.com/300x200?text=Carbonara",
    extendedIngredients: [
      { name: "spaghetti", measures: { metric: { amount: 100, unitShort: "g" } } },
      { name: "bacon", measures: { metric: { amount: 50, unitShort: "g" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Cook pasta." }, { step: "Mix with bacon and egg." } ] }
    ]
  },
  {
    title: "Margherita Pizza",
    readyInMinutes: 30,
    cuisines: ["Italian"],
    image: "https://via.placeholder.com/300x200?text=Margherita+Pizza",
    extendedIngredients: [
      { name: "pizza dough", measures: { metric: { amount: 1, unitShort: "pc" } } },
      { name: "mozzarella", measures: { metric: { amount: 100, unitShort: "g" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Add toppings." }, { step: "Bake in oven." } ] }
    ]
  },

  // === ASIAN ===
  {
    title: "Chicken Teriyaki",
    readyInMinutes: 35,
    cuisines: ["Asian"],
    image: "https://via.placeholder.com/300x200?text=Chicken+Teriyaki",
    extendedIngredients: [
      { name: "chicken", measures: { metric: { amount: 200, unitShort: "g" } } },
      { name: "teriyaki sauce", measures: { metric: { amount: 50, unitShort: "ml" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Cook chicken." }, { step: "Add sauce and simmer." } ] }
    ]
  },
  {
    title: "Vegetable Stir Fry",
    readyInMinutes: 20,
    cuisines: ["Asian"],
    image: "https://via.placeholder.com/300x200?text=Veggie+Stir+Fry",
    extendedIngredients: [
      { name: "mixed vegetables", measures: { metric: { amount: 300, unitShort: "g" } } },
      { name: "soy sauce", measures: { metric: { amount: 30, unitShort: "ml" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Stir-fry vegetables." }, { step: "Add sauce." } ] }
    ]
  },

  // === AMERICAN ===
  {
    title: "Cheeseburger",
    readyInMinutes: 20,
    cuisines: ["American"],
    image: "https://via.placeholder.com/300x200?text=Cheeseburger",
    extendedIngredients: [
      { name: "beef patty", measures: { metric: { amount: 1, unitShort: "pc" } } },
      { name: "cheddar", measures: { metric: { amount: 1, unitShort: "slice" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Grill patty." }, { step: "Assemble burger." } ] }
    ]
  },
  {
    title: "Mac and Cheese",
    readyInMinutes: 25,
    cuisines: ["American"],
    image: "https://via.placeholder.com/300x200?text=Mac+%26+Cheese",
    extendedIngredients: [
      { name: "macaroni", measures: { metric: { amount: 100, unitShort: "g" } } },
      { name: "cheese", measures: { metric: { amount: 150, unitShort: "g" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Boil pasta." }, { step: "Mix with cheese sauce." } ] }
    ]
  },

  // === EUROPEAN ===
  {
    title: "Swedish Meatballs",
    readyInMinutes: 40,
    cuisines: ["European"],
    image: "https://via.placeholder.com/300x200?text=Swedish+Meatballs",
    extendedIngredients: [
      { name: "ground beef", measures: { metric: { amount: 200, unitShort: "g" } } },
      { name: "cream", measures: { metric: { amount: 100, unitShort: "ml" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Roll meatballs." }, { step: "Fry and add sauce." } ] }
    ]
  },
  {
    title: "German Potato Salad",
    readyInMinutes: 25,
    cuisines: ["European"],
    image: "https://via.placeholder.com/300x200?text=Potato+Salad",
    extendedIngredients: [
      { name: "potatoes", measures: { metric: { amount: 3, unitShort: "pcs" } } },
      { name: "vinegar", measures: { metric: { amount: 20, unitShort: "ml" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Boil potatoes." }, { step: "Mix with dressing." } ] }
    ]
  },

  // === MEXICAN ===
  {
    title: "Chicken Tacos",
    readyInMinutes: 20,
    cuisines: ["Mexican"],
    image: "https://via.placeholder.com/300x200?text=Chicken+Tacos",
    extendedIngredients: [
      { name: "taco shells", measures: { metric: { amount: 3, unitShort: "pcs" } } },
      { name: "chicken", measures: { metric: { amount: 150, unitShort: "g" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Cook chicken." }, { step: "Assemble tacos." } ] }
    ]
  },
  {
    title: "Guacamole",
    readyInMinutes: 10,
    cuisines: ["Mexican"],
    image: "https://via.placeholder.com/300x200?text=Guacamole",
    extendedIngredients: [
      { name: "avocado", measures: { metric: { amount: 2, unitShort: "pcs" } } },
      { name: "lime", measures: { metric: { amount: 1, unitShort: "pc" } } }
    ],
    analyzedInstructions: [
      { steps: [ { step: "Mash avocado." }, { step: "Mix with lime and seasoning." } ] }
    ]
  }
];
