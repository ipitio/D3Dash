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