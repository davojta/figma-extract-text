var traverse = require('traverse');
var fs = require('fs-extra');
var xlsx = require('node-xlsx');
const request = require('request')



// REPLACE ME: replace these values with a file you own and with your own developer token.
const file_id = 'bN4CiGwZPlGVBu9SdT347ZkU';
const personal_access_token = '8894-fdb41f9b-93a3-4ce6-83ef-b6eaeb56c26b';

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

request.get(`${api_endpoint}/files/${file_id}`, {
  headers: {
    "Content-Type": "application/json",
    "x-figma-token": personal_access_token,
  },
}, function (error, response, body) {
  
  requestErrorHandler(error, response, body);

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
  fs.writeFileSync('./figma_text_layers.xlsx', buffer, 'binary');
});



function requestErrorHandler(error, response, body) {
  if (error) {
    console.log(error);
    console.log(body);
    process.exit(1)
  }
}

function hasKey(node, key) {
  return node && typeof node === 'object' && key in node;
}