
import yargs from 'yargs';
import sharp from 'sharp';
import fs from 'fs';

const args = yargs(process.argv.slice(2))
  .option('file', {
    alias: 'f'
  })
  .option('output', {
    alias: 'o'
  })
  .argv;

if (args.file && args.output) {
  console.log(`File: ${args.file}`);
  console.log(`Out: ${args.output}`);
  sharp(fs.readFileSync(args.file))
    .resize({ fit: 'contain', width: 600, height: 600})
    .toFile(`${args.output}`);
}