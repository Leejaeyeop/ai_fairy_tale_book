import axios from "axios";

export async function fetchTtsApi(text) {
    let res = null;
    let data = JSON.stringify({
        voice: {
            languageCode: "ko-KR",
            ssmlGender: "FEMALE",
            name: "ko-KR-Wavenet-A", // Specify the voice
        },
        input: {
            text: text,
        },
        audioConfig: {
            audioEncoding: "mp3",
        },
    });

    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyCKiq248cQRH-p3lGwK0SgGOdKFKw7dt0Q",
        headers: {
            "Content-Type": "application/json",
        },
        data: data,
    };

    await axios
        .request(config)
        .then((response) => {
            res = response;
        })
        .catch((error) => {
            throw error;
        });
    return res;
}

export async function fetchGetTitles(data, abortController) {
    let res = null;
    await axios
        .get(process.env.VUE_APP_API_URL + "api/v1/title", {
            params: data, // Send data as query parameters
            responseType: "json",
            signal: abortController.signal,
        })
        .then((response) => {
            res = response;
        })
        .catch((error) => {
            throw error;
        });

    return res;
}
