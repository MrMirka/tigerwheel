let n = 1; //Счетчик кадров 
let toRun = false;
let count = 0; //Счетчик блур (нужен для рассчета размития)
let radialBlur;
let loaderBlock; //Графический лоадер

const sprites = {}; //Хранилище текстур


const position = [
    { name: 'Bonus 100', position: 0 },
    { name: '50FS', position: 60 },
    { name: 'Bonus 75', position: 120 },
    { name: '100FS_1', position: 180 },
    { name: 'Bonus 50', position: 240 },
    { name: '100FS_2', position: 300 }
];




//Базовые параметры скрипта
let param = {
    startPosition: 0, //From
    targetPosition: degreesToRadians(position[5].position), //To
    duration: 350,
    blurAngle: 1.3,
    imgBaraban: './img/tiger/baraban.png',
    imgBack: './img/tiger/barabanBackground.png',
    imgLogo: './img/tiger/logo.png',
    imgArrow: './img/tiger/pointer.png',
    width: document.getElementById('c').offsetWidth * window.devicePixelRatio,
    height: document.getElementById('c').offsetHeight * window.devicePixelRatio
};
//Установливает рандомную цель (тестовая)
setTarget();


//Create scene
let app = new PIXI.Application({
    width: param.width,
    height: param.height,
    //backgroundColor: 0xffffff,
    backgroundAlpha: 0,
    antialias: true,
    view: document.getElementById('c')
});
document.body.appendChild(app.view);

const container = new PIXI.Container();
app.stage.addChild(container);


//Запускаем графический лоадер
initLoaderCircle();


//Запуск лупа
//initLoop();


//Loaders
const loader = new PIXI.Loader();
loader.add('wheelBack', param.imgBack)
    .add('wheel', param.imgBaraban)
    .add('wheelLogo', param.imgLogo)
    .add('wheelArrow', param.imgArrow);

loader.load((loader, resources) => {
    //Код выполняется после загрузки изображений
    sprites.wheel = new PIXI.Sprite(resources.wheel.texture);
    sprites.wheelLogo = new PIXI.Sprite(resources.wheelLogo.texture);
    sprites.wheelArrow = new PIXI.Sprite(resources.wheelArrow.texture);
    sprites.wheelBack = new PIXI.Sprite(resources.wheelBack.texture);

    //Задний фон
    sprites.wheelBack.anchor.set(0.5);
    sprites.wheelBack.width = param.width;
    sprites.wheelBack.height = param.height;
    container.addChild(sprites.wheelBack);

    //Барабан
    sprites.wheel.width = param.width * 1.12;
    sprites.wheel.height = param.height * 1.12;
    sprites.wheel.anchor.set(0.5);
    container.addChild(sprites.wheel);

    //Логотип
    sprites.wheelLogo.anchor.set(0.5);
    sprites.wheelLogo.width = param.width * 0.3;
    sprites.wheelLogo.height = param.height * 0.3;
    container.addChild(sprites.wheelLogo);

    //Стрелка
    sprites.wheelArrow.anchor.set(0.5);
    sprites.wheelArrow.position.y = -580
    sprites.wheelArrow.width = param.width * 0.22;
    sprites.wheelArrow.height = param.height * 0.22;
    container.addChild(sprites.wheelArrow);

    //Радиальный блур
    radialBlur = new PIXI.filters.RadialBlurFilter();
    sprites.wheel.filters = [radialBlur];
    radialBlur.angle = 0;
    radialBlur.kernelSize = 120;
    radialBlur.center = [param.width / 2, param.height / 2];
    radialBlur.radius = param.width / 2;
    container.transform.position.set(param.width / 2, param.height / 2);

    //Скрываем графический лоадер 
    removeLoader();

    //Mouse listener
    window.addEventListener('mousedown', () => {
        toRun = true;
        sprites.wheel.rotation = param.startPosition;
        let blurCount = 0;
        gsap.to(sprites.wheel, {
            rotation: param.targetPosition + Math.PI * 4, // Задаем конечное значение угла в радианах
            duration: 3, // Длительность в секундах
            ease: "power1.inOut", // Тип easing
            onComplete: function () {
                param.startPosition = param.targetPosition
                setTarget()
            }
        });
        /*  gsap.to(sprites.wheel, {
            rotation: param.targetPosition + Math.PI * 4, // Добавляем 4π радианов для двух дополнительных оборотов
            duration: 5, // Длительность анимации в секундах
            ease: "power1.inOut", // Тип easing для плавного вращения
            onUpdate: function() {
                // Увеличиваем значение счётчика
                blurCount += 0.1; // Настраиваем шаг для плавного изменения
        
                // Применяем размытие на основе синусоидальной функции
                radialBlur.angle = Math.abs(Math.sin(blurCount)) * param.blurAngle;
            },
            onComplete: function () {
               
                param.startPosition = param.targetPosition
                setTarget(); // Опционально устанавливаем следующую цель вращения
            }
        });  */
    });
    window.addEventListener("touchstart", () => {
        toRun = true;
        sprites.wheel.rotation = param.startPosition;
        let blurCount = 0;
        gsap.to(sprites.wheel, {
            rotation: param.targetPosition + Math.PI * 4, // Задаем конечное значение угла в радианах
            duration: 3, // Длительность в секундах
            ease: "power1.inOut", // Тип easing
            onComplete: function () {
                param.startPosition = param.targetPosition
                setTarget()
            }
        });
    });
});






