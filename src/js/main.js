// All the terminal wizardry was borrowed from Substack: https://github.com/substack/lxjs-2013-slides

var exterminate = require('exterminate')
	, shoe = require('shoe')
	, muxDemux = require('mux-demux')
	, sock = shoe('/sock')
	, mx = muxDemux();
sock.pipe(mx).pipe(sock);

var elHtml = document.documentElement
	, elSlides = document.querySelector('.slides')
	, elProgress = document.querySelector('#progress')
	, elCountdown = elProgress.querySelector('p')
	, elBtnMode = document.querySelector('.button-mode');

var model = {
	mode: 'reference',
	slide: 0,
	slides: parse(Array.prototype.slice.call(elSlides.children)),
	partials: [],
	start: 0,
	last: 0,
	total: 0,
	countdown: parseInt(elCountdown.innerHTML, 10),
	shells: [],
	activeShell: null,
	cwd: '',
	refWindow: '',
	width: 0,
	height: 0
}
model.total = model.slides.length;


function parse(items) {
	var slides = [];
	items.forEach(function(item) {
		if (item.tagName == 'HEADER'
			|| item.tagName == 'SECTION'
			&& !item.classList.contains('ref')) {
				slides.push(item);
				item.id = slides.length;
		}
	});
	return slides;
}

function changeMode(value) {
	var mode = value
		|| (model.mode == 'reference')
			? 'presentation'
			: 'reference';
	elHtml.classList.remove(model.mode + '-mode');
	elHtml.classList.add(mode + '-mode');
	if (mode == 'presentation') {
		window.scrollTop = 0;
		model.start = model.last = +new Date;
		presentationTick();
		model.refWindow = window.open('http://localhost:8000')
		setTimeout(function() {
			model.refWindow.document.documentElement.classList.add('presentation-slave');
		}, 2000);
	}
	model.mode = mode;
}

function nextSlide() {
	if (model.slide + 1 < model.total) changeSlide(1);
}

function prevSlide() {
	if (model.slide - 1 >= 0) changeSlide(-1);
}

function changeSlide(value) {
	var back = value < 0
		, current = model.slides[model.slide]
		, next = model.slides[model.slide + value];
	model.partials = Array.prototype.slice.call(next.querySelectorAll('.partial:not(.show)'))
		|| [];

	if (back) {
		next.classList.remove('stacked');
		current.classList.remove('visible');
	} else {
		next.classList.add('visible');
		current.classList.add('stacked');
	}
	model.cwd = next.getAttribute('data-cwd');
	model.slide += value;
	setProgress((model.slide + 1) / model.total * 100);
	if (model.refWindow) {
		model.refWindow.document.getElementById(next.id).scrollIntoView();
	}
}

function setProgress(value) {
	elProgress.style.width = '' + value + '%';
}

function showPartial() {
	model.partials.shift().classList.add('show');
}

function presentationTick(time) {
	var now = +new Date;
	if ((now - model.last) > 60000) {
		elCountdown.innerHTML = --model.countdown;
		model.last = now;
	}
	if (model.countdown) window.requestAnimationFrame(presentationTick);
}

function createShell() {
	cwd = model.cwd || '.';
	console.log(cwd);

	var shell = exterminate(80, 45)
		, stream = mx.createStream({
				command: ['bash', '-i'],
				cwd: cwd,
				columns: 80,
				rows: 45
			})
		, idx = model.shells.length + 1
		, h = parseInt(window.innerHeight, 10)
		, w = parseInt(window.innerWidth, 10);

	stream.write('clear\n');
	shell.pipe(stream).pipe(shell);

	model.width = w;
	model.height = h;
	model.shells.push(shell);
	activateShell(idx)
	shell.appendTo(elHtml);
	sizeShell(shell, w * 0.5, h * 0.5);
	manageShells()
	return shell;
}

