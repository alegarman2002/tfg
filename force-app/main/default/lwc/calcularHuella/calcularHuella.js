import { LightningElement } from 'lwc';
import calcularHuellaUsuario from '@salesforce/apex/CarbonFootprint.calcularHuellaUsuario'
import d3js from '@salesforce/resourceUrl/D3'

export default class CacularHuella extends LightningElement {


    async calcularValor() {
        var numero = 0
        await calcularHuellaUsuario({valorControl: 1}).then((atribute => {numero = atribute}))
        console.log(numero)
    }


    //Vamos a utilizar el d3js
    width  = 400
    height = 400
    radius = 200
    colors = d3.scale.category20()

    piedata = [
    { 
        label: 'Bob',
        value: 50
    },{
        label: 'Gerald',
        value: 50
    },{
        label: 'Jennifer',
        value: 50
    },{
        label: 'Lorenzo',
        value: 50
    },{
        label: 'Hillary',
        value: 50
    }, {
        label: 'Jane',
        value: 50
    }
    ]

//     var pie = d3.layout.pie()
//   .value(function(d) { return d.value; })

// var arc = d3.svg.arc()
//   .outerRadius(radius)

// var myChard = d3.select('.chart').append('svg')
//   .attr('width', width)
//   .attr('height', height)
//   .append('g')
//   .attr('transform', 'translate('+ (width - radius) +', '+ (height - radius) +')')
//   .selectAll('path').data(pie(piedata))
//   .enter().append('g')
//     .attr('class', 'slice')

// var slices = d3.selectAll('g.slice')
//   .append('path')
//   .attr('fill', function(d, i) {
//      return colors(i);
//    })
//    .attr('d', arc)
//    .on('mouseover', function() {
//      d3.select(this)
//       .style('opacity', 0.8)
//    })
//   .on('mouseout', function() {
//      d3.select(this)
//       .style('opacity', 1)
//    })

// var text = d3.selectAll('g.slice')
//   .append('text')
//   .text(function(d) { return d.data.label; }) //slice = d, so we the slice's data.
//   .attr('text-anchor', 'middle')
//   .attr('fill', 'white')
//   .attr('transform', function(d) {
//     d.innerRadius = 0;
//     d.outerRadius = radius;
//     return 'translate('+arc.centroid(d)+')';//puts text at center of slice
//   })

// //Chart2
// var w = 500,
//     h = 600;

// var circleWidth = 5;

// var palette = {
//   "lightgray": "#819090",
//   "gray": "#708284",
//   "mediumgray": "#536870",
//   "darkgray": "#475B62",

//   "darkblue": "#0A2933",
//   "darkerblue": "#042029",

//   "paleryellow": "#FCF4DC",
//   "paleyellow": "#EAE3CB",
//   "yellow": "#A57706",
//   "orange": "#BD3613",
//   "red": "#D11C24",
//   "pink": "#C61C6F",
//   "purple": "#595AB7",
//   "blue": "#2176C7",
//   "green": "#259286",
//   "yellowgreen": "#738A05"
// }

// var nodes = [
//   { name: 'Parent'},
//   { name: 'child1', target: [0]},
//   { name: 'child2', target: [0]},
//   { name: 'child3', target: [2]},
//   { name: 'child4', target: [1]},
//   { name: 'child5', target: [0, 1, 2]}
// ]

// var links = [];

// for (var i = 0; i < nodes.length; i++) {
//   if(nodes[i].target !== undefined) {
//     for (var x = 0; x < nodes[i].target.length; x++) {
//       links.push({
//         source: nodes[i],
//         target: nodes[nodes[i].target[x]]
//       });
//     }
//   }
// }

// var myChart2 = d3.select('.chart2').append('svg')
//   .attr('width', w)
//   .attr('height', h)
//   .style('background', palette.paleryellow)

// var force = d3.layout.force()
//   .nodes(nodes)
//   .links([])
//   .gravity(0.3)
//   .charge(-500)
//   .size([w, h])

// var link = myChart2.selectAll('line')
//   .data(links).enter().append('line')
//   .attr('stroke', palette.gray)

// var node = myChart2.selectAll('circle')
//   .data(nodes).enter()
//   .append('g')
//   .call(force.drag)

// node.append('circle')
//   .attr('cx', function(d) { return d.x; })
//   .attr('cy', function(d) { return d.y; })
//   .attr('r', circleWidth)
//   .attr('fill', function(d, i) {
//     if (i > 0) { return palette.pink; }
//     else { return palette.blue; }
//   })

// node.append('text')
//   .text(function(d) { return d.name; })
//   .attr('text-anchor', function (d, i) {
//     if (i > 0) { return 'beginning' }
//     else { return 'end'}
//   })
//   .attr('font-size', function (d, i) {
//     if (i > 0) { return '1.1em'; }
//     else { return '1.8em'; }
//   })
//   .attr('fill', function(d, i) {
//     if (i > 0) { return palette.mediumgray }
//     else { return palette.yellowgreen }
//   })
//   .attr('x', function (d, i) {
//     if (i > 0) { return circleWidth + 5; }
//     else { return circleWidth - 12; }
//   })
//   .attr('y', function (d, i) {
//     if (i > 0) { return circleWidth; }
//     else { return circleWidth + 2;}
//   })

// force.on('tick', function(e) {
//   node.attr('transform', function(d, i) {
//     return 'translate('+ d.x +', '+ d.y +')';
//   })
//   link
//     .attr('x1', function(d) { return d.source.x })
//     .attr('y1', function(d) { return d.source.y })
//     .attr('x2', function(d) { return d.target.x })
//     .attr('y2', function(d) { return d.target.y })
// })

// force.start();
}