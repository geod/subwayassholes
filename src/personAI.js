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

class PersonAI {
    move(person) {
        moveToDestination(person);
    }
}


class PoliteAI {

    constructor() {
        this.allOut = false;
    }


    move(person) {
        //bug when they were dragging people back in then stopping!
        this.allOut = this.allOut || !anyPresent(exitingGroup, trainFinishZone);
        if (!this.allOut) {
            person.setSpeed(0, 0);
            return;
        }
        moveToDestination(person);
    }
}

class AssholeAI {
    move(person) {
        moveToDestination(person);
    }
}