//Инициализируем анимацию, движение колеса когда toRun = true
function initLoop() {

    let countShift = (1 + param.blurAngle) / param.duration;
    app.ticker.add(() => {

        //Loader
        if (loaderBlock != undefined) {
            loaderBlock.rotation += 0.15;
        }

        if (toRun) {


            if (!isMobileDevice())
                radialBlur.angle = CubicInOut(Math.abs(Math.sin(count)) * param.duration, 0, param.blurAngle, param.duration);
            sprites.wheel.rotation = CubicInOut(n, param.startPosition, param.targetPosition - param.startPosition + (Math.PI * 8), param.duration);
            n++;
            count += countShift;
            if (n === param.duration) {
                count = 0;
                toRun = false;
                n = 1;
                updateParam(param.targetPosition);
                setTarget();
            }
        }
    });
}

//Изинг
function CubicInOut(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
}

//Тестовая функция для рандомного положения барабана (заменить на нужное поведение) 
function setTarget() {
    let pos = Math.floor(Math.random() * 5);
    let shift = (Math.random() - 0.5) * 0.17;
    if (shift > 0.12) {
        shift = 0.12;
    } else if (shift < -0.12) {
        shift = -0.12;
    }
    param.targetPosition = degreesToRadians(position[pos].position) + shift;

    let str = 'Кручу на  ' + position[pos].name;
    console.log(str);

}

function updateParam(target) {
    sprites.wheel.rotation = target; //Обнуляем количесво оборотов колеса (чтобы счисление было в пределах 0 - 2PI)
    param.startPosition = target; //Устанавливаем текущее положение в стартовое
}

//Проверка на мобильные устройства
//Блур включаем только на десктопах и айфонах
function isMobileDevice() {

    if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}


//Квадратный лоадер
function initLoader() {
    loaderBlock = new PIXI.Container();
    loaderBlock.position.x = param.width / 2;
    loaderBlock.position.y = param.height / 2;
    loaderBlock.pivot.x = loaderBlock.width / 2;
    loaderBlock.pivot.y = loaderBlock.height / 2;
    app.stage.addChild(loaderBlock);

    let size = param.width * 0.06;
    let loaderS = new PIXI.Graphics();
    loaderS.beginFill(0xFF0025);
    loaderS.drawRect(0, 0, size, size);
    loaderS.beginFill(0xF7E800);
    loaderS.drawRect(size * 1.2, 0, size, size);
    loaderS.beginFill(0xF7E800);
    loaderS.drawRect(0, size * 1.2, size, size);
    loaderS.beginFill(0xFF0025);
    loaderS.drawRect(size * 1.2, size * 1.2, size, size);
    loaderS.pivot.x = loaderS.width / 2;
    loaderS.pivot.y = loaderS.height / 2;
    loaderBlock.addChild(loaderS);
}


//Круглый лоадер
function initLoaderCircle() {
    loaderBlock = new PIXI.Container();
    loaderBlock.position.x = param.width / 2;
    loaderBlock.position.y = (param.height / 2) * 0.97;
    loaderBlock.pivot.x = loaderBlock.width / 2;
    loaderBlock.pivot.y = loaderBlock.height / 2;
    app.stage.addChild(loaderBlock);

    let size = param.width * 0.08;
    let loaderS = new PIXI.Graphics();
    loaderS.lineStyle(size * 0.2, 0xFF0025);
    loaderS.arc(0, 0, size, 0, Math.PI * 2);
    loaderS.lineStyle(size * 0.2, 0xF7E800);
    loaderS.arc(0, 0, size, 0, Math.PI * 0.4);
    loaderBlock.addChild(loaderS);
}


//Удаляем лоадер
function removeLoader() {
    app.stage.removeChild(loaderBlock);
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}


