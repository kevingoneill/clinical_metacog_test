const PETAL_SHAPES = ['triangle', 'rect', 'oval', 'heart'];
const N_PETALS = [4, 5, 6, 10];
const N_LEAVES = [0, 1, 2];
const PETAL_COLORS = [
    { color: '#FFD30D', label: 'yellow' },
    { color: '#FB9946', label: 'peach' },
    { color: '#E96047', label: 'red' },
    { color: '#FCA5A6', label: 'pink' },
    { color: '#BBA1BE', label: 'lilac' },
    //{ color: '#F7F8F1', label: 'white' }
];
const CENTER_COLORS = [
    { color: '#19180A', label: 'black' },
    { color: '#902618', label: 'red' },
    { color: '#4B2F3E', label: 'purple' }
]

console.log('Number of possible flowers: ', 
    PETAL_SHAPES.length * N_PETALS.length * N_LEAVES.length * 
    PETAL_COLORS.length * CENTER_COLORS.length);

/*
 * drawPetal():
 *   Generate the SVG path to draw a single flower petal
 *     center: the center coordinate of the flower head
 *     angle: the angle of the petal
 *     radius: the distance from the flower center to the petal center
 *     scale_x: stretching factor for the petal width
 *     scale_y: stretching factor for the petal height
 *     shape: the petal shape ('triangle', 'rect', 'oval', 'heart')
 *     fill: the petal fill color
 */
function drawPetal(center, angle, radius, scale_x, scale_y, shape = 'triangle', fill = 'black') {
    const x = center - 250 * scale_x + radius * Math.cos(angle);
    const y = center - 500 * scale_y + radius * Math.sin(angle);
    const rotate_angle = 180 / Math.PI * angle + 90

    //let transform = `translate(${x} ${y}) scale(${scale_x} ${scale_y}) rotate(${rotate_angle} 250 500)`;
    let transform = `translate(${x} ${y}) rotate(${rotate_angle} ${250 * scale_x} ${500 * scale_y}) scale(${scale_x} ${scale_y})`;

    switch (shape) {
        case 'heart':
            return `<path d="M 166.34638,0.12568454 C 109.70666,3.3057545 56.070178,66.305215 50.697348,180.9071 40.918678,389.48515 111.10152,970.6217 175,998.9757 c 0.4665,0.207 71.3713,0.3328 71.82953,0.4805 0.47598,0.1669 0.94837,0.4091 1.42818,0.4962 0.13222,0.024 0.27274,-0.01 0.40582,0.01 0.45396,0.068 0.89148,0.022 1.33647,0.027 0.445,-0.01 0.88253,0.041 1.33649,-0.027 0.13307,-0.018 0.27359,0.016 0.40581,-0.01 0.47981,-0.087 0.95219,-0.3293 1.42817,-0.4962 C 253.6287,999.3085 324.5335,999.1827 325,998.9757 388.89848,970.6217 459.08134,389.48514 449.30265,180.90711 441.1637,7.3041245 322.3109,-47.761645 250,44.024525 225.42426,12.829885 195.50651,-1.5115155 166.34638,0.12568454 Z" transform="${transform}" fill="${fill}" />`;
        case 'oval':
            return `<ellipse cx="250" cy="500" rx="200" ry="500" transform="${transform}" fill="${fill}" />`;
        case 'rect':
            return `<path d="m 176.49723,0 h 147.00552 c 69.98414,0 130.13992,34.90969 126.32518,77.89348 L 374.90545,922.1065 C 371.09071,965.0903 393.48689,1000 323.50275,1000 H 176.49723 c -69.98413,0 -47.58793,-34.9097 -51.40268,-77.8935 L 50.172075,77.89348 C 46.357335,34.90969 106.5131,0 176.49723,0 Z" transform="${transform}" fill="${fill}" />`;
        default:
            return `<path d="m 260.50856,905.73956 c -224.444922,10e-6 -673.33479,-777.5 -561.11233,-971.875012 C -188.38132,-260.51046 709.39838,-260.51049 821.62085,-66.135483 933.84331,128.23952 484.95349,905.73956 260.50856,905.73956 Z" transform="${transform} matrix(-0.30233528,0,0,-0.89472946,328.76092,810.39187)" fill="${fill}" />`;
    }
}

/*
 *  drawFlower():
 *    Generate an SVG image containing a flower with:
 *    n_petals: number of petals
 *    shape: shape of petals ('triangle', 'rect', 'oval', or 'heart')
 *    center_color: color of the center of the flower
 *    petal_color: color of the petals
 *    layered: if true, add a second layer of petals with a darker color.
 *    n_leaves: number of leaves on the stem (0, 1, or 2)
 *    angle: angle to rotate the flower head in degrees (at 0, one petal will always point up)
 *    size: size of the SVG image in pixels
 *    radius: relative radius of the petals
 *    background_color: background color of the SVG image
 */
