
; $(function ($) {

    var canvas, context, audioContext, buffer, particles = [], audio = ['popOne', 'popTwo'], tweets = [], mouse = { x: -99999, y: -99999 }, type = ['circle', 'rumble'], skip = step = 0, closestIndex = -1, force = 1, enableWebAudioAPI = isLoading = release = true, played = false, lastTime = lastDownload = $.now(), FPS = 60;

    /*
	 * List colors.
	 */

    var colors = [

		'#7c4960',
		'#ffec00',
		'#e90055',

		// 5 more blue color
		'#5ccfea',
		'#5ccfea',
		'#5ccfea',
		'#5ccfea',

		'#a94eb5',
		'#ceff00',
		'#bce3de',

		// 2 more orange color
		'#ffb600',
		'#ffb600',

		// 2 more black color
		'#000000',
		'#000000'

    ];

    /*
 	 * Init.
	 */

    function init() {

        var body = document.querySelector('body');

        canvas = document.createElement('canvas');

        canvas.width = innerWidth;
        canvas.height = innerHeight;

        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.bottom = 0;
        canvas.style.left = 0;
        canvas.style.right = 0;
        canvas.style.zIndex = -1;

        canvas.style.background = 'rgb(255, 255, 255);';

        body.appendChild(canvas);

        // Browser supports canvas?
        if (!!(capable)) {

            context = canvas.getContext('2d');

            // Events
            if ('ontouchmove' in window) {

                document.addEventListener('touchmove', self.onTouchMove, false);

            }

            else {

                document.addEventListener('mousemove', onMouseMove, false);

            }

            window.onresize = onResize;

            // Todo
            preloadAudio();
            createParticles();

        }

        else {

            console.error('Sorry, your browser sucks :(');

        }

    }

    /*
	 * Checks if browser supports canvas element.
	 */

    function capable() {

        return canvas.getContext && canvas.getContext('2d');

    }

    /*
	 * On resize window event.
	 */

    function onResize() {

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

    }

    /*
	 * Mouse move event.
	 */

    function onMouseMove(event) {

        event.preventDefault();

        mouse.x = event.pageX - canvas.offsetLeft;
        mouse.y = event.pageY - canvas.offsetTop;

    }

    /*
	 * Touch move event.
	 */

    function onTouchMove(event) {

        event.preventDefault();

        mouse.x = event.touches[0].pageX - canvas.offsetLeft;
        mouse.y = event.touches[0].pageY - canvas.offsetTop;

    }

    /*
	 * Get the audio file via Ajax.
	 */

    function preloadAudio() {

        try {

            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            var request = new XMLHttpRequest();

            request.open('GET', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/16395/popOne.ogg', true);
            request.responseType = 'arraybuffer';

            request.onload = function () {

                audioContext.decodeAudioData(request.response, function (chunk) {

                    buffer = chunk;

                }, function () {

                    $.error('Failed to get audio file :(');

                });

            };

            request.send();

        }

        catch (Exception) {

            enableWebAudioAPI = false;

        }

    }

    /*
	 * Create particles.
	 */

    function createParticles() {

        var colums, rows, columsSpacing, rowsSpacing, columsPadding, rowsPadding;

        colums = 15;
        rows = 15;

        columsSpacing = (innerWidth || canvas.width) * 0.5 / colums;
        rowsSpacing = (innerHeight || canvas.height) * 0.5 / rows;

        columsPadding = 7;
        rowsPadding = 3;

        // Iterate through the grid
        for (var colum = columsPadding, columsLen = colums + columsPadding; colum < columsLen; colum++) {

            for (var row = rowsPadding, rowsLen = rows + rowsPadding; row < rowsLen; row++) {

                var x, y, shape, radius;

                x = colum * columsSpacing + columsSpacing * 0.5;
                y = row * rowsSpacing + rowsSpacing * 0.5;

                shape = type[~~(Math.random() * type.length)];
                radius = shape === 'circle' ? randomBetween(2, 10) : randomBetween(2, 10) * 2;

                particles.push({

                    x: x,
                    y: y,
                    goalX: x,
                    goalY: y,
                    centerX: x,
                    centerY: y,
                    gridX: x,
                    gridY: y,

                    vx: 0,
                    vy: 0,

                    radius: radius,
                    towardsRadius: radius,
                    color: colors[~~(Math.random() * colors.length)],
                    alpha: 0.0,

                    orbit: ~~(Math.random() * 70),
                    speed: 0.06 + Math.random() * 0.08,
                    angle: 0,

                    over: false,
                    type: shape

                });

            }

        }

        loop();

    }



    /*
	 * Load a random tweet.
	 */

    function loadTweet(color) {


            $('.tweets').html('<p class = "mentions"> <p> <a href = "javascript:void(0)">&hearts;LOVE  NASTYA&hearts;</a></p>');



            isLoading = false;

        

        $('a').css({

            'color': color || colors[~~(Math.random() * colors.length)],
            'text-decoration': 'none',
            'font-size': '1.7em'

        });

    }

    /*
	 * Play the audio.
	 */

    function play() {

        if (enableWebAudioAPI) {

            var source = audioContext.createBufferSource();

            source.playbackRate.value = Math.pow(Math.random(), 2) * 0.9 + 0.25;
            source.gain.value = 0.4;
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.noteOn(0);

        }

        else {

            var media = document.querySelector('#' + audio[~~(Math.random() * audio.length)]);

            media.play();

        }

    }

    /*
	 * Loop logic.
	 */

    function loop() {


        clear();
        update();
        render();

        requestAnimFrame(loop);

    }

    /*
	 * Clear the whole screen.
	 */

    function clear() {

        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
        context.fillRect(0, 0, canvas.width, canvas.height);

    };

    /*
	 * Update the particles.
	 */

    function update() {

        particles.forEach(function (particle, index) {

            /*
			 * ========== Initial step. ==========
			 */

            if (step > 100) {

                // Toggle visibility
                particles[skip].alpha = 1.0;

                if (skip < particles.length - 1) {

                    skip += 1;

                    // Reset the current step
                    step = 0;

                }

                else

                    skip = particles.length - 1;

            }

            /*
			 * ========== Behaviour when the mouse is in/out the particle. ==========
			 */

            // If the mouse is close to the particle...	
            if (distanceTo(particle, mouse) < 60 && closestIndex !== index && particle.alpha === 1.0) {

                // Add forces
                particle.orbit = ~~(Math.random() * 70);
                particle.speed = 0.06 + Math.random() * 0.08;

                if (!release) {

                    var currentClosestParticle, maxRadius;

                    currentClosestParticle = particles[closestIndex];
                    maxRadius = currentClosestParticle.type === 'circle' ? 100 : 150;

                    if (distanceTo(currentClosestParticle, mouse) < 60) {

                        if (!played) {

                            try {

                                play();

                            }

                            catch (Exception) { }

                            loadTweet(currentClosestParticle.color);

                            played = true;

                        }

                        currentClosestParticle.over = true;
                        currentClosestParticle.speed = 0;

                        // Towards to max radius
                        currentClosestParticle.radius += (maxRadius - currentClosestParticle.radius) * 0.09;

                        // Reached the towards add a gravity field
                        if (~~currentClosestParticle.radius === maxRadius - 1)

                            force = 150;

                    }

                }

                else {

                    closestIndex = index;
                    release = false;

                }

            }

                // If the mouse is out the particle...	
            else if (distanceTo(particle, mouse) > 70 && closestIndex === index && particle.alpha === 1.0) {

                force = 1;

                if (distanceTo(particles[closestIndex], mouse) > 70) {

                    particles[closestIndex].over = false;
                    particles[closestIndex].speed = 0.06 + Math.random() * 0.08;

                    release = true;
                    played = !release;

                }

            }

            // Restore back to original radius
            if (!particle.over)

                particle.radius += (particle.towardsRadius - particle.radius) * 0.5;

            /*
			 * ========== Transitions (grid, circle, heart). ==========
			 */

            var angle, steps, ease = 0.01, friction = 0.96;

            angle = Math.atan2(particle.y - mouse.y, particle.x - mouse.x);
            steps = Math.PI * 2 * index / particles.length;

            // Inverse polar system	
            particle.x += Math.cos(angle) * force / distanceTo(particle, mouse) + (particle.goalX - particle.x) * 0.08;
            particle.y += Math.sin(angle) * force / distanceTo(particle, mouse) + (particle.goalY - particle.y) * 0.08;

            // Interactive orbit force when the mouse is far away from particles
            if (distanceTo(particle, mouse) > 60) {

                particle.goalX = particle.centerX + Math.cos(index + particle.angle) * particle.orbit;
                particle.goalY = particle.centerY + Math.sin(index + particle.angle) * particle.orbit;

            }

            // Rotation
            particle.angle += particle.speed;

            // Loss forces
            particle.speed = Math.max(particle.speed - 0.00005, 0);
            particle.orbit += (1 - particle.orbit) * 0.001;

            // Circle
            if ($.now() - lastTime > 6000 && $.now() - lastTime < 12000) {

                // Ease
                particle.vx += ((innerWidth || canvas.width) * 0.5 + 170 * Math.cos(steps) - particle.centerX) * ease;
                particle.vy += (250 + 170 * Math.sin(steps) - particle.centerY) * ease;

                // Friction
                particle.vx *= friction;
                particle.vy *= friction;

                particle.centerX += particle.vx;
                particle.centerY += particle.vy;

            }

            // Heart
            if ($.now() - lastTime > 12000 && $.now() - lastTime < 18000) {

                // Ease
                particle.vx += ((innerWidth || canvas.width) * 0.5 + 180 * Math.pow(Math.sin(index), 3) - particle.centerX) * ease;
                particle.vy += (250 + 10 * (-(15 * Math.cos(index) - 5 * Math.cos(2 * index) - 2 * Math.cos(3 * index) - Math.cos(4 * index))) - particle.centerY) * ease;

                // Friction
                particle.vx *= friction;
                particle.vy *= friction;

                particle.centerX += particle.vx;
                particle.centerY += particle.vy;

                

            }

            // Grid
            if ($.now() - lastTime > 18000 && $.now() - lastTime < 24000) {

                // Ease
                particle.vx += (particle.gridX - particle.centerX) * ease;
                particle.vy += (particle.gridY - particle.centerY) * ease;

                // Friction
                particle.vx *= friction;
                particle.vy *= friction;

                particle.centerX += particle.vx;
                particle.centerY += particle.vy;

            }

            // Reset 'em all
            if ($.now() - lastTime > 24000)

                lastTime = $.now();

        });

        step += 200;

    }

    /*
	 * Render the particles.
	 */

    function render() {

        [].forEach.call(particles, function (particle, index) {

            context.save();
            context.globalAlpha = particle.alpha;
            context.translate(particle.x, particle.y);
            context.rotate(45 * Math.PI / 180);
            context.fillStyle = particle.color;
            context.beginPath();
            particle.type === 'circle' ? context.arc(-2, -2, particle.radius, 0, Math.PI * 2) : context.rect(particle.radius / -2, particle.radius / -2, particle.radius, particle.radius);
            context.closePath();
            context.fill();
            context.restore();

        });

    }

    /*
	 * Distance between two points.
	 */

    function distanceTo(pointA, pointB) {

        var dx = Math.abs(pointA.x - pointB.x);
        var dy = Math.abs(pointA.y - pointB.y);

        return Math.sqrt(dx * dx + dy * dy);

    }

    /*
	 * Useful function for random integer between [min, max].
	 */

    function randomBetween(min, max) {

        return ~~(Math.random() * (max - min + 1) + min);

    }

    /*
	 * Request new frame by Paul Irish.
	 * 60 FPS.
	 */

    window.requestAnimFrame = (function () {

        return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||

				function (callback) {

				    window.setTimeout(callback, 1000 / FPS);

				};

    })();

    window.addEventListener ? window.addEventListener('load', init, false) : window.onload = init;

})(jQuery);