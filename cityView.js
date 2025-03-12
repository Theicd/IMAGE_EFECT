// cityView.js - קובץ להוספת חלונות פנורמיים עם נוף עירוני לחדר התלת מימדי
// יש לכלול קובץ זה אחרי script3d.js

// פונקציה להוספת חלונות לחדר
function addWindowsToRoom() {
    // יצירת סצנת העיר
    const cityScene = new THREE.Scene();
    const cityRenderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    cityRenderer.setSize(1024, 512); // גודל הטקסטורה של החלון
    
    // הגדרת מצלמה לסצנת העיר
    const cityCamera = new THREE.PerspectiveCamera(20, 2, 1, 500);
    cityCamera.position.set(0, 2, 14);
    
    // יצירת אובייקטים לסצנת העיר
    const city = new THREE.Object3D();
    const smoke = new THREE.Object3D();
    const town = new THREE.Object3D();
    
    // צבע רקע וערפל
    const cityColor = 0xF02050;
    cityScene.background = new THREE.Color(cityColor);
    cityScene.fog = new THREE.Fog(cityColor, 10, 16);
    
    // פונקציה לערכים רנדומליים
    function mathRandom(num = 8) {
        return -Math.random() * num + Math.random() * num;
    }
    
    // פונקציה לצבע הבניינים
    function setTintColor() {
        return 0x000000;
    }
    
    // יצירת העיר
    function initCity() {
        // יצירת בניינים
        for (let i = 1; i < 100; i++) {
            const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
            const material = new THREE.MeshStandardMaterial({
                color: setTintColor(),
                wireframe: false,
                side: THREE.DoubleSide
            });
            const wmaterial = new THREE.MeshLambertMaterial({
                color: 0xFFFFFF,
                wireframe: true,
                transparent: true,
                opacity: 0.03,
                side: THREE.DoubleSide
            });

            const cube = new THREE.Mesh(geometry, material);
            const wire = new THREE.Mesh(geometry, wmaterial);
            cube.add(wire);
            
            cube.castShadow = true;
            cube.receiveShadow = true;
            
            // בניינים בגבהים שונים
            cube.scale.y = 0.1 + Math.abs(mathRandom(8));
            
            const cubeWidth = 0.9;
            cube.scale.x = cube.scale.z = cubeWidth + mathRandom(1 - cubeWidth);
            cube.position.x = Math.round(mathRandom());
            cube.position.z = Math.round(mathRandom());
            cube.position.y = cube.scale.y / 2;
            
            town.add(cube);
        }
        
        // יצירת חלקיקים צהובים (כוכבים) - הגדלת מספר החלקיקים והגודל שלהם
        const gmaterial = new THREE.MeshToonMaterial({ color: 0xFFFF00, side: THREE.DoubleSide });
        const gparticular = new THREE.CircleGeometry(0.03, 3); // הגדלת גודל החלקיקים
        const aparticular = 5;
        
        for (let h = 1; h < 500; h++) { // הגדלת מספר החלקיקים
            const particular = new THREE.Mesh(gparticular, gmaterial);
            particular.position.set(mathRandom(aparticular), mathRandom(aparticular), mathRandom(aparticular));
            particular.rotation.set(mathRandom(), mathRandom(), mathRandom());
            smoke.add(particular);
        }
        
        // יצירת רצפה שחורה
        const pmaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            roughness: 10,
            metalness: 0.6,
            opacity: 0.9,
            transparent: true
        });
        const pgeometry = new THREE.PlaneGeometry(60, 60);
        const pelement = new THREE.Mesh(pgeometry, pmaterial);
        pelement.rotation.x = -90 * Math.PI / 180;
        pelement.position.y = -0.001;
        pelement.receiveShadow = true;
        
        city.add(pelement);
    }
    
    // יצירת קווי תנועה (מכוניות) - אפקט הקווים העפים
    function createCars(cScale = 2, cPos = 20, cColor = 0xFFFF00) {
        const cMat = new THREE.MeshToonMaterial({ color: cColor, side: THREE.DoubleSide });
        const cGeo = new THREE.BoxGeometry(1, cScale / 40, cScale / 40);
        const cElem = new THREE.Mesh(cGeo, cMat);
        const cAmp = 3;
        
        // מיקום קבוע לרכבים
        const createCarPos = Math.random() > 0.5;
        
        if (createCarPos) {
            cElem.position.x = -cPos/2 + mathRandom(cPos);
            cElem.position.z = mathRandom(cAmp);
        } else {
            cElem.position.x = mathRandom(cAmp);
            cElem.position.z = -cPos/2 + mathRandom(cPos);
            cElem.rotation.y = 90 * Math.PI / 180;
        }
        
        cElem.receiveShadow = true;
        cElem.castShadow = true;
        cElem.position.y = Math.abs(mathRandom(5));
        city.add(cElem);
    }
    
    // יצירת קווי תנועה
    function generateLines() {
        for (let i = 0; i < 80; i++) { // הגדלת מספר הקווים
            createCars(0.1, 20);
        }
        createCars(0.1, 20, 0xFFFFFF);
    }
    
    // הוספת תאורה
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 4);
    const lightFront = new THREE.SpotLight(0xFFFFFF, 20, 10);
    const lightBack = new THREE.PointLight(0xFFFFFF, 0.5);
    
    lightFront.rotation.x = 45 * Math.PI / 180;
    lightFront.rotation.z = -45 * Math.PI / 180;
    lightFront.position.set(5, 5, 5);
    lightFront.castShadow = true;
    lightFront.shadow.mapSize.width = 6000;
    lightFront.shadow.mapSize.height = lightFront.shadow.mapSize.width;
    lightFront.penumbra = 0.1;
    lightBack.position.set(0, 6, 0);
    
    smoke.position.y = 2;
    
    cityScene.add(ambientLight);
    city.add(lightFront);
    cityScene.add(lightBack);
    cityScene.add(city);
    city.add(smoke);
    city.add(town);
    
    // רשת עזר
    const gridHelper = new THREE.GridHelper(60, 120, 0xFF0000, 0x000000);
    city.add(gridHelper);
    
    // אתחול והפעלת האנימציה
    initCity();
    generateLines();
    
    // הוספת זווית לעיר כדי שתראה יותר טוב בחלון
    city.rotation.y = -Math.PI / 6;
    
    // רינדור סטטי של סצנת העיר לטקסטורה
    cityRenderer.render(cityScene, cityCamera);
    
    // יצירת טקסטורה מהרינדור
    const cityTexture = new THREE.CanvasTexture(cityRenderer.domElement);
    
    // יצירת חלונות בחדר
    const { leftWindowMaterial, rightWindowMaterial } = createWindows(cityTexture);
    
    // החזרת אובייקטים שיידרשו לאנימציה של הקווים העפים
    return {
        cityScene,
        cityCamera,
        cityRenderer,
        city,
        smoke,
        cityTexture,
        leftWindowMaterial,
        rightWindowMaterial
    };
}

