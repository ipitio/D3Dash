/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Copyright (C) 2022  ipitio                                                  *
 *                                                                             *
 * This program is free software: you can redistribute it and/or modify        *
 * it under the terms of the GNU Affero General Public License as published by *
 * the Free Software Foundation, either version 3 of the License, or           *
 * (at your option) any later version.                                         *
 *                                                                             *
 * This program is distributed in the hope that it will be useful,             *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of              *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               *
 * GNU Affero General Public License for more details.                         *
 *                                                                             *
 * You should have received a copy of the GNU Affero General Public License    *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.      *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function corrMat(data, vars, root, dim, embed = false) {

    // create a new svg element
    let svg = root.append('svg')
        .attr('width', dim)
        .attr('height', dim);

    if (!embed)
        svg = svg.attr('transform', 'translate(0, 200)');
    else
        svg = svg.attr('transform', 'translate(-75, 175)');

    // create a new color scale
    let colorScale = d3.scaleSequential()
        .domain([-1, 1])
        .interpolator(d3.interpolateRdBu);

    // create a new tooltip
    let tooltip = root.append('tip')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute');

    if (!embed)
        tooltip.style('left', dim * 1.15 + 'px')
            .style('top', dim / 2 + 'px');
    else
        tooltip.style('left', dim * 2.85 + 'px')
            .style('top', dim * 1.75 + 'px');

    // create a new gradient
    let defs = svg.append('defs');
    let linearGradient = defs.append('linearGradient')
        .attr('id', 'gradient')
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%');
    linearGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale(1));
    linearGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale(-1));

    // create a new matrix vis row by row
    let row = svg.selectAll('.row')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'row')
        .attr('transform', (d, i) => `translate(250, ${50 + i * 20})`);

    row.selectAll('.cell')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('x', (d, i) => i * 20)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', d => colorScale(-d))
        .on('mouseover', function (d) {
            tooltip.transition()
                .duration(200)
                .style('opacity', 1);
            tooltip.html(`<b>Correlation</b> | ${d.srcElement.__data__.toFixed(3)}`)
                .style('border', `5px solid ${colorScale(-d.srcElement.__data__)}`)
                .style('background-color', 'white')
                .style('border-radius', '15px')
                .style('padding', '10px');
        })
        .on('mouseout', function () {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // add a new label for each row
    row.append('text')
        .attr('x', -10)
        .attr('y', 10)
        .attr('dy', '.32em')
        .attr('text-anchor', 'end')
        .text((d, i) => toTitleCase(vars[i], 0));

    // add a new label for each column above the matrix
    let col = svg.selectAll('.col')
        .data(vars)
        .enter()
        .append('g')
        .attr('class', 'col')
        .attr('transform', (d, i) => `translate(${250 + i * 20}, 30) rotate(-50)`);
    col.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '1em')
        .attr('text-anchor', 'start')
        .text((d, i) => toTitleCase(vars[i], 0));
}