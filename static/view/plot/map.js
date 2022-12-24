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

function proportionalCircle(originalData, root, dim, data, variable, embed = false) {

    // create the svg
    let svg = root.append('svg')
        .attr('width', dim)
        .attr('height', dim)

    if (!embed)
        svg = svg.attr('transform', 'translate(0, 70)');
    else
        svg = svg.attr('transform', 'translate(90, 100)');

    let image = svg.append('svg:image')
        .attr('xlink:href', 'static/view/png/nyc.png')
        .attr('width', dim * 1.25)
        .attr('height', dim * 1.25)
        .attr('x', -95)
        .attr('y', -35);

    if (embed)
        image.attr('x', -65)
            .attr('y', -30);

    // add a tooltip at the top of root
    let tooltip = root.append('tip')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute');

    if (!embed)
        tooltip.style('left', dim + 'px')
            .style('top', dim / 2 + 'px');
    else
        tooltip.style('left', dim * 1.5 + 'px')
            .style('top', dim * 1.75 + 'px');

    // create the projection
    let projection = d3.geoMercator()
        .fitSize([dim, dim], data);

    // create the path
    let path = d3.geoPath()
        .projection(projection);

    // create the map
    let count = {};
    originalData.forEach(function (d) {
        if (d[variable] in count) {
            count[d[variable]] += 1;
        } else {
            count[d[variable]] = 1;
        }
    });
    let max = 0;
    for (let key in count) {
        if (count[key] > max) {
            max = count[key];
        }
    }

    let chartData = [];

    svg.selectAll('circle')
        .data(data.features)
        .enter()
        .append('circle')
        .attr('cx', function (d) {
            chartData.push({ x: path.centroid(d)[0], y: path.centroid(d)[1] });
            return path.centroid(d)[0];
        })
        .attr('cy', function (d) { return path.centroid(d)[1]; })
        .attr('fill', (d, i) => {
            let levels = JSON.parse(localStorage.getItem('levels'));
            if (levels)
                for (let j = 0; j < levels.length; j++)
                    for (let variable in levels[j])
                        for (let value in levels[j][variable])
                            if (originalData[i][variable] == value)
                                return levels[j][variable][value];
            return 'white';
        })
        .attr('r', (d) => {
            let counts = count[d.properties[variable]];
            if (counts > 80) return counts / 10;
            if (counts > 40) return counts / 2;
            if (counts > 20) return counts / max * 20;
            if (counts > 10) return counts;
            return (counts ** (embed ? 2.5 : 2.75)) / counts;
        })
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style('opacity', 0.5)
        .on('mouseover', function (d) {
            d3.select(this).style('cursor', 'pointer');
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html('<b>' + toTitleCase(variable, 0) + ' ' + d.srcElement.__data__.properties[variable] + ' ' + '</b> | ' + count[d.srcElement.__data__.properties[variable]] + ' crashes')
                .style('border', `5px solid ${d3.select(this).attr('fill')}`)
                .style('background-color', 'white')
                .style('border-radius', '15px')
                .style('padding', '10px');
        })
        .on('mouseout', function (d) {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function (d) {
            highlight(this, d, variable, 'map');
        });

    cluster(chartData, svg, 'Map', 'circle', dim, embed)
}