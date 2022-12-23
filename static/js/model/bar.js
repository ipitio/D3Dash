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

function bars(vars, root, dim, variable, isZip = false, isHist = false, embed = false) {

    // create the svg
    let svg = root.append('svg');

    if (embed) {
        svg = svg.append('g')
            .attr('transform', `translate(100, ${isHist ? -25 : 0})`);
        // add the title
        svg.append('text')
            .attr('x', (dim / 2))
            .attr('y', dim / 2 + (isHist ? 225 : 125))
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .text(toTitleCase(variable, 0));
    }
    else if (isZip)
        svg = svg.append('g')
            .attr('transform', 'translate(-515, 200)');
    else
        svg = svg.append('g')
            .attr('transform', 'translate(-100, 200)');

    let tooltip = root.append('tip')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute');

    if (!embed)
        tooltip.style('left', dim + 'px')
            .style('top', dim / 2 + 'px');
    else
        tooltip.style('left', (isHist ? dim * .575 : dim * .625) + 'px')
            .style('top', (isHist ? dim * 1.5 : dim / 1.5) + 'px');

    let x = vars.map(function (d) { return d.x; })
    let y = vars.map(function (d) { return d.y; })
    const xRange = isZip ? dim * 2.75 : dim;

    let histogram = 0;
    let bins = 0;

    // create the scales
    let xScale = 0;
    let yScale = 0;

    if (isHist) {
        xScale = d3.scaleLinear()
            .domain([0, 2 + d3.max(vars)])
            .range([0, dim]);
        histogram = d3.histogram()
            .value(function (d) { return d; })
            .domain(xScale.domain())
            .thresholds(xScale.ticks(15));
        bins = histogram(vars);
        yScale = d3.scaleLinear()
            .domain([0, d3.max(bins, function (d) { return d.length; })])
            .range([dim, dim - 350]);
    } else {
        xScale = d3.scaleBand()
            .domain(x)
            .range([0, xRange])
            .padding(0.1);
        yScale = d3.scaleLinear()
            .domain([
                Math.min(Math.min.apply(Math, y), 0),
                Math.max.apply(Math, y)
            ])
            .range([dim, dim - 350]);
    }

    // create the axes
    // make bottom axis values vertical
    let xAxis = d3.axisBottom(xScale)
    let yAxis = d3.axisLeft(yScale);

    // create the bars
    svg.selectAll('rect')
        .data(isHist ? bins : Object.values(vars))
        .enter()
        .append('rect')
        .attr('x', function (d) {
            return isHist ? 1 : xScale(d.x);
        })
        .attr('y', function (d) {
            return isHist ? 0 : yScale(d.y);
        })
        .attr('width', !isHist ? xScale.bandwidth() : function (d) {
            return Math.abs(xScale(d.x1) - xScale(d.x0) - 1);
        })
        .attr('height', function (d) {
            return isHist ? (dim - yScale(d.length)) : (dim - yScale(d.y));
        })
        .attr('fill', function (d, i) {
            // if the bar/level is in localStorage, return its color
            let levels = JSON.parse(localStorage.getItem('levels'));
            let values = !isHist ? d.x : d.filter(function (d) {
                return typeof d === 'string' || d instanceof String;
            }).map(function (d) { return parseInt(d); })
            if (levels) {
                for (let i = 0; i < levels.length; i++) {
                    if (levels[i][variable]) {
                        if (Array.isArray(values))
                            values = values[0];
                        if (levels[i][variable][values])
                            return levels[i][variable][values];
                    }
                }
            }
            return 'silver';
        })
        .attr('transform', !isHist ? `translate(0, ${-100})` : function (d) {
            let y = yScale(d.length) === 0 ? 0 : yScale(d.length) - (embed ? 0 : 100);
            return 'translate(' + (xScale(d.x0)) + ',' + y + ')';
        })
        .on('mouseover', function (d) {
            d3.select(this).style('cursor', 'pointer');
            let value = !isHist ? d.srcElement.__data__.x : d.srcElement.__data__.x0 + ' - ' + d.srcElement.__data__.x1;
            if (variable.toLowerCase() === 'numeric type')
                value = cars[parseInt(value)];
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`<b>${toTitleCase(value, 0)}</b> | ${!isHist ? d.srcElement.__data__.y : d.srcElement.__data__.length} crashes`)
                .style('border', `5px solid ${d3.select(this).attr('fill')}`)
                .style('background-color', 'white')
                .style('border-radius', '15px')
                .style('padding', '10px');
        })
        .on('mouseout', function (d) {
            d3.select(this).style('cursor', 'none');
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function (d) {
            highlight(this, d, variable, isHist ? 'hist' : 'bar');
        });

    // create the x axis
    svg.append('g')
        .attr('id', isHist ? 'x-axis' : 'x-axis-bar')
        .attr('transform', `translate(0, ${dim - (embed && isHist ? 0 : 100)})`)
        .call(xAxis)
        .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');

    // create the y axis
    svg.append('g')
        .attr('transform', `translate(0, ${!embed ? dim - (dim + dim / 5) : !isHist ? dim - (dim + dim / 3) + 16.5 : dim - (dim + dim / 3) + dim / 3})`)
        .call(yAxis);

    // create the y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', isHist || !embed ? -(dim / 2) : -(dim / 2) + 100)
        .attr('y', dim - (dim + dim / 10))
        .attr('text-anchor', 'middle')
        .text(isHist ? 'Frequency' : 'Count');

    if (isHist)
        for (let i = 0; i < 2; i++)
            d3.select('#x-axis .tick:last-child').remove()
};