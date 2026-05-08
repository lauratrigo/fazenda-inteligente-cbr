(function () {
  var TOOL_TO_ACTION = {
    hoe: "preparar_solo",
    seed: "plantar",
    water: "regar",
    fertilizer: "adubar",
    pesticide: "tratar_pragas",
    harvest: "colher"
  };

  var STAGE_LABELS = {
    empty: "vazio",
    prepared: "solo preparado",
    seed: "semente",
    sprout: "broto",
    middle: "planta média",
    adult: "planta adulta",
    problem: "planta com problema",
    ready: "pronta para colher"
  };

  function createEmptyPlot(tile) {
    return {
      x: tile.x,
      y: tile.y,
      stage: "empty",
      previousStage: "seed",
      growth: "semente",
      age: 0,
      soil: "normal",
      moisture: "baixa",
      pests: "nenhuma",
      health: "saudavel",
      daysDry: 0
    };
  }

  function initializePlots(plantingTiles) {
    var plots = {};

    plantingTiles.forEach(function (tile) {
      plots[window.FarmMap.makeKey(tile.x, tile.y)] = createEmptyPlot(tile);
    });

    return plots;
  }

  function clonePlot(plot) {
    return JSON.parse(JSON.stringify(plot));
  }

  function resetPlot(plot) {
    var empty = createEmptyPlot({ x: plot.x, y: plot.y });
    Object.keys(plot).forEach(function (key) {
      delete plot[key];
    });
    Object.assign(plot, empty);
  }

  function getPlot(plots, x, y) {
    return plots[window.FarmMap.makeKey(x, y)] || null;
  }

  function getPlotByKey(plots, key) {
    return plots[key] || null;
  }

  function isCropStage(plot) {
    return plot.stage !== "empty" && plot.stage !== "prepared";
  }

  function improvePests(current) {
    if (current === "alta") return "media";
    if (current === "media") return "baixa";
    return "nenhuma";
  }

  function worsenPests(current) {
    if (current === "nenhuma") return "baixa";
    if (current === "baixa") return "media";
    return "alta";
  }

  function lowerMoisture(current) {
    if (current === "alta") return "media";
    if (current === "media") return "baixa";
    return "baixa";
  }

  function applyTool(plot, tool, inventory) {
    var action = TOOL_TO_ACTION[tool];

    if (!plot) {
      return { ok: false, action: action, message: "Você precisa estar perto de um canteiro." };
    }

    if (tool === "hoe") {
      if (plot.stage !== "empty") {
        return { ok: false, action: action, message: "Esse canteiro já está preparado ou ocupado." };
      }

      plot.stage = "prepared";
      plot.soil = "normal";
      plot.moisture = "media";
      plot.health = "saudavel";
      return { ok: true, action: action, message: "Solo preparado. Agora dá para plantar uma semente." };
    }

    if (tool === "seed") {
      if (plot.stage !== "prepared") {
        return { ok: false, action: action, message: "Prepare o solo com a enxada antes de plantar." };
      }

      if (inventory.seeds <= 0) {
        return { ok: false, action: action, message: "Você está sem sementes." };
      }

      inventory.seeds -= 1;
      plot.stage = "seed";
      plot.previousStage = "seed";
      plot.growth = "semente";
      plot.age = 0;
      plot.health = "saudavel";
      plot.pests = "nenhuma";
      return { ok: true, action: action, message: "Semente plantada." };
    }

    if (tool === "water") {
      if (plot.stage === "empty") {
        return { ok: false, action: action, message: "Não há nada para regar nesse canteiro." };
      }

      if (plot.moisture === "alta") {
        plot.soil = plot.soil === "pobre" ? "pobre" : "encharcado";
      }

      plot.moisture = "alta";
      if (plot.soil === "seco") {
        plot.soil = "normal";
      }
      if (plot.health === "murcha") {
        plot.health = "saudavel";
      }
      plot.daysDry = 0;
      return { ok: true, action: action, message: "Canteiro regado." };
    }

    if (tool === "fertilizer") {
      if (plot.stage === "empty") {
        return { ok: false, action: action, message: "Prepare ou plante algo antes de usar adubo." };
      }

      plot.soil = "normal";
      if (plot.health === "amarelada") {
        plot.health = "saudavel";
      }
      if (plot.stage === "problem" && plot.pests !== "alta" && plot.moisture !== "baixa") {
        plot.stage = plot.previousStage || "middle";
      }
      return { ok: true, action: action, message: "Adubo aplicado. O solo ficou mais nutritivo." };
    }

    if (tool === "pesticide") {
      if (!isCropStage(plot)) {
        return { ok: false, action: action, message: "Só faz sentido tratar pragas em uma planta." };
      }

      plot.pests = improvePests(plot.pests);
      if (plot.health === "com_manchas" && plot.pests !== "alta") {
        plot.health = "saudavel";
      }
      if (plot.stage === "problem" && plot.pests !== "alta" && plot.moisture !== "baixa" && plot.soil !== "pobre") {
        plot.stage = plot.previousStage || "middle";
      }
      return { ok: true, action: action, message: "Pragas controladas." };
    }

    if (tool === "harvest") {
      if (plot.stage !== "ready") {
        return { ok: false, action: action, message: "Essa planta ainda não está pronta para colher." };
      }

      inventory.harvests += 1;
      inventory.coins += 20;
      if (Math.random() < 0.5) {
        inventory.seeds += 1;
      }
      resetPlot(plot);
      return { ok: true, action: action, message: "Colheita vendida por 20 moedas.", result: "colheu" };
    }

    return { ok: false, action: action, message: "Ferramenta desconhecida." };
  }

  function weatherAffectsPlot(plot, weather) {
    if (plot.stage === "empty") {
      return;
    }

    if (weather === "chuvoso") {
      if (plot.moisture === "alta" && plot.soil !== "pobre") {
        plot.soil = "encharcado";
      }
      plot.moisture = "alta";
      plot.daysDry = 0;
    }

    if (weather === "seco") {
      plot.moisture = lowerMoisture(lowerMoisture(plot.moisture));
      if (plot.moisture === "baixa" && plot.soil !== "pobre") {
        plot.soil = "seco";
      }
    }

    if (weather === "ensolarado") {
      plot.moisture = lowerMoisture(plot.moisture);
      if (plot.moisture === "baixa" && Math.random() < 0.35 && plot.soil !== "pobre") {
        plot.soil = "seco";
      }
    }
  }

  function maybeCreateProblem(plot) {
    if (!isCropStage(plot) || plot.stage === "ready") {
      return;
    }

    if (plot.moisture === "baixa") {
      plot.daysDry += 1;
      plot.health = "murcha";
    }

    if (plot.soil === "pobre") {
      plot.health = "amarelada";
    }

    if (plot.pests === "media" || plot.pests === "alta") {
      plot.health = "com_manchas";
    }

    if (plot.health !== "saudavel" || plot.pests === "alta") {
      if (plot.stage !== "problem") {
        plot.previousStage = plot.stage;
      }
      plot.stage = "problem";
    }
  }

  function canGrow(plot) {
    return isCropStage(plot) && plot.stage !== "ready" && plot.stage !== "problem" && plot.moisture !== "baixa" && plot.soil !== "seco" && plot.soil !== "encharcado" && plot.soil !== "pobre" && plot.pests !== "alta" && plot.health === "saudavel";
  }

  function grow(plot) {
    if (plot.stage === "seed") {
      plot.stage = "sprout";
      plot.growth = "broto";
    } else if (plot.stage === "sprout") {
      plot.stage = "middle";
      plot.growth = "medio";
    } else if (plot.stage === "middle") {
      plot.stage = "adult";
      plot.growth = "adulto";
    } else if (plot.stage === "adult") {
      plot.stage = "ready";
      plot.growth = "adulto";
    }

    plot.age += 1;
  }

  function recoverIfCared(plot) {
    if (plot.stage !== "problem") {
      return;
    }

    if (plot.moisture !== "baixa" && plot.soil !== "pobre" && plot.soil !== "seco" && plot.pests !== "alta") {
      plot.health = "saudavel";
      plot.stage = plot.previousStage || "middle";
    }
  }

  function advanceDay(plots, weather) {
    var summary = { grown: 0, problems: 0 };

    Object.keys(plots).forEach(function (key) {
      var plot = plots[key];

      if (plot.stage === "empty") {
        return;
      }

      weatherAffectsPlot(plot, weather);

      if (isCropStage(plot) && plot.age > 1 && Math.random() < 0.1) {
        plot.pests = worsenPests(plot.pests);
      }

      if (isCropStage(plot) && plot.age > 1 && Math.random() < 0.06) {
        plot.soil = "pobre";
      }

      maybeCreateProblem(plot);
      recoverIfCared(plot);

      if (canGrow(plot)) {
        grow(plot);
        summary.grown += 1;
      }

      if (plot.stage === "problem") {
        summary.problems += 1;
      }
    });

    return summary;
  }

  function plotScore(plot) {
    var stageScore = {
      empty: 0,
      prepared: 8,
      seed: 16,
      sprout: 28,
      middle: 42,
      adult: 58,
      problem: 22,
      ready: 75
    }[plot.stage] || 0;
    var moistureScore = { baixa: -10, media: 8, alta: 10 }[plot.moisture] || 0;
    var soilScore = { seco: -12, normal: 10, encharcado: -10, pobre: -8 }[plot.soil] || 0;
    var pestScore = { nenhuma: 10, baixa: 4, media: -6, alta: -16 }[plot.pests] || 0;
    var healthScore = { saudavel: 16, amarelada: -5, murcha: -8, com_manchas: -10 }[plot.health] || 0;

    return stageScore + moistureScore + soilScore + pestScore + healthScore;
  }

  function evaluateResult(beforePlot, afterPlot, actionResult) {
    if (actionResult && actionResult.result === "colheu") {
      return "colheu";
    }

    var beforeScore = plotScore(beforePlot);
    var afterScore = plotScore(afterPlot);
    var difference = afterScore - beforeScore;

    if (difference >= 12) {
      return "melhorou";
    }

    if (difference > 0) {
      return "melhorou_parcialmente";
    }

    if (difference === 0) {
      return "sem_efeito";
    }

    return "piorou";
  }

  function drawCrop(ctx, plot, tileSize) {
    var px = plot.x * tileSize;
    var py = plot.y * tileSize;
    var cx = px + tileSize / 2;
    var cy = py + tileSize / 2;

    if (plot.stage === "empty") {
      return;
    }

    if (plot.stage === "prepared") {
      ctx.fillStyle = "rgba(255, 247, 220, 0.25)";
      ctx.fillRect(px + 7, py + 7, tileSize - 14, 3);
      ctx.fillRect(px + 7, py + 17, tileSize - 14, 3);
      return;
    }

    if (plot.stage === "seed") {
      ctx.fillStyle = "#f4cc58";
      ctx.fillRect(cx - 3, cy - 2, 6, 5);
      return;
    }

    if (plot.stage === "sprout") {
      ctx.fillStyle = "#2f7c3b";
      ctx.fillRect(cx - 2, cy - 8, 4, 14);
      ctx.fillRect(cx - 9, cy - 5, 8, 5);
      ctx.fillRect(cx + 1, cy - 4, 8, 5);
      return;
    }

    if (plot.stage === "middle") {
      ctx.fillStyle = "#2f7c3b";
      ctx.fillRect(cx - 3, cy - 14, 6, 22);
      ctx.fillStyle = "#55a64c";
      ctx.fillRect(cx - 13, cy - 10, 12, 7);
      ctx.fillRect(cx + 1, cy - 7, 12, 7);
      ctx.fillRect(cx - 9, cy + 1, 18, 6);
      return;
    }

    if (plot.stage === "adult") {
      ctx.fillStyle = "#2f7c3b";
      ctx.fillRect(cx - 4, cy - 18, 8, 28);
      ctx.fillStyle = "#61b85a";
      ctx.fillRect(cx - 15, cy - 13, 13, 8);
      ctx.fillRect(cx + 2, cy - 13, 13, 8);
      ctx.fillStyle = "#f4cc58";
      ctx.fillRect(cx - 5, cy - 18, 10, 11);
      return;
    }

    if (plot.stage === "problem") {
      ctx.fillStyle = plot.health === "amarelada" ? "#d8c755" : "#7ca753";
      ctx.fillRect(cx - 3, cy - 11, 6, 20);
      ctx.fillRect(cx - 14, cy - 5, 12, 6);
      ctx.fillRect(cx + 2, cy - 3, 12, 6);
      ctx.fillStyle = "#9d4030";
      ctx.fillRect(cx - 9, cy - 10, 4, 4);
      ctx.fillRect(cx + 7, cy - 2, 4, 4);
      return;
    }

    if (plot.stage === "ready") {
      ctx.fillStyle = "#2f7c3b";
      ctx.fillRect(cx - 4, cy - 18, 8, 28);
      ctx.fillStyle = "#ffd45a";
      ctx.fillRect(cx - 11, cy - 16, 8, 18);
      ctx.fillRect(cx + 3, cy - 16, 8, 18);
      ctx.fillRect(cx - 4, cy - 21, 8, 18);
    }
  }

  function drawCrops(ctx, plots, tileSize) {
    Object.keys(plots).forEach(function (key) {
      drawCrop(ctx, plots[key], tileSize);
    });
  }

  window.FarmCrops = {
    STAGE_LABELS: STAGE_LABELS,
    TOOL_TO_ACTION: TOOL_TO_ACTION,
    advanceDay: advanceDay,
    applyTool: applyTool,
    clonePlot: clonePlot,
    drawCrops: drawCrops,
    evaluateResult: evaluateResult,
    getPlot: getPlot,
    getPlotByKey: getPlotByKey,
    initializePlots: initializePlots,
    plotScore: plotScore
  };
})();

