const elem = document.getElementById("3d-graph");
//var mydata = JSON.parse('./graph_try.json');
const Graph = ForceGraph3D()(elem)
    .jsonUrl("./graph_try.json")
    .nodeAutoColorBy("user")
    .nodeLabel(node => `${node.user}: ${node.description}`)
    .onNodeHover(node => (elem.style.cursor = node ? "pointer" : null))
    .onNodeClick(node => {
        console.log(this);
    });
