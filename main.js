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

function ball(x, y, preview = false) {
	const newSize = Common.random(0.5, 1.5);

	return Bodies.circle(x, y, ballSize * newSize, {
		restitution: 0.3,
		friction: 0.01,
		isStatic: preview,
		collisionFilter: {
			group: preview ? -1 : 0
		},
		render: {
			sprite: {
				xScale: newSize,
				yScale: newSize,
				texture: './img/ball.png'
			}
		}
	});
}

let stack = Composites.stack(50, 10, 3, 1, 10, 0, function (x, y) {
	return ball(x, y);
});

Composite.add(world, stack);

let mouse = Mouse.create(render.canvas)

// keep the mouse in sync with rendering
render.mouse = mouse;

let lastClick = 0;
render.canvas.addEventListener('click', function (event) {
	if (Date.now() - lastClick > 500) {
		lastClick = Date.now();

		const x = Math.max(Math.min(event.clientX, Suika.width - (ballSize + (size / 2))), ballSize + (size / 2));
		Composite.add(world, ball(x, 150));
	}
});

let previewBall = ball(Suika.width / 2, 50, true);
Composite.add(world, previewBall);
render.canvas.addEventListener('mousemove', function (event) {
	const x = Math.max(Math.min(event.clientX, Suika.width - (ballSize + (size / 2))), ballSize + (size / 2));
	previewBall.position.x = x;
});

// fit the render viewport to the scene
Render.lookAt(render, {
	min: { x: 0, y: 0 },
	max: { x: Suika.width, y: Suika.height }
});
