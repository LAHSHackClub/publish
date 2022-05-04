
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
  .option('width', {
    alias: 'w'
  })
  .argv;

if (args.file && args.output) {
  const inputFSplit = args.file.split('/');
  const inputFileName = inputFSplit[inputFSplit.length - 1];
  console.log(`Resizing ${inputFileName}`);
  sharp(fs.readFileSync(args.file))
    .rotate()
    .resize({ fit: 'contain', width: args.width })
    .toFile(`${args.output}`);
}