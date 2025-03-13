// rainEffect.js - אפקט גשם

// הגדרת האפקט ישירות כאובייקט גלובלי
window.rainEffect = {
  name: "גשם",
  value: "rain",
  apply: function(mesh, scene, composer) {
    function getImageBounds(mesh) {
      // בדיקה אם זו קבוצה עם מסגרת
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        // אם יש לנו קבוצה, נשתמש ב-imagePlane לקבלת הגיאומטריה
        targetMesh = mesh.userData.imagePlane;
      }
      
      if (!targetMesh.geometry || !targetMesh.geometry.parameters) {
        console.error("Invalid mesh geometry for rain effect", targetMesh);
        return {
          minX: -1, maxX: 1,
          minY: -1, maxY: 1,
          z: mesh.position.z + 0.01
        };
      }
      
      const width = targetMesh.geometry.parameters.width;
      const height = targetMesh.geometry.parameters.height;
      return {
        minX: -width / 2,
        maxX: width / 2,
        minY: -height / 2,
        maxY: height / 2,
        z: mesh.position.z + 0.01
      };
    }

    const bounds = getImageBounds(mesh);

    const rainCount = 1000;
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    const rainVelocities = new Float32Array(rainCount);

    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
      rainPositions[i + 1] = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
      rainPositions[i + 2] = bounds.z;

      rainVelocities[i / 3] = 0.1 + Math.random() * 0.2;
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));

    const rainMaterial = new THREE.LineBasicMaterial({
      color: 0x9999aa,
      transparent: true,
      opacity: 0.7
    });

    // שיטה חדשה: יצירת קבוצת גשם שתיצמד למיקום התמונה
    const rainGroup = new THREE.Group();
    rainGroup.position.copy(mesh.position);
    // חשוב מאוד: מיקום הגשם קדימה יותר מהתמונה בציר ה-Z
    rainGroup.position.z = mesh.position.z + 0.05;
    scene.add(rainGroup);

    const rain = [];
    for (let i = 0; i < rainCount; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      
      // הנקודה הראשונה תהיה נקודת ההתחלה (נשארת בגבולות)
      const start = new THREE.Vector3(
        rainPositions[i * 3],
        rainPositions[i * 3 + 1],
        rainPositions[i * 3 + 2] - mesh.position.z
      );
      
      // הקו מתמשך כלפי מטה אבל תמיד בגבולות התמונה
      const end = start.clone();
      const dropLength = Math.min(0.2, (bounds.maxY - start.y) * 0.3); // מגביל את אורך הטיפה
      end.y -= dropLength;

      const vertices = new Float32Array([
        start.x, start.y, start.z,
        end.x, end.y, end.z
      ]);

      lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

      const line = new THREE.Line(lineGeometry, rainMaterial);
      rainGroup.add(line);
      rain.push({
        line: line,
        velocity: rainVelocities[i]
      });
    }

    mesh.userData.customObjects = mesh.userData.customObjects || [];
    mesh.userData.customObjects.push(rainGroup);
    mesh.userData.customObjects = mesh.userData.customObjects.concat(rain.map(r => r.line));

    mesh.userData.updateFunction = function(delta, imageBounds) {
      rain.forEach(drop => {
        const positions = drop.line.geometry.attributes.position.array;

        positions[1] -= drop.velocity * 0.5;
        positions[4] -= drop.velocity * 0.5;

        // בדיקת כל הגבולות
        if (positions[1] < bounds.minY || 
            positions[1] > bounds.maxY || 
            positions[0] < bounds.minX || 
            positions[0] > bounds.maxX) {
          const resetY = bounds.maxY;
          const resetX = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;

          positions[0] = resetX;
          positions[1] = resetY;
          positions[3] = resetX;
          positions[4] = resetY - Math.min(0.2, (bounds.maxY - bounds.minY) * 0.3);
        }

        drop.line.geometry.attributes.position.needsUpdate = true;
      });
    };
  }
};
