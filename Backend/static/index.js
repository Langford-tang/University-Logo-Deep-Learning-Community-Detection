const elem = document.getElementById("3d-graph");
//let mydata = JSON.parse('./graph_try.json');

let jsonname = document.getElementById("3d-graph").getAttribute("class");

let hidNodes = [];
let colorDict = {};
let clusterCount = 20;
// document.querySelector("#threshold input").value = parseFloat(
//     window.location.href.substring(48, 52)
// );

let clusterChanger = document.querySelector('.Cluster_Changer select');
for (let i = 0; i < clusterCount; i++) {
    option = document.createElement('option');
    option.setAttribute('value', 'cluster' + i.toString());
    option.innerText = 'Cluster' + i.toString();
    clusterChanger.appendChild(option);
}

function changeCluster(name) {
    fetch("/chcluster/" + name, {
        method: "GET"
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonName) {
            console.log(jsonName)
            hidNodes = [];
            colorDict = {};
            Graph = ForceGraph3D()(elem)
                .jsonUrl('../static/' + jsonName)
                .nodeAutoColorBy("user")
                .nodeLabel(node => {
                    colorDict[node.user] = node.color;
                    return node.user + " : " + node.description;
                })
                .onNodeHover(hoverfunc)
                .onNodeClick(clickfunc)
                .linkOpacity(0.4);
            document.getElementById('Threshold').setAttribute('value', 30);
        });
}

clusterChanger.addEventListener('change', function () {
    changeCluster(this.value);
});

