// Recipe data
const recipeData = {
  "title": "Muriel's Farmhouse Cookbook: Recipes from Nowhere, Kansas",
  "subtitle": "A Complete Collection of Courage the Cowardly Dog Recipes",
  "description": "Step into Muriel's kitchen and discover the magical recipes that have appeared throughout the adventures of Courage the Cowardly Dog. From the famous Happy Plums to Little Muriel's extravagant macaroni and cheese, this cookbook brings you all the culinary delights from the middle of Nowhere!",
  "recipes": [
    {
      "name": "Happy Plums",
      "episode": "The Tower of Dr. Zalost",
      "description": "These magical plums have the power to restore happiness and defeat the gloomiest of villains. Muriel's special recipe combines sweet roasted plums with a tangy balsamic reduction.",
      "servings": "4",
      "prep_time": "15 minutes",
      "cook_time": "35 minutes",
      "category": "desserts",
      "ingredients": ["4 large plums, halved and pitted", "2 tablespoons sugar", "1 tablespoon coconut oil", "1/2 cup balsamic vinegar", "1/4 teaspoon vanilla extract", "1 teaspoon fresh rosemary, chopped", "Sour cream for serving", "2 tablespoons honey"],
      "instructions": ["Preheat your oven to 350°F (175°C).", "Cut plums in half and remove the pits.", "Coat a baking pan with coconut oil.", "Brush plums with coconut oil and sprinkle with sugar.", "Bake for 20 minutes until plums are soft and caramelized.", "Meanwhile, combine balsamic vinegar and rosemary in a saucepan.", "Bring to a boil, then reduce heat and simmer for 8 minutes.", "Add remaining sugar and vanilla, stir until dissolved.", "Strain the syrup to remove rosemary pieces.", "Place warm plums in serving mugs.", "Drizzle with balsamic syrup and honey.", "Top with a dollop of sour cream and serve immediately."],
      "muriel_tip": "The secret is in the vinegar reduction - it balances the sweetness perfectly!"
    },
    {
      "name": "Little Muriel's Macaroni and Cheese",
      "episode": "Little Muriel",
      "description": "This isn't just any mac and cheese - this is the extravagant, buttery, cheesy masterpiece that even the most demanding three-year-old Muriel would approve of.",
      "servings": "8-10",
      "prep_time": "20 minutes",
      "cook_time": "35 minutes",
      "category": "main-dishes",
      "ingredients": ["1 pound elbow macaroni", "10 tablespoons butter", "1 cup béchamel sauce", "2 cups sharp cheddar cheese, grated", "1 cup havarti cheese, grated", "1 cup monterey jack cheese, grated", "Salt and pepper to taste", "Breadcrumbs for topping (optional)"],
      "instructions": ["Preheat oven to 350°F (175°C) and butter a 9x13 inch casserole dish.", "Cook macaroni to al dente (1 minute less than package directions).", "Prepare béchamel sauce and keep warm.", "Drain pasta and immediately add butter, stirring until melted.", "Mix in béchamel sauce and half of all the grated cheeses.", "Layer half the pasta mixture in the prepared dish.", "Sprinkle with a layer of remaining cheese.", "Top with remaining pasta and final layer of cheese.", "Bake for 15-20 minutes until bubbly and golden.", "Let cool for 5 minutes before serving."],
      "muriel_tip": "Never use pre-grated cheese - grate it yourself for the best flavor!"
    },
    {
      "name": "Scottish Dream Cookies",
      "episode": "Le Quack Balloon",
      "description": "These buttery Scottish shortbread cookies are Muriel's specialty, made with love and perhaps a bit too much butter (just the way she likes it!).",
      "servings": "24 cookies",
      "prep_time": "15 minutes",
      "cook_time": "20 minutes",
      "category": "desserts",
      "ingredients": ["1 cup (2 sticks) butter, softened", "1/2 cup powdered sugar", "1 3/4 cups all-purpose flour", "1/4 teaspoon salt", "1 teaspoon vanilla extract", "Sugar for sprinkling"],
      "instructions": ["Preheat oven to 325°F (165°C).", "Cream butter and powdered sugar until light and fluffy.", "Add vanilla extract and mix well.", "Gradually add flour and salt, mixing until just combined.", "Roll dough into 1-inch balls and place on ungreased baking sheets.", "Flatten slightly with a fork in a crisscross pattern.", "Sprinkle with sugar.", "Bake for 18-20 minutes until edges are lightly golden.", "Cool on baking sheet for 5 minutes before transferring to wire rack."],
      "muriel_tip": "I like to use extra butter - it makes them extra dreamy!"
    },
    {
      "name": "Flantasy Flan",
      "episode": "King of Flan",
      "description": "This hypnotically delicious flan is so good, it could take over a whole town! Rich, creamy, and topped with golden caramel.",
      "servings": "6",
      "prep_time": "30 minutes",
      "cook_time": "50 minutes",
      "category": "desserts",
      "ingredients": ["1 cup sugar (divided)", "3 cups whole milk", "4 large eggs", "1/4 teaspoon salt", "2 teaspoons vanilla extract", "Yellow food coloring (optional)"],
      "instructions": ["Preheat oven to 325°F (165°C).", "In a saucepan, melt 1/2 cup sugar over medium heat until amber colored.", "Quickly pour caramel into 6 ramekins, swirling to coat bottoms.", "Heat milk and 1/4 cup sugar until steaming (don't boil).", "In a bowl, whisk eggs, salt, and remaining 1/4 cup sugar.", "Slowly add hot milk to egg mixture, whisking constantly.", "Strain mixture and add vanilla and food coloring.", "Pour into prepared ramekins.", "Place in baking dish and add hot water halfway up sides.", "Bake 45-50 minutes until set.", "Cool completely, then refrigerate for at least 4 hours.", "To serve, run knife around edge and invert onto plates."],
      "muriel_tip": "Don't let it hypnotize you before you finish making it!"
    },
    {
      "name": "Muriel's Award-Winning Dog Food",
      "episode": "Invisible Muriel",
      "description": "This secret recipe won first place at the County Dog Food Contest. It's so good, even the government wants the recipe!",
      "servings": "Makes about 4 cups",
      "prep_time": "10 minutes",
      "cook_time": "20 minutes",
      "category": "special",
      "ingredients": ["1 pound ground turkey", "1 cup brown rice", "1/2 cup carrots, diced", "1/2 cup green beans, chopped", "1/4 cup peas", "2 tablespoons olive oil", "1 egg", "Secret ingredient: 1 tablespoon nutritional yeast"],
      "instructions": ["Cook brown rice according to package directions.", "Heat olive oil in a large skillet.", "Cook ground turkey until browned and fully cooked.", "Add carrots and cook for 5 minutes.", "Add green beans and peas, cook for 3 minutes.", "Mix in cooked rice and beaten egg.", "Stir in the secret ingredient - nutritional yeast!", "Cool completely before serving to your dog.", "Store in refrigerator for up to 3 days."],
      "muriel_tip": "The secret ingredient must remain secret - that's why it's so special!"
    },
    {
      "name": "Eustace's Favorite Mashed Potatoes",
      "episode": "Family Business",
      "description": "These aren't just any mashed potatoes - they're Muriel's specialty with a secret ingredient that makes them irresistible.",
      "servings": "6",
      "prep_time": "15 minutes",
      "cook_time": "25 minutes",
      "category": "sides",
      "ingredients": ["2 pounds russet potatoes, peeled and cubed", "1/2 cup warm milk", "4 tablespoons butter", "Salt and pepper to taste", "Secret ingredient: 2 tablespoons cream cheese"],
      "instructions": ["Boil potatoes in salted water until tender, about 20 minutes.", "Drain thoroughly and let cool slightly.", "Mash potatoes with a potato masher or ricer.", "Add warm milk and butter gradually.", "Season with salt and pepper.", "Stir in the secret ingredient - cream cheese!", "Whip until smooth and fluffy.", "Serve immediately while hot."],
      "muriel_tip": "The secret ingredient makes them extra creamy - but don't tell Eustace!"
    },
    {
      "name": "Courage's Comfort Soup",
      "episode": "Various episodes",
      "description": "A warming soup that helps calm even the most frightened souls. Perfect for those scary nights in Nowhere.",
      "servings": "4",
      "prep_time": "15 minutes",
      "cook_time": "30 minutes",
      "category": "main-dishes",
      "ingredients": ["2 tablespoons olive oil", "1 onion, diced", "2 carrots, sliced", "2 celery stalks, chopped", "4 cups chicken broth", "1 cup small pasta or noodles", "1 cup cooked chicken, shredded", "Salt and pepper to taste", "Fresh parsley for garnish"],
      "instructions": ["Heat olive oil in a large pot.", "Sauté onion, carrots, and celery until softened.", "Add chicken broth and bring to a boil.", "Add pasta and cook according to package directions.", "Stir in cooked chicken and heat through.", "Season with salt and pepper.", "Garnish with fresh parsley before serving.", "Serve hot with crackers or bread."],
      "muriel_tip": "This soup can cure anything - even the worst case of the scares!"
    },
    {
      "name": "Nowhere Farmhouse Bread",
      "episode": "Background staple",
      "description": "A hearty homemade bread that's perfect for any meal at the Bagge farmhouse. Simple, rustic, and delicious.",
      "servings": "1 loaf",
      "prep_time": "20 minutes (plus rising time)",
      "cook_time": "35 minutes",
      "category": "sides",
      "ingredients": ["3 cups bread flour", "1 teaspoon salt", "1 teaspoon sugar", "1 packet active dry yeast", "1 cup warm water", "2 tablespoons olive oil"],
      "instructions": ["Dissolve yeast and sugar in warm water. Let stand 5 minutes.", "Mix flour and salt in a large bowl.", "Add yeast mixture and olive oil to flour.", "Knead until smooth and elastic, about 10 minutes.", "Place in oiled bowl, cover, and let rise 1 hour.", "Punch down and shape into a loaf.", "Place in greased loaf pan and let rise 30 minutes.", "Bake at 375°F for 30-35 minutes until golden.", "Cool on wire rack before slicing."],
      "muriel_tip": "Nothing beats fresh bread from the farmhouse oven!"
    }
  ]
};

