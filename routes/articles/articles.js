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
//let pdfParser = new PDFParser(this,1);

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const natural_language_understanding = new NaturalLanguageUnderstandingV1({
  'username': 'addceb71-3818-4edf-ab98-745f1e260fa5',
  'password': 'lesiNMLoPDPj',
  'version_date': '2017-02-27'
});

const folder = 'C:/Users/pipe-_000/Desktop/PI2/proyecto/angular-src/uploads/';
var severalWords = false;

var documentosAnalizados = [];
var documentosFiltrados = [];
var documentosFiltradosPorAutor = [];

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'angular-src/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})

var upload = multer({
  storage: storage
})

router.post('/initChatbot', (req, res, next) => {
  documentosAnalizados = [];
  var words = req.body.mensaje.split(',');
  var finalWords = [];
  words.forEach(word => finalWords.push(word.toUpperCase()));
  if (words.length > 1) {
    severalWords = true;
  } else {
    severalWords = false;
  }

  search_query = {
    all: words
    //author: 'William Chan'
  };

  getFilteredDocsPerAnio(req.body.mensaje).then(function (documentos) {
    console.log(documentos.length);
    getDocumentsPromise(documentos).then(function (documentosAnalizados) {
      res.send({
        'botMessage': getBotResponse(req.body.mensaje),
        'query': documentosAnalizados,
        'algo': 'algo'
      })
    });
  });


});

function getDocumentsPromise(documentos) {
  return new Promise(function (resolve, reject) {
    //arxiv.search(search_query, function (err, results) {
    var data = [];
    if (documentos.length != 0) {
      for (var i = 0; i < 5; i++) {

        let pdfParser = new PDFParser(this, 1);
        var options = {
          url: documentos[i].links[1].href,
          headers: {
            'Referer': 'https://arxiv.org',
            'User-Agent': 'request'
          }
        }
        request(options).pipe(pdfParser);
        var contenido;
        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
          contenido = pdfParser.getRawTextContent();
          var parameters = getParameters(contenido);
          natural_language_understanding.analyze(parameters, function (err, response) {
            if (err)
              console.log('error:', err);
            else
              var words = [];
            response.keywords.forEach(keyword => words.push(keyword.text.toUpperCase()));
            documentosAnalizados.push({
              'nombreDocumento': documentos[i].title,
              'palabrasClaves': words
            });
            if (documentosAnalizados.length == 5) {
              resolve(documentosAnalizados);
            }
          });
        });
      }
    }
    })
  //})

}

router.post('/fileUpload', upload.array("uploads[]", 12), (req, res) => {
  res.send({
    'successful': 'files uploaded succesfully'
  });
});

function getBotResponse(message) {
  var intent = '';
  var output = '';
  for (var i = 0; i < jsonBot.length; i++) {
    jsonBot[i].examples.forEach(ex => {
      if (ex.text.toUpperCase() === message.toUpperCase()) {
        intent = jsonBot[i].intent;
        output = jsonBot[i].description;
      }
    })
  }
  if (intent !== '' && output !== '') {
    return output
  } else {
    if (severalWords) {
      return 'Le resultó útil la búsqueda?'
    } else {
      return 'No se de que me esta hablando'
    }
  }
}


router.post('/processDocuments', (req, res) => {
  initDocumentProcessing(req.body.files);
  res.send({
    'successful': 'successful processing'
  });
});

function initDocumentProcessing(inputFiles) {
  fs.readdir(folder, (err, files) => {
    files.forEach(file => {
      if (inputFiles.includes(file)) {
        const data = fs.readFileSync(folder + file, 'utf8');
        processDocument(data, file);
      }
    });
  })
}

function processDocument(data, documentName) {
  var parameters = getParameters(data);
  natural_language_understanding.analyze(parameters, function (err, response) {
    if (err)
      console.log('error:', err);
    else
      var words = [];
    response.keywords.forEach(keyword => words.push(keyword.text.toUpperCase()));
    documentosAnalizados.push({
      'nombreDocumento': documentName,
      'palabrasClaves': words
    });
  });
}

function getParameters(data) {
  return {
    'text': data,
    'features': {
      'entities': {
        'emotion': false,
        'sentiment': false,
        'limit': 2
      },
      'keywords': {
        'emotion': false,
        'sentiment': false,
        'limit': 5
      }
    }
  }
}

router.post('/getDocsPerYear', (req, res, next) => {
  docsPorAnio(req.body.mensaje).then(function (data) {
    //console.log(data);
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
      documentosFiltrados = results;
      var arreglo = [];
      var contador = 0;
      var numeroVeces = 0;
      for (var a = 0; a < results.items.length; a++) {
        var anio = results.items[contador].published.toString().substring(10, 15)
        //console.log(results.items[a].published.toString().substring(10, 15));
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
        if (a == results.items.length - 1) {
          resolve(arreglo);
        }
      }

    });
  })
}

router.get('/getFilteredDocs', (req, res) => {
  res.send({
    'response': documentosFiltrados
  })
});

router.post('/getDocumentsPerYear', (req, res) => {
  console.log(req.body.anio);
  getFilteredDocsPerAnio(req.body.anio);
});

function getFilteredDocsPerAnio(anio) {
  console.log(anio);
  return new Promise(function (resolve, reject) {
    arrayDocsPerAnio = [];
    for (var i = 0; i < documentosFiltrados.items.length; i++) {
      if (documentosFiltrados.items[i].published.toString().substring(10, 15).trim() == anio.trim()) {
        arrayDocsPerAnio.push(documentosFiltrados.items[i]);
      }
    }
    documentosFiltradosPorAutor = arrayDocsPerAnio;
    resolve(arrayDocsPerAnio);
    //console.log(arrayDocsPerAnio.length);
  })
}

router.get('/getDocsPerAuthor', (req, res) => {

  docsPorAutor().then(function (data) {
    console.log(data);
    res.send({
      'data': data
    })
  });
  //docsPorAutor();
});

function docsPorAutor() {
  /*for(var i = 0; i < 115; i++) {
    if(documentosFiltradosPorAutor[i].authors[0].name.toString() == 'Arlindo Flavio da Conceição') {
      console.log(i);
    }
    console.log(documentosFiltradosPorAutor[i].authors);
  }*/

  return new Promise(function (resolve, reject) {
    var arreglo = [];
    var contador = 0;
    var numeroVeces = 1;
    var estaEnArreglo = false;
    var author;
    for (var a = 0; a < 15; a++) {
      author = documentosFiltradosPorAutor[a].authors[0].name.toString()
      for (i = 0; i < arreglo.length; i++) {
        if (documentosFiltradosPorAutor[a].authors[0].name.toString() ==
          documentosFiltradosPorAutor[i].authors[0].name.toString()) {
          arreglo[i].nroVeces = arreglo[i].nroVeces + 1
          estaEnArreglo = true;
        } else {
          estaEnArreglo = false;
        }
      }

      if(!estaEnArreglo) {
        arreglo.push({
          'author': author,
          'nroVeces': numeroVeces
        });
      }

      if (a == 14) {
        console.log(arreglo);
        resolve(arreglo);
      }
    }
    //console.log(arreglo);
  })
}

module.exports = router;