(function () {
  var TILE_SIZE = 32;
  var WIDTH = 24;
  var HEIGHT = 18;
  var BLOCKED = {
    fence: true,
    house: true,
    tree: true,
    water: true
  };

  function makeKey(x, y) {
    return x + "," + y;
  }

  function createMap() {
    var tiles = [];
    var plantingTiles = [];
    var treeTiles = [
      { x: 18, y: 2 }, { x: 20, y: 3 }, { x: 3, y: 12 }, { x: 5, y: 14 },
      { x: 19, y: 14 }, { x: 21, y: 13 }, { x: 12, y: 2 }
    ];
    var treeLookup = {};

    treeTiles.forEach(function (tile) {
      treeLookup[makeKey(tile.x, tile.y)] = true;
    });

    for (var y = 0; y < HEIGHT; y += 1) {
      var row = [];

      for (var x = 0; x < WIDTH; x += 1) {
        var type = "grass";

        if (x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1) {
          type = "fence";
        }

        if (x >= 2 && x <= 5 && y >= 2 && y <= 5) {
          type = "house";
        }

        if ((x >= 6 && x <= 8 && y === 5) || (x === 8 && y >= 5 && y <= 8)) {
          type = "path";
        }

        if (x >= 9 && x <= 16 && y >= 8 && y <= 13) {
          type = "plot";
          plantingTiles.push({ x: x, y: y });
        }

        if (treeLookup[makeKey(x, y)]) {
          type = "tree";
        }

        row.push(type);
      }

      tiles.push(row);
    }

    return {
      width: WIDTH,
      height: HEIGHT,
      tileSize: TILE_SIZE,
      tiles: tiles,
      plantingTiles: plantingTiles,
      assistantTile: { x: 18, y: 9 }
    };
  }

  function getTile(map, x, y) {
    if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
      return "fence";
    }

    return map.tiles[y][x];
  }

  function isBlockedTile(map, x, y) {
    return Boolean(BLOCKED[getTile(map, x, y)]);
  }

  function isPlantingTile(map, x, y) {
    return getTile(map, x, y) === "plot";
  }

  function pixelToTile(map, pixelX, pixelY) {
    return {
      x: Math.floor(pixelX / map.tileSize),
      y: Math.floor(pixelY / map.tileSize)
    };
  }

  function isBlockedRect(map, left, top, width, height) {
    var points = [
      pixelToTile(map, left, top),
      pixelToTile(map, left + width, top),
      pixelToTile(map, left, top + height),
      pixelToTile(map, left + width, top + height)
    ];

    return points.some(function (point) {
      return isBlockedTile(map, point.x, point.y);
    });
  }

  function drawGrassDetails(ctx, x, y, tileSize) {
    var seed = (x * 37 + y * 19) % 17;
    ctx.fillStyle = seed % 2 === 0 ? "rgba(52, 124, 48, 0.25)" : "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(x * tileSize + 7 + seed, y * tileSize + 8, 3, 9);
    ctx.fillRect(x * tileSize + 19, y * tileSize + 17 + (seed % 4), 3, 7);
  }

  function drawMap(ctx, map) {
    var tileSize = map.tileSize;

    for (var y = 0; y < map.height; y += 1) {
      for (var x = 0; x < map.width; x += 1) {
        var type = getTile(map, x, y);
        var px = x * tileSize;
        var py = y * tileSize;

        if (type === "grass") {
          ctx.fillStyle = (x + y) % 2 === 0 ? "#70b85d" : "#69ae57";
          ctx.fillRect(px, py, tileSize, tileSize);
          drawGrassDetails(ctx, x, y, tileSize);
        }

        if (type === "path") {
          ctx.fillStyle = "#c99a5a";
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = "rgba(112, 69, 37, 0.18)";
          ctx.fillRect(px + 3, py + 23, 20, 3);
          ctx.fillRect(px + 15, py + 8, 12, 3);
        }

        if (type === "plot") {
          ctx.fillStyle = "#8e5b31";
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = "#754521";
          ctx.fillRect(px + 3, py + 5, tileSize - 6, 3);
          ctx.fillRect(px + 3, py + 15, tileSize - 6, 3);
          ctx.fillRect(px + 3, py + 25, tileSize - 6, 3);
        }

        if (type === "fence") {
          ctx.fillStyle = "#70b85d";
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = "#8d5627";
          ctx.fillRect(px + 4, py + 8, tileSize - 8, 6);
          ctx.fillRect(px + 4, py + 20, tileSize - 8, 6);
          ctx.fillStyle = "#6f3f1e";
          ctx.fillRect(px + 8, py + 4, 6, 25);
          ctx.fillRect(px + 22, py + 4, 6, 25);
        }

        if (type === "house") {
          ctx.fillStyle = "#70b85d";
          ctx.fillRect(px, py, tileSize, tileSize);
        }

        if (type === "tree") {
          ctx.fillStyle = "#70b85d";
          ctx.fillRect(px, py, tileSize, tileSize);
        }
      }
    }

    drawHouse(ctx, tileSize);
    drawTrees(ctx, map);
    drawAssistant(ctx, map);
  }

  function drawHouse(ctx, tileSize) {
    var x = 2 * tileSize;
    var y = 2 * tileSize;
    ctx.fillStyle = "#8b4a2b";
    ctx.fillRect(x + 4, y + 24, 4 * tileSize - 8, 3 * tileSize + 4);
    ctx.fillStyle = "#d45c3d";
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 30);
    ctx.lineTo(x + 2 * tileSize, y - 4);
    ctx.lineTo(x + 4 * tileSize + 5, y + 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe7a3";
    ctx.fillRect(x + 18, y + 50, 24, 20);
    ctx.fillRect(x + 80, y + 50, 24, 20);
    ctx.fillStyle = "#52311d";
    ctx.fillRect(x + 52, y + 75, 24, 45);
  }

  function drawTrees(ctx, map) {
    for (var y = 0; y < map.height; y += 1) {
      for (var x = 0; x < map.width; x += 1) {
        if (getTile(map, x, y) !== "tree") {
          continue;
        }

        var px = x * map.tileSize;
        var py = y * map.tileSize;
        ctx.fillStyle = "#6f3f1e";
        ctx.fillRect(px + 13, py + 17, 8, 15);
        ctx.fillStyle = "#2f7c3b";
        ctx.fillRect(px + 6, py + 5, 20, 18);
        ctx.fillStyle = "#3f9a49";
        ctx.fillRect(px + 2, py + 11, 28, 14);
        ctx.fillStyle = "#23632f";
        ctx.fillRect(px + 9, py + 2, 15, 8);
      }
    }
  }

  function drawAssistant(ctx, map) {
    var px = map.assistantTile.x * map.tileSize;
    var py = map.assistantTile.y * map.tileSize;
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.fillRect(px + 6, py + 25, 22, 5);
    ctx.fillStyle = "#7c4a25";
    ctx.fillRect(px + 15, py + 10, 4, 20);
    ctx.fillStyle = "#f4cc58";
    ctx.fillRect(px + 7, py + 6, 20, 16);
    ctx.fillStyle = "#4f3520";
    ctx.fillRect(px + 9, py + 10, 4, 4);
    ctx.fillRect(px + 21, py + 10, 4, 4);
    ctx.fillRect(px + 12, py + 18, 10, 3);
    ctx.fillStyle = "#5fa8d3";
    ctx.fillRect(px + 22, py + 2, 8, 8);
    ctx.fillStyle = "#fff7dc";
    ctx.fillRect(px + 24, py + 4, 4, 4);
  }

  function drawTileHighlight(ctx, map, tile, color) {
    if (!tile) {
      return;
    }

    ctx.strokeStyle = color || "#fff7dc";
    ctx.lineWidth = 3;
    ctx.strokeRect(tile.x * map.tileSize + 2, tile.y * map.tileSize + 2, map.tileSize - 4, map.tileSize - 4);
  }

  window.FarmMap = {
    TILE_SIZE: TILE_SIZE,
    createMap: createMap,
    drawMap: drawMap,
    drawTileHighlight: drawTileHighlight,
    getTile: getTile,
    isBlockedRect: isBlockedRect,
    isBlockedTile: isBlockedTile,
    isPlantingTile: isPlantingTile,
    makeKey: makeKey,
    pixelToTile: pixelToTile
  };
})();
