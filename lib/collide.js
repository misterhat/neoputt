function circles(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const radii = a.radius + b.radius;

    return ((dx * dx) + (dy * dy)) < (radii * radii);
}

module.exports.circles = circles;
