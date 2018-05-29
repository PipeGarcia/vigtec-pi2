const express = require('express');
const router = express.Router();
const jsonBot = require('./bot');
const multer = require('multer');
const fs = require("fs");
const config = require('../../config/database');
const Article = require('../../models/articles');
arxiv = require('arxiv');
var TfIdf = require('node-tfidf');
var tfidf = new TfIdf();
const kmeans = require('node-kmeans');
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
var documentosFiltradosPorAnio = [];

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

  getFilteredDocsPerAnio(req.body.mensaje).then(function (documentos) {
    console.log(documentos.length);
    getDocumentsPromise(documentos).then(function (documentosAnalizados) {
      res.send({
        'query': documentosAnalizados,
        'algo': 'algo'
      })
    });
  });
});

function getDocumentsPromise(documentos) {
  limite = 0;
  if (documentos.length > 20) {
    limite = 20;
  } else {
    limite = documentos.length;
  }
  return new Promise(function (resolve, reject) {
    var data = [];
    if (documentos.length != 0) {
      for (var i = 0; i < limite; i++) {
        processDocument(documentos[i].summary, documentos[i].title, limite).then((data) => {
          resolve(data);
        });
      }
    } else {
      resolve({
        'nombreDocumento': '',
        'palabrasClaves': ''
      });
    }
  })
}

router.post('/fileUpload', upload.array("uploads[]", 12), (req, res) => {
  res.send({
    'successful': 'files uploaded succesfully'
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

function processDocument(data, documentName, limite) {
  return new Promise(function (resolve, reject) {
    var parameters = getParameters(data);
    documentos = [];
    natural_language_understanding.analyze(parameters, function (err, response) {
      if (err)
        console.log('error:', err);
      else
        var words = [];
      response.keywords.forEach(keyword => words.push(keyword.text.toUpperCase()));
      documentos.push({
        'nombreDocumento': documentName,
        'palabrasClaves': words
      });
      if (documentos.length == limite) {
        resolve(documentos);
      }
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
      'query': data,
      'algo': 'algo'
    })
  });
});

//primera búsqueda, muestra la barra con los docs por año
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
          if (arreglo.length == 0) {
            arreglo.push({
              'anio': anio,
              'nroVeces': numeroVeces
            });
          }
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
    console.log("nro de docs " + documentosFiltrados.items.length);
    for (var i = 0; i < documentosFiltrados.items.length; i++) {
      if (documentosFiltrados.items[i].published.toString().substring(10, 15).trim() == anio.trim()) {
        arrayDocsPerAnio.push(documentosFiltrados.items[i]);
      }
    }
    documentosFiltradosPorAnio = arrayDocsPerAnio;
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

  return new Promise(function (resolve, reject) {
    var arreglo = [];
    var contador = 0;
    var numeroVeces = 1;
    var estaEnArreglo = false;
    var author;
    for (var a = 0; a < 15; a++) {
      author = documentosFiltradosPorAnio[a].authors[0].name.toString()
      for (i = 0; i < arreglo.length; i++) {
        if (documentosFiltradosPorAnio[a].authors[0].name.toString() ==
          documentosFiltradosPorAnio[i].authors[0].name.toString()) {
          arreglo[i].nroVeces = arreglo[i].nroVeces + 1
          estaEnArreglo = true;
        } else {
          estaEnArreglo = false;
        }
      }

      if (!estaEnArreglo) {
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

router.post('/getAllDocuments', (req, res) => {
  agruparDocsConKmeans(req.body.mensaje).then(function (data) {
    res.send({
      'data': data
    });
  });
});


function agruparDocsConKmeans(palabras) {
  limite = 0;
  if (documentosFiltradosPorAnio.length > 20) {
    limite = 20;
  } else {
    limite = documentosFiltradosPorAnio.length;
  }
  return new Promise(function (resolve, reject) {
    documentos = [];
    retornarDocumentos(limite).then(function (tfidf) {
      console.log(palabras);
      //tfidf.tfidfs(['blockchain', 'bitcoin, tech'], function (i, measure) {
      var matriz = new Array(palabras.length);
      for (i = 0; i < limite; i++) {
        matriz[i] = new Array(palabras.length);
      }
      for (var j = 0; j < palabras.length; j++) {
        tfidf.tfidfs(palabras[j], function (i, measure) {
          matriz[i][j] = measure;
        });
      }
      console.log(matriz);
      analisisKmeans(matriz).then(data => {
        organizarLista(data).then(function (listaFinal) {
          resolve(listaFinal);
        });
      });
    });
  });
}


function retornarDocumentos(limite) {
  var tfidf = new TfIdf();
  summ = [];
  return new Promise(function (resolve, reject) {
    for (i = 0; i < limite; i++) {
      //summ = documentosFiltradosPorAnio[i].summary.split(" ");
      summ = documentosFiltradosPorAnio[i].summary;
      console.log(documentosFiltradosPorAnio[i].title);
      tfidf.addDocument(summ);
      if (tfidf.documents.length == limite) {
        resolve(tfidf);
      }
    }

  });
}

function analisisKmeans(data) {
  return new Promise(function (resolve, reject) {
    let vectors = new Array();
    for (let i = 0; i < data.length; i++) {
      vectors[i] = data[i];
    }
    kmeans.clusterize(vectors, {
      k: 4
    }, (err, res) => {
      if (err) console.error(err);
      //else console.log('%o', res);
      else resolve(res); //console.log('%o', res);
    });
  });
}

function organizarLista(lista) {
  return new Promise(function (resolve, reject) {
    listaFinal = {};
    var elemento = "";
    for (i = 0; i < lista.length; i++) {
      elemento = "elemento" + i
      listaFinal[elemento] = {
        elementos: []
      }
      for (j = 0; j < lista[i].clusterInd.length; j++) {
        listaFinal[elemento]['elementos'].push({
          "nombre": documentosFiltradosPorAnio[lista[i].clusterInd[j]].title,
          "anio": documentosFiltradosPorAnio[lista[i].clusterInd[j]].published.toString().substring(0, 15),
          "link": documentosFiltradosPorAnio[lista[i].clusterInd[j]].links[1].href
        });
      }
    }
    //console.log(JSON.stringify(listaFinal));
    resolve(listaFinal);
  });
}

module.exports = router;