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

function highlight(that, d, variable, plot = 'bar') {
    d = d.srcElement.__data__;
    let values = [];
    switch (plot.toLowerCase()) {
        case 'hist':
            values = d.filter((d) => {
                return typeof d === 'string' || d instanceof String;
            })
                .map((d) => { return parseInt(d); }).sort();
            break;
        case 'bar':
            values = [d.x];
            break;
        case 'map':
            values = [d.properties[variable]];
            break;
        default:
            return;
    }
    let levels = JSON.parse(localStorage.getItem('levels'));
    let color = d3.interpolateSinebow(Math.random());
    if (levels) {
        if (d3.select(that).attr('fill') === (plot === 'map' ? 'white' : 'silver')) {
            // while the color or similar is already in use, change it
            while (true) {
                let found = false;
                for (let i = 0; i < levels.length; i++)
                    for (let variable in levels[i])
                        if (Object.values(levels[i][variable]).some((d) => {
                            return deltaE(d, color) < 11;
                        }))
                            found = true;
                if (!found) break;
                color = d3.interpolateSinebow(Math.random());
            }

            let found = false;
            for (let j = 0; j < levels.length; j++) {
                for (let variable in levels[j]) {
                    for (let value in levels[j][variable])
                        if (values.includes(value)) {
                            delete levels[j][variable][value];
                            if (Object.keys(levels[j][variable]).length == 0)
                                delete levels[j][variable];
                            if (Object.keys(levels[j]).length == 0)
                                levels.splice(j, 1);
                            found = true;
                        }
                    if (found) break;
                }
                if (found) break;
            }
            if (!found) {
                let level = {};
                level[variable] = {};
                for (let value of values)
                    level[variable][value] = color;
                levels.push(level);
            }
        } else
            for (let j = 0; j < levels.length; j++)
                for (let variable in levels[j])
                    for (let value = 0; value < values.length; value++)
                        if (Object.keys(levels[j][variable]).includes(values[value].toString())) {
                            delete levels[j][variable][values[value]];
                            if (Object.keys(levels[j][variable]).length == 0)
                                delete levels[j][variable];
                            if (Object.keys(levels[j]).length == 0)
                                levels.splice(j, 1);
                        }
    } else {
        levels = [];
        let level = {};
        level[variable] = {};
        for (let value of values)
            level[variable][value] = color;
        levels.push(level);
    }

    localStorage.setItem('levels', JSON.stringify(levels));
    location.reload();
}