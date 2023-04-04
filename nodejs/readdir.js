var testFolder = './data'
var fs = require('fs')

fs.readdir(testFolder, (err, list) => {
  console.log(list)
})
