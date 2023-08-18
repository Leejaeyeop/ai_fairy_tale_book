import { pubSub } from "./pubsub";

export function fileUpload(removeScene) {
    console.log(removeScene);
    let fileInput = document.getElementById("pdfUpload");
    fileInput.click();

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            let file = fileInput.files[0];
            removeScene();
            pubSub.publish("beginScene3", file);
        }
    });
}
