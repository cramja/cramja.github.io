$(".category-filter").on("click", function(e) {
  var buttonEl = $(e.target);
  var selectionClass = "." + e.target.getAttribute('data-class-filter');
  if (!buttonEl.hasClass("selected")) {
    $(".selected").removeClass("selected");
    buttonEl.addClass("selected");
    $(".post-list-row").hide();
    $(selectionClass).show();
  } else {
    buttonEl.removeClass("selected");
    $(".post-list-row").show();
  }
})