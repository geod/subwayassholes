var exitingGroup;
var enteringGroup;
var assholeGroup;
var trainGroup;
var trainWP;

var exitFinish;
var exitFinishZone;

var trainFinish;
var trainFinishZone;

var noPolite = 5;
var noExiting = 5;
var noAsshole = 0;

// Controls
var enteringSlider, exitingSlider, assHoleSlider;
var resetButton;
var iterationCounterInput;
var debugCheckbox;
var labels = ["#Exiting", "#Entering", "#Assholes", "Counter", "Debug"];

var ic = 0
var startTime = undefined //physical time

var SIMULATION_MODE = true;

var SCALE = 1;
var FR = 100;
var VISIBILITY = 20; // plus over size
var DEBUG = false;
var PERSON_WIDTH = 25;
var MAX_PEOPLE = 30;
var RENDER = true;
var SEED = 10;

var tWidth = 200;
var gap = PERSON_WIDTH * 3.1;
var offset = (0.5 * tWidth) + (0.5 * gap);
var coords = [{
    x: 400 - offset,
    y: 300
}, {
    x: 400 + offset,
    y: 300
}];

//Within a sprite _centred_ on x,y
function setLocation(grp, x, y, width, height) {
    grp.forEach(function(person) {
        person.position.x = x + random(-0.5, 0.5) * width;
        person.position.y = y + random(-0.5, 0.5) * height;
    });
}

//Within a rectangle
function setLocationRect(grp, x, y, width, height) {
    grp.forEach(function(person) {
        person.position.x = x + random(0, 1) * width;
        person.position.y = y + random(0, 1) * height;
    });
}

function createPerson(number, destination, group) {
    for (var i = 0; i < number; i++) {
        person = createSprite(0, 0);
        person.width = PERSON_WIDTH;
        person.height = PERSON_WIDTH;
        person.scale = SCALE;
        person.destination = destination;
        //person.immovable = true; (seems to override the train!)
        person.setCollider("circle", 0, 0, person.width / 2); // helpful for having 'brush by' behavior
        group.add(person);
        person.group = group; // Note this is sim group not p5 group
        person.type = 'person';
    }
}

function createTrain(trainGroup) {
    for (var i = 0; i < coords.length; i++) {
        train = createSprite(coords[i].x, coords[i].y);
        train.width = tWidth;
        train.height = 25;
        train.immovable = true;
        train.type = 'train';
        trainGroup.add(train);
    }
}

function createDoorWP(trainGroup) {
    var t0 = trainGroup[0];
    var t0p = trainGroup[0].position;
    var t1 = trainGroup[1];
    var t1p = trainGroup[1].position;
    return [{
        x: t0p.x + 0.5 * t0.width,
        y: t0p.y + 0.5 * t0.height
    }, {
        x: t1p.x - 0.5 * t1.width,
        y: t1p.y + 0.5 * t1.height
    }];
}

function reset() {
    allSprites.clear();
    // remove();
    // p5.instance = new p5();
    ic = 0;

    exitFinishZone = createSprite(400, 400);
    exitFinishZone.width = 200;
    exitFinishZone.height = 170;

    exitFinish = createSprite(400, exitFinishZone.position.y + exitFinishZone.height / 2 - 25);
    exitFinish.addAnimation('normal', 'assets/finishingline.png');
    exitFinish.scale = 0.25;

    trainFinishZone = createSprite(400, 200);
    trainFinishZone.width = 200;
    trainFinishZone.height = 170;

    trainFinish = createSprite(400, trainFinishZone.position.y - trainFinishZone.height / 2 + 25);
    trainFinish.addAnimation('normal', 'assets/finishingline.png');
    trainFinish.scale = 0.25;

    //Normal people exiting
    exitingGroup = new Group();
    createPerson(exitingSlider.value(), exitFinish, exitingGroup);
    exitingGroup.forEach(function(p) {
        p.AI = new PersonAI()
    });
    // Normal people queue near the door
    setLocation(exitingGroup, 400, 235, 200, 75);

    // Polite people entering
    enteringGroup = new Group();
    createPerson(enteringSlider.value(), trainFinish, enteringGroup);
    enteringGroup.forEach(function(p) {
        p.AI = new PoliteAI()
    });
    //polite people hang at the sides
    var grp1 = enteringGroup.slice(0);
    var grp2 = grp1.splice(0, Math.ceil(grp1.length / 2));
    setLocationRect(grp1, 300, 325, 50, 50);
    setLocationRect(grp2, 450, 325, 50, 50);

    // Assholes
    assholeGroup = new Group();
    createPerson(assHoleSlider.value(), trainFinish, assholeGroup);
    assholeGroup.forEach(function(p) {
        p.AI = new AssholeAI()
    });
    // start, like assholes, infront of the door
    setLocationRect(assholeGroup, 350, 325, 100, 75);

    trainGroup = new Group();
    createTrain(trainGroup);

    trainWP = createDoorWP(trainGroup);

    enteringGroup.displace(enteringGroup);
    exitingGroup.displace(exitingGroup);
}

