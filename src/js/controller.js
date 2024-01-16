import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import paginationView from './views/paginationView.js';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // 0) Выбранный элмемент обновление
    resultsView.update(model.getSearchResultPage());

    // 1) Обновление закладок
    bookmarksView.update(model.state.bookmarks);

    // 2) Загрузка рецепта
    await model.loadRecipe(id);

    // 3) Отображение рецепта
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResult = async function () {
  try {
    // 1) Поисковой запрос
    const query = searchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();

    // 2) Загрузка результата
    await model.loadSearchResult(query);

    // 3) Отображение результата
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage());

    // 4) Рендер кнопок страниц
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 3) Отображение НОВОГО результата
  // resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultPage(goToPage));

  // 4) Рендер НОВЫХ кнопок страниц
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //1) Обновить проции по рецепту
  model.updateServings(newServings);

  //2) Визуализировать
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Добавляем или удаляем закладки
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // 2) Обновляем
  recipeView.update(model.state.recipe);
  // 3) Рендер закладок
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Отображение загрузки
    addRecipeView.renderSpinner();

    // Загрузка нового рецепта
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    // Рендер рецепта
    recipeView.render(model.state.recipe);

    // Сообщение об успехе
    addRecipeView.renderMessage();

    // Рендер закладки
    bookmarksView.render(model.state.bookmarks);

    // Изменить id в URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Закрытие формы
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