// Global variables
let currentRecipeIndex = 0;
let currentScale = 1;
let originalServings = 4;
let filteredRecipes = recipeData.recipes;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  renderRecipeGrid();
  showWelcomePage();
});

// Event listeners
function setupEventListeners() {
  const searchInput = document.getElementById('recipe-search');
  const categoryFilter = document.getElementById('category-filter');
  
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', handleCategoryFilter);
  }
  
  // Modal event listeners
  const scaleModal = document.getElementById('scale-modal');
  if (scaleModal) {
    scaleModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeScaleModal();
      }
    });
  }
}

// Navigation functions
function showWelcomePage() {
  hideAllPages();
  document.getElementById('welcome-page').classList.add('active');
}

function showRecipeBrowser() {
  hideAllPages();
  document.getElementById('recipe-browser').classList.add('active');
}

function showRecipeDetail(recipeIndex) {
  currentRecipeIndex = recipeIndex;
  const recipe = recipeData.recipes[recipeIndex];
  
  // Reset scale
  currentScale = 1;
  originalServings = parseInt(recipe.servings) || 4;
  
  // Populate recipe details
  document.getElementById('recipe-name').textContent = recipe.name;
  document.getElementById('recipe-episode').textContent = recipe.episode;
  document.getElementById('recipe-servings').textContent = recipe.servings;
  document.getElementById('recipe-prep-time').textContent = recipe.prep_time;
  document.getElementById('recipe-cook-time').textContent = recipe.cook_time;
  document.getElementById('recipe-description').textContent = recipe.description;
  document.getElementById('muriel-tip').textContent = recipe.muriel_tip;
  
  // Populate ingredients
  renderIngredients(recipe.ingredients);
  
  // Populate instructions
  renderInstructions(recipe.instructions);
  
  // Populate recipe navigation
  renderRecipeNavigation(recipeIndex);
  
  hideAllPages();
  document.getElementById('recipe-detail').classList.add('active');
}

