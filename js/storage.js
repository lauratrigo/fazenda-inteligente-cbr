(function () {
  var SAVE_KEY = "fazendinha-cbr-save-v2";
  var CASES_KEY = "fazendinha-cbr-cases-v2";

  function readJson(key, fallback) {
    var raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("Falha ao ler LocalStorage:", key, error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  window.FarmStorage = {
    SAVE_KEY: SAVE_KEY,
    CASES_KEY: CASES_KEY,
    loadGame: function () {
      return readJson(SAVE_KEY, null);
    },
    saveGame: function (state) {
      writeJson(SAVE_KEY, state);
    },
    clearGame: function () {
      localStorage.removeItem(SAVE_KEY);
    },
    loadLearnedCases: function () {
      var cases = readJson(CASES_KEY, []);
      return Array.isArray(cases) ? cases : [];
    },
    saveLearnedCases: function (cases) {
      writeJson(CASES_KEY, cases);
    },
    clearLearnedCases: function () {
      localStorage.removeItem(CASES_KEY);
    },
    clearAll: function () {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(CASES_KEY);
    }
  };
})();
