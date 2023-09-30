import { pubSub } from "./pubsub";

export function fileUpload(removeScene) {
    let fileInput = document.getElementById("pdfUpload");
    fileInput.click();

    const upload = function () {
        if (fileInput.files.length > 0) {
            let file = fileInput.files[0];
            removeScene();
            pubSub.publish("beginScene3", file);
            fileInput.value = null;
            fileInput.removeEventListener("change", upload);
        }
    };

    fileInput.addEventListener("change", upload);
}
