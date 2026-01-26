import { Fs } from "@d0paminedriven/fs";

const fs = new Fs(process.cwd());

const filesArr = fs
  .readDir("src", { recursive: true })
  .filter(o =>  !(o.lastIndexOf(".") === -1))
  .map(v => `src/${v}`);
console.log(filesArr);
