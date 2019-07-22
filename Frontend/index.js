const elem = document.getElementById("3d-graph");
//let mydata = JSON.parse('./graph_try.json');

const Graph = ForceGraph3D()(elem)
    .jsonUrl("./graph_try_all.json")
    .nodeAutoColorBy("user")
    .nodeLabel(node => `${node.user}: ${node.description}`)
    .onNodeHover(node => (elem.style.cursor = node ? "pointer" : null))
    .onNodeClick(node => {
        Graph.pauseAnimation();
        console.log(node);
        console.log(node.user);
        console.log(node.description);
        // let [nodeName, country] = node.description.split("_");
        document
            .querySelector(".image-container img")
            .setAttribute("src", "./imgs/train/" + node.description + ".jpeg");

        Graph.resumeAnimation();
    });

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
let rightSidebar = document.querySelector(".right-sidebar");

leftSidebar.onmousedown = dragBox;
rightSidebar.onmousedown = dragBox;
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

// ============================= 控制
