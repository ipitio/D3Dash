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

function clearLevels(root) {
    // if length of levels in local storage is 0, remove it from local storage
    if (localStorage.getItem('levels')) {
        if (JSON.parse(localStorage.getItem('levels')).length === 0)
            return;
        root.append('button')
            .style('border', '2px solid black')
            .attr('id', 'clear')
            .text('Clear Levels')
            .style('width', '150px')
            .style('position', 'fixed')
            .style('top', 35 + 'px')
            .style('right', 45 + 'px')
            .on('mouseover', function () {
                d3.select(this).style('cursor', 'pointer');

                d3.select('body').append('div')
                    .attr('id', 'tooltip')
                    .style('position', 'fixed')
                    .style('top', 100 + 'px')
                    .style('right', 30 + 'px')
                    .style('background-color', 'white')
                    .style('color', 'grey')
                    .style('border', '2px solid grey')
                    .style('border-radius', '15px')
                    .style('padding', '5px')
                    .style('box-shadow', '0px 0px 130px rgba(150, 152, 154, 0.5)')
                    .text('This will clear ALL levels');
            })
            .on('mouseout', function () {
                d3.select(this).style('cursor', 'default');
                // remove the tooltip
                d3.select('#tooltip').remove();
            })
            .on('click', () => {
                localStorage.removeItem('levels');
                location.reload();
            });
    }
}