distanceSprites = function(s1, s2) {
    distS = dist(s1.position.x, s1.position.y, s2.position.x, s2.position.y);
    return distS;
}

findAngleBetweenPoints = function(point1, point2) {
    var xd = point2.x - point1.x;
    var yd = point1.y - point2.y;
    return Math.atan2(xd, yd) * 180.0 / Math.PI;
}

function newLocation(orig, angle) {
    vAdd = p5.Vector.fromAngle(radians(angle - 90));
    vAdd = vAdd.mult(VISIBILITY);
    vNew = p5.Vector.add(orig, vAdd);
    return vNew;
}

function stop() {
    enteringGroup.forEach(function(f) {
        f.setSpeed(0, 0);
    })
    exitingGroup.forEach(function(f) {
        f.setSpeed(0, 0);
    })
    assholeGroup.forEach(function(f) {
        f.setSpeed(0, 0);
    })
    drawSprites();
    text("Finished:" + ic, 400, 400);
    if (startTime != 0) {
        console.log("DONE:exiting:" + noExiting + ",noPolite:" + noPolite + ",noAsshole:" + noAsshole + ", ic:" + ic + ", elapsed:" + (new Date() - startTime));
        startTime = 0;
    }
}

function setParams() {
    var params = getURLParams();
    noPolite = (params.noPolite == undefined ? noPolite : parseInt(params.noPolite))
    noExiting = (params.noExiting == undefined ? noExiting : parseInt(params.noExiting))
    noAsshole = (params.noAsshole == undefined ? noAsshole : parseInt(params.noAsshole))
}

function setup() {
    setParams()
    frameRate(FR);
    createCanvas(800, 800);
    angleMode(DEGREES);
    //randomSeed(SEED);

    var offset = Math.round([].reduce.call(labels, function(a, b) {
        return Math.max(textWidth(a), textWidth(b));
    })) + 5 + 10;

    exitingSlider = createSlider(0, MAX_PEOPLE, noExiting);
    exitingSlider.position(offset, 10);

    enteringSlider = createSlider(0, MAX_PEOPLE, noPolite);
    enteringSlider.position(offset, 30);

    assHoleSlider = createSlider(0, MAX_PEOPLE, noAsshole);
    assHoleSlider.position(offset, 50);

    iterationCounterInput = createInput();
    iterationCounterInput.attribute('disabled', true);
    iterationCounterInput.position(offset, 70);

    debugCheckbox = createInput(0, 1, 0);
    debugCheckbox.attribute("type", "checkbox");
    debugCheckbox.position(offset, 90);

    resetButton = createButton('Reset');
    resetButton.position(10, 115);
    resetButton.mousePressed(reset);

    reset();
    startTime = new Date();
}

function draw() {
    if (RENDER) {
        background(255, 255, 255);
        textSize(16);
        text(labels[0], 10, 25);
        text(labels[1], 10, 45);
        text(labels[2], 10, 65);
        text(labels[3], 10, 85);
        text(labels[4], 10, 105);
        drawSprites();
    }

    if (exitTest()) {
        stop();
        return false;
    }

    ic++;
    if (RENDER)
        iterationCounterInput.value(ic);

    if (true || ic % 0 == 0) {
        f = function(p) {
            p.AI.move(p);
        };
        exitingGroup.forEach(f);
        enteringGroup.forEach(f);
        assholeGroup.forEach(f);
    }

    // issue is they dont _displace_. The exiters rarely move back.
    // they generally 'stop' moving reducing the number of channels
    // bounce is slightly better but the group will still push an asshole out the channel
    assholeGroup.bounce(enteringGroup);
    assholeGroup.bounce(assholeGroup);
    assholeGroup.bounce(exitingGroup);

    enteringGroup.bounce(exitingGroup);
    enteringGroup.bounce(enteringGroup);
    enteringGroup.bounce(assholeGroup);

    exitingGroup.bounce(assholeGroup);
    exitingGroup.bounce(enteringGroup);
    exitingGroup.bounce(exitingGroup);

    enteringGroup.collide(trainGroup);
    assholeGroup.collide(trainGroup);
    exitingGroup.collide(trainGroup);

    //enteringGroup.displace(exitingGroup);

    if (debugCheckbox.elt.checked) {


        noFill();
        stroke('pink');
        rect(300, 325, 50, 150); // polite
        rect(450, 325, 50, 150);
        rect(300, 200, 200, 75); // exiting
        rect(350, 325, 100, 75); // assholes

        ellipse(trainWP[0].x, trainWP[0].y, 10, 10);
        ellipse(trainWP[1].x, trainWP[1].y, 10, 10);

        var fps = frameRate();
        console.log('fps:' + fps)
        fill(255);
        stroke(0);
        text("FPS: " + fps.toFixed(2), 10, height - 10);
    }
    return true;
}



