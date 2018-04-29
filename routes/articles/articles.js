const express = require('express');
const router = express.Router();
const jsonBot = require('./bot');
const multer = require('multer');
const fs = require("fs");
const config = require('../../config/database');
const Article = require('../../models/articles');
arxiv = require('arxiv');

var request = require('request');
let PDFParser = require("pdf2json");

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const natural_language_understanding = new NaturalLanguageUnderstandingV1({
  'username': 'addceb71-3818-4edf-ab98-745f1e260fa5',
  'password': 'lesiNMLoPDPj',
  'version_date': '2017-02-27'
});

const folder = 'C:/Users/pipe-_000/Desktop/PI2/proyecto/angular-src/uploads/';
var severalWords = false;

var documentosAnalizados = [];
var titles = [];

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'angular-src/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})

var upload = multer({ storage: storage })


router.post('/initChatbot', (req, res) => {
  documentosAnalizados = [];
  var words = req.body.mensaje.split(',');
  var finalWords = [];
  words.forEach(word => finalWords.push(word.toUpperCase()));
  if(words.length > 1) {
    severalWords = true;
  } else {
    severalWords = false;
  }

  search_query = {
    all: words
    //author: 'William Chan'
  };

  getDocumentsPromise(search_query).then(function(documentosAnalizados) {

    res.send(
      {    
        'botMessage': getBotResponse(req.body.mensaje),    
        'query': documentosAnalizados,
        'titles': titles,    
        'algo': 'algo'    
      }
    )
    
  });

});

  function getDocumentsPromise(search_query) {
    return new Promise(function(resolve, reject) {
      arxiv.search(search_query, function(err, results) {
    
        var data = [];

        if(results.items.length != 0){
          for(var i=0; i<2; i++) {
            
            let pdfParser = new PDFParser(this, 1);
            var options = {
              url: results.items[i].links[1].href,
              headers: {
                  'Referer': 'https://arxiv.org',
                  'User-Agent': 'request'
              }
            }

            console.log(options.url);
            console.log(results.items[i].title);
            console.log("i = " + i);
            request(options).pipe(pdfParser);
            var contenido;
            
      
            pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
            pdfParser.on("pdfParser_dataReady", pdfData => {
                    //fs.writeFile("./resultado.txt", pdfParser.getRawTextContent());
                contenido = pdfParser.getRawTextContent();
                
                var parameters = getParameters(contenido);
                console.log("i = " + i);
                natural_language_understanding.analyze(parameters, function(err, response) {
                  if (err)
                      console.log('error:', err);
                  else
                      var words = [];
                      //console.log(response);
                      response.keywords.forEach(keyword => words.push(keyword.text.toUpperCase()));
                      console.log("i = " + i);
                      console.log("doc en i: " + results.items[i].title);
                      documentosAnalizados.push({
                        'nombreDocumento': results.items[i].title, 
                        'palabrasClaves':words
                      });
                      //console.log(documentosAnalizados);
                      if(documentosAnalizados.length == 2) {
                        resolve(documentosAnalizados);                      
                      }
                });
            });
            console.log(results.items[i].title);
            titles.push({
              'title': results.items[i].title
            });
            console.log("ii = " + i);
          }
        }
      });
    })
  }

router.post('/fileUpload', upload.array("uploads[]", 12), (req, res) => {
  res.send({'successful':'files uploaded succesfully'});
});
  
function getBotResponse(message) {
    var intent = '';
    var output = '';
    for(var i = 0; i < jsonBot.length; i++) {
      jsonBot[i].examples.forEach(ex => {
        if (ex.text.toUpperCase() === message.toUpperCase()) {
          intent = jsonBot[i].intent;
          output = jsonBot[i].description;
        }
      })
    }
    if(intent !== '' && output !== '') {
        return output
    } else {
      if(severalWords) {
        return 'Le resultó útil la búsqueda?'
      } else {
      return 'No se de que me esta hablando'
    }
  }
}

router.post('/processDocuments', (req, res) => {
  initDocumentProcessing(req.body.files);
  res.send({'successful': 'successful processing'});
});

function initDocumentProcessing(inputFiles) {
  fs.readdir(folder, (err, files) => {
    files.forEach(file => {
      if(inputFiles.includes(file)){
        const data = fs.readFileSync(folder + file, 'utf8');
        processDocument(data, file);
      }      
    });
  })
}

function processDocument(data, documentName) {
  var parameters = getParameters(data);
    natural_language_understanding.analyze(parameters, function(err, response) {
      if (err)
          console.log('error:', err);
      else
          var words = [];
          //console.log(response);
          response.keywords.forEach(keyword => words.push(keyword.text.toUpperCase()));
          documentosAnalizados.push({'nombreDocumento': documentName, 'palabrasClaves':words});
          console.log(documentosAnalizados);
          //machetazo = true;
      });
}

function getParameters(data) {
  return {
      'text': data,
      'features': {
        'entities': {
          'emotion': true,
          'sentiment': true,
          'limit': 2
        },
        'keywords': {
          'emotion': true,
          'sentiment': true,
          'limit': 10
        }
      }
    }
}

router.post('/getDocsPerYear', (req, res) => {
  docsPorAnio(req.body.mensaje).then(function (data) {
    console.log(data);
    res.send({    
        'botMessage': getBotResponse(req.body.mensaje),    
        'query': data,    
        'algo': 'algo'    
    })
  });
});

function docsPorAnio(words) {
  return new Promise(function (resolve, reject) {
    search_query = {
      all: words
      //author: 'William Chan'
    };
    arxiv.search(search_query, function (err, results) {
      var arreglo = [];
      var contador = 0;
      var numeroVeces = 0;
      for (var a = 0; a < results.items.length; a++) {
        var anio = results.items[contador].published.toString().substring(10, 15)
        console.log(results.items[a].published.toString().substring(10, 15));
        if (anio == results.items[a].published.toString().substring(10, 15)) {
          numeroVeces = numeroVeces + 1;
        } else {
          arreglo.push({
            'anio': anio,
            'nroVeces': numeroVeces
          });
          contador = a;
          numeroVeces = 0;
        }
        if(a == results.items.length-1) {
          resolve(arreglo);
        }
      }
      
    });
  })
}

module.exports = router;