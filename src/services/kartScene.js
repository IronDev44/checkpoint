export const KART_RAINBOW = ["#f56c96", "#ffad69", "#f6df76", "#72dbac", "#68d9ec", "#8792f4", "#cc86ea"];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const smoothstep = value => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };
const tint = (hex, factor) => `rgb(${[1, 3, 5].map(offset => Math.round(parseInt(hex.slice(offset, offset + 2), 16) * factor)).join(",")})`;
const roadColors = [0.86, 1].map(factor => KART_RAINBOW.map(color => tint(color, factor)));

export function getKartSceneBudget(width, height, { light = false, effects = "balanced", dpr = 1 } = {}) {
  const reduced = light || effects === "calm";
  return {
    reduced,
    pixelRatio: Math.min(dpr || 1, reduced ? 1 : 2, Math.sqrt((reduced ? 650000 : 1800000) / Math.max(1, width * height))),
    rows: reduced ? 42 : 84,
    stars: reduced ? 38 : effects === "boost" ? 140 : 100,
    fps: reduced ? 30 : 60,
    items: !reduced,
  };
}

// Reproject for each viewport instead of stretching a fixed desktop drawing.
export function projectKartRoad(z, width, height, distance = 0, direction = 1) {
  const depth = 1 / Math.max(.55, z);
  const bend = Math.pow(clamp(1 - depth, 0, 1), 2);
  return {
    x: width * (.5 + direction * .46 * Math.sin(z * .075 + distance * .016) * bend),
    y: height * (.42 + .72 * depth - .18 * smoothstep((z - 8) / 48) + .018 * Math.sin(distance * .025)),
    half: width * .82 * depth,
    scale: depth,
  };
}

function quad(ctx, color, ax, ay, bx, by, cx, cy, dx, dy) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.lineTo(dx, dy); ctx.closePath(); ctx.fill();
}