function changeDisplay() {
    let gData = Graph.graphData();
    Graph.nodeThreeObject(node => {
        // use a sphere as a drag handle
        const obj = new THREE.Mesh(
            new THREE.SphereGeometry(7),
            new THREE.MeshBasicMaterial({
                depthWrite: false,
                transparent: true,
                opacity: 0
            })
        );

        // add img sprite as child
        const imgTexture = new THREE.TextureLoader().load(
            "static/" + getFileName(node)
        );
        const material = new THREE.SpriteMaterial({ map: imgTexture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(12, 12);
        obj.add(sprite);

        return obj;
    });
}

function hoverfunc(node, preNode) {
    Graph.nodeColor(node => {
        if (hidNodes.indexOf(node) !== -1) {
            return "rgba(0,0,0,0)";
        } else {
            return colorDict[node.user];
        }
    });

    hidNodes = [];
    if (node) {
        Graph.graphData().nodes.forEach(element => {
            if (element.user !== node.user) {
                hidNodes.push(element);
            }
        });
    }
    updateGraph();
    elem.style.cursor = node ? "pointer" : null;
}

function clickfunc(node) {
    Graph.pauseAnimation();
    // console.log(node);
    // console.log(node.user);
    // console.log(node.description);
    // let [nodeName, country] = node.description.split("_");
    let img = document.querySelector(".image-container img");
    img.setAttribute("src", getFileName(node));
    img.setAttribute("title", node.description);
    img.setAttribute("alt", node.description);
    updateSameCluster(node);
    Graph.resumeAnimation();
}

function updateGraph() {
    Graph.graphData().nodes.forEach(element => {
        // console.log(element.color);
        colorDict[element.user] = element.color;
    });

    Graph.nodeRelSize(Graph.nodeRelSize());
}

let Graph = ForceGraph3D()(elem)
    .jsonUrl("../static/" + jsonname)
    .nodeAutoColorBy("user")
    .nodeLabel(node => {
        colorDict[node.user] = node.color;
        return node.user + " : " + node.description;
    })
    .onNodeHover(hoverfunc)
    .onNodeClick(clickfunc)
    .linkOpacity(0.4);

let getOffsetLeft = function (obj) {
    var tmp = obj.offsetLeft;
    var val = obj.offsetParent;
    while (val != null) {
        tmp += val.offsetLeft;
        val = val.offsetParent;
    }
    return tmp;
};

let getOffsetTop = function (obj) {
    var tmp = obj.offsetTop;
    var val = obj.offsetParent;
    while (val != null) {
        tmp += val.offsetTop;
        val = val.offsetParent;
    }
    return tmp;
};

// =============================== 拖拽

let leftSidebar = document.querySelector(".left-sidebar");
// let rightSidebar = document.querySelector(".right-sidebar");

leftSidebar.onmousedown = dragBox;
// rightSidebar.onmousedown = dragBox;
function dragBox(ex) {
    target = this;
    let x = ex.clientX - getOffsetLeft(target);
    let y = ex.clientY - getOffsetTop(target);
    //let x = ex.clientX - target.offsetLeft;
    //let y = ex.clientY - target.offsetTop;
    document.onmousemove = function (e) {
        let l = e.clientX - x;
        let t = e.clientY - y;
        if (l < 0) {
            l = 0;
        } else if (
            l >
            document.documentElement.clientWidth - target.offsetWidth
        ) {
            l = document.documentElement.clientWidth - target.offsetWidth;
        }
        if (t < 0) {
            t = 0;
        } else if (
            t >
            document.documentElement.clientHeight - target.offsetHeight
        ) {
            t = document.documentElement.clientHeight - target.offsetHeight;
        }
        target.style.left = l + "px";
        target.style.top = t + "px";
        let windowMoveEv = new Event(
            "floatWindowMove" /*, {
                'cancelable': true,
            }*/
        );
        windowMoveEv.self = target;
        windowMoveEv.positionX = l;
        windowMoveEv.positionY = t;
        //windowMoveEv.preventDefault = function(){windowMoveEv.defaultPrevented = true;}
        //that.fire(windowMoveEv);
    };
    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
    };
    return false;
}

// ============================= 添加同一个cluster的图片

function getFileName(node) {
    return "../static/imgs/train/" + node.description + ".jpeg";
}

function genImg(node) {
    let container = document.createElement("div");
    container.classList.add("image-container");
    let elem = document.createElement("img");
    elem.setAttribute("src", getFileName(node));
    elem.setAttribute("title", node.description);
    elem.setAttribute("alt", node.description);
    elem.classList.add("same-cluster");
    container.appendChild(elem);
    return container;
}

function updateSameCluster(node) {
    let container = document.querySelector(".cluster-container");
    container.innerHTML = ""; //
    Graph.graphData().nodes.forEach(element => {
        if (element.user === node.user && node.id !== element.id) {
            document
                .querySelector(".cluster-container")
                .appendChild(genImg(element));
            console.log("added elemnt")
        }
    });
}

// =========================== 控制

var volumeSlider = document.getElementById("volume");
document.getElementById("volume").addEventListener(
    "input",
    function () {
        update();
    },
    false
);

function update() {
    var sldinput = volumeSlider.querySelector(".slider-input");
    var sldthumb = volumeSlider.querySelector(".slider-thumb");
    var sldlevel = volumeSlider.querySelector(".slider-level");
    var val = parseInt(sldinput.value);
    sldthumb.style.left = val * 5 + "%";
    sldthumb.textContent = val;
    sldlevel.style.width = val * 5 + "%";
    Graph.nodeRelSize(val);
}

let imgsize = document.getElementById("ImageSize");
document.getElementById("ImageSize").addEventListener(
    "input",
    function () {
        updateImageSizeBtn();
    },
    false
);

function updateImageSizeBtn() {
    var sldinput = imgsize.querySelector("#slider-input");
    var sldthumb = imgsize.querySelector("#slider-thumb");
    var sldlevel = imgsize.querySelector("#slider-level");
    var val = parseInt(sldinput.value);
    sldthumb.style.left = val + "%";
    sldthumb.textContent = val + "%";
    sldlevel.style.width = val + "%";
    updateImageSize(val / 25);
    // Graph.nodeRelSize(val);
}

// function updateForm() {
//     var sldinput = volumeSlider.querySelector(".slider-input");
//     var sldthumb = volumeSlider.querySelector(".slider-thumb");
//     var sldlevel = volumeSlider.querySelector(".slider-level");
//     var val = parseInt(sldinput.value);
//     sldthumb.style.left = val * 5 + "%";
//     sldthumb.textContent = val;
//     sldlevel.style.width = val * 5 + "%";
//     Graph.nodeRelSize(val);
// }

// ========================= 更新数据

let threshold = document.querySelector("#Threshold");
//let maxdegree = document.querySelector("#MaxDegree")
let submitBtn = document.querySelector("#submit");

submitBtn.addEventListener("click", function (e) {
    e.preventDefault();
    // let formdata = new FormData();
    // formdata.append("threshold", threshold.value);
    // formdata.append("maxdegree", maxdegree.value);
    // data = 'threshold=' + threshold.value + '&maxdegree=' + maxdegree.value;
    fetch("/chpara/" + threshold.value, {
        method: "GET"
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonName) {
            console.log(jsonName)
            hidNodes = [];
            colorDict = {};
            Graph = ForceGraph3D()(elem)
                .jsonUrl('../static/' + jsonName)
                .nodeAutoColorBy("user")
                .nodeLabel(node => {
                    colorDict[node.user] = node.color;
                    return node.user + " : " + node.description;
                })
                .onNodeHover(hoverfunc)
                .onNodeClick(clickfunc)
                .linkOpacity(0.4);
        });
});

// ================== 更改视图

let tempfunc = undefined;

let display = document.querySelector(".right-sidebar select");
display.addEventListener("change", function () {
    console.log(this.value);
    if (this.value === "Image") {
        tempfunc = Graph.nodeThreeObject();
        Graph.nodeThreeObject(node => {
            // use a sphere as a drag handle
            const obj = new THREE.Mesh(
                new THREE.SphereGeometry(7),
                new THREE.MeshBasicMaterial({
                    depthWrite: false,
                    transparent: true,
                    opacity: 0
                })
            );
            // add img sprite as child
            const imgTexture = new THREE.TextureLoader().load(
                getFileName(node)
            );
            const material = new THREE.SpriteMaterial({ map: imgTexture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(12, 12);
            obj.add(sprite);
            return obj;
        }).onNodeHover((node, prenode) => { });

        document
            .querySelector(".slider-input")
            .setAttribute("disabled", "disabled");
        document.querySelector("#slider-input").removeAttribute("disabled");
    } else {
        Graph.nodeThreeObject(tempfunc).onNodeHover(hoverfunc);
        document.querySelector(".slider-input").removeAttribute("disabled");
        document
            .querySelector("#slider-input")
            .setAttribute("disabled", "disabled");
    }
});

function updateImageSize(newSize) {
    Graph.graphData().nodes.map(node => {
        node.__threeObj.scale.x = newSize;
        node.__threeObj.scale.y = newSize;
        node.__threeObj.scale.z = newSize;
    });
}

// ============================== 搜索框


let searchBox = document.querySelector('.search-txt')
let searchButton = document.querySelector(".search-box input[type='submit']")
searchButton.addEventListener('click', function (e) {
    e.preventDefault();

    let id = searchBox.value;
    let gData = Graph.graphData();

    fetch("/search/" + id, {
        method: "GET"
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data) {
                for (const [key, value] of Object.entries(data.prediction)) {
                    changeCluster('cluster' + value.toString())
                    clusterChanger.selectedIndex = value;
                }
            }



            setTimeout(function () {
                for (node of gData.nodes) {
                    if (node.description.indexOf(id) > -1) {
                        const distance = 40;
                        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

                        Graph.cameraPosition(
                            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                            node, // lookAt ({ x, y, z })
                            3000  // ms transition duration
                        );
                        break;
                    }
                }
            }, 2000);

        });



})