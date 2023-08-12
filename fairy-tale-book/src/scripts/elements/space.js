import store from "@/store/store";
export default class Space {
    #gltfLoader;

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
                function (xhr) {
                    this.loadedPercent = (xhr.loaded / xhr.total) * 100;
                    store.dispatch("setLoadedPercent", this.loadedPercent);
                    // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
                },
                function (error) {
                    console.log("An error happened", error);
                }
            );
        });
    }
}
