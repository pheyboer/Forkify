import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}

// new api url
// https://forkify-api.jonas.io

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    // console.log('Loading recipe ID:', id);

    if (!id) return;
    recipeView.renderSpinner();

    // update results view if there are actual results
    if (
      model.state.search &&
      model.state.search.results &&
      model.state.search.results.length > 0
    ) {
      resultsView.update(model.getSearchResultsPage());
    }

    // Only update bookmarks if they exist
    if (model.state.bookmarks && model.state.bookmarks.length > 0) {
      bookmarksView.update(model.state.bookmarks);
    }

    // Loading recipe
    await model.loadRecipe(id);
    // console.log('Recipe loaded:', model.state.recipe);

    // Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error('Error loading recipe:', err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //get search query
    const query = searchView.getQuery();
    if (!query) return;

    //load search results
    await model.loadSearchResults(query);

    //render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // render inital paginatoin
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings(in state)
  model.updateServings(newServings);

  // update the view as well
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

//controller for adding new bookmark
const controlAddBookmark = function () {
  //add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //update recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //upload new recipe data
    await model.uploadRecipe(newRecipe);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

//implement publisher subscriber pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