function sizeShell(shell, w, h) {
	shell.resize(w, h);
	shell.terminal.element.style.width = w + 'px';
	shell.terminal.element.style.height = h + 'px';
}

function activateShell(idx) {
	if (idx && model.shells.length >= idx) {
		model.activeShell = model.shells[idx - 1];
		model.activeShell.terminal.focus();
	}
}

function manageShells() {
	var n = model.shells.length;
	if (n === 1) {
		model.shells[0].terminal.element.style.left = model.width * 0.25 + 'px';
		model.shells[0].terminal.element.style.top = model.height * 0.25 + 'px';
	}
	if (n === 2) {
		model.shells[0].terminal.element.style.left = model.width * 0 + 'px';
		model.shells[0].terminal.element.style.top = model.height * 0.25 + 'px';
		model.shells[1].terminal.element.style.left = model.width * 0.5 + 'px';
		model.shells[1].terminal.element.style.top = model.height * 0.25 + 'px';
	}
	if (n === 3) {
		model.shells[0].terminal.element.style.left = model.width * 0 + 'px';
		model.shells[0].terminal.element.style.top = model.height * 0 + 'px';
		model.shells[1].terminal.element.style.left = model.width * 0.5 + 'px';
		model.shells[1].terminal.element.style.top = model.height * 0 + 'px';
		model.shells[2].terminal.element.style.left = model.width * 0.25 + 'px';
		model.shells[2].terminal.element.style.top = model.height * 0.5 + 'px';
	}
	if (n === 4) {
		model.shells[0].terminal.element.style.left = model.width * 0 + 'px';
		model.shells[0].terminal.element.style.top = model.height * 0 + 'px';
		model.shells[1].terminal.element.style.left = model.width * 0.5 + 'px';
		model.shells[1].terminal.element.style.top = model.height * 0 + 'px';
		model.shells[2].terminal.element.style.left = model.width * 0 + 'px';
		model.shells[2].terminal.element.style.top = model.height * 0.5 + 'px';
		model.shells[3].terminal.element.style.left = model.width * 0.5 + 'px';
		model.shells[3].terminal.element.style.top = model.height * 0.5 + 'px';
	}
}

function destroyShell() {
	model.activeShell.destroy();
	elHtml.removeChild(model.activeShell.terminal.element);
	for (var i = 0, n = model.shells.length; i < n; i++) {
		if (model.activeShell === model.shells[i]) {
			model.shells.splice(i, 1);
			break;
		}
	}
	model.activeShell = null;
	activateShell(n-1);
	if (model.activeShell) manageShells();
}

function onKeyDown(evt) {
	if (model.mode == "presentation") {
		// Alt + `
		if (evt.altKey && evt.keyCode == 192) {
			createShell();
		}
		if (!model.activeShell) {
			if (evt.keyIdentifier === 'Right') {
				model.partials.length
					? showPartial()
					: nextSlide();
			}
			if (evt.keyIdentifier === 'Left')	{
				prevSlide();
			}
			// ESC
			if (evt.keyCode === 27) {
				changeMode();
			}
		} else {
			// Alt + q
			if (evt.altKey && evt.keyCode == 81) {
				destroyShell();
			}
			// Alt + 1
			if (evt.altKey && evt.keyCode == 49) {
				activateShell(1);
			}
			// Alt + 2
			if (evt.altKey && evt.keyCode == 50) {
				activateShell(2);
			}
			// Alt + 3
			if (evt.altKey && evt.keyCode == 51) {
				activateShell(3);
			}
			// Alt + 4
			if (evt.altKey && evt.keyCode == 52) {
				activateShell(4);
			}
		}
	}
}

function onKeyPress(evt) {
	if (model.activeShell) model.activeShell.terminal.keyPress(evt);
}

elBtnMode.addEventListener('click', changeMode, false);
document.addEventListener('keyup', onKeyDown, false);
document.addEventListener('keypress', onKeyPress, false);

// Init code highlighting
hljs.initHighlightingOnLoad();

