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

function loadings(loading, root, dim, xScale, yScale) {
    let loadingData = [];
    for (let i = 0; i < loading.length; i++)
        loadingData.push({ x: loading[i][0] * 5.5, y: loading[i][1] * 5.5 });

    // sort the loading data by theorem of pythagoras
    loadingData.sort((a, b) => {
        return Math.sqrt(b.x ** 2 + b.y ** 2) - Math.sqrt(a.x ** 2 + a.y ** 2);
    });

    // prepend two elements to the loading data, now they all appear
    loadingData.unshift({ x: 0, y: 0 });
    loadingData.unshift({ x: 0, y: 0 });

    loadingData = loadingData.slice(0, 2 + parseInt(location.href.split('&arg=')[1]));

    // create a color scale
    let colorScale = d3.scaleOrdinal(d3.schemeSet2);

    // add arrows, rounded at the end instead of an arrow head
    root.selectAll('path')
        .data(loadingData)
        .enter()
        .append('path')
        .attr('d', function (d) {
            return 'M' + xScale(0) + ',' + yScale(0) + 'L' + xScale(d.x) + ',' + yScale(d.y);
        })
        .attr('stroke', function (d, i) { return colorScale(i); })
        .attr('stroke-width', 3);

    // add a legend
    let legend = root.selectAll('.legend')
        .data(loadingData)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) {
            if (i < 2) {
                return `translate(0, ${-dim})`;
            } else {
                return 'translate(50,' + i * 20 + ')';
            }
        });

    legend.append('rect')
        .attr('x', dim + 45)
        .attr('y', 201)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', function (d, i) { return colorScale(i); });

    legend.append('text')
        .attr('x', dim + 70)
        .attr('y', 210)
        .attr('dy', '.35em')
        .style('text-anchor', 'start')
        .text(function (d, i) { return i - 2; });

    // add a title to the legend
    root.append('text')
        .attr('x', dim + 50)
        .attr('y', dim - 275)
        .attr('text-anchor', 'start')
        .style('font-size', '16px')
        .text('Principal Components');
}