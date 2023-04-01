import dotenv from 'dotenv'
import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
import * as pdfDocumnet from 'PDFKit';
import fs from 'fs';
import https from 'https';
import pdfjsLib from 'pdfjs-dist';

dotenv.config()
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);
// const pdfDocumnet = require('pdfkit');

const app = express()
// sample data
let texts = []
let imgs = []
let doc = null
async function createStory() {    
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Please write a fairy tale book with the title of the book called 'Lee Jae-yeop'. The topic is about adventure.",
    temperature: 0,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    // stop: [" "],
  });
  let text = response.data.choices[0].text
  texts = text.split("\n")
  texts = texts.filter(text => text !== '')
  console.log(texts)
}

async function createImg() {
  for(let text of texts) {
    const response = await openai.createImage({
      prompt: text,
      n: 1,
      size: "256x256",
    });
    imgs.push(response.data.data[0].url)
  }
  // console.log(texts[0])
  // const response = await openai.createImage({
  //   prompt: texts[0],
  //   n: 1,
  //   size: "256x256",
  // });
  console.log(imgs)
}

function initPdf() {
  doc = new pdfDocumnet();
  // doc.font("NanumGothic.ttf");
}

// function completePdf() {
//   doc.end()
//   console.log("end")
// }

async function createPdf() {
  const imgPromises = [];
  for (let i = 0; i < imgs.length; i++) {
    let text = texts[i];
    let imgUrl = imgs[i];
    imgPromises.push(
      new Promise((resolve, reject) => {
        https.get(imgUrl, (response) => {
          const chunks = [];
          response.on('data', (chunk) => {
            chunks.push(chunk);
          });
          response.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve({ buffer, text });
          });
        }).on('error', (error) => {
          reject(error);
        });
      })
    );
  }

  // 순서를 보장한다... 즉, 여기서 buffer로 보내도 되고, pdf를 생성 해도 된다.
  for await (const { buffer, text } of imgPromises) {
    doc.addPage();
    doc.image(buffer).text(text);
  }

  doc.pipe(fs.createWriteStream('output.pdf'));
  doc.end();

  console.log('종료');
}

async function main() {
  // pdf 파일 생성
  initPdf()
  // story를 만든다.
  await createStory()
  // img를 만든다.
  await createImg()
  // pdf를 만든다.
  await createPdf()
}

// main()

// server open
// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });
function pdfParse() {

  const pdfPath = 'output.pdf'
  const loadingTask = pdfjsLib.getDocument(pdfPath);

  loadingTask.promise.then( pdf => {
    const numPages = pdf.numPages
    for(let i =1; i<=numPages; i++) {
      pdf.getPage(i).then(page => {
        const viewport = page.getViewport({ scale:1 });
        const canvas = document.createElement('canvas')
        const canvasContext = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderTask = page.render({
          canvasContext,
          viewport
        })

      })
    }
  })
  
}

pdfParse()