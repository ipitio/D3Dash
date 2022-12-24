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

async function get(analysis, df = 1) {
    const json = await (await fetch(location.origin + '/' + analysis, { method: 'POST' })).json();
    if (analysis !== 'scree' && df) {
        let data = [];
        for (let i = 0; i < 3; i++) {
            data.push([]);
            for (let j = 0; j < json.length; j++) {
                data[i].push(i === 0 ? json[j][0] : i === 1 ? json[j].level_0 : json[j].level_1);
            }
        }
        let vals = data[0];
        let cols = [...new Set(data[2])];
        let rows = [...new Set(data[1])];
        return { 'data': data, 'vals': vals, 'cols': cols, 'rows': rows };
    }
    return json;
}

function getColumnData(data, col) {
    let columnData = [];
    data.forEach(function (d) { columnData.push(d[col]); });
    return columnData;
}

function range(start, end) {
    const sign = start > end ? -1 : 1;
    return Array.from(
        { length: Math.abs(end - start) + 1 },
        (_, i) => start + i * sign
    );
}

function toTitleCase(str, keepUpper = 1, buf = []) {
    if (str === str.toLowerCase() && str.length < 5) {
        str = str.toUpperCase()
    }
    str = str.split(' ');
    for (let i = 0; i < str.length; i++) {
        buf.push(str[i].replace(
            /\w\S*/g, (txt) => {
                let head = txt.charAt(0).toUpperCase();
                let tail = txt.substring(1);
                return head + (keepUpper || txt.length < 4 ? tail : tail.toLowerCase());
            }
        ));
    }
    return buf.join(' ');
}

function trim(data, vars) {
    let trimmed = [];
    for (let i = 0; i < data.length; i++) {
        trimmed.push({});
        for (let j = 0; j < vars.length; j++) {
            trimmed[i][vars[j]] = data[i][vars[j]];
        }
    }
    return trimmed;
}

function unflatten(data, cols, rows, len) {
    let matrix = [];
    for (let i = 0; i < cols; i++) {
        matrix.push([]);
        for (let j = 0; j < rows; j++) {
            matrix[i].push(data[i * len + j]);
        }
    }
    return matrix;
}

function reduce(columnData, reduce = 0) {

    if (reduce) {
        // return the [reduce] most frequent values
        let commonData = [];
        let values = [];
        columnData.forEach(function (d) {
            if (values.includes(d)) {
                commonData[values.indexOf(d)] += 1;
            } else {
                values.push(d);
                commonData.push(1);
            }
        });
        let temp = [];
        for (let i = 0; i < reduce; i++) {
            temp.push(values[commonData.indexOf(d3.max(commonData))]);
            commonData[commonData.indexOf(d3.max(commonData))] = 0;
        }

        columnData.forEach(function (d) {
            if (!temp.includes(d)) {
                columnData[columnData.indexOf(d)] = 'Other';
            }
        });
    }

    // create a dictionary of the frequencies of the values in columnData
    let chartData = {};
    columnData.forEach(function (d) {
        if (d in chartData) {
            chartData[d] += 1;
        } else {
            chartData[d] = 1;
        }
    });

    // sort the dictionary by values
    let sorted = Object.fromEntries(
        Object.entries(chartData).sort(([, a], [, b]) => b - a)
    );

    sorted = Object.entries(chartData).map(function (d) {
        return {
            x: d[0],
            y: d[1]
        }
    });

    return sorted.sort((a, b) => b.y - a.y);
};

// https://stackoverflow.com/a/52453462
function deltaE(rgbA, rgbB) {
    let labA = rgb2lab(rgbA);
    let labB = rgb2lab(rgbB);
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb, str = 1) {
    if (str) rgb = parse_rgb_string(rgb);
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

function parse_rgb_string(rgb) {
    rgb = rgb.replace(/[^\d,]/g, '').split(',');
    return rgb;
}