// פונקציה ליצירת החלונות בחדר
function createWindows(cityTexture) {
    // חלון שמאלי
    const leftWindowGeometry = new THREE.PlaneGeometry(4, 2.5);
    const leftWindowMaterial = new THREE.MeshBasicMaterial({
        map: cityTexture,
        transparent: true, // אפשר שקיפות
        opacity: 1.0, // אטימות מלאה
        side: THREE.DoubleSide,
        depthWrite: false, // מונע בעיות עם שכבות עומק
        depthTest: true // מאפשר בדיקת עומק
    });
    const leftWindow = new THREE.Mesh(leftWindowGeometry, leftWindowMaterial);
    leftWindow.position.set(-4.95, 0, 0); // ממוקם בקיר השמאלי
    leftWindow.rotation.y = Math.PI / 2; // סיבוב להתאמה לקיר
    leftWindow.renderOrder = 1; // סדר רינדור גבוה יותר
    scene.add(leftWindow);
    
    // מסגרת ניאון לחלון שמאלי
    const leftWindowFrameGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(4.2, 2.7, 0.1));
    const leftWindowFrameMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        linewidth: 2
    });
    const leftWindowFrame = new THREE.LineSegments(leftWindowFrameGeometry, leftWindowFrameMaterial);
    leftWindowFrame.position.set(-4.9, 0, 0);
    leftWindowFrame.rotation.y = Math.PI / 2;
    leftWindowFrame.renderOrder = 2; // סדר רינדור גבוה יותר מהחלון
    scene.add(leftWindowFrame);
    
    // אור שבא מהחלון השמאלי
    const leftWindowLight = new THREE.PointLight(0x00ffff, 0.5, 10);
    leftWindowLight.position.set(-4.8, 0, 0);
    scene.add(leftWindowLight);
    
    // חלון ימני
    const rightWindowGeometry = new THREE.PlaneGeometry(4, 2.5);
    const rightWindowMaterial = new THREE.MeshBasicMaterial({
        map: cityTexture,
        transparent: true, // אפשר שקיפות
        opacity: 1.0, // אטימות מלאה
        side: THREE.DoubleSide,
        depthWrite: false, // מונע בעיות עם שכבות עומק
        depthTest: true // מאפשר בדיקת עומק
    });
    const rightWindow = new THREE.Mesh(rightWindowGeometry, rightWindowMaterial);
    rightWindow.position.set(4.95, 0, 0); // ממוקם בקיר הימני
    rightWindow.rotation.y = -Math.PI / 2; // סיבוב להתאמה לקיר
    rightWindow.renderOrder = 1; // סדר רינדור גבוה יותר
    scene.add(rightWindow);
    
    // מסגרת ניאון לחלון ימני
    const rightWindowFrameGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(4.2, 2.7, 0.1));
    const rightWindowFrameMaterial = new THREE.LineBasicMaterial({ 
        color: 0xff00ff,
        linewidth: 2
    });
    const rightWindowFrame = new THREE.LineSegments(rightWindowFrameGeometry, rightWindowFrameMaterial);
    rightWindowFrame.position.set(4.9, 0, 0);
    rightWindowFrame.rotation.y = -Math.PI / 2;
    rightWindowFrame.renderOrder = 2; // סדר רינדור גבוה יותר מהחלון
    scene.add(rightWindowFrame);
    
    // אור שבא מהחלון הימני
    const rightWindowLight = new THREE.PointLight(0xff00ff, 0.5, 10);
    rightWindowLight.position.set(4.8, 0, 0);
    scene.add(rightWindowLight);
    
    // החזרת החומרים של החלונות כדי שנוכל לעדכן אותם באנימציה
    return { leftWindowMaterial, rightWindowMaterial };
}

