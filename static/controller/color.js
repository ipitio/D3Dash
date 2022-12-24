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

async function color(data, root, element, title) {
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