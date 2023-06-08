import * as THREE from "three";

export const playAction = (clipAction, mixer) => {
    const action = mixer.clipAction(clipAction);
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.enabled = true;
    action.paused = false;
    action.timeScale = 1;
    // reset시 필요
    action.reset();
    action.play();
};

export const playReverseAction = (clipAction, mixer) => {
    let action = mixer.clipAction(clipAction);
    action.paused = false;
    action.time = action.getClip().duration;
    action.timeScale = -1;
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.enabled = true;
    // reset시 필요
    // action.reset();
    action.play();
};
