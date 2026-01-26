import { Fs } from "@d0paminedriven/fs";

const fs = new Fs(process.cwd());

const filesArr = <const T extends "src" | "dist" = "src">(distOrSrc: T) => {
  const filePaths = fs
    .readDir("src", { recursive: true })
    .filter(o => !(o.lastIndexOf(".") === -1))
    .filter(o => !o.startsWith("test"))
    .map(v => `${distOrSrc}/${v}`);
  if (distOrSrc === "src") {
    return filePaths;
  } else {
    return filePaths.map(p => p.slice(0, p.lastIndexOf(".")).concat(".d.ts"));
  }
};
if (process.argv[3] === "src" || process.argv[3] === "dist") {
  console.log(filesArr(process.argv[3]));
}
