let Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Composites = Matter.Composites,
	Common = Matter.Common,
	MouseConstraint = Matter.MouseConstraint,
	Mouse = Matter.Mouse,
	Composite = Matter.Composite,
	Bodies = Matter.Bodies;

// create engine
let engine = Engine.create(),
	world = engine.world;

const Suika = {
	width: 400,
	height: 850,
}

// create renderer
let render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: Suika.width,
		height: Suika.height,
		showAngleIndicator: false,
		wireframes: false,
	}
});

Render.run(render);

// create runner
let runner = Runner.create();
Runner.run(runner, engine);

// add bodies
let options = {
	isStatic: true,
	render: {
		fillStyle: '#000',
		strokeStyle: '#000',
		lineWidth: 0
	},
};

world.bodies = [];

const size = 15
const ballSize = 46
Composite.add(world, [
	Bodies.rectangle(Suika.width / 2, -1, Suika.width, size, options), // top
	Bodies.rectangle(Suika.width / 2, Suika.height + 1, Suika.width, size, options), // bottom
	Bodies.rectangle(Suika.width + 1, Suika.height / 2, size, Suika.height, options), // right
	Bodies.rectangle(-1, Suika.height / 2, size, Suika.height, options) // left
]);

const ConfigFruits = {
	'cherries': {
		img: './img/cherries.png',
		radius: 50,
		point: 2,
		color: '#E34B83',
	},
	'strawberry': {
		img: './img/strawberry.png',
		radius: 50,
		point: 4,
		color: '#DE7250',
	},
	'grapes': {
		img: './img/grapes.png',
		radius: 50,
		point: 6,
		color: '#E077F8',
	},
	'lime': {
		img: './img/lime.png',
		radius: 50,
		point: 8,
		color: '#A9E34B',
	},
	'orange': {
		img: './img/orange.png',
		radius: 50,
		point: 10,
		color: '#E68B53',
	},
	'apples': {
		img: './img/apples.png',
		radius: 50,
		point: 12,
		color: '#FE313A',
	},
	'pear': {
		img: './img/pear.png',
		radius: 50,
		point: 14,
		color: '#F8E077',
	},
	'peach': {
		img: './img/peach.png',
		point: 16,
		radius: 50,
		color: '#E810C4',
	},
	'pineapple': {
		img: './img/pineapple.png',
		point: 18,
		radius: 50,
		color: '#E8C810',
	},
	'melon': {
		img: './img/melon.png',
		point: 20,
		radius: 50,
		color: '#BCFF58',
	},
	'watermelon': {
		img: './img/watermelon.png',
		point: 22,
		radius: 50,
		color: '#009B00',
	},
}

const getRandomFruit = () => {
	return Object.keys(ConfigFruits)[Math.floor(Math.random() * 5)];
}


function ball(x, y, preview = false, fruitKey = null) {
	if (!fruitKey) {
		fruitKey = getRandomFruit();
	}
	fruit = ConfigFruits[fruitKey];
	const newSize = (fruit.point - 2) / 20 + 0.5;

	const body = Bodies.circle(x, y, ballSize * newSize, {
		restitution: 0.3,
		friction: 0.01,
		isStatic: preview,
		collisionFilter: {
			group: preview ? -1 : 0
		},
		render: {
			fillStyle: preview ? '#fff' : fruit.color,
			// sprite: {
			// 	xScale: newSize,
			// 	yScale: newSize,
			// 	texture: './img/ball.png',
			// }
		}
	});
	Object.assign(body, {
		fruit: fruitKey,
		point: fruit.point,
		preview
	});
	return body;
}

// let stack = Composites.stack(50, 10, 3, 1, 10, 0, function (x, y) {
// 	return ball(x, y);
// });

// Composite.add(world, stack);

let mouse = Mouse.create(render.canvas)

// keep the mouse in sync with rendering
render.mouse = mouse;

let nextBall = getRandomFruit();

let previewBall = ball(Suika.width / 2, 50, true, nextBall);
Composite.add(world, previewBall);
render.canvas.addEventListener('mousemove', function (event) {
	const x = Math.max(Math.min(event.clientX, Suika.width - (ballSize + (size / 2))), ballSize + (size / 2));
	previewBall.position.x = x;
});

let lastClick = 0;
render.canvas.addEventListener('click', function (event) {
	if (Date.now() - lastClick > 500) {
		lastClick = Date.now();

		const x = Math.max(Math.min(event.clientX, Suika.width - (ballSize + (size / 2))), ballSize + (size / 2));
		Composite.add(world, ball(x, 150, false, nextBall));

		nextBall = getRandomFruit();
		previewBall.render.fillStyle = ConfigFruits[nextBall].color;
		previewBall.circleRadius = ((ConfigFruits[nextBall].point - 2) / 20 + 0.5) * 50;
	}
});

Matter.Events.on(engine, 'collisionStart', function (event) {
	let pairs = event.pairs;
	for (let i = 0, j = pairs.length; i != j; ++i) {
		let pair = pairs[i];

		if (!pair.bodyA.preview && !pair.bodyB.preview
			&& pair.bodyA.fruit && pair.bodyB.fruit
			&& pair.bodyA.fruit === pair.bodyB.fruit
			&& Composite.get(world, pair.bodyA.id, pair.bodyA.type) && Composite.get(world, pair.bodyB.id, pair.bodyB.type)
		) {
			const x = (pair.bodyA.position.x + pair.bodyB.position.x) / 2;
			const y = (pair.bodyA.position.y + pair.bodyB.position.y) / 2;
			Composite.remove(world, pair.bodyA);
			Composite.remove(world, pair.bodyB);

			const index = Object.keys(ConfigFruits).indexOf(pair.bodyA.fruit)
			const nextFruit = Object.keys(ConfigFruits)[index + 1];
			if (!nextFruit) {
				alert('Game Over');
				return;
			}

			Composite.add(world, ball(x, y, false, nextFruit));
		}
	}
});

// fit the render viewport to the scene
Render.lookAt(render, {
	min: { x: 0, y: 0 },
	max: { x: Suika.width, y: Suika.height }
});