function hideAllPages() {
  document.querySelectorAll('.page-section').forEach(page => {
    page.classList.remove('active');
  });
}

// Search and filter functions
function handleSearch() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const categoryFilter = document.getElementById('category-filter').value;
  
  filteredRecipes = recipeData.recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                         recipe.episode.toLowerCase().includes(searchTerm) ||
                         recipe.description.toLowerCase().includes(searchTerm);
    
    const matchesCategory = !categoryFilter || recipe.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  renderRecipeGrid();
}

function handleCategoryFilter() {
  handleSearch(); // This will apply both search and category filters
}

// Render functions
function renderRecipeGrid() {
  const grid = document.getElementById('recipes-grid');
  grid.innerHTML = '';
  
  filteredRecipes.forEach((recipe, index) => {
    const originalIndex = recipeData.recipes.findIndex(r => r.name === recipe.name);
    const card = createRecipeCard(recipe, originalIndex);
    grid.appendChild(card);
  });
}

function createRecipeCard(recipe, index) {
  const card = document.createElement('div');
  card.className = 'recipe-card bg-card-opacity rounded-lg p-4 cursor-pointer hover:bg-card transition-all duration-300';
  card.onclick = () => showRecipeDetail(index);
  
  card.innerHTML = `
    <div class="mb-3">
      <h3 class="text-lg font-semibold text-pink-200 mb-2">${recipe.name}</h3>
      <span class="inline-block bg-purple-600 text-white px-2 py-1 rounded-full text-xs">${recipe.episode}</span>
    </div>
    <div>
      <p class="text-gray-300 text-sm mb-3 line-clamp-3">${recipe.description}</p>
      <div class="flex flex-wrap gap-2 text-xs text-gray-400">
        <span>👥 ${recipe.servings}</span>
        <span>⏱️ ${recipe.prep_time}</span>
        <span>🔥 ${recipe.cook_time}</span>
      </div>
    </div>
  `;
  
  return card;
}

