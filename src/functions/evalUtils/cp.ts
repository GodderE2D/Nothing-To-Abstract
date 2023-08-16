import { spawn } from "node:child_process";
import { inspect } from "node:util";

export function cp(...argsArr: string[]) {
  const child = spawn(argsArr[0], argsArr.slice(1));
  const lines: string[] = [];

  child.stdout.on("data", (data) => lines.push(data));
  child.stderr.on("data", (data) => lines.push(data));
  child.on("error", (data) => lines.push(inspect(data)));

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      if (code === 0) return resolve(lines.join(""));

      lines.push(`\n\nProcess exited with code ${code}`);
      return reject(lines.join(""));
    });
  });
}

// Same as cp(), but takes one argument and splits it into an array automatically
export function scp(args: string) {
  const argsArr = args.split(" ");
  const child = spawn(argsArr[0], argsArr.slice(1));
  const lines: string[] = [];

  child.stdout.on("data", (data) => lines.push(data));
  child.stderr.on("data", (data) => lines.push(data));
  child.on("error", (data) => lines.push(inspect(data)));

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      if (code === 0) return resolve(lines.join(""));

      lines.push(`\n\nProcess exited with code ${code}`);
      return reject(lines.join(""));
    });
  });
}
