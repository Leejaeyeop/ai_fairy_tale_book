import { pubSub } from "./pubsub";

export function fileUpload(removeScene) {
    console.log(removeScene);
    let fileInput = document.getElementById("pdfUpload");
    fileInput.click();

    const upload = function () {
        if (fileInput.files.length > 0) {
            let file = fileInput.files[0];
            removeScene();
            console.log("tldgod");
            pubSub.publish("beginScene3", file);
            fileInput.removeEventListener("change", upload);
        }
    };

    fileInput.addEventListener("change", upload);
}
