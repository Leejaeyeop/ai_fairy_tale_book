require('dotenv').config();
const express = require('express');
const app = express()
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);
const pdfDocumnet = require('pdfkit');
const fs = require('fs');
const https = require('https');

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

main()

// server open
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});