// מעקב אחר הגריד והרצפה הנוכחיים
let currentFloorGrid = null;
let currentFloor = null;

// שיפור הרצפה המשקפת
function enhanceReflectiveFloor() {
    // מחיקת כל הגרידים הקודמים מהסצנה
    for (let i = scene.children.length - 1; i >= 0; i--) {
        const child = scene.children[i];
        
        // מחיקת כל הגרידים
        if (child instanceof THREE.GridHelper || 
            (child.isObject3D && child.type === "GridHelper") ||
            (child.name === "floorGrid")) {
            scene.remove(child);
        }
    }
    
    // מחיקת הרצפה הקיימת אם קיימת
    if (currentFloor && scene.children.includes(currentFloor)) {
        scene.remove(currentFloor);
    }
    
    // מחיקת הגריד הקיים אם קיים
    if (currentFloorGrid && scene.children.includes(currentFloorGrid)) {
        scene.remove(currentFloorGrid);
    }
    
    // יצירת רצפה חדשה בסגנון העיר התלת מימדית
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    
    // יצירת חומר לרצפה בסגנון הרצפה של העיר
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000, 
        side: THREE.DoubleSide,
        roughness: 10,
        metalness: 0.6,
        opacity: 0.9,
        transparent: true,
        shininess: 100
    });
    
    currentFloor = new THREE.Mesh(floorGeometry, floorMaterial);
    currentFloor.rotation.x = -Math.PI / 2;
    currentFloor.position.y = -3;
    currentFloor.receiveShadow = true;
    currentFloor.name = "reflectiveFloor";
    scene.add(currentFloor);
    
    // יצירת גריד חדש ומעודכן
    currentFloorGrid = new THREE.GridHelper(10, 20, 0xFF0000, 0x000000);
    currentFloorGrid.position.y = -2.99;
    currentFloorGrid.name = "floorGrid";
    scene.add(currentFloorGrid);
    
    // דיספוז של משאבים ישנים כדי להימנע מדליפות זיכרון
    if (floorGeometry) floorGeometry.dispose();
    if (floorMaterial) floorMaterial.dispose();
}

