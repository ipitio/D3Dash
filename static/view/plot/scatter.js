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

function scatterPlot(data, selectedColumnX, selectedColumnY, root, dim, labels = true, title = 'Scatterplot', vars = null, loading = null, originalData = null, embed = false) {

    data = data.map(d => {
        return typeof d.map == 'function' ? d.map(e => e === undefined ? 0 : e) : d;
    });

    let columnDataX = !title.includes('MDS') ? getColumnData(data, selectedColumnX) : data[0];
    let columnDataY = !title.includes('MDS') ? getColumnData(data, selectedColumnY) : data[1];
    let chartData = [];
    for (let i = 0; i < columnDataX.length; i++)
        chartData.push({ x: columnDataX[i], y: columnDataY[i] });

    // create the svg
    let svg = root.append('svg');
    // if not labels, then we are in a scatterplot matrix
    if (!labels)
        svg.attr('class', 'svg');
    if (embed)
        svg = svg.append('g')
            .attr('transform', `translate(75, -100)`);
    else if (title.includes('Matrix'))
        svg = svg.append('g')
            .attr('transform', `translate(${labels ? -400 : 50}, ${labels ? 125 : 0})`);
    else svg = svg.append('g')
        .attr('transform', `translate(${labels ? -100 : 50}, ${labels ? 125 : 0})`);

    // create the x axis
    let xScale = d3.scaleLinear()
        .domain([
            Math.min.apply(Math, chartData.map(function (d) { return d.x; })),
            Math.max.apply(Math, chartData.map(function (d) { return d.x; })) + 1
        ])
        .range([0, dim]);

    let yScale = d3.scaleLinear()
    if (labels) {
        yScale = d3.scaleLinear()
            .domain([
                Math.min.apply(Math, chartData.map(function (d) { return d.y; })),
                Math.max.apply(Math, chartData.map(function (d) { return d.y; })) + 1
            ])
            .range([dim, 100]);
    } else {
        // create the y axis
        yScale = d3.scaleLinear()
            .domain([
                Math.max.apply(Math, chartData.map(function (d) { return d.y; })) + 1,
                Math.min.apply(Math, chartData.map(function (d) { return d.y; }))
            ])
            .range([dim, 100]);
    }

    // create the x axis
    let xAxis = d3.axisBottom(xScale).ticks(dim * 0.04);

    // create the y axis
    let yAxis = d3.axisLeft(yScale).ticks(dim * 0.06);

    if (labels) {
        // create the x axis label
        svg.append('text')
            .attr('x', dim / 2)
            .attr('y', dim + 50)
            .attr('text-anchor', 'middle')
            .text(toTitleCase(vars ? (!title.includes('MDS') ? 'Component ' : 'Coordinate ') + vars[0] : selectedColumnX));
        // create the y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -dim / 2 - (dim / 10))
            .attr('y', -dim / 10)
            .attr('text-anchor', 'middle')
            .text(toTitleCase(vars ? (!title.includes('MDS') ? 'Component ' : 'Coordinate ') + vars[1] : selectedColumnY));
    }

    let xOffset = labels ? dim : 2 * dim;
    // create the x axis
    svg.append('g')
        .attr('transform', 'translate(0,' + xOffset + ')')
        .call(xAxis);

    // create the y axis
    svg.append('g')
        .call(yAxis);

    // create the scatter plot
    svg.selectAll('circle')
        .data(chartData)
        .enter()
        .append('circle')
        .attr('index', function (d, i) { return i; })
        .attr('cx', function (d) { return xScale(d.x); })
        .attr('cy', function (d) { return yScale(d.y); })
        .attr('r', dim < 100 ? dim / 20 : dim / 200);

    if (title.includes('Biplot'))
        loadings(loading, svg, dim, xScale, yScale);

    if (originalData) {
        // color any points that are in local storage levels with the same value using the same color
        // levels are stored as [{variable : {value1 : 'color', value2 : 'color', ...}, ...}, ...]}}}]
        let levels = JSON.parse(localStorage.getItem('levels'));
        if (levels)
            svg.selectAll('circle')
                .style('fill', function (d) {
                    for (let i = 0; i < levels.length; i++)
                        for (let variable in levels[i])
                            for (let value in levels[i][variable])
                                if (originalData[chartData.indexOf(d)][variable] == value)
                                    return levels[i][variable][value];
                    return 'slategray';
                });
    }

    cluster(chartData, svg, title ? title : (selectedColumnX + '-' + selectedColumnY), 'circle', dim, embed);
}