function renderIngredients(ingredients) {
  const list = document.getElementById('ingredients-list');
  list.innerHTML = '';
  
  ingredients.forEach((ingredient, index) => {
    const li = document.createElement('li');
    li.className = 'flex items-center space-x-2 text-gray-300';
    li.innerHTML = `
      <input type="checkbox" class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-2" id="ingredient-${index}" onchange="toggleIngredient(${index})">
      <label for="ingredient-${index}" class="flex-1 cursor-pointer" id="ingredient-text-${index}">${scaleIngredient(ingredient)}</label>
    `;
    list.appendChild(li);
  });
}

function renderInstructions(instructions) {
  const list = document.getElementById('instructions-list');
  list.innerHTML = '';
  
  instructions.forEach((instruction, index) => {
    const li = document.createElement('li');
    li.className = 'text-gray-300 leading-relaxed';
    li.innerHTML = `<span class="font-semibold text-purple-400">${index + 1}.</span> ${instruction}`;
    list.appendChild(li);
  });
}

function renderRecipeNavigation(currentIndex) {
  const navList = document.getElementById('recipe-nav-list');
  navList.innerHTML = '';
  
  recipeData.recipes.forEach((recipe, index) => {
    if (index !== currentIndex) {
      const navItem = document.createElement('div');
      navItem.className = 'bg-card hover:bg-card-opacity rounded-lg p-3 cursor-pointer transition-colors';
      navItem.innerHTML = `
        <div class="text-pink-200 font-medium text-sm">${recipe.name}</div>
        <div class="text-gray-400 text-xs mt-1">${recipe.episode}</div>
      `;
      navItem.onclick = () => showRecipeDetail(index);
      navList.appendChild(navItem);
    }
  });
}

// Ingredient scaling and checking
function scaleIngredient(ingredient) {
  if (currentScale === 1) return ingredient;
  
  // Simple scaling logic - look for numbers and scale them
  return ingredient.replace(/(\d+(?:\.\d+)?)/g, (match) => {
    const num = parseFloat(match);
    const scaled = num * currentScale;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2);
  });
}

function toggleIngredient(index) {
  const checkbox = document.getElementById(`ingredient-${index}`);
  const text = document.getElementById(`ingredient-text-${index}`);
  
  if (checkbox.checked) {
    text.classList.add('line-through', 'text-gray-500');
  } else {
    text.classList.remove('line-through', 'text-gray-500');
  }
}

// Modal functions
function showScaleModal() {
  const modal = document.getElementById('scale-modal');
  const servingsInput = document.getElementById('scale-servings');
  servingsInput.value = originalServings * currentScale;
  modal.classList.remove('hidden');
}

function closeScaleModal() {
  document.getElementById('scale-modal').classList.add('hidden');
}

function applyScale() {
  const newServings = parseInt(document.getElementById('scale-servings').value);
  if (newServings && newServings > 0) {
    currentScale = newServings / originalServings;
    
    // Update servings display
    document.getElementById('recipe-servings').textContent = newServings;
    
    // Re-render ingredients with new scale
    const recipe = recipeData.recipes[currentRecipeIndex];
    renderIngredients(recipe.ingredients);
    
    closeScaleModal();
  }
}

// Print function
function printRecipe() {
  window.print();
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Make search responsive - updated for new HTML structure
const searchInput = document.getElementById('recipe-search');
if (searchInput) {
  searchInput.addEventListener('input', debounce(handleSearch, 300));
}

// Also support the header search
const headerSearch = document.getElementById('searchInput');
if (headerSearch) {
  headerSearch.addEventListener('input', debounce(handleSearch, 300));
}