import store from "@/store/store";
export default class Space {
    #gltfLoader;
    #totalSize = 78021208
    constructor(gltfLoader) {
        this.#gltfLoader = gltfLoader;
    }

    async loadSpace() {
        return new Promise((resolve) => {
            this.#gltfLoader.load(
                "workshop.glb",
                (gltf) => {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene;

                    model.position.set(0.2, 0, 0);

                    resolve(model);
                },
                (xhr) => {
                    // console.log(xhr.loaded)
                    this.loadedPercent = (xhr.loaded / this.#totalSize) * 100;
                    store.dispatch("setLoadedPercent", this.loadedPercent);
                },
                function (error) {
                    console.log("An error happened", error);
                }
            );
        });
    }
}
