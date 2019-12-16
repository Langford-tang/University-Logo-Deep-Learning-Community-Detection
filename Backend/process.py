import numpy as np
# import matplotlib.pyplot as plt
from igraph import *
import pandas as pd
import requests


# arpack_options.maxiter=300000

def processData(dismatP, namesP, threshold): 

    drawdata = np.load(dismatP)
    names = np.load(namesP)
    # dismat = np.load('./npydata/all_data_k_means/dismat.npy')
    # names = np.load('./npydata/all_data_k_means/names_train.npy')

    np.fill_diagonal(drawdata, 0)

    def cluster_index(index):
        for i, cluster in enumerate(b):
                if index in cluster:
                    return i

    drawdata[drawdata > threshold] = 0

    # for i in range(len(drawdata)):
    #     if sum(drawdata[i] > 0) > 30:
    #         drawdata[:, i:i+1] = 0
    #         drawdata[i:i+1, :] = 0

    g = Graph.Adjacency((drawdata > 0).tolist(), "MAX")
    g.es['weight'] = drawdata[drawdata > 0]
    g.vs['label'] = list(range(len(names)))

    b = g.community_leading_eigenvector(weights=g.es["weight"])
    links = [{"source": a, "target": b} for a in range(drawdata.shape[0]) for b in range(
        drawdata.shape[0]) if drawdata[a, b] > 0 and a < b]
    nodes = [{"id": a, "description": names[a].replace("'", '&#39;').replace(
        '"', "&quot;"), "user": cluster_index(a)} for a in range(drawdata.shape[0]) if np.sum(drawdata[a]) > 0]
    
    filename = 'threshold_' + str(threshold) +'.json'
    with open('./static/' + filename, 'w') as f:
        f.write(str({"links": links, "nodes": nodes}).replace("'", '"'))
    return filename

