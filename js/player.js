(function () {
  function createPlayer(map, savedPlayer) {
    return savedPlayer || {
      x: 9.5 * map.tileSize,
      y: 7.5 * map.tileSize,
      width: 18,
      height: 24,
      speed: 120,
      facing: "down",
      moving: false
    };
  }

  function update(player, input, map, deltaSeconds) {
    var dx = 0;
    var dy = 0;

    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    player.moving = dx !== 0 || dy !== 0;

    if (Math.abs(dx) > Math.abs(dy)) {
      player.facing = dx > 0 ? "right" : "left";
    } else if (dy !== 0) {
      player.facing = dy > 0 ? "down" : "up";
    }

    move(player, map, dx * player.speed * deltaSeconds, 0);
    move(player, map, 0, dy * player.speed * deltaSeconds);
  }

  function move(player, map, dx, dy) {
    if (dx === 0 && dy === 0) {
      return;
    }

    var nextX = player.x + dx;
    var nextY = player.y + dy;
    var left = nextX - player.width / 2;
    var top = nextY - player.height / 2;

    if (!window.FarmMap.isBlockedRect(map, left, top, player.width, player.height)) {
      player.x = nextX;
      player.y = nextY;
    }
  }

  function getCurrentTile(player, map) {
    return window.FarmMap.pixelToTile(map, player.x, player.y + player.height / 4);
  }

  function getFacingTile(player, map) {
    var tile = getCurrentTile(player, map);

    if (player.facing === "up") tile.y -= 1;
    if (player.facing === "down") tile.y += 1;
    if (player.facing === "left") tile.x -= 1;
    if (player.facing === "right") tile.x += 1;

    return tile;
  }

  function getInteractionTile(player, map) {
    var current = getCurrentTile(player, map);
    var facing = getFacingTile(player, map);

    if (window.FarmMap.isPlantingTile(map, facing.x, facing.y)) {
      return facing;
    }

    return current;
  }

  function drawPlayer(ctx, player, tick) {
    var x = Math.round(player.x);
    var y = Math.round(player.y);
    var bob = player.moving ? Math.sin(tick / 100) * 1.5 : 0;

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(x - 11, y + 11, 22, 6);

    ctx.fillStyle = "#4d6fb3";
    ctx.fillRect(x - 8, y - 5 + bob, 16, 18);
    ctx.fillStyle = "#f1b77a";
    ctx.fillRect(x - 7, y - 18 + bob, 14, 12);
    ctx.fillStyle = "#7a4a24";
    ctx.fillRect(x - 10, y - 23 + bob, 20, 7);
    ctx.fillRect(x - 7, y - 27 + bob, 14, 5);

    ctx.fillStyle = "#263027";
    if (player.facing !== "up") {
      ctx.fillRect(x - 4, y - 14 + bob, 3, 3);
      ctx.fillRect(x + 3, y - 14 + bob, 3, 3);
    }

    ctx.fillStyle = "#263027";
    ctx.fillRect(x - 8, y + 12 + bob, 6, 6);
    ctx.fillRect(x + 2, y + 12 - bob, 6, 6);
  }

  window.FarmPlayer = {
    createPlayer: createPlayer,
    drawPlayer: drawPlayer,
    getCurrentTile: getCurrentTile,
    getFacingTile: getFacingTile,
    getInteractionTile: getInteractionTile,
    update: update
  };
})();

