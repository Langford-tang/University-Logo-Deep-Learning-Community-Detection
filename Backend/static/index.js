const elem = document.getElementById("3d-graph");
//let mydata = JSON.parse('./graph_try.json');

let jsonname = document.getElementById("3d-graph").getAttribute("class");

let hidNodes = [];
let colorDict = {};

// document.querySelector("#threshold input").value = parseFloat(
//     window.location.href.substring(48, 52)
// );

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
    .linkOpacity(0.8);

let getOffsetLeft = function(obj) {
    var tmp = obj.offsetLeft;
    var val = obj.offsetParent;
    while (val != null) {
        tmp += val.offsetLeft;
        val = val.offsetParent;
    }
    return tmp;
};

let getOffsetTop = function(obj) {
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
    document.onmousemove = function(e) {
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
    document.onmouseup = function() {
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
    function() {
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
    function() {
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

let treshold = document.querySelector("#Treshold");
//let maxdegree = document.querySelector("#MaxDegree")
let submitBtn = document.querySelector("#submit");

submitBtn.addEventListener("click", function(e) {
    e.preventDefault();
    // let formdata = new FormData();
    // formdata.append("treshold", treshold.value);
    // formdata.append("maxdegree", maxdegree.value);
    // data = 'treshold=' + treshold.value + '&maxdegree=' + maxdegree.value;
    fetch("/chpara/" + treshold.value, {
        method: "GET"
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(jsonName) {
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
                .linkOpacity(0.8);
        });
});

// ================== 更改视图

let tempfunc = undefined;

let display = document.querySelector("select");
display.addEventListener("change", function() {
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
        }).onNodeHover((node, prenode) => {});

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

// setTimeout(() => {
//     document
//         .querySelector("#threshold input")
//         .addEventListener("change", function() {
//             console.log(this.value);
//             console.log(window.location.href.substring(0, 48));
//             console.log(this.value == parseInt(this.value));
//             if (parseInt(this.value) == this.value) {
//                 data =
//                     window.location.href.substring(0, 48) +
//                     this.value +
//                     ".0.json";
//             } else {
//                 data =
//                     window.location.href.substring(0, 48) +
//                     this.value +
//                     ".json";
//             }
//             console.log(data);
//             window.location.href = data;
//         });
// }, 1000);
