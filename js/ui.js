(function () {
  var TOOL_LABELS = {
    hoe: "enxada",
    seed: "semente",
    water: "regador",
    fertilizer: "adubo",
    pesticide: "controle de pragas",
    harvest: "colher"
  };

  var WEATHER_LABELS = {
    ensolarado: "ensolarado",
    chuvoso: "chuvoso",
    seco: "seco",
    nublado: "nublado"
  };

  var elements = {};
  var messageTimer = 0;

  function init(game) {
    elements.day = document.getElementById("hudDay");
    elements.weather = document.getElementById("hudWeather");
    elements.coins = document.getElementById("hudCoins");
    elements.seeds = document.getElementById("hudSeeds");
    elements.harvests = document.getElementById("hudHarvests");
    elements.tool = document.getElementById("hudTool");
    elements.quickMessage = document.getElementById("quickMessage");
    elements.assistantSpeech = document.getElementById("assistantSpeech");
    elements.cbrSimilarity = document.getElementById("cbrSimilarity");
    elements.cbrAction = document.getElementById("cbrAction");
    elements.cbrCycle = document.getElementById("cbrCycle");
    elements.toolGrid = document.getElementById("toolGrid");

    Array.prototype.forEach.call(elements.toolGrid.querySelectorAll("button[data-tool]"), function (button) {
      button.addEventListener("click", function () {
        game.setTool(button.dataset.tool);
      });
    });

    document.getElementById("nextDayButton").addEventListener("click", function () {
      game.nextDay();
    });
    document.getElementById("saveButton").addEventListener("click", function () {
      game.saveGame(true);
    });
    document.getElementById("resetButton").addEventListener("click", function () {
      game.resetGame();
    });
    document.getElementById("askCbrButton").addEventListener("click", function () {
      game.askAssistant();
    });
  }

  function update(game) {
    elements.day.textContent = game.state.day;
    elements.weather.textContent = WEATHER_LABELS[game.state.weather];
    elements.coins.textContent = game.state.inventory.coins;
    elements.seeds.textContent = game.state.inventory.seeds;
    elements.harvests.textContent = game.state.inventory.harvests;
    elements.tool.textContent = TOOL_LABELS[game.state.currentTool];

    Array.prototype.forEach.call(elements.toolGrid.querySelectorAll("button[data-tool]"), function (button) {
      button.classList.toggle("is-active", button.dataset.tool === game.state.currentTool);
    });
  }

  function showMessage(message, persistent) {
    elements.quickMessage.textContent = message;
    messageTimer = persistent ? 0 : Date.now() + 4500;
  }

  function tickMessage() {
    if (messageTimer && Date.now() > messageTimer) {
      elements.quickMessage.textContent = "WASD/setas movem, E usa ferramenta, Q consulta o Assistente CBR, N passa o dia.";
      messageTimer = 0;
    }
  }

  function showAssistantWaiting() {
    elements.assistantSpeech.textContent = "Aproxime-se de um canteiro e pressione Q. Eu comparo a situação com casos antigos e sugiro uma ação.";
    elements.cbrSimilarity.textContent = "--";
    elements.cbrAction.textContent = "--";
    elements.cbrCycle.textContent = "aguardando";
  }

  function showAssistantNoPlot() {
    elements.assistantSpeech.textContent = "Chegue mais perto de um canteiro para eu analisar solo, umidade, pragas e crescimento.";
    elements.cbrSimilarity.textContent = "--";
    elements.cbrAction.textContent = "--";
    elements.cbrCycle.textContent = "sem canteiro";
  }

  function showAssistantAnalysis(analysis) {
    elements.assistantSpeech.textContent = analysis.explanation;
    elements.cbrSimilarity.textContent = analysis.similarity.percentage + "%";
    elements.cbrAction.textContent = window.FarmCBR.ACTION_LABELS[analysis.recommendedAction];
    elements.cbrCycle.textContent = "Retrieve > Reuse > Revise";
  }

  function showRetain(learnedCount, result) {
    elements.cbrCycle.textContent = "Retain: " + learnedCount + " casos";
    elements.assistantSpeech.textContent = "Aprendi com o último dia. Resultado registrado: " + result + ". Minha memória cresceu para próximas recomendações.";
  }

  window.FarmUI = {
    init: init,
    showAssistantAnalysis: showAssistantAnalysis,
    showAssistantNoPlot: showAssistantNoPlot,
    showAssistantWaiting: showAssistantWaiting,
    showMessage: showMessage,
    showRetain: showRetain,
    tickMessage: tickMessage,
    update: update
  };
})();
