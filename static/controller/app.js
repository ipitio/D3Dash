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

var pages = {
    'bar': 'ZIPCODE',
    'hist': 'crash time',
    'corrmat': '8',
    'scatmat': '8',
    'pcd': '8',
    'pca': 'pca',
    'biplot': '8',
    'mds': 'euclidean',
    'map': 'ZIPCODE'
};

var buttons = ['Bar Chart',
    'Histogram',
    'Correlation Matrix',
    'Scatterplot Matrix',
    'Parallel Coordinates',
    'PCA',
    'Biplot',
    'MDS',
    'Map'
];

var cars = ['Sedan',
    'Tanker',
    'SUV',
    'Bus',
    'Taxi',
    'Ambulance',
    'Bike',
    'Box Truck',
    'Motorcycle',
    'E-Scooter',
    'E-Bike',
    'Flat Bed',
    'Dump',
    'Pick-up Truck'
]

async function app(file) {
    d3.csv(file).then((data) => { load(data); });
}

function load(data, root = d3.select('body'), page = location.search.split('page=').pop(), arg = location.search.split('arg=').pop(), dim = 500) {
    root.selectAll('*').remove();
    arg = arg.replace(/%20|\+/g, ' '); // replace %20 or + with space
    header('NYC Crash Statistics', data, root);
    root = root.append('plot').attr('class', 'pageRoot');
    clearLevels(root);
    switch (true) {
        case /^bar.*/i.test(page):
            return pageBar(data, root, arg, dim);
        case /^hist.*/i.test(page):
            return pageHist(data, root, arg, dim);
        case /^corrmat.*/i.test(page):
            return pageCorr(root, arg, dim);
        case /^scatmat.*/i.test(page):
            return pageScatMat(data, root, arg);
        case /^pcd.*/i.test(page):
            return pagePCD(data, root, arg, dim);
        case /^pca.*/i.test(page):
            return pagePCA(data, root, arg, dim);
        case /^biplot.*/i.test(page):
            return pageBiplot(data, root, dim);
        case /^mds.*/i.test(page):
            return pageMDS(data, root, arg.includes('?') || arg === '' ? 'euclidean' : arg, dim);
        case /^map.*/i.test(page):
            return pageMap(data, root, arg, dim);
        default:
            return pageIndex(data, root);
    }
}