//////////////////////////////////////////

function occupied(loc) {
    var ss = exitingGroup.concat(enteringGroup).concat(trainGroup); //TODO optimize
    var o = null;
    for (var i = 0; i < ss.length; i++) {
        if (ss[i].overlapPoint(loc.x, loc.y)) {
            o = ss[i];
            break;
        }
    }
    return o;
}

function exitTest() {
    // var allOut = allWithin(exitingGroup, exitFinishZone);
    // var allIn = allWithin(enteringGroup, trainFinishZone) && allWithin(assholeGroup, trainFinishZone);
    // return allOut && allIn;
    return (exitingGroup.length + enteringGroup.length + assholeGroup.length) == 0;
    //return allSprites.length == 0;
}


function calculateWayPoint(person) {
    return person.destination.position;
}

function calculateWayPointVector(person) {
    var destLoc = calculateWayPoint(person);
    angle = findAngleBetweenPoints(person.position, destLoc);
    vec = createVector(person.position.x, person.position.y);
    return vec;
}

/**
 * How do people actually route? They dont A* because they cant see that far ahead.
 *  We know the rough angle we are heading.
 *  If we are blocked we will
 *      in most cases stop moving
 *      in some cases move 45 or 90?
 *  Do we have two modes? Once we are in then diffuse?
 * TODO fix when brushing up beside a train
 */
function moveToDestination(person) {
    // if close delete
    if (distanceSprites(person, person.destination) < (PERSON_WIDTH * 1.5)) {
        person.groups.forEach(function(g) {
            g.remove(person)
        });
        return;
    }


    //Create vector pointing to destination
    var pp = person.position;
    var wayPointVec = calculateWayPointVector(person);

    // starting with the vector to the destination
    // calculate what is around
    // ordered list starting with the vector to destination
    var a = [0, -45, 45, -90, 90];
    var courseOpts = [];
    for (var i = 0; i < a.length; i++) {
        courseOpts[i] = {};
        courseOpts[i].offset = a[i];
        courseOpts[i].loc = newLocation(wayPointVec, angle + a[i]);
        courseOpts[i].angle = findAngleBetweenPoints(pp, courseOpts[i].loc);
        courseOpts[i].occupied = occupied(courseOpts[i].loc);
        if (debugCheckbox.elt.checked) {
            stroke(courseOpts[i].occupied != null ? 'red' : 'orange');
            strokeWeight(4);
            line(pp.x, pp.y, courseOpts[i].loc.x, courseOpts[i].loc.y);
        }
    }

    var course = null;
    if ((courseOpts[0].occupied != null && courseOpts[0].occupied.type == 'train') ||
        (courseOpts[1].occupied != null && courseOpts[1].occupied.type == 'train') ||
        (courseOpts[2].occupied != null && courseOpts[2].occupied.type == 'train')) {
        // if the vector to the destination is occupied *by the train* then head horizontal
        course = {};
        course.angle = Math.sign(courseOpts[0].angle) * 90;
        course.loc = newLocation(wayPointVec, course.angle);
        course.stroke = 'blue';
    } else {
        // else pick a course that appears to be free
        course = courseOpts[0];
        var unoccSum = 0;
        for (var i = 0; i < a.length; i++) {
            if (!courseOpts[i].occupied) {
                course = courseOpts[i];
                break;
            }
        }
    }

    if (debugCheckbox.elt.checked) {
        stroke(course.stroke != null ? course.stroke : 'green');
        strokeWeight(4);
        line(pp.x, pp.y, course.loc.x, course.loc.y);
    }
    //if(ic % 10 == 0)
    person.setSpeed(1, course.angle - 90);
}

function anyPresent(group, area) {
    var present = false;
    group.forEach(function(p) {
        present = (present || p.overlap(area))
    });
    return present;
}

function allWithin(group, area) {
    var present = true;
    group.forEach(function(p) {
        present = (present && area.overlap(p))
    });
    return present;
}

// class PersonAI {
//     move(person) {
//         moveToDestination(person);
//     }
// }
//
//
// class PoliteAI {
//
//     constructor() {
//         this.allOut = false;
//     }
//
//
//     move(person) {
//         //bug when they were dragging people back in then stopping!
//         this.allOut = this.allOut || !anyPresent(exitingGroup, trainFinishZone);
//         if (!this.allOut) {
//             person.setSpeed(0, 0);
//             return;
//         }
//         moveToDestination(person);
//     }
// }
//
// class AssholeAI {
//     move(person) {
//         moveToDestination(person);
//     }
// }
