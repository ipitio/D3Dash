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

function header(title, data, root) {
    const selection = location.href.split('page=')[1]?.split('&arg=')[0] || title;
    const selectionName = buttons[Object.keys(pages).indexOf(selection)] || title;
    const plots = dropdown(root.append('header'), '', selectionName, '10%', `20px + ${selectionName.length}px`, 'fixed', '360px', '', `${window.innerHeight / 16 + 8}px`);

    // add the list of Object.keys(pages) to the menu
    for (let page of Object.keys(pages)) {
        if (page != selection) {
            plots.append('button')
                .style('max-width', '95%')
                .html(`${buttons[Object.keys(pages).indexOf(page)]}<i class='fa-solid fa-circle-arrow-right'></i>`)
                .on('mousedown', function () {
                    history.replaceState({}, '', '?page=' + page + '&arg=' + pages[page]);
                    load(data, root);
                    if (page === 'pcd' || page === 'scatmat')
                        location.reload();
                });
        }
    }
    if (selection !== 'NYC Crash Statistics') {
        plots.append('button')
            .style('max-width', '95%')
            .html("Dashboard<i class='fa-solid fa-circle-arrow-left'></i>")
            .on('mousedown', function () {
                history.replaceState({}, '', '');
                load(data, root, '');
                location.reload();
            });
    }
    plots.append('button')
        .style('max-width', '95%')
        .style('color', 'white')
        .style('background-color', 'rgba(127, 127, 127, 0.5)')
        .html(`<b>Github</b><i class='fa-solid fa-code'></i>`)
        .on('mousedown', function () {
            window.open('https://github.com/ipitio/D3Dash', '_blank');
        })
        .on('mouseover', function () {
            d3.select(this)
                .style('background-color', 'rgba(64, 64, 64, 0.75)')
                .style('box-shadow', '0px 0px 10px rgba(128, 130, 132, 0.75)');
        })
        .on('mouseout', function () {
            d3.select(this)
                .style('background-color', 'rgba(127, 127, 127, 0.5)')
                .style('box-shadow', '0px 0px 0px rgba(0, 0, 0, 0)');
        });
}