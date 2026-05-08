(function () {
  function boot() {
    var canvas = document.getElementById("gameCanvas");
    var game = window.FarmGame.createGame(canvas);
    window.fazendinhaGame = game;
    game.start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
