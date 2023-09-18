import * as THREE from "three";

export default class Particle {
    constructor(scene,renderer,camera) {
        // 파티클 생성
        const particles = new THREE.Group();
        scene.add(particles);

        // 파티클 재료 생성
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.01,
        });

        // 파티클 생성 함수
        function createParticles() {
            const particleGeometry = new THREE.BufferGeometry();
            const vertices = [];

            for (let i = 0; i < 1000; i++) {
                const x = (Math.random() - 0.5) * 10;
                const y = (Math.random() - 0.5) * 10;
                const z = (Math.random() - 0.5) * 10;

                vertices.push(x, y, z);
            }

            particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

            const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
            particles.add(particleSystem);
        }

        createParticles();

        // 애니메이션 루프 설정
        const animate = () => {
            requestAnimationFrame(animate);

            // 파티클을 회전 또는 움직이게 만듭니다.
            particles.rotation.x += 0.001;
            particles.rotation.y += 0.001;

            renderer.render(scene, camera);
        };

        animate();
    }
}
