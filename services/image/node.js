
import yargs from 'yargs';
import sharp from 'sharp';
import fs from 'fs';

const args = yargs(process.argv.slice(2))
  .option('file', {
    alias: 'f'
  })  
  .argv;

if (args.file) {
  console.log(`File: ${args.file}`);
  sharp(fs.readFileSync(args.file))
    .resize({ fit: 'contain', width: 600, height: 600})
    .toFile('output.webp');
}