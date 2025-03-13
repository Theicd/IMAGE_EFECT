// oldFilmEffect.js - אפקט פילם ישן

// הגדרת האפקט ישירות כאובייקט גלובלי
window.oldFilmEffect = {
  name: "פילם ישן",
  value: "oldFilm",
  apply: function(mesh, scene, composer) {
    if (composer) {
      const filmPass = new THREE.FilmPass(0.35, 0.5, 648, false);
      filmPass.enabled = true;
      composer.addPass(filmPass);

      // בדיקה אם NoiseShader קיים ויצירת אובייקט אחיד
      if (THREE.NoiseShader) {
        const noisePass = new THREE.ShaderPass(THREE.NoiseShader);
        if (noisePass && noisePass.uniforms && noisePass.uniforms['amount']) {
          noisePass.uniforms['amount'].value = 0.08;
          noisePass.enabled = true;
          composer.addPass(noisePass);
          
          mesh.userData.customPasses = mesh.userData.customPasses || [];
          mesh.userData.customPasses.push(filmPass, noisePass);
        } else {
          console.warn("NoiseShader קיים אבל uniforms['amount'] חסר");
          mesh.userData.customPasses = mesh.userData.customPasses || [];
          mesh.userData.customPasses.push(filmPass);
        }
      } else {
        console.warn("NoiseShader לא נמצא בספריית THREE");
        mesh.userData.customPasses = mesh.userData.customPasses || [];
        mesh.userData.customPasses.push(filmPass);
      }
    }
  }
};
