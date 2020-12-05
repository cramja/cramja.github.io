var gblog = {
  _postListClass: ".post-list-row",
  filter: null,
  toggleFilter(category) {
    if (gblog.filter == null) {
      $(`${gblog._postListClass}`).hide();
      $(`${gblog._postListClass}-${category}`).show();
      gblog.filter = category;
    } else {
      $(`${gblog._postListClass}`).show();
      gblog.filter = null;
    }
  }
};


$(".post-category-label").on("click", function (e) {
  gblog.toggleFilter(e.target.getAttribute("data-category"));
});
