export default class Space {
  constructor(gltfLoader) {
    this._gltfLoader = gltfLoader;
  }

  async _loadSpace() {
    return new Promise((resolve) => {
      this._gltfLoader.load(
        "workshop.glb",
        (gltf) => {
          // add the loaded glTF model to the scene
          const model = gltf.scene;
          const bookshelf =
            model.children[0].children[0].children[0].children[1];
          const desk = model.children[0].children[0].children[0].children[2];
          this._bookshelf = bookshelf;
          this._desk = desk;

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
