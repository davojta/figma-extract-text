var traverse = require('traverse');
var fs = require('fs-extra');
var xlsx = require('node-xlsx');
const request = require('request')



const api_endpoint = 'https://api.figma.com/v1';

function getTextNodes(figFile) {
  return traverse.nodes(figFile)
    .filter(node => hasKey(node, 'type') && node.type === 'TEXT')
    .map(node => ({ id: node.id, name: node.name, characters: node.characters }))
}

// console.log('api call', `${api_endpoint}/files/${file_id}`);

function keysToArray(objects) {
  const keysArray = [];
  keysArray.push(Object.keys(objects));
  objects.forEach(function(object) {
      keysArray.push((Object).values(object));
  });
  return keysArray;
}

const extractText = (personal_access_token, file_id) => {
  
  console.log('file_id', file_id);
  console.log('personal_access_token1', personal_access_token);

  console.log('start remove file');
  fs.removeSync('./public/figma_text_layers.xlsx');
  console.log('end remove file');

  return new Promise((resolve, reject) => {
    console.log('personal_access_token2', personal_access_token);
    request.get(`${api_endpoint}/files/${file_id}`, {
      headers: {
        "Content-Type": "application/json",
        "x-figma-token": personal_access_token,
      },
    }, function (error, response, body) {
      
      requestErrorHandler(error, response, body, reject);
    
      const parsedBody = JSON.parse(body);
      fs.outputJsonSync('./parsedBody.json', parsedBody, {
        spaces: '\t',
      });
    
      const textNodes = getTextNodes(parsedBody);
      // console.log('textNodes', textNodes);
      fs.outputJsonSync('./text_nodes.json', textNodes, {
        spaces: '\t',
      });
    
      const xlsxData = keysToArray(textNodes);
      console.log('xlsxData', xlsxData);
    
      const buffer = xlsx.build([{ name: 'Common', data: xlsxData }]);
      fs.writeFileSync('./public/figma_text_layers.xlsx', buffer, 'binary');
      resolve();
      
      setTimeout(() => {
        console.log('clean up the file');
        fs.removeSync('./public/figma_text_layers.xlsx');
      }, 20*1000);

      
    });
  })
}

module.exports = {
  extractText,
};



function requestErrorHandler(error, response, body, reject) {
  if (error) {
    console.error(error);
    console.error(body);
    reject(error);

    // response.send();
    // process.exit(1)
  }
}

function hasKey(node, key) {
  return node && typeof node === 'object' && key in node;
}