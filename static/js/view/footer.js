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

function footer(data, root, all, name = 'Variables', isInt = 1, arg = '') {
    if (!location.href.split('?')[1])
        return;
    let selection = location.href.split('&arg=')[1];
    if (arg)
        selection = selection ? selection : arg;
    selection = isInt || !selection ? selection : toTitleCase(selection, 0).replace(/%20/g, ' ');
    const args = dropdown(root.append('footer'), name, selection, '8%', `20px + ${name.length + selection?.length}px`, 'relative', '100%', '0%', '0px', true);
    const page = location.href.split('page=')[1]?.split('&arg=')[0];
    if (!page) return //root.append('footer');

    // add a list of options to the menu
    if (isInt) {
        for (let i = 2; i <= all.length; i++) {
            if (i != selection) {
                args.append('button')
                    .style('max-width', '90%')
                    .html(`${i}<i class='fa-solid fa-circle-chevron-right'></i>`)
                    .on('mousedown', function () {
                        history.replaceState({}, '', '?page=' + page + '&arg=' + i);
                        load(data, root);
                        location.reload();
                    });
            }
        }
    } else {
        for (let i = 0; i <= all.length; i++) {
            if (all[i]?.toLowerCase() != selection?.toLowerCase() && all[i]?.length > 0) {
                args.append('button')
                    .style('max-width', '90%')
                    .html(`${toTitleCase(all[i], 0)}<i class='fa-solid fa-circle-chevron-right'></i>`)
                    .on('mousedown', function () {
                        history.replaceState({}, '', '?page=' + page + '&arg=' + all[i]);
                        load(data, root);
                        location.reload();
                    });
            }
        }
    }
}