function star(ctx, x, y, radius, color, turn = 0) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let point = 0; point < 10; point++) {
    const angle = turn - Math.PI / 2 + point * Math.PI / 5;
    const r = point % 2 ? radius * .46 : radius;
    const px = x + Math.cos(angle) * r, py = y + Math.sin(angle) * r;
    if (point === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
}

function cloud(ctx, x, y, size, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  const gradient = ctx.createLinearGradient(0, y - size * .6, 0, y + size * .4);
  gradient.addColorStop(0, "#b6cff3"); gradient.addColorStop(.3, "#6b8ab6"); gradient.addColorStop(1, "#314765");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const r = size * (.23 + (i % 3) * .06);
    const cx = x + (i - 3) * size * .22, cy = y - Math.sin(i * 1.25) * size * .14;
    ctx.moveTo(cx + r, cy); ctx.ellipse(cx, cy, r, r * .65, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

export function paintKartSky(ctx, width, height, budget) {
  const sky = ctx.createLinearGradient(0, 0, width * .6, height);
  sky.addColorStop(0, "#0b1730"); sky.addColorStop(.47, "#263b63"); sky.addColorStop(1, "#0d1731");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
  const nebula = ctx.createRadialGradient(width * .68, height * .38, 0, width * .68, height * .38, height * .55);
  nebula.addColorStop(0, "#9dbad73d"); nebula.addColorStop(.45, "#8f7db526"); nebula.addColorStop(1, "#29173a00");
  ctx.fillStyle = nebula; ctx.fillRect(0, 0, width, height);
  for (let index = 0; index < budget.stars; index++) {
    const x = ((index * .61803398875 + .09) % 1) * width;
    const y = ((index * .38196601125 + index * index * .007) % 1) * height;
    const size = index % 13 === 0 ? 1.5 : .6 + index % 3 * .25;
    ctx.fillStyle = index % 4 ? "#c4c4e8aa" : "#fff4d7";
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
    if (index % 13 === 0) { ctx.fillRect(x - size * 3, y - .35, size * 6, .7); ctx.fillRect(x - .35, y - size * 3, .7, size * 6); }
  }
  for (let i = 0; i < (budget.reduced ? 5 : 9); i++) {
    cloud(ctx, width * ((i * .618 + .08) % 1), height * (.23 + (i % 4) * .11), Math.min(width * (.20 + i % 3 * .05), height * .18), .42 + i % 3 * .1);
  }
  star(ctx, width * .13, height * .31, Math.min(width * .026, 17), "#ffe6a1", -.2);
  star(ctx, width * .9, height * .66, Math.min(width * .016, 11), "#99e6e5", .2);
}

function crystal(ctx, x, y, size, lean) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(lean);
  const s = size;
  quad(ctx, "#7466dc", 0, -s * 2.5, -s * .55, -s * 1.6, -s * .4, 0, 0, s * .2);
  quad(ctx, "#79daf3", 0, -s * 2.5, s * .45, -s * 1.7, s * .5, -s * .2, 0, s * .2);
  quad(ctx, "#ccf6ff", 0, -s * 2.5, s * .12, -s * 1.5, 0, s * .2, -s * .12, -s * 1.4);
  ctx.restore();
}

export function paintKartRoad(ctx, width, height, distance, time, { budget, direction = 1, boost = false }) {
  ctx.save(); ctx.translate(width * .5, height * .42);
  ctx.rotate(budget.reduced ? 0 : Math.sin(time * .6) * .025 * direction);
  ctx.translate(-width * .5, -height * .42);
  const step = 64 / budget.rows;
  const offset = distance % step;
  const worldRow = Math.floor(distance / step);
  const rows = Array.from({ length: budget.rows + 1 }, (_, index) => projectKartRoad(.95 + index * step - offset, width, height, distance, direction));
  for (let index = budget.rows - 1; index >= 0; index--) {
    const near = rows[index], far = rows[index + 1];
    const row = index + worldRow;
    if (near.y < 0 || far.y > height * 1.2) continue;
    const colors = roadColors[row % 2];
    const boostTile = boost && row % 17 < 2;
    for (const side of [-1, 1]) {
      const xn = near.x + side * near.half, xf = far.x + side * far.half;
      quad(ctx, side < 0 ? "#704f89" : "#367587", xn, near.y, xf, far.y, xf, far.y + 5 * far.scale, xn, near.y + 5 * near.scale);
    }
    for (let lane = 0; lane < 7; lane++) {
      const left = lane * 2 / 7 - 1, right = (lane + 1) * 2 / 7 - 1;
      quad(ctx, boostTile ? (lane % 2 ? "#c1eced" : "#fff0a0") : colors[(lane + Math.floor(row / 3)) % 7], near.x + left * near.half, near.y, far.x + left * far.half, far.y, far.x + right * far.half, far.y, near.x + right * near.half, near.y);
      ctx.strokeStyle = "#282c4e73"; ctx.lineWidth = Math.max(.6, near.scale * 1.5); ctx.stroke();
      if (!budget.reduced && (row + lane) % 3 === 0) {
        ctx.fillStyle = "#effcff24"; ctx.beginPath(); ctx.moveTo(near.x + left * near.half, near.y); ctx.lineTo(far.x + left * far.half, far.y); ctx.lineTo(far.x + right * far.half, far.y); ctx.closePath(); ctx.fill();
      }
      if (boostTile && near.y - far.y > 3) {
        const half = (near.half + far.half) / 2;
        const cx = (near.x + far.x) / 2 + (left + right) / 2 * half;
        const cy = (near.y + far.y) / 2, dy = (near.y - far.y) * .27, dx = half * .09;
        ctx.fillStyle = "#9463a3"; ctx.beginPath();
        ctx.moveTo(cx - dx, cy + dy); ctx.lineTo(cx, cy - dy); ctx.lineTo(cx + dx, cy + dy);
        ctx.lineTo(cx + dx * .65, cy + dy); ctx.lineTo(cx, cy - dy * .3); ctx.lineTo(cx - dx * .65, cy + dy); ctx.closePath(); ctx.fill();
      }
    }
    ctx.strokeStyle = "#fff3ff35"; ctx.lineWidth = Math.max(.4, near.scale * 1.3);
    ctx.beginPath(); ctx.moveTo(near.x - near.half, near.y); ctx.lineTo(near.x + near.half, near.y); ctx.stroke();
    for (const side of [-1, 1]) {
      const n = near.x + side * near.half, f = far.x + side * far.half;
      quad(ctx, side < 0 ? "#ffc0e5" : "#c1faff", n, near.y, f, far.y, f + side * 3 * far.scale, far.y, n + side * 3 * near.scale, near.y);
      if (row % 3 === 0) {
        ctx.strokeStyle = side < 0 ? "#ffb0d8" : "#9ee9f5"; ctx.lineWidth = Math.max(.6, near.scale * 2);
        ctx.beginPath(); ctx.moveTo(n, near.y); ctx.lineTo(n, near.y - near.scale * 17); ctx.stroke();
      }
    }
    if (budget.items && index > 2 && index < 22 && row % 10 === 6) {
      const side = row % 20 < 10 ? -1 : 1;
      const size = Math.min(48, near.half * .27);
      crystal(ctx, near.x + side * (near.half + size), near.y + size * .3, size, -side * .25);
      crystal(ctx, near.x + side * (near.half + size * 1.7), near.y + size * .4, size * .6, side * .2);
    }
  }
  ctx.restore();
  if (!budget.reduced) {
    cloud(ctx, -width * .12 + Math.sin(time * .17) * width * .05, height * .86, width * .32, .36);
    cloud(ctx, width * 1.13 + Math.cos(time * .15) * width * .04, height * .69, width * .29, .31);
  }
  if (boost && !budget.reduced) {
    ctx.lineCap = "round";
    const rays = budget.stars > 100 ? 30 : 18;
    for (let index = 0; index < rays; index++) {
      const angle = index * Math.PI * 2 / rays + .13;
      const travel = (time * 1.8 + index * .618) % 1;
      const radius = .25 + travel * .55;
      const x = width * .5, y = height * .43;
      ctx.strokeStyle = `${KART_RAINBOW[index % 7]}${Math.round(Math.sin(travel * Math.PI) * 120).toString(16).padStart(2, "0")}`;
      ctx.lineWidth = 1 + travel * 2;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(angle) * width * radius, y + Math.sin(angle) * height * radius);
      ctx.lineTo(x + Math.cos(angle) * width * (radius + .15), y + Math.sin(angle) * height * (radius + .15)); ctx.stroke();
    }
  }
}
