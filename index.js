const RESOLUTION = 800;

let canvas;
let ctxt;

let point;
let polygons;
let insidePolygons;

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.width = RESOLUTION;
    canvas.height = RESOLUTION;
    ctxt = canvas.getContext("2d");

    point = [NaN, NaN];
    polygons = generateRandomPolygons(8, 4, 0.01);
    insidePolygons = polygons.map(() => false);

    canvas.onmousemove = e => {
        let rect = canvas.getBoundingClientRect()
        let x = (e.clientX - rect.left) / rect.width;
        let y = (e.clientY - rect.top) / rect.height;
        point = [x, y];

        for(let i=0;i<polygons.length;i++) {
            insidePolygons[i] = pointInsidePolygon(polygons[i], point);
        }
    }

    requestAnimationFrame(loop);
}

function generateRandomPolygons(count, size, minArea) {
    let result = [];
    while(result.length < count) {
        let polygon = generateRandomPolygon(size);

        if(polygonIntersectsSelf(polygon)) {
            continue;
        }

        if(polygonArea(polygon) < minArea) {
            continue;
        }

        if(polygonIntersectsPolygons(result, polygon)) {
            continue;
        }

        result.push(polygon);
    }
    return result;
}

function generateRandomPolygon(size) {
    let result = [];
    for(let i=0;i<size;i++) {
        result.push([
            Math.random() * 0.8 + 0.1,
            Math.random() * 0.8 + 0.1
        ]);
    }
    return result;
}

function polygonIntersectsPolygons(polygons, newPolygon) {
    for(let polygon of polygons) {
        if(polygonIntersectsPolygon(polygon, newPolygon)) {
            return true;
        }
    }
    return false;
}

function polygonIntersectsSelf(polygon) {
    for(let i=0;i<polygon.length-1;i++) {
        for(let j=i+2;j<polygon.length-1;j++) {
            if(lineIntersectsLine(polygon[i][0], polygon[i][1], polygon[i+1][0], polygon[i+1][1], polygon[j][0], polygon[j][1], polygon[j+1][0], polygon[j+1][1])) {
                return true;
            }
        }

        if(lineIntersectsLine(polygon[i][0], polygon[i][1], polygon[i+1][0], polygon[i+1][1], polygon[polygon.length-1][0], polygon[polygon.length-1][1], polygon[0][0], polygon[0][1])) {
            return true;
        }
    }

    return false;
}

function polygonIntersectsPolygon(polygon1, polygon2) {
    for(let i=0;i<polygon1.length-1;i++) {
        for(let j=0;j<polygon2.length-1;j++) {
            if(lineIntersectsLine(polygon1[i][0], polygon1[i][1], polygon1[i+1][0], polygon1[i+1][1], polygon2[j][0], polygon2[j][1], polygon2[j+1][0], polygon2[j+1][1])) {
                return true;
            }
        }
        if(lineIntersectsLine(polygon1[i][0], polygon1[i][1], polygon1[i+1][0], polygon1[i+1][1], polygon2[0][0], polygon2[0][1], polygon2[polygon2.length-1][0], polygon2[polygon2.length-1][1])) {
            return true;
        }
    }
    for(let j=0;j<polygon2.length-1;j++) {
        if(lineIntersectsLine(polygon1[0][0], polygon1[0][1], polygon1[polygon1.length-1][0], polygon1[polygon1.length-1][1], polygon2[j][0], polygon2[j][1], polygon2[j+1][0], polygon2[j+1][1])) {
            return true;
        }
    }

    return false;
}

function polygonArea(polygon) {
    let area = 0;
    for(let i=0;i<polygon.length-1;i++) {
        area += polygon[i][0] * polygon[i+1][1] - polygon[i+1][0] * polygon[i][1];
    }
    area += polygon[polygon.length-1][0] * polygon[0][1] - polygon[0][0] * polygon[polygon.length-1][1];
    return Math.abs(area) / 2;
}

function ccw(ax, ay, bx, by, cx, cy) {
    return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
}

function lineIntersectsLine(ax, ay, bx, by, cx, cy, dx, dy) {
    return (
        ccw(ax, ay, cx, cy, dx, dy) != ccw(bx, by, cx, cy, dx, dy) &&
        ccw(ax, ay, bx, by, cx, cy) != ccw(ax, ay, bx, by, dx, dy)
    );
}

function pointInsidePolygon(polygon, point) {
    let intersectionCount = 0;
    for(let i=0;i<polygon.length-1;i++) {
        let x1;
        let y1;
        let x2;
        let y2;

        if(polygon[i][0] > polygon[i+1][0]) {
            x2 = polygon[i][0]
            y2 = polygon[i][1]
            x1 = polygon[i+1][0]
            y1 = polygon[i+1][1]
        } else {
            x1 = polygon[i][0]
            y1 = polygon[i][1]
            x2 = polygon[i+1][0]
            y2 = polygon[i+1][1]
        }

        // right edge has to be right of point
        if(x2 <= point[0]) {
            continue;
        }

        if(lineIntersectsLine(x1, y1, x2, y2, point[0], point[1], 1, point[1])) {
            intersectionCount++;
        }
    }

    let x1;
    let y1;
    let x2;
    let y2;

    if(polygon[polygon.length-1][0] > polygon[0][0]) {
        x2 = polygon[polygon.length-1][0]
        y2 = polygon[polygon.length-1][1]
        x1 = polygon[0][0]
        y1 = polygon[0][1]
    } else {
        x1 = polygon[polygon.length-1][0]
        y1 = polygon[polygon.length-1][1]
        x2 = polygon[0][0]
        y2 = polygon[0][1]
    }

    // right edge has to be right of point
    if(x2 > point[0] && lineIntersectsLine(x1, y1, x2, y2, point[0], point[1], 1, point[1])) {
        intersectionCount++;
    }

    return intersectionCount % 2 !== 0;
}

function loop() {
    ctxt.setTransform(1, 0, 0, 1, 0, 0);
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    ctxt.setTransform(RESOLUTION, 0, 0, RESOLUTION, 0, 0);


    ctxt.lineWidth = 0.002;
    ctxt.fillStyle = "#FFF3";
    for(let i=0;i<polygons.length;i++) {
        ctxt.beginPath();
        ctxt.moveTo(polygons[i][0][0], polygons[i][0][1]);
        for(let j=1;j<polygons[i].length;j++) {
            ctxt.lineTo(polygons[i][j][0], polygons[i][j][1]);
        }
        ctxt.closePath();
        if(insidePolygons[i]) {
            ctxt.fill();
        }
        ctxt.stroke();
    }

    ctxt.fillStyle = "#000";
    for(let i=0;i<polygons.length;i++) {
        for(let j=0;j<polygons[i].length;j++) {
            ctxt.beginPath();
            ctxt.arc(polygons[i][j][0], polygons[i][j][1], 0.0075, 0, 2 * Math.PI);
            ctxt.fill();
        }
    }

    ctxt.fillStyle = "#FFF";
    ctxt.beginPath();
    ctxt.arc(point[0], point[1], 0.0075, 0, 2 * Math.PI);
    ctxt.fill();

    requestAnimationFrame(loop);
}
