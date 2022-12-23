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

function dropdown(root, name, selection, bottom, width, listPos, listWidth, listLeft, top, dropUp = false) {

    let menu = root.append('div')
        .attr('class', 'dropdown')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('position', 'absolute')
        .style('margin-left', 'auto')
        .style('margin-right', 'auto')
        .style('z-index', '1000')
        .style('bottom', bottom)
        .style('width', width)
        .on('mouseleave', function () {
            menu.select('.dropdown-content')
                .style('opacity', '0')
                .style('visibility', 'hidden');
        });

    const button = d3.create('button')
        .html(`<i class="fa-solid fa-circle-chevron-${dropUp ? 'up' : 'down'}"></i>
            ${name.concat((name.length > 0 ? ': <b>' : ' <b>').concat(toTitleCase(selection)))}</b>`)
        .style('box-shadow', '0px 0px 130px rgba(150, 152, 154, 0.5)')
        .on('mouseover', function () {
            menu.select('.dropdown-content')
                .style('opacity', '1')
                .style('visibility', 'visible');
        });

    if (!dropUp)
        menu.append(() => button.node());

    const list = menu.append('box')
        .attr('class', 'dropdown-content')
        .style('position', listPos)
        .style('width', listWidth)
        .style('z-index', '1000')
        .style('left', listLeft)
        .style('top', top)
        .style('opacity', '0')
        .style('visibility', 'hidden');

    if (dropUp)
        menu.append(() => button.node());

    return list;
}