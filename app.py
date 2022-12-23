""" * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
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
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * """

import glob
import json as JSON
import os
import socket
import subprocess
import threading
import warnings
import webbrowser
from importlib import util

packages = [
    "python-dotenv",
    "flask",
    "pandas",
    "scikit-learn",
    "pgeocode",
    "pandas_geojson",
]
for pkg in packages:
    if not util.find_spec(pkg):
        subprocess.check_call(["pip3", "install", pkg])
os.chdir(os.path.dirname(__file__))
warnings.filterwarnings("ignore")

import pandas as pd
import pgeocode
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from pandas_geojson import to_geojson
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances
from sklearn.preprocessing import StandardScaler

load_dotenv()

app = Flask(__name__)

csv = os.getenv("DATA")
data = pd.read_csv(csv)
corr = data.corr(numeric_only=True).fillna(0)
numeric = data[data.columns.intersection(corr.columns)]
scaled = StandardScaler().fit_transform(numeric.values)

pca = PCA(len(corr.columns))
pca.fit(scaled)

nomi = pgeocode.Nominatim("us")
data["lat"] = data["ZIPCODE"].apply(lambda x: nomi.query_postal_code(x)["latitude"])
data["long"] = data["ZIPCODE"].apply(lambda x: nomi.query_postal_code(x)["longitude"])


def json(df=corr, n=-1):
    df = df[df.abs().sum().nlargest(n).index] if n > -1 else df
    return df.stack().reset_index().to_json(orient="records")


def sort_df(df):
    sorted_df = df[df.abs().sum().nlargest(2).index]
    for _ in range(len(df.columns) - 2):
        i = 0
        name = sorted_df.columns[i]
        while name in sorted_df.columns:
            name = sorted_df[sorted_df.columns[-1]].abs().nlargest(i + 1).index[-1]
            i += 1
        sorted_df = pd.concat([sorted_df, df[name]], axis=1)
    return sorted_df


def elbow(df):
    distortions = []
    models = []
    for k in range(1, 6):
        kmeanModel = KMeans(k).fit(df)
        models.append(pd.DataFrame(kmeanModel.labels_))
        distortions.append(kmeanModel.inertia_)
    delta = [distortions[i + 1] - distortions[i] for i in range(len(distortions) - 1)]
    elbow = 0
    for i in range(len(delta) - 1):
        if delta[i + 1] / delta[i] if delta[i] else 0 < 0.5:
            elbow = i + 1
    return models[elbow]


@app.errorhandler(404)
def index(e):
    return render_template(
        "index.html", files=glob.glob("static/**", recursive=True), data=csv
    )


@app.route("/<plot>", methods=["GET", "POST"])
def analyze(plot="", arg=""):
    if request and request.args:
        arg = request.args.get("arg")
    match plot:
        case "corrmat":
            return json()
        case "scatmat":
            return json(n=len(data.columns) if int(arg) < 0 else int(arg))
        case "pcd":
            return json(sort_df(corr))
        case "pca":
            return json(pd.DataFrame(PCA(2).fit_transform(scaled)))
        case "scree":
            return jsonify(list(pca.explained_variance_ratio_))
        case "biplot":
            return json(pd.DataFrame(pca.components_))
        case "mds":
            return json(
                pd.DataFrame(
                    MDS(
                        2,
                        random_state=0,
                        dissimilarity="precomputed",
                        n_init=6,
                        n_jobs=-1,
                    ).fit_transform(pairwise_distances(scaled, metric=arg))
                )
            )
        case "map":
            return to_geojson(df=data, lat="lat", lon="long", properties=data.columns)
        case "kmeans":
            df = pd.DataFrame(JSON.loads(request.args.get("data")))
            if len(df) == 0:
                df = numeric
            if len(df.columns) > len(df):
                df = df.T
            match request.args.get("method"):
                case "elbow":
                    return json(elbow(df))
    return json(data)


if __name__ == "__main__":
    PORT = os.getenv("PORT")
    threading.Timer(
        0,
        lambda: webbrowser.open_new_tab("http://" + socket.gethostname() + ":" + PORT),
    ).start()
    app.run(os.getenv("HOST"), int(PORT))
