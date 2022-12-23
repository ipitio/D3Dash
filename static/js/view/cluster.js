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

async function cluster(data, root, title, element, dim, embed = false) {
    title = title.replace(/\s/g, "");
    let arg = location.search.split('arg=')[1]?.toLowerCase();
    let button = root.append("g")
        .style("transition", "0.3s")
        .attr("id", "cluster-button-" + title)
        .attr("transform", "translate(" + (arg?.includes("zip") ? dim + dim / 4.5 : title == 'PCD' ? embed ? dim / 2 + 35 : dim / 2 + 70 : title == "Map" ? dim / 2 - 75 : dim / 2 - 50) + "," + 10 + ")")
        .on("mouseover", function () {
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("rect")
                .style("stroke-width", "3");
        })
        .on("mouseleave", function () {
            d3.select(this).style("cursor", "default");
            d3.select(this).select("rect")
                .style("stroke-width", "1");
        })
        .on("mousedown", async function () {
            if (!localStorage.getItem('cluster-' + title)) {
                localStorage.setItem('cluster-' + title, true);
                color(data, root, element, title);
            } else {
                localStorage.removeItem('cluster-' + title);
                location.reload();
            };
        });

    button.append("rect")
        .attr("width", 100)
        .attr("height", 30)
        .attr("rx", 15)
        .attr("ry", 15)
        .style("fill", "white")
        .style("stroke", "black")
        .style("stroke-width", 1);

    button.append("text")
        .attr("x", 50)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .html(`<i class='fas fa-boxes'></i>Cluster`);

    if (localStorage.getItem('cluster-' + title))
        color(data, root, element, title);
}

let color = async (data, root, element, title) => {
    d3.select("#cluster-button-" + title).select("rect")
        .style("fill", "black");
    d3.select("#cluster-button-" + title).select("text")
        .style("fill", "white");

    let points = await get("kmeans?method=elbow&data=" + JSON.stringify(data), 0);
    let colors = d3.scaleOrdinal(d3.schemeCategory10);
    root.selectAll(element)
        .style(element.includes("path") ? "stroke" : "fill", function (d, i) {
            if (points[i])
                return colors(points[i][0]);
        });
}