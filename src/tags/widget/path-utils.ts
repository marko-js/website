type Rotation = 0 | 1 | 2 | 3;
type Point = [number, number];
type PathCommand = string | Point;

interface Nub {
  radius: number;
  path: PathCommand[];
}

// prettier-ignore
const nubs: Record<string, Nub> = {
  out: {
    radius: 44,
    path: [
      "c", [7, 0], [10, -9], [8, -13],
      "s", [-10, -12], [-10, -28],
      "c", [0, -22], [19, -46], [46, -46],
      "s", [46, 24], [46, 46],
      "c", [0, 16], [-8, 24], [-10, 28],
      "s", [1, 13], [8, 13]
    ]
  },
  in: {
    radius: 46,
    path: [
      "c", [3, 0], [5, 3], [3, 6],
      "s", [-9, 10], [-9, 30],
      "c", [0, 21], [16, 51], [52, 51],
      "s", [52, -30], [52, -51],
      "c", [0, -20], [-7, -27], [-9, -30],
      "s", [0, -6], [3, -6]
    ]
  }
};

function rotatePoint([x, y]: Point, rotation: Rotation): Point {
  switch (rotation) {
    case 0:
      return [x, y];
    case 1:
      return [-y, x];
    case 2:
      return [-x, -y];
    case 3:
      return [y, -x];
  }
}

function toPathString(commands: PathCommand[], rotation: Rotation): string {
  let path = "";

  for (const command of commands) {
    if (typeof command === "string") {
      path += "\n" + command;
    } else {
      path += rotatePoint(command, rotation).join(" ") + " ";
    }
  }

  return path;
}

export interface NubOptions {
  top?: "in" | "out";
  right?: "in" | "out";
  bottom?: "in" | "out";
  left?: "in" | "out";
}

export function createWidgetPath(options: NubOptions): string {
  const { top, right, bottom, left } = options;

  let path = "M -130 -140";

  if (top && nubs[top]) {
    const nub = nubs[top];
    path += "h" + (130 - nub.radius);
    path += toPathString(nub.path, 0);
  }

  path += "H 130 a 10 10 0 0 1 10 10";

  if (right && nubs[right]) {
    const nub = nubs[right];
    path += "v" + (130 - nub.radius);
    path += toPathString(nub.path, 1);
  }

  path += "V 130 a 10 10 0 0 1 -10 10";

  if (bottom && nubs[bottom]) {
    const nub = nubs[bottom];
    path += "h" + (-130 + nub.radius);
    path += toPathString(nub.path, 2);
  }

  path += "H -130 a 10 10 0 0 1 -10 -10";

  if (left && nubs[left]) {
    const nub = nubs[left];
    path += "v" + (-130 + nub.radius);
    path += toPathString(nub.path, 3);
  }

  path += "V -130 a 10 10 0 0 1 10 -10";

  return path;
}
