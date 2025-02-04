# 带材质的球体，可以切换不同材质

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js</title>
    <style>
        body { margin: 0; padding: 0;}
        canvas { display: block; }
        #material-list {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: white;
            padding: 10px;
            list-style-type: none;
            display: flex;
            flex-wrap: wrap;
            align-self: center;
            gap: 10px;
        }
        #material-list li {
            cursor: pointer;
            border: 1px solid #ccc;
            font-size: 12px;
            line-height: 1;
            padding: 10px 15px;
        }
        #material-list li:hover {
            background-color: #eee;
        }
    </style>
</head>
<body>
    <ul id="material-list">
        <li data-texture="1">材质1</li>
        <li data-texture="2">材质2</li>
        <li data-texture="3">材质3</li>
    </ul>
    <script src="https://cdn.jsdelivr.net/npm/three@0.141.0/build/three.min.js"></script>
    <script>
        let scene, camera, renderer, sphere;
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;
        let targetCameraZ = 5; // 目标相机 Z 位置
        const maxCameraZ = window.innerWidth / 2 / window.innerHeight * 10; // 最大缩放距离控制在屏幕一半
        let materials = []; // 存放材质的数组

        function init() {
            // 创建场景
            scene = new THREE.Scene();
            
            // 创建相机
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = targetCameraZ;

            // 创建渲染器
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // 添加环境光
            const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
            scene.add(ambientLight);

            // 添加点光源
            const pointLight = new THREE.PointLight(0xffffff, 2, 100);
            pointLight.position.set(10, 10, 10);
            scene.add(pointLight);

            // 创建材质
            const textureLoader = new THREE.TextureLoader();

            // 通过设置 `wrapS` 和 `wrapT` 来控制纹理的平铺方式
            const texture1 = textureLoader.load('https://image2.znzmo.com/1709172012363_7557.jpeg?x-oss-process=style/detail');
            texture1.wrapS = THREE.RepeatWrapping;
            texture1.wrapT = THREE.RepeatWrapping;
            texture1.repeat.set(1, 1); // 设置纹理重复次数，确保无缝效果
            materials.push(new THREE.MeshStandardMaterial({ map: texture1, side: THREE.DoubleSide }));

            const texture2 = textureLoader.load('https://image2.znzmo.com/1695436767254_7398.png?x-oss-process=style/detail');
            texture2.wrapS = THREE.RepeatWrapping;
            texture2.wrapT = THREE.RepeatWrapping;
            texture2.repeat.set(1, 1);
            materials.push(new THREE.MeshStandardMaterial({ map: texture2, side: THREE.DoubleSide }));

            const texture3 = textureLoader.load('https://image2.znzmo.com/1696125417976_8183.jpeg?x-oss-process=style/detail');
            texture3.wrapS = THREE.RepeatWrapping;
            texture3.wrapT = THREE.RepeatWrapping;
            texture3.repeat.set(1, 1);
            materials.push(new THREE.MeshStandardMaterial({ map: texture3, side: THREE.DoubleSide }));

            // 创建球体，调整UV映射
            const geometry = new THREE.SphereGeometry(1, 64, 64); // 增加分段，平滑表面
            geometry.computeTangents(); // 增加贴图精度
            sphere = new THREE.Mesh(geometry, materials[0]); // 默认使用第一个材质
            scene.add(sphere);

            // 监听鼠标事件
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('wheel', onWheel); // 添加滚轮事件

            // 监听材质列表的点击事件
            document.getElementById('material-list').addEventListener('click', onMaterialClick);

            animate();
        }

        function onMouseDown(event) {
            isDragging = true;
            previousMouseX = event.clientX;
            previousMouseY = event.clientY;
        }

        function onMouseUp() {
            isDragging = false;
        }

        function onMouseMove(event) {
            if (isDragging) {
                const deltaX = event.clientX - previousMouseX;
                const deltaY = event.clientY - previousMouseY;

                // 更新球体的旋转
                sphere.rotation.y += deltaX * 0.01; // 左右旋转
                sphere.rotation.x += deltaY * 0.01; // 上下旋转

                previousMouseX = event.clientX;
                previousMouseY = event.clientY;
            }
        }

        function onWheel(event) {
            // 根据滚轮方向调整目标相机位置
            targetCameraZ += event.deltaY * 0.01;
            targetCameraZ = Math.max(2, Math.min(maxCameraZ, targetCameraZ)); // 限制相机缩放
        }

        function onMaterialClick(event) {
            const textureIndex = event.target.getAttribute('data-texture');
            if (textureIndex !== null) {
                sphere.material = materials[parseInt(textureIndex) - 1]; // 切换材质
            }
        }

        function animate() {
            requestAnimationFrame(animate);

            // 平滑相机移动
            camera.position.z += (targetCameraZ - camera.position.z) * 0.1;

            // 自动旋转
            // sphere.rotation.x += 0.01;
            // sphere.rotation.y += 0.01;

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        init();
    </script>
</body>
</html>
```

