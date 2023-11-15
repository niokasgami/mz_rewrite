const {readFileSync} = require('fs');
const watch = require('node-watch');

const concatSource = require('./concat.js');

JSON.parse(readFileSync('./modules.json').toString())
  .map(name=>({name, target:`./js/${name}`}))
  .forEach(({name,target})=>{
    watch(target, ()=>{
      concatSource(name);
      console.log(`${target} changed. copy ${name}.js`);
    });
  });