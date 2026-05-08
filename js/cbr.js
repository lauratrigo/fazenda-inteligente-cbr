(function () {
  var WEIGHTS = {
    clima: 10,
    solo: 20,
    umidade: 15,
    pragas: 20,
    crescimento: 10,
    saude: 15,
    estagioPlanta: 10
  };

  var RESULT_PRIORITY = {
    colheu: 5,
    melhorou: 4,
    melhorou_parcialmente: 3,
    sem_efeito: 2,
    piorou: 1
  };

  var ACTION_LABELS = {
    preparar_solo: "preparar solo",
    plantar: "plantar",
    regar: "regar",
    adubar: "adubar",
    tratar_pragas: "tratar pragas",
    colher: "colher",
    esperar: "esperar"
  };

  var INITIAL_CASES = [
    {
      id: "base-001",
      clima: "seco",
      solo: "seco",
      umidade: "baixa",
      pragas: "nenhuma",
      crescimento: "broto",
      saude: "murcha",
      estagioPlanta: "crescendo",
      acaoAplicada: "regar",
      resultado: "melhorou",
      explicacao: "Em clima seco, uma planta murcha com umidade baixa melhorou depois de receber água."
    },
    {
      id: "base-002",
      clima: "ensolarado",
      solo: "normal",
      umidade: "media",
      pragas: "nenhuma",
      crescimento: "semente",
      saude: "saudavel",
      estagioPlanta: "preparado",
      acaoAplicada: "plantar",
      resultado: "melhorou",
      explicacao: "Solo preparado e saudável era adequado para plantar uma nova semente."
    },
    {
      id: "base-003",
      clima: "nublado",
      solo: "pobre",
      umidade: "media",
      pragas: "baixa",
      crescimento: "medio",
      saude: "amarelada",
      estagioPlanta: "crescendo",
      acaoAplicada: "adubar",
      resultado: "melhorou",
      explicacao: "Folhas amareladas em solo pobre indicaram falta de nutrientes."
    },
    {
      id: "base-004",
      clima: "ensolarado",
      solo: "normal",
      umidade: "media",
      pragas: "alta",
      crescimento: "adulto",
      saude: "com_manchas",
      estagioPlanta: "crescendo",
      acaoAplicada: "tratar_pragas",
      resultado: "melhorou",
      explicacao: "Pragas altas e manchas foram resolvidas com controle de pragas."
    },
    {
      id: "base-005",
      clima: "chuvoso",
      solo: "encharcado",
      umidade: "alta",
      pragas: "nenhuma",
      crescimento: "broto",
      saude: "saudavel",
      estagioPlanta: "crescendo",
      acaoAplicada: "esperar",
      resultado: "melhorou_parcialmente",
      explicacao: "Com solo encharcado, esperar foi melhor do que regar novamente."
    },
    {
      id: "base-006",
      clima: "nublado",
      solo: "normal",
      umidade: "media",
      pragas: "nenhuma",
      crescimento: "adulto",
      saude: "saudavel",
      estagioPlanta: "pronto",
      acaoAplicada: "colher",
      resultado: "colheu",
      explicacao: "A planta adulta pronta foi colhida com sucesso."
    },
    {
      id: "base-007",
      clima: "seco",
      solo: "normal",
      umidade: "baixa",
      pragas: "media",
      crescimento: "medio",
      saude: "com_manchas",
      estagioPlanta: "crescendo",
      acaoAplicada: "tratar_pragas",
      resultado: "melhorou_parcialmente",
      explicacao: "O controle de pragas ajudou, mas a baixa umidade ainda exigia atenção."
    },
    {
      id: "base-008",
      clima: "ensolarado",
      solo: "normal",
      umidade: "media",
      pragas: "nenhuma",
      crescimento: "semente",
      saude: "saudavel",
      estagioPlanta: "vazio",
      acaoAplicada: "preparar_solo",
      resultado: "melhorou",
      explicacao: "Um canteiro vazio precisou ser preparado antes do plantio."
    },
    {
      id: "base-009",
      clima: "chuvoso",
      solo: "normal",
      umidade: "alta",
      pragas: "baixa",
      crescimento: "medio",
      saude: "saudavel",
      estagioPlanta: "crescendo",
      acaoAplicada: "esperar",
      resultado: "melhorou_parcialmente",
      explicacao: "A chuva já cuidava da umidade, então esperar foi suficiente."
    },
    {
      id: "base-010",
      clima: "seco",
      solo: "pobre",
      umidade: "baixa",
      pragas: "baixa",
      crescimento: "broto",
      saude: "amarelada",
      estagioPlanta: "crescendo",
      acaoAplicada: "adubar",
      resultado: "melhorou_parcialmente",
      explicacao: "Adubar ajudou o solo pobre, mas a seca ainda pedia rega."
    },
    {
      id: "base-011",
      clima: "ensolarado",
      solo: "seco",
      umidade: "baixa",
      pragas: "alta",
      crescimento: "adulto",
      saude: "com_manchas",
      estagioPlanta: "crescendo",
      acaoAplicada: "tratar_pragas",
      resultado: "melhorou",
      explicacao: "Mesmo com solo seco, pragas altas eram o risco mais urgente."
    },
    {
      id: "base-012",
      clima: "nublado",
      solo: "normal",
      umidade: "media",
      pragas: "nenhuma",
      crescimento: "semente",
      saude: "saudavel",
      estagioPlanta: "plantado",
      acaoAplicada: "regar",
      resultado: "melhorou_parcialmente",
      explicacao: "A semente plantada recebeu água para começar o crescimento."
    }
  ];

  function cloneCase(caseData) {
    return JSON.parse(JSON.stringify(caseData));
  }

  function getCaseBase() {
    return INITIAL_CASES.map(cloneCase).concat(window.FarmStorage.loadLearnedCases());
  }

  function mapGrowth(plot) {
    if (!plot || plot.stage === "empty" || plot.stage === "prepared" || plot.stage === "seed") {
      return "semente";
    }

    if (plot.stage === "sprout") {
      return "broto";
    }

    if (plot.stage === "middle" || plot.stage === "problem") {
      return plot.growth || "medio";
    }

    return "adulto";
  }

  function mapPlantStage(plot) {
    if (!plot || plot.stage === "empty") {
      return "vazio";
    }

    if (plot.stage === "prepared") {
      return "preparado";
    }

    if (plot.stage === "seed") {
      return "plantado";
    }

    if (plot.stage === "ready") {
      return "pronto";
    }

    return "crescendo";
  }

  function createCaseFromPlot(plot, weather) {
    return {
      clima: weather,
      solo: plot.soil || "normal",
      umidade: plot.moisture || "baixa",
      pragas: plot.pests || "nenhuma",
      crescimento: mapGrowth(plot),
      saude: plot.health || "saudavel",
      estagioPlanta: mapPlantStage(plot)
    };
  }

  function calculateSimilarity(currentCase, storedCase) {
    var score = 0;
    var matches = {};

    Object.keys(WEIGHTS).forEach(function (attribute) {
      var matchesAttribute = currentCase[attribute] === storedCase[attribute];
      matches[attribute] = matchesAttribute;

      if (matchesAttribute) {
        score += WEIGHTS[attribute];
      }
    });

    return {
      score: score,
      percentage: score,
      matches: matches
    };
  }

  function compareResults(first, second) {
    return (RESULT_PRIORITY[first.resultado] || 0) - (RESULT_PRIORITY[second.resultado] || 0);
  }

  function retrieve(currentCase) {
    var caseBase = getCaseBase();

    return caseBase.reduce(function (best, storedCase) {
      var similarity = calculateSimilarity(currentCase, storedCase);

      if (!best || similarity.score > best.similarity.score) {
        return { case: storedCase, similarity: similarity };
      }

      if (similarity.score === best.similarity.score && compareResults(storedCase, best.case) > 0) {
        return { case: storedCase, similarity: similarity };
      }

      return best;
    }, null);
  }

  function reuse(retrievedCase) {
    return retrievedCase.acaoAplicada;
  }

  function revise(currentCase, reusedAction) {
    var action = reusedAction;
    var adaptations = [];
    var hasPlant = currentCase.estagioPlanta === "plantado" || currentCase.estagioPlanta === "crescendo" || currentCase.estagioPlanta === "pronto";

    if (currentCase.estagioPlanta === "vazio") {
      action = "preparar_solo";
      adaptations.push("canteiro vazio pede preparo do solo antes de qualquer plantio");
    } else if (currentCase.estagioPlanta === "preparado") {
      action = "plantar";
      adaptations.push("solo preparado pode receber uma semente");
    } else if (currentCase.estagioPlanta === "pronto") {
      action = "colher";
      adaptations.push("planta pronta deve ser colhida antes de novos cuidados");
    } else if (currentCase.pragas === "alta") {
      action = "tratar_pragas";
      adaptations.push("pragas altas têm prioridade sobre outras ações");
    } else if (hasPlant && (currentCase.solo === "seco" || currentCase.umidade === "baixa")) {
      action = "regar";
      adaptations.push("solo seco ou umidade baixa pedem rega");
    } else if (hasPlant && currentCase.solo === "pobre" && currentCase.saude === "amarelada") {
      action = "adubar";
      adaptations.push("solo pobre com planta amarelada indica adubação");
    }

    if (hasPlant && (action === "plantar" || action === "preparar_solo")) {
      action = currentCase.umidade === "baixa" || currentCase.solo === "seco" ? "regar" : "esperar";
      adaptations.push("o canteiro já tem uma planta, então não deve ser preparado ou plantado novamente");
    }

    if (currentCase.solo === "encharcado" && action === "regar") {
      action = "esperar";
      adaptations.push("solo encharcado não deve receber mais água");
    }

    return {
      action: action,
      adaptations: adaptations
    };
  }

  function analyze(currentCase) {
    var retrieved = retrieve(currentCase);
    var reusedAction = reuse(retrieved.case);
    var revised = revise(currentCase, reusedAction);

    return {
      currentCase: currentCase,
      retrievedCase: retrieved.case,
      similarity: retrieved.similarity,
      reusedAction: reusedAction,
      recommendedAction: revised.action,
      adaptations: revised.adaptations,
      explanation: buildExplanation(retrieved.case, retrieved.similarity, reusedAction, revised)
    };
  }

  function buildExplanation(retrievedCase, similarity, reusedAction, revised) {
    var text = "Já vi um caso parecido (" + similarity.percentage + "%). Recomendação: " + ACTION_LABELS[revised.action] + ".";

    if (revised.action !== reusedAction) {
      text += " Eu adaptei a ação antiga, que era " + ACTION_LABELS[reusedAction] + ".";
    }

    if (revised.adaptations.length) {
      text += " Motivo: " + revised.adaptations.join("; ") + ".";
    } else {
      text += " A ação do caso antigo ainda faz sentido aqui.";
    }

    text += " Caso recuperado: " + retrievedCase.id + ".";
    return text;
  }

  function retain(caseData, action, result) {
    var learnedCases = window.FarmStorage.loadLearnedCases();
    var learnedCase = {
      id: "aprendido-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      clima: caseData.clima,
      solo: caseData.solo,
      umidade: caseData.umidade,
      pragas: caseData.pragas,
      crescimento: caseData.crescimento,
      saude: caseData.saude,
      estagioPlanta: caseData.estagioPlanta,
      acaoAplicada: action,
      resultado: result,
      explicacao: "Caso aprendido no jogo: ação " + ACTION_LABELS[action] + " resultou em " + result + ".",
      criadoEm: new Date().toISOString()
    };

    learnedCases.unshift(learnedCase);
    window.FarmStorage.saveLearnedCases(learnedCases.slice(0, 80));
    return learnedCase;
  }

  window.FarmCBR = {
    ACTION_LABELS: ACTION_LABELS,
    WEIGHTS: WEIGHTS,
    analyze: analyze,
    calculateSimilarity: calculateSimilarity,
    createCaseFromPlot: createCaseFromPlot,
    getCaseBase: getCaseBase,
    getInitialCases: function () { return INITIAL_CASES.map(cloneCase); },
    getLearnedCases: function () { return window.FarmStorage.loadLearnedCases(); },
    retain: retain
  };
})();

