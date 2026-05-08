(function () {
  var TOOLS_BY_KEY = {
    "1": "hoe",
    "2": "seed",
    "3": "water",
    "4": "fertilizer",
    "5": "pesticide",
    "6": "harvest"
  };

  var WEATHER_OPTIONS = ["ensolarado", "chuvoso", "seco", "nublado"];

  function randomWeather() {
    var roll = Math.random();
    if (roll < 0.32) return "ensolarado";
    if (roll < 0.56) return "chuvoso";
    if (roll < 0.78) return "nublado";
    return "seco";
  }

  function createDefaultState(map) {
    return {
      day: 1,
      weather: "ensolarado",
      inventory: {
        seeds: 10,
        harvests: 0,
        coins: 0
      },
      currentTool: "hoe",
      crops: window.FarmCrops.initializePlots(map.plantingTiles),
      pendingCases: [],
      player: null
    };
  }

  function createGame(canvas) {
    var ctx = canvas.getContext("2d");
    var map = window.FarmMap.createMap();
    var saved = window.FarmStorage.loadGame();
    var state = saved || createDefaultState(map);
    var player = window.FarmPlayer.createPlayer(map, state.player);
    var input = { up: false, down: false, left: false, right: false };
    var lastTime = 0;
    var game = {
      canvas: canvas,
      ctx: ctx,
      map: map,
      state: state,
      player: player,
      input: input,
      setTool: setTool,
      useTool: useTool,
      askAssistant: askAssistant,
      nextDay: nextDay,
      saveGame: saveGame,
      resetGame: resetGame,
      getTargetPlotInfo: getTargetPlotInfo,
      start: start
    };

    ctx.imageSmoothingEnabled = false;
    state.crops = state.crops || window.FarmCrops.initializePlots(map.plantingTiles);
    state.pendingCases = state.pendingCases || [];
    state.inventory = state.inventory || { seeds: 10, harvests: 0, coins: 0 };
    state.currentTool = state.currentTool || "hoe";
    state.weather = WEATHER_OPTIONS.indexOf(state.weather) >= 0 ? state.weather : "ensolarado";

    bindInput(game);
    bindCanvasClick(game);
    window.FarmUI.init(game);
    window.FarmUI.update(game);

    function setTool(tool) {
      state.currentTool = tool;
      window.FarmUI.update(game);
      window.FarmUI.showMessage("Ferramenta atual: " + toolLabel(tool) + ".");
    }

    function toolLabel(tool) {
      return {
        hoe: "enxada",
        seed: "semente",
        water: "regador",
        fertilizer: "adubo",
        pesticide: "controle de pragas",
        harvest: "colher"
      }[tool] || tool;
    }

    function getTargetPlotInfo() {
      var tile = window.FarmPlayer.getInteractionTile(player, map);

      if (!window.FarmMap.isPlantingTile(map, tile.x, tile.y)) {
        return null;
      }

      return {
        tile: tile,
        key: window.FarmMap.makeKey(tile.x, tile.y),
        plot: window.FarmCrops.getPlot(state.crops, tile.x, tile.y)
      };
    }

    function useTool() {
      var target = getTargetPlotInfo();

      if (!target) {
        window.FarmUI.showMessage("Fique sobre ou de frente para um canteiro para usar a ferramenta.");
        return;
      }

      var beforePlot = window.FarmCrops.clonePlot(target.plot);
      var caseData = window.FarmCBR.createCaseFromPlot(target.plot, state.weather);
      var result = window.FarmCrops.applyTool(target.plot, state.currentTool, state.inventory);

      window.FarmUI.showMessage(result.message);

      if (result.ok) {
        state.pendingCases.push({
          key: target.key,
          caseData: caseData,
          beforePlot: beforePlot,
          action: result.action,
          actionResult: result
        });
        saveGame(false);
      }

      window.FarmUI.update(game);
    }

    function askAssistant() {
      var target = getTargetPlotInfo();

      if (!target) {
        window.FarmUI.showAssistantNoPlot();
        window.FarmUI.showMessage("O assistente precisa de um canteiro perto de você.");
        return;
      }

      var currentCase = window.FarmCBR.createCaseFromPlot(target.plot, state.weather);
      var analysis = window.FarmCBR.analyze(currentCase);
      window.FarmUI.showAssistantAnalysis(analysis);
      window.FarmUI.showMessage("Assistente CBR sugeriu: " + window.FarmCBR.ACTION_LABELS[analysis.recommendedAction] + ".");
    }

    function nextDay() {
      var oldWeather = state.weather;
      var summary = window.FarmCrops.advanceDay(state.crops, oldWeather);
      var retained = [];
      var lastResult = "sem_efeito";

      state.pendingCases.forEach(function (pending) {
        var afterPlot = window.FarmCrops.getPlotByKey(state.crops, pending.key) || pending.beforePlot;
        var result = window.FarmCrops.evaluateResult(pending.beforePlot, afterPlot, pending.actionResult);
        lastResult = result;
        retained.push(window.FarmCBR.retain(pending.caseData, pending.action, result));
      });

      state.pendingCases = [];
      state.day += 1;
      state.weather = randomWeather();
      saveGame(false);
      window.FarmUI.update(game);

      var message = "Dia " + state.day + ": clima " + state.weather + ". " + summary.grown + " planta(s) cresceram.";
      if (summary.problems) {
        message += " " + summary.problems + " canteiro(s) precisam de cuidado.";
      }
      window.FarmUI.showMessage(message, true);

      if (retained.length) {
        window.FarmUI.showRetain(window.FarmCBR.getLearnedCases().length, lastResult);
      }
    }

    function serializeState() {
      return {
        day: state.day,
        weather: state.weather,
        inventory: state.inventory,
        currentTool: state.currentTool,
        crops: state.crops,
        pendingCases: state.pendingCases,
        player: {
          x: player.x,
          y: player.y,
          width: player.width,
          height: player.height,
          speed: player.speed,
          facing: player.facing,
          moving: false
        }
      };
    }

    function saveGame(notify) {
      window.FarmStorage.saveGame(serializeState());
      if (notify) {
        window.FarmUI.showMessage("Jogo salvo no navegador.");
      }
    }

    function resetGame() {
      if (!confirm("Resetar progresso, inventário e casos aprendidos?")) {
        return;
      }

      window.FarmStorage.clearAll();
      state = createDefaultState(map);
      player = window.FarmPlayer.createPlayer(map, null);
      game.state = state;
      game.player = player;
      window.FarmUI.showAssistantWaiting();
      window.FarmUI.showMessage("Progresso resetado. A fazendinha começou de novo.", true);
      window.FarmUI.update(game);
    }

    function update(deltaSeconds) {
      window.FarmPlayer.update(player, input, map, deltaSeconds);
      window.FarmUI.tickMessage();
    }

    function render(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.FarmMap.drawMap(ctx, map);
      window.FarmCrops.drawCrops(ctx, state.crops, map.tileSize);
      var target = getTargetPlotInfo();
      if (target) {
        window.FarmMap.drawTileHighlight(ctx, map, target.tile, "#fff7dc");
      }
      window.FarmPlayer.drawPlayer(ctx, player, time);
    }

    function loop(time) {
      var deltaSeconds = Math.min((time - lastTime) / 1000, 0.05) || 0;
      lastTime = time;
      update(deltaSeconds);
      render(time);
      requestAnimationFrame(loop);
    }

    function start() {
      window.FarmUI.showAssistantWaiting();
      requestAnimationFrame(loop);
    }

    return game;
  }

  function bindInput(game) {
    window.addEventListener("keydown", function (event) {
      var key = event.key.toLowerCase();

      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(key) >= 0) {
        event.preventDefault();
      }

      if (key === "w" || key === "arrowup") game.input.up = true;
      if (key === "s" || key === "arrowdown") game.input.down = true;
      if (key === "a" || key === "arrowleft") game.input.left = true;
      if (key === "d" || key === "arrowright") game.input.right = true;

      if (TOOLS_BY_KEY[key]) {
        game.setTool(TOOLS_BY_KEY[key]);
      }

      if (key === "e" || key === " ") {
        game.useTool();
      }

      if (key === "q") {
        game.askAssistant();
      }

      if (key === "n") {
        game.nextDay();
      }
    });

    window.addEventListener("keyup", function (event) {
      var key = event.key.toLowerCase();
      if (key === "w" || key === "arrowup") game.input.up = false;
      if (key === "s" || key === "arrowdown") game.input.down = false;
      if (key === "a" || key === "arrowleft") game.input.left = false;
      if (key === "d" || key === "arrowright") game.input.right = false;
    });
  }

  function bindCanvasClick(game) {
    game.canvas.addEventListener("click", function (event) {
      var rect = game.canvas.getBoundingClientRect();
      var scaleX = game.canvas.width / rect.width;
      var scaleY = game.canvas.height / rect.height;
      var x = (event.clientX - rect.left) * scaleX;
      var y = (event.clientY - rect.top) * scaleY;
      var tile = window.FarmMap.pixelToTile(game.map, x, y);
      var assistant = game.map.assistantTile;

      if (Math.abs(tile.x - assistant.x) <= 1 && Math.abs(tile.y - assistant.y) <= 1) {
        game.askAssistant();
      }
    });
  }

  window.FarmGame = {
    createGame: createGame
  };
})();
