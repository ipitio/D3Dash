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

async function pageIndex(data, root, dim = 350) {
    if (location.href.slice(-1) !== '/')
        history.replaceState({}, '', location.href.slice(0, -location.href.split('/').pop().length));
    root = root.style('display', 'grid')
        .style('grid-template-columns', '1fr 1fr 1fr')
        .style('grid-template-rows', '1fr 1fr')
        .style('grid-template-areas', "'pageBar pagePCD pageMDS' 'pageHist pageMap pageCorr'")
        .style('width', '98.25%')
        .style('padding-left', '1.75%')
        .style('padding-top', '1%')
        .style('min-height', window.innerHeight - 180 + 'px');
    pageBar(data, root.append('plot').style('grid-area', 'pageBar'), 'NUMERIC TYPE', dim, true);
    pageHist(data, root.append('plot').style('grid-area', 'pageHist'), 'crash time', dim, true);
    pageCorr(root.append('plot').style('grid-area', 'pageCorr'), 8, dim, true);
    pagePCD(data, root.append('plot').style('grid-area', 'pagePCD'), 8, dim, true);
    pageMap(data, root.append('plot').style('grid-area', 'pageMap'), 'ZIPCODE', dim, true);
    pageMDS(data, root.append('plot').style('grid-area', 'pageMDS'), 'euclidean', dim, true);
}

async function pageBar(data, root, arg = 'ZIPCODE', dim, embed = false) {
    const filter = data.columns.filter(d => d === d.toUpperCase());
    let filtered = {};
    filter.forEach(d => {
        filtered[d] = data.map(e => e[d]);
    });
    arg = arg ? arg : filter[0];
    bars(reduce(filtered[arg]), root, dim, arg, arg === filter[0], 0, embed);
    footer(data, root, filter, 'Variable', 0, arg);
}

async function pageHist(data, root, arg = 'crash time', dim, embed = false) {
    const filter = data.columns.filter(d => d === d.toLowerCase());
    let filtered = {};
    filter.forEach(d => {
        filtered[d] = data.map(e => e[d]);
    });
    arg = arg ? arg : filter[1];
    bars(filtered[arg], root, dim, arg, 0, 1, embed);
    footer(data, root, filter, 'Variable', 0, arg);
}

async function pageCorr(root, size = 8, dim, embed = false) {
    const analysis = await get('corrmat');
    const vars = analysis.cols;
    size = Math.min(size, vars.length);
    const matrix = unflatten(analysis.vals, size, size, vars.length);
    corrMat(matrix, vars.slice(0, size), root, dim, embed);
    footer(matrix, root, vars);
}

async function pageScatMat(data, root, size = -1, dim = 50) {
    const analysis = await get('scatmat?arg=' + size);
    let vars = analysis.cols;
    vars = vars.slice(0, Math.min(size, vars.length));
    const scatter = root.append('plot')
        .append('div')
        .style('display', 'grid')
        .style('grid-template-columns', `repeat(${vars.length}, 166px)`)
        .style('grid-template-rows', `repeat(${vars.length}, 166px)`)
        .style('top', vars.length < 6 ? `${100 * (1 / vars.length)}px` : '0')
        .style('position', 'absolute')
        .style('padding-top', `${window.innerHeight / 8}px`)
        .style('padding-bottom', `${window.innerHeight / 8}px`);
    for (let i = 0; i < vars.length; i++)
        for (let j = 0; j < vars.length; j++) {
            if (i == j)
                scatter.append('text')
                    .text(toTitleCase(vars[j], 0));
            else if (i > j) scatter.append('text');
            else scatterPlot(data, vars[j], vars[i], scatter, dim, false, '', null, null, data);
        }
    footer(data, root, (await get('scatmat?arg=-1')).cols);
}

async function pagePCD(data, root, size = 8, dim, embed = false) {
    const analysis = await get('pcd');
    const vars = analysis.cols;
    size = Math.min(size, vars.length);
    const selection = vars.slice(0, size);
    parallelDisplay(trim(data, selection), selection, root, dim, embed);
    footer(data, root, vars);
}

async function pagePCA(data, root, plot = 'pca', dim) {
    if (plot === 'scree') {
        root = root.append('plot').attr('class', 'pageRoot');
        const y = await get('scree', 0)
        scree(y, root, dim);
        data = y;
    } else {
        const analysis = await get('pca');
        const vars = analysis.cols;
        const matrix = unflatten(analysis.vals, data.length, vars.length, vars.length);
        scatterPlot(matrix, 0, 1, root, dim, true, 'PCA', [0, 1], false, data);
        data = matrix;
    }
    const plots = ['pca', 'scree'];
    footer(data, root, plots, 'Plot', 0);
}

async function pageBiplot(data, root, dim) {
    const analysis = await get('pca');
    const vars = analysis.cols;
    const matrix = unflatten(analysis.vals, data.length, vars.length, vars.length);
    const biplosis = await get('biplot');
    const bivars = biplosis.cols;
    const vectors = unflatten(biplosis.vals, bivars.length, bivars.length, 2);
    scatterPlot(matrix, 0, 1, root, dim, true, 'Biplot', vars, vectors, data);
    footer(matrix, root, vectors, 'Components');
}

async function pageMDS(data, root, metric = 'euclidean', dim, embed = false) {
    const analysis = await get('mds?arg=' + metric);
    const vars = analysis.cols;
    const matrix = unflatten(analysis.vals, vars.length, analysis.rows.length, vars.length);
    const metrics = ['euclidean', 'correlation'];
    scatterPlot(matrix, 0, 1, root, dim, true, 'MDS', [0, 1], false, data, embed);
    footer(matrix, root, metrics, 'Metric', 0);
}

async function pageMap(data, root, variable = 'ZIPCODE', dim, embed = false) {
    const analysis = await get('map', 0);
    const vars = data.columns.filter(d => d.toUpperCase() != d || d.includes('ZIP' || d.includes('NUMERIC')));
    proportionalCircle(data, root, dim, analysis, variable, embed);
    footer(data, root, vars, 'Variable', 0);
}