function drawFlower({n_petals = 5, shape = 'triangle', center_color = 'black', petal_color = 'black',
    layered = false, n_leaves = 0, angle = 0, size = 250, radius = .4, background_color = 'hsla(0, 0%, 100%, 0)'}) {
    // start an svg image
    let svg = `<svg id="img" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" 
                        style="background-color: ${background_color};">`;

    // add stem
    svg += `<path fill="none" stroke="#769960" stroke-width="${size * 3 / 100}px" 
                     d="M ${size / 2},${1.1 * size} C ${3 / 4 * size},${size / 2} ${size / 2},${size / 4} ${size / 2},${size / 4}" />`

    // add leaves
    if (n_leaves > 0) {
        // bottom leaf shape
        svg += `<path fill="#769960" stroke="none" d="m 180.61264,180.65696 c -0.12579,27.88939 -34.88425,50.49873 -62.33062,50.49873 -27.446349,0 -52.652481,-22.53729 -48.432561,-50.07077 C 84.421694,86.006271 108.10294,18.844312 118.28202,18.844311 c 5.96757,-1e-6 62.75177,68.44582 62.33062,161.812649 z"
                        transform="translate(${.28 * size} ${.6 * size}) scale(${size * 4 / 3000} ${size * 4 / 3000}) rotate(-85 125 125)" />`;
        // bottom leaf mid-line
        svg += `<path fill="none" stroke="hsl(from #769960 h s calc(l*.85))" stroke-width="${size / 100}px"
                        d="M ${size * .55},${size * .79} C ${size * .525},${size * .71} ${size * .35},${size * .76} ${size * .35},${size * .76}" />`;
    }
    if (n_leaves > 1) {
        // top leaf shape
        svg += `<path fill="#769960" stroke="none" d="m 68.01306,181.01668 c 0.12579,27.88939 34.88425,50.49873 62.33062,50.49873 27.44636,0 52.65249,-22.53729 48.43257,-50.07077 C 164.20401,86.365992 140.52276,19.204033 130.34368,19.204031 124.37611,19.20403 67.59191,87.649852 68.01306,181.01668 Z" 
                        transform="translate(${.59 * size} ${.4 * size}) scale(${size * 4 / 3000} ${size * 4 / 3000}) rotate(95 125 125)" />`;
        // top leaf mid-line
        svg += `<path fill="none" stroke="hsl(from #769960 h s calc(l*.85))" stroke-width="${size / 100}px"
                        d="M ${size * .65},${size * .57} C ${size * .675},${size * .52} ${size * .85},${size * .58} ${size * .85},${size * .58}" />`;
    }

    // add flower head, rotating it by `angle`
    svg += `<g id="head" transform="translate(${size / 4} 0) scale(.25 .25) rotate(${angle} ${size} ${size})">`;

    // add back petals
    if (layered) {
        svg += seq(Math.PI / n_petals - Math.PI / 2, 2 * Math.PI + Math.PI / n_petals, by = 2 * Math.PI / n_petals)
            .map(a => drawPetal(size, a, radius * size, size * 6 / 1000 / n_petals, size / 1000,
                shape = shape, fill = `hsl(from ${petal_color} h s calc(l*.85))`))
            .join('\n');
    }

    // add front petals
    svg += seq(-Math.PI / 2, 2 * Math.PI - 2 * Math.PI / n_petals, by = 2 * Math.PI / n_petals)
        .map(a => drawPetal(size, a, radius * size, size * 6 / 1000 / n_petals, size / 1000, shape = shape, fill = petal_color))
        .join('\n');

    // draw center
    svg += `<ellipse cx="${size}" cy="${size}" rx="${2 / 3 * radius * size}" ry="${2 / 3 * radius * size}" fill="${center_color}" />`;
    return svg + '</g></svg>';
}
function generateFlowerParams() {
    const shape = jsPsych.randomization.sampleWithReplacement(PETAL_SHAPES, 1)[0];
    const n_petals = jsPsych.randomization.sampleWithReplacement(N_PETALS, 1)[0];
    const n_leaves = jsPsych.randomization.sampleWithReplacement(N_LEAVES, 1)[0];
    const petal_color = jsPsych.randomization.sampleWithReplacement(PETAL_COLORS, 1)[0].color;
    const center_color = jsPsych.randomization.sampleWithReplacement(CENTER_COLORS, 1)[0].color;
    const layered = Math.random() > .5;
    const angle = Math.round(Math.random() * 360);
    return {
        n_petals: n_petals,
        shape: shape,
        center_color: center_color,
        petal_color: petal_color,
        layered: layered,
        n_leaves: n_leaves,
        angle: angle,
        size: WM_stimuli_size,
        radius: .4,
    };
};
/*
return drawFlower(
        n_petals,
        shape,
        center_color,
        petal_color,
        layered,
        n_leaves,
        angle,
        size = WM_stimuli_size,
        radius = .4,
        background_color = 'hsla(0, 0%, 100%, 1.00)'
        );
*/