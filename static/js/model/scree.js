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

function scree(y, root, dim) {

    // create the svg
    let svg = root.append('svg')
        .append('g')
        .attr('transform', 'translate(-100, 175)');

    let x = range(0, y.length - 1);
    y = y.map(function (d) { return d * 100; });

    // create the array for cumulative sum
    let z = [];
    let sum = 0;
    for (let i = 0; i < y.length; i++) {
        sum += y[i];
        z.push(sum);
    }

    let chartData = [];
    for (let i = 0; i < y.length; i++)
        chartData.push({
            x: x[i],
            y: y[i],
            z: z[i]
        });

    // create the scales
    let xScale = d3.scaleBand()
        .domain(x)
        .range([0, dim])
        .padding(0.1);
    let yScale = d3.scaleLinear()
        .domain([
            Math.min.apply(Math, y),
            Math.max.apply(Math, y)
        ])
        .range([dim, dim - 350]);

    // add the scale for the cumulative sum line
    let zScale = d3.scaleLinear()
        .domain([
            Math.min.apply(Math, z),
            Math.max.apply(Math, z)
        ])
        .range([dim, dim - 350]);

    // create the axes
    let xAxis = d3.axisBottom(xScale)
    let yAxis = d3.axisLeft(yScale);
    let zAxis = d3.axisRight(zScale);

    // create the bars
    svg.selectAll('rect')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('x', function (d) {
            return xScale(d.x);
        })
        .attr('y', function (d) {
            return yScale(d.y);
        })
        .attr('width', xScale.bandwidth())
        .attr('height', function (d) {
            return dim - yScale(d.y);
        })
        .attr('fill', 'grey')
        .attr('transform', `translate(0, ${-100})`);

    // create the cumulative sum line
    let line = d3.line()
        .x(function (d) {
            return xScale(d.x) + xScale.bandwidth() / 2;
        })
        .y(function (d) {
            return zScale(d.z);
        });

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('d', line)
        .attr('transform', `translate(0, ${-100})`);

    // create the x axis
    svg.append('g')
        .attr('transform', `translate(0, ${dim - 100})`)
        .call(xAxis);

    // create the y axis
    svg.append('g')
        .attr('transform', `translate(0, ${dim - (dim + dim / 5)})`)
        .call(yAxis);

    // create the z axis
    svg.append('g')
        .attr('transform', `translate(${dim}, ${dim - (dim + dim / 5)})`)
        .call(zAxis);

    // create the x axis label
    svg.append('text')
        .attr('x', dim / 2)
        .attr('y', dim - dim / 10)
        .attr('text-anchor', 'middle')
        .text('Principal Component');

    // create the y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(dim / 2))
        .attr('y', dim - (dim + dim / 10))
        .attr('text-anchor', 'middle')
        .text('Variance Explained (%)');

    // create the z axis label
    svg.append('text')
        .attr('transform', 'rotate(90)')
        .attr('x', (dim / 2))
        .attr('y', -(dim - dim / 10) - 100)
        .attr('text-anchor', 'middle')
        .text('Cumulative Sum (%)');

    // draw a red line from the z axis to the cumulative sum line
    svg.append('line')
        .attr('x1', dim)
        .attr('y1', zScale(60))
        .attr('x2', dim - 280)
        .attr('y2', zScale(60))
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('transform', `translate(0, ${-100})`);

    // draw a red line from the cumulative sum line to the x axis
    svg.append('line')
        .attr('x1', dim - 280)
        .attr('y1', zScale(60))
        .attr('x2', dim - 280)
        .attr('y2', dim)
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('transform', `translate(0, ${-100})`);
}