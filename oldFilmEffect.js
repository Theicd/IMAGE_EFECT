// oldFilmEffect.js - אפקט פילם ישן משופר

window.oldFilmEffect = {
  name: "פילם ישן",
  value: "oldFilm",
  apply: function(mesh, scene, composer, isPreview = false) {
    if (!composer) {
      console.warn("Composer לא זמין עבור OldFilmEffect");
      return;
    }

    // 1. FilmPass - קווים אנכיים וגרגירי סרט
    const filmPass = new THREE.FilmPass(
      isPreview ? 0.25 : 0.35, // עוצמת הרעש (פחות בתצוגה מקדימה)
      isPreview ? 0.3 : 0.5,  // עוצמת הקווים האנכיים
      648, // מספר הקווים
      false // גוונים אפורים (לא נשתמש כרגע)
    );
    filmPass.enabled = true;
    composer.addPass(filmPass);

    // 2. NoisePass - גרגירי סרט משופרים
    if (THREE.NoiseShader) {
      const noisePass = new THREE.ShaderPass(THREE.NoiseShader);
      if (noisePass && noisePass.uniforms && noisePass.uniforms['amount']) {
        noisePass.uniforms['amount'].value = isPreview ? 0.05 : 0.08; // רעש עדין יותר בתצוגה מקדימה
        noisePass.enabled = true;
        composer.addPass(noisePass);
      } else {
        console.warn("NoiseShader קיים אבל uniforms['amount'] חסר");
      }
    } else {
      console.warn("NoiseShader לא נמצא בספריית THREE");
    }

    // 3. SepiaShader - גוונים חמים/דהויים
    if (THREE.SepiaShader) {
      const sepiaPass = new THREE.ShaderPass(THREE.SepiaShader);
      if (sepiaPass && sepiaPass.uniforms && sepiaPass.uniforms['amount']) {
        sepiaPass.uniforms['amount'].value = isPreview ? 0.3 : 0.5; // גוון חם יותר בסרטון
        sepiaPass.enabled = true;
        composer.addPass(sepiaPass);
      } else {
        console.warn("SepiaShader קיים אבל uniforms['amount'] חסר");
      }
    } else {
      console.warn("SepiaShader לא נמצא בספריית THREE");
    }

    // 4. שריטות דינמיות - שימוש ב-ShaderPass מותאם אישית
    const scratchShader = {
      uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 },
        scratchIntensity: { value: isPreview ? 0.1 : 0.2 } // עוצמת השריטות
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float scratchIntensity;
        varying vec2 vUv;

        float random(float seed) {
          return fract(sin(seed * 43758.5453) * 12345.6789);
        }

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);

          // שריטות דינמיות
          float scratch = 0.0;
          for (float i = 0.0; i < 3.0; i += 1.0) {
            float x = random(i + time * 0.1) * 2.0 - 1.0;
            float dist = abs(vUv.x - x);
            if (dist < 0.002) {
              scratch += (1.0 - dist / 0.002) * scratchIntensity * random(i + time);
            }
          }

          color.rgb += scratch * vec3(1.0, 1.0, 1.0);
          gl_FragColor = color;
        }
      `
    };

    const scratchPass = new THREE.ShaderPass(scratchShader);
    scratchPass.enabled = true;
    composer.addPass(scratchPass);

    // 5. הבהוב קל - שימוש ב-BrightnessContrastShader
    if (THREE.BrightnessContrastShader) {
      const brightnessPass = new THREE.ShaderPass(THREE.BrightnessContrastShader);
      if (brightnessPass && brightnessPass.uniforms) {
        brightnessPass.uniforms['brightness'].value = 0.0; // בסיס
        brightnessPass.enabled = true;
        composer.addPass(brightnessPass);

        // עדכון ההבהוב בזמן אמת
        mesh.userData.updateFunction = (delta) => {
          scratchPass.uniforms['time'].value += delta;
          brightnessPass.uniforms['brightness'].value = Math.sin(Date.now() * 0.002) * (isPreview ? 0.05 : 0.1); // הבהוב קל
        };
      } else {
        console.warn("BrightnessContrastShader קיים אבל uniforms חסרים");
      }
    } else {
      console.warn("BrightnessContrastShader לא נמצא בספריית THREE");
    }

    // שמירת ה-Passes לניהול עתידי
    mesh.userData.customPasses = mesh.userData.customPasses || [];
    mesh.userData.customPasses.push(filmPass);
    if (THREE.NoiseShader) mesh.userData.customPasses.push(noisePass);
    if (THREE.SepiaShader) mesh.userData.customPasses.push(sepiaPass);
    mesh.userData.customPasses.push(scratchPass);
    if (THREE.BrightnessContrastShader) mesh.userData.customPasses.push(brightnessPass);
  }
};