// פונקציה לעדכון הקווים העפים בשמיים
function updateFlyingLines(cityObjects) {
    if (!cityObjects) return;
    
    const { cityScene, cityCamera, cityRenderer, city, smoke, cityTexture, leftWindowMaterial, rightWindowMaterial } = cityObjects;
    
    // סיבוב העשן (הקווים העפים) - הגברת מהירות הסיבוב
    smoke.rotation.y += 0.02;
    smoke.rotation.x += 0.02;
    
    // הזזת העשן קדימה ואחורה לאפקט יותר דינמי
    smoke.position.z = Math.sin(Date.now() * 0.001) * 0.5;
    
    // רינדור מחדש של סצנת העיר
    cityRenderer.render(cityScene, cityCamera);
    
    // עדכון הטקסטורה בשני החלונות
    cityTexture.needsUpdate = true;
    
    // וידוא שהחומרים של החלונות מעודכנים
    if (leftWindowMaterial) leftWindowMaterial.needsUpdate = true;
    if (rightWindowMaterial) rightWindowMaterial.needsUpdate = true;
}

// הוספת החלונות לחדר ושמירת האובייקטים לאנימציה
let cityObjects;

// פונקציה ראשית להוספת כל השיפורים לחדר
function enhanceRoom() {
    cityObjects = addWindowsToRoom();
    addFogToRoom();
    enhanceReflectiveFloor();
    
    // הוספת עדכון הקווים העפים ללולאת האנימציה
    const originalAnimate = animate;
    
    // יצירת פונקציית אנימציה חדשה שמעדכנת גם את האפקטים בחלונות
    animate = function() {
        originalAnimate();
        
        // עדכון האפקטים בחלונות בכל פריים
        updateFlyingLines(cityObjects);
    };
    
    // הפעלת אנימציה ראשונית כדי לוודא שהאפקטים מופעלים מיד
    updateFlyingLines(cityObjects);
    
    // הפעלת סיור אוטומטי בחדר
    startRoomTour();
}

