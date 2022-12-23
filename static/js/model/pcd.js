/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Copyright (C) 2022  ipitio                                              *
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

function parallelDisplay(data, vars, root, dim, embed = false) {

    // create linear scales for the y axes
    let y = {};
    for (let i = 0; i < vars.length; i++) {
        y[vars[i]] = d3.scaleLinear()
            .domain(d3.extent(data, d => +d[vars[i]]))
            .range([dim, 100]);
    }

    // create a linear scale for x
    let x = d3.scalePoint()
        .range([0, dim * 1.5])
        .padding(1)
        .domain(vars);

    // Add the svg element
    let svg = root.append('svg')
        .attr('width', dim)
        .attr('height', dim)

    if (!embed)
        svg = svg.attr('transform', 'translate(-120, 70)');
    else
        svg = svg.attr('transform', 'translate(-25, 0)');

    // Add the lines
    svg.selectAll('myPath')
        .data(data)
        .join('path')
        .attr('d', function (d) {
            return d3.line()(vars.map(function (p) {
                return [
                    x(p),
                    y[p](d[p])
                ];
            }));
        })
        .style('fill', 'none')
        .style('stroke', d => {
            // color the lines based on the color values of the variables in the levels in localStorage
            let levels = JSON.parse(localStorage.getItem('levels'));
            if (levels)
                for (let i = 0; i < levels.length; i++)
                    for (let j = 0; j < vars.length; j++)
                        if (levels[i][vars[j]] && levels[i][vars[j]][d[vars[j]]])
                            return levels[i][vars[j]][d[vars[j]]];
            return 'silver';
        })
        .style('opacity', 0.5);

    // Add the axis
    svg.selectAll('myAxis')
        .data(vars)
        .enter()
        .append('g')
        .attr('transform', function (d) {
            return 'translate(' + x(d) + ')';
        })
        .each(function (d) {
            d3.select(this).call(d3.axisLeft().scale(y[d]));
        })
        .append('text')
        .style('text-anchor', 'start')
        .attr('x', dim - (!embed ? 140 : 100))
        .attr('y', dim - (!embed ? 140 : 100))
        .attr('transform', 'rotate(45)')
        .text(function (d) { return toTitleCase(d, 0); })
        .style('fill', 'black')

    cluster(data, svg, 'PCD', 'path', dim, embed);
}