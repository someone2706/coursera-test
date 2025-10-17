// js/script.js
(function (global) {
  var dc = {};

  // Helper to replace {{propName}} in a string with propValue
  function insertProperty(string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    return string.replace(new RegExp(propToReplace, "g"), propValue);
  }

  // Helper to choose random index
  function chooseRandomIndex(n) {
    return Math.floor(Math.random() * n);
  }

  // Paths to remote JSON endpoints
  var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";
  var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";

  // Load the home snippet and insert into #main-content.
  // But first fetch categories and choose a random short_name to insert
  function loadHomeWithRandomCategory() {
    $ajaxUtils.sendGetRequest(allCategoriesUrl, function (categories) {
      if (!Array.isArray(categories) || categories.length === 0) {
        console.error("No categories found; loading home without random category.");
        insertHomeSnippet("'L'"); // fallback
        return;
      }

      var randIndex = chooseRandomIndex(categories.length);
      var randShortName = categories[randIndex].short_name;
      // Must include surrounding quotes so onclick="$dc.loadMenuItems('L');" remains valid
      var randomCategoryShortName = "'" + randShortName + "'";
      insertHomeSnippet(randomCategoryShortName);
    }, true);
  }

  // Insert the home snippet, replacing {{randomCategoryShortName}}
  function insertHomeSnippet(randomCategoryShortName) {
    var homeSnippetUrl = "snippets/home-snippet.html";
    $ajaxUtils.sendGetRequest(homeSnippetUrl, function (homeHtml) {
      var homeHtmlToInsert = insertProperty(homeHtml, "randomCategoryShortName", randomCategoryShortName);
      document.querySelector("#main-content").innerHTML = homeHtmlToInsert;
    }, false);
  }

  // Load menu categories (list all categories)
  function loadMenuCategories() {
    $ajaxUtils.sendGetRequest(allCategoriesUrl, function (categories) {
      buildAndShowCategoriesHTML(categories);
    }, true);
  }

  // Build HTML for categories and show
  function buildAndShowCategoriesHTML(categories) {
    var categoriesTitleHtml = "<h2>Menu Categories</h2>";
    var categoryHtml = "<div class='categories-list'>";

    categories.forEach(function (cat) {
      categoryHtml += "<div class='category-item'>";
      categoryHtml += "<h3>" + cat.name + " (" + cat.short_name + ")</h3>";
      categoryHtml += "<p>" + (cat.special_instructions || "") + "</p>";
      categoryHtml += "</div>";
    });

    categoryHtml += "</div>";
    document.querySelector("#main-content").innerHTML = categoriesTitleHtml + categoryHtml;
  }

  // Load menu items for a given category short name (expects a string like 'L' or 'S')
  // This function is called from the Specials tile via onclick="$dc.loadMenuItems('L');"
  function loadMenuItems(categoryShortName) {
    // categoryShortName may be passed with quotes: 'L' or without. Normalize:
    if (typeof categoryShortName === "string") {
      // Remove surrounding quotes if present
      categoryShortName = categoryShortName.replace(/^'+|'+$/g, "");
    }

    $ajaxUtils.sendGetRequest(menuItemsUrl + categoryShortName, function (menuItemsResponse) {
      buildAndShowMenuItemsHTML(menuItemsResponse, categoryShortName);
    }, true);
  }

  // Build HTML for menu items response (object with menu_items array and category info)
  function buildAndShowMenuItemsHTML(menuItemsResponse, categoryShortName) {
    var titleHtml = "<h2>Menu Items for Category: " + categoryShortName + "</h2>";
    var items = menuItemsResponse.menu_items;
    var itemsHtml = "<div class='menu-items'>";

    if (!Array.isArray(items) || items.length === 0) {
      itemsHtml += "<p>No items found for this category.</p>";
    } else {
      items.forEach(function (item) {
        itemsHtml += "<div class='menu-item'>";
        itemsHtml += "<h3>" + item.name + " - " + (item.short_name || "") + "</h3>";
        itemsHtml += "<p>" + (item.description || "") + "</p>";
        itemsHtml += "</div>";
      });
    }

    itemsHtml += "</div>";
    document.querySelector("#main-content").innerHTML = titleHtml + itemsHtml;
  }

  // Expose functions via $dc object expected by snippets
  dc.loadHomeWithRandomCategory = loadHomeWithRandomCategory;
  dc.loadMenuCategories = loadMenuCategories;
  dc.loadMenuItems = loadMenuItems;

  global.$dc = dc;

  // On DOMContentLoaded, load the home page with a random category value
  document.addEventListener("DOMContentLoaded", function () {
    loadHomeWithRandomCategory();
  });
})(window);