// סיור אוטומטי בחדר בכניסה
function startRoomTour() {
    console.log('מתחיל סיור בחדר');
    
    // בדיקה שכל המשאבים הדרושים קיימים
    if (!scene || !camera || !controls || !cityObjects) {
        console.error('חלק מהמשאבים לא נטענו עדיין, מנסה שוב בעוד 2 שניות');
        setTimeout(startRoomTour, 2000);
        return;
    }
    
    // שמירת המצב המקורי של הבקרים
    const originalControlsEnabled = controls.enabled;
    
    // ביטול זמני של הבקרים כדי שהמשתמש לא יפריע לסיור
    controls.enabled = false;
    
    // שמירת המיקום המקורי של המצלמה
    const originalPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };
    
    // שמירת הכיוון המקורי של המצלמה
    const originalTarget = controls.target.clone();
    
    console.log('מיקום מצלמה התחלתי:', originalPosition);
    
    // נקודות מבט לסיור
    const viewpoints = [
        { // נקודת מבט 1: זווית רחבה שמראה את החדר והחלון השמאלי
            position: { x: -2.5, y: 0, z: 2 },
            target: { x: 0, y: 0, z: 0 },
            duration: 1.5 // משך בשניות
        },
        { // נקודת מבט 2: מבט על החלון הימני
            position: { x: 2.5, y: 0, z: 2 },
            target: { x: 0, y: 0, z: 0 },
            duration: 1.5
        },
        { // נקודת מבט 3: מבט מלמעלה שמראה את כל החדר
            position: { x: 0, y: 1.5, z: 2.5 },
            target: { x: 0, y: 0, z: 0 },
            duration: 1
        },
        { // נקודת מבט 4: חזרה למיקום הרגיל מול הטקסט
            position: originalPosition,
            target: originalTarget,
            duration: 1
        }
    ];
    
    // פונקציה לאנימציה בין שתי נקודות
    function animateBetweenPoints(startPoint, endPoint, duration, onComplete) {
        const startTime = Date.now();
        let lastFrameTime = startTime;
        let animationFrameId;
        
        function updatePosition() {
            const currentTime = Date.now();
            const elapsed = (currentTime - startTime) / 1000; // זמן שעבר בשניות
            const progress = Math.min(elapsed / duration, 1); // התקדמות בין 0 ל-1
            
            // פונקציית איזון לתנועה חלקה יותר
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : -1 + (4 - 2 * progress) * progress;
            
            // עדכון מיקום המצלמה
            camera.position.x = startPoint.position.x + (endPoint.position.x - startPoint.position.x) * easeProgress;
            camera.position.y = startPoint.position.y + (endPoint.position.y - startPoint.position.y) * easeProgress;
            camera.position.z = startPoint.position.z + (endPoint.position.z - startPoint.position.z) * easeProgress;
            
            // עדכון מטרת המצלמה
            controls.target.x = startPoint.target.x + (endPoint.target.x - startPoint.target.x) * easeProgress;
            controls.target.y = startPoint.target.y + (endPoint.target.y - startPoint.target.y) * easeProgress;
            controls.target.z = startPoint.target.z + (endPoint.target.z - startPoint.target.z) * easeProgress;
            
            // עדכון בקרי המצלמה
            controls.update();
            
            // חישוב FPS לניטור ביצועים
            const frameTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;
            
            if (progress < 1) {
                // המשך האנימציה
                animationFrameId = requestAnimationFrame(updatePosition);
            } else {
                // סיום האנימציה
                cancelAnimationFrame(animationFrameId);
                console.log('סיום אנימציה לנקודה');
                if (onComplete) onComplete();
            }
        }
        
        // התחלת האנימציה
        animationFrameId = requestAnimationFrame(updatePosition);
        
        // החזרת מזהה האנימציה לביטול במקרה הצורך
        return {
            cancel: function() {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
            }
        };
    }
    
    // ביצוע הסיור דרך כל נקודות המבט ברצף
    function startTourSequence(index = 0) {
        if (index >= viewpoints.length - 1) {
            // סיום הסיור - אנימציה לנקודה האחרונה
            animateBetweenPoints(
                { position: camera.position, target: controls.target },
                viewpoints[index],
                viewpoints[index].duration,
                function() {
                    // החזרת הבקרים למצב המקורי
                    controls.enabled = originalControlsEnabled;
                }
            );
            return;
        }
        
        // אנימציה לנקודת המבט הנוכחית, ואז המשך לנקודה הבאה
        animateBetweenPoints(
            index === 0 ? { position: camera.position, target: controls.target } : viewpoints[index - 1],
            viewpoints[index],
            viewpoints[index].duration,
            function() {
                // המשך לנקודה הבאה
                startTourSequence(index + 1);
            }
        );
    }
    
    // התחלת הסיור
    startTourSequence();
}

// ערפל קל בחדר לתחושת עומק
function addFogToRoom() {
    scene.fog = new THREE.FogExp2(0x000000, 0.05);
}
