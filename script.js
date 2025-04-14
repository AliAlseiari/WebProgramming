document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById("moodForm");
    const moodSelect = document.getElementById("moodSelect");
    const errorElement = document.getElementById("error");
    const resultSection = document.getElementById("resultSection");
    const mealImage = document.getElementById("mealImage");
    const mealTitle = document.getElementById("mealTitle");
    const mealInstructions = document.getElementById("mealInstructions");
    const mealLink = document.getElementById("mealLink");
    const saveBtn = document.getElementById("saveRecipe");
    const themeToggle = document.getElementById("themeToggle");
  
    // Mood to Category Mapping
    const moodMap = {
      happy: "Dessert",
      sad: "Pasta",
      tired: "Breakfast",
      angry: "Beef",
      hungry: "Chicken"
    };
  
    // Fallback categories if primary fails
    const fallbackCategories = {
      Dessert: "Starter",
      Pasta: "Vegetarian",
      Breakfast: "Egg",
      Beef: "Lamb",
      Chicken: "Seafood"
    };
  
    // Form Submission Handler
    form.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      const mood = moodSelect.value;
      if (!mood) {
        showError("Please select your mood first!");
        return;
      }
  
      try {
        showLoading(true);
        const category = moodMap[mood];
        
        // Try primary category first
        let meals = await fetchMealsByCategory(category);
        
        // If no meals, try fallback category
        if (!meals || meals.length === 0) {
          const fallback = fallbackCategories[category];
          meals = await fetchMealsByCategory(fallback);
        }
  
        if (!meals || meals.length === 0) {
          throw new Error("No meals found for selected mood");
        }
  
        // Get random meal and its details
        const randomMeal = meals[Math.floor(Math.random() * meals.length)];
        const mealDetails = await fetchMealDetails(randomMeal.idMeal);
        
        // Display the meal
        displayMeal(mealDetails);
        
      } catch (error) {
        console.error("Error:", error);
        showError("Couldn't find a meal. Please try another mood or try again later.");
      } finally {
        showLoading(false);
      }
    });
  
    // Save Recipe Handler
    saveBtn.addEventListener("click", function() {
      const savedMeals = JSON.parse(localStorage.getItem("savedMeals") || "[]");
      
      savedMeals.push({
        title: mealTitle.textContent,
        link: mealLink.href,
        image: mealImage.src
      });
      
      localStorage.setItem("savedMeals", JSON.stringify(savedMeals));
      
      // Show feedback
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
      }, 2000);
    });
  
    // Theme Toggle Handler
    themeToggle.addEventListener("click", function() {
      document.body.classList.toggle("dark");
      const icon = this.querySelector("i");
      icon.classList.toggle("fa-moon");
      icon.classList.toggle("fa-sun");
    });
  
    // Helper Functions
    async function fetchMealsByCategory(category) {
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        return data.meals || [];
      } catch (error) {
        console.error(`Error fetching ${category}:`, error);
        return null;
      }
    }
  
    async function fetchMealDetails(mealId) {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const data = await response.json();
      return data.meals[0];
    }
  
    function displayMeal(meal) {
      mealImage.src = meal.strMealThumb;
      mealImage.alt = meal.strMeal;
      mealTitle.textContent = meal.strMeal;
      
      // Clean up instructions
      const instructions = meal.strInstructions
        .split('\r\n')
        .filter(para => para.trim() !== '')
        .slice(0, 3)
        .join('\n\n');
        
      mealInstructions.textContent = instructions;
      mealLink.href = meal.strYoutube || meal.strSource || 
                      `https://www.google.com/search?q=${encodeURIComponent(meal.strMeal + " recipe")}`;
      
      resultSection.style.display = "block";
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }
  
    function showError(message) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
      setTimeout(() => {
        errorElement.style.display = "none";
      }, 3000);
    }
  
    function showLoading(show) {
      const submitBtn = form.querySelector("button[type='submit']");
      if (show) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-search"></i> Find My Meal';
      }
    }
  });