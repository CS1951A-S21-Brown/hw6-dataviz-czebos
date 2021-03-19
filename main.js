
// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 700;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 500;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;




function render(year) {
    d3.select("#graph1").selectAll("*").remove()
    let svg = d3.select("#graph1")
        .append("svg")
        .attr("width", 600)
        .attr("height", graph_1_height)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    let title1 = svg.append("text")
        .attr("transform", "translate(" + graph_1_width / 8 + ",-20)")
        .style("text-anchor", "middle")
        .style("font-size", 25).text("Games Played By Teams in Year " + year);

    let lab = svg.append("text")
        .attr("transform", "translate(" + graph_1_width / 8 + ",0)")    
        .style("text-anchor", "middle")
        .style("font-size", 20)
    d3.csv('/data/football.csv').then(function (data) {
        new_data = cleanData(data, year)
        nodes = Array.from(new_data[0])
        new_nodes = []
        var i = 0;
        var total = 0;
        for (i = 0; i < nodes.length; i++) {
            new_nodes.push({ 'id': nodes[i], 'val': new_data[2][nodes[i]] })
            total += new_data[2][nodes[i]]
        }

        lab.text("Total: " + total / 2);

        nodes = new_nodes
        var link = svg.selectAll("line")
            .data(new_data[1])
            .enter().append("line").style("stroke", "#aaa")

        var node = svg
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", 10)
            .style("fill", "#69b3a2")
            .style("fill", "#69b3a2")
            .on('mouseover', function (d, i) {
                d3.select(this.parentNode).append("text")
                    .attr("x", function () {
                        return d.x;
                    })
                    .attr("y", function () {
                        return d.y;
                    })
                    .attr("class", "mylabel")
                    .text(function () {
                        return d.id + ": " + d.val + " games";
                    });
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '.5')
            })
            .on('mouseout', function (d, i) {
                d3.selectAll('.mylabel').remove()
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '1')
            });


        var simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink().id(function (d) { return d.id }).links(new_data[1]))
            .force("collide", d3.forceCollide().radius(function (d) {
                return d.radius
            }))
            .force("charge", d3.forceManyBody().strength(-5))
            .force("center", d3.forceCenter(graph_1_width / 10, graph_1_height / 2 + 20))
            .tick(100)
            .on("end", ticked);



        function ticked() {
            link.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; })
            node.attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y })
        }
    })
}

render('1998')

function cleanData(data, year) {
    var i;
    var newList = [];
    var keys = new Set();
    var dict = {};
    for (i = 0; i < data.length; i++) {
        if (data[i].date.includes(year)) {
            if (!keys.has(data[i].home_team)){
                dict[data[i].home_team] = 0
            }
            if (!keys.has(data[i].away_team)) {
                dict[data[i].away_team] = 0
            }
            keys.add(data[i].home_team)
            keys.add(data[i].away_team)
            dict[data[i].home_team] += 1
            dict[data[i].away_team] += 1

            newList.push({ 'source': data[i].home_team, 'target': data[i].away_team })

        }
    }
    return [keys, newList, dict]
}

function cleanData3(data, year) {
    var i;
    var newList = [];
    var keys = new Set();
    var dict = {};
    for (i = 0; i < data.length; i++) {
        if (data[i].date.includes(year) && data[i].tournament.localeCompare('FIFA World Cup') == 0) {
            keys.add(data[i].away_team)
            keys.add(data[i].home_team)

        }
    }

    var nodes = Array.from(keys)
    var vals = {}
    for (i = 0; i < nodes.length; i++) {
        var j;
        for (j = 0; j < data.length; j++) {
            if (data[j].date.includes(year) && data[j].tournament.localeCompare('FIFA World Cup') == 0 && (data[j].away_team.localeCompare(nodes[i]) == 0 || data[j].home_team.localeCompare(nodes[i]) == 0)) {
                if (data[j].away_team.localeCompare(nodes[i]) == 0) {
                    if (nodes[i] in vals) {
                        vals[nodes[i]].push(parseInt(data[j].away_score))
                        vals[nodes[i]].push(-parseInt(data[j].home_score))

                    } else {
                        vals[nodes[i]] = [parseInt(data[j].away_score), -parseInt(data[j].home_score)]
                    }
                } else {
                    if (nodes[i] in vals) {
                        vals[nodes[i]].push(parseInt(data[j].home_score))
                        vals[nodes[i]].push(-parseInt(data[j].away_score))

                    } else {
                        vals[nodes[i]] = [parseInt(data[j].home_score), -parseInt(data[j].away_score)]
                    }

                }
            }
        }

    }

    objs = []

    for (var key in vals) {
        objs.push({'name': key, 'vals': vals[key]})
    }

    return objs
}

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", 700)
    .attr("height", 700)
    .append("g")

var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(120)
    .center([0, 20])
    .translate([graph_2_width / 4, graph_2_height - 100 ]);

var datam = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([.25, .35, .425, .50, .575, .65, .75, .8])
    .range(d3.schemeGreens[8]);



Promise.all([d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"), d3.csv("/data/football.csv")]).then(function (data) {
    winP = getWinP(data[1])
    svg2.append("g")
        .selectAll("path")
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("fill", function (d) {
            if (d.properties.name.localeCompare('USA') == 0) {
                //return colorScale(getCategory(winP["United States"]))
            }
            if (d.properties.name.localeCompare('China') == 0) {
                //return colorScale(getCategory(winP["China PR"]))
            }
            if (getCategory(winP[d.properties.name]) == -1) {
                return "#BDBDBD"
            }
            return colorScale(getCategory(winP[d.properties.name]));
        })
    .on('mouseover', function (d, i) {
        svg2.append("text")
            .attr("x", function () {
                return 150;
            })
            .attr("y", function () {
                return 50;
            })
            .attr("class", "mylabel")
            .text(function () {
                var val = winP[d.properties.name]
                if (d.properties.name.localeCompare('USA') == 0) {
                    val =  winP["United States"]
                }
                if (d.properties.name.localeCompare('China') == 0) {
                    val = winP["China PR"]
                }
                if (!val) {
                    val = 'N/A'
                } 
                return "Win Percentage of " + d.properties.name + ": " + val;
            });
    })
        .on('mouseout', function (d, i) {
            d3.selectAll('.mylabel').remove()
        });
})

let title = svg2.append("text")
    .attr("transform", "translate( 270,20)")  

    .style("text-anchor", "middle")
    .style("font-size", 25).text("Win Percentage of Top 10 Nations");


function getCategory(perc) {
    if (perc < .7) {
        return .25
    } else if (perc < .72) {
        return .35
    } else if (perc < .733) {
        return .425
    }
    else if (perc < .7349) {
        return .5
    }
    else if (perc < .74) {
        return .575
    }
    else if (perc < .76) {
        return .65
    } else if (perc <.79) {
        return .75
    } else if (perc < 1){
        return .8
    }
    return -1;

}

function getWinP(data) {
    var keys = new Set();
    var dict1 = {};
    var dict2 = {};

    for (i = 0; i < data.length; i++) {
            if (!keys.has(data[i].home_team)) {
                dict1[data[i].home_team] = 0
                dict2[data[i].home_team] = 0
            }
            if (!keys.has(data[i].away_team)) {
                dict1[data[i].away_team] = 0
                dict2[data[i].away_team] = 0
            }
            keys.add(data[i].home_team)
            keys.add(data[i].away_team)
            if (data[i].home_score != data[i].away_score) {
                dict1[data[i].home_team] += 1
                dict1[data[i].away_team] += 1
                if (data[i].home_score > data[i].away_score) {
                    dict2[data[i].home_team] += 1
                } else {
                    dict2[data[i].away_team] += 1
                }
            }


        
    }
    nodes = Array.from(keys)
    res = {}
    top10 = []
    for (i = 0; i < nodes.length; i++) {
        res[nodes[i]] = dict2[nodes[i]] / dict1[nodes[i]]
        if (top10.length < 35) {
            top10.push(nodes[i])
        } else {
            let minI = -1;
            let minV = 0;
            var j = 0;
            for (j = 0; j < top10.length; j++) {
                if (res[top10[j]] < res[nodes[i]]) {
                    if (minI == -1) {
                        minI = j
                        minV = res[top10[j]] 
                    } else {
                        if (res[top10[j]] < minV) {
                            minI = j
                            minV = res[top10[j]] 
                        }
                    }

                }
            }
            if (minI != -1) {
                top10[minI] = nodes[i]
            }
        }

    }

    new_res = {}
    for (i = 0; i < top10.length; i++) {
        new_res[top10[i]] = res[top10[i]]
    }

    return new_res


}



function render2(year) {

    d3.select("#graph3").selectAll("*").remove()

    let svg3 = d3.select("#graph3")
        .append("svg")
        .attr("width", 700)
        .attr("height", 650)
        .append("g").attr("transform", "translate(20, 20)")


    let title2 = svg3.append("text")
        .attr("transform", "translate( 300,0)")

        .style("text-anchor", "middle")
        .style("font-size", 25).text("Score Differential By World Cup");

    d3.csv('/data/football.csv').then(function (data) {
        new_data = cleanData3(data, year);
        title2.text("Score Differential of World Cup " + year)


        //var sumstat = d3.nest()
        //    .key(function (d) { return d.key })
        //    .rollup(function (d) {
        //        d.map(function (g) { return g.vals; })
        //        var q1 = d3.quantile(d.vals.sort(d3.ascending), .25)
        //        var median = d3.quantile(d.vals.sort(d3.ascending), .5)
        //        var q3 = d3.quantile(d.vals.sort(d3.ascending), .75)
        //        var interQuantileRange = q3 - q1
        //        var min = q1 - 1.5 * interQuantileRange
        //        var max = q3 + 1.5 * interQuantileRange
        //        return { 'q1': q1, 'median': median, 'q3': q3, 'interQuantileRange': interQuantileRange, 'min': min, 'max': max }

        //    }).entries(new_data)

        var i;
        for (i = 0; i < new_data.length; i++) {
            var q1 = d3.quantile(new_data[i].vals.sort(d3.ascending), .25)
            var median = d3.quantile(new_data[i].vals.sort(d3.ascending), .5)
            var q3 = d3.quantile(new_data[i].vals.sort(d3.ascending), .75)
            var interQuantileRange = q3 - q1
            var min = q1 - 1.5 * interQuantileRange
            var max = q3 + 1.5 * interQuantileRange
            new_data[i].sumstat = { 'q1': q1, 'median': median, 'q3': q3, 'interQuantileRange': interQuantileRange, 'min': min, 'max': max }
        }

        new_data = new_data.sort(function (a, b) { return b.sumstat.q3 - a.sumstat.q3 })

        var myColor = d3.scaleSequential().domain([.5, 3])
            .interpolator(d3.interpolateViridis);

        console.log(myColor)

        console.log(new_data)

        var x = d3.scaleBand()
            .range([20, 700])
            .domain(new_data.map(function (d) { return d.name }))
            .paddingInner(1)
            .paddingOuter(.5)


        svg3.append("g")
            .attr("transform", "translate(0, 550)")
            .style("top", "40px")
            .style("margin-top", "40px")
            .style("font-size", 18)
            .attr("writing-mode", "vertical-rl")

        var y = d3.scaleLinear()
            .domain([-14, 7])
            .range([700, 0])

        const adju = 20

        svg3
            .selectAll("botText")
            .data(new_data)
            .enter()
            .append("text")
            .attr("x", function (d) { return (x(d.name)) })
            .attr("y", function (d) { return (y(d.sumstat.min)) + 5 + adju })
            .style("font-size", 18)
            .text(function (d) { return d.name })
            .attr("writing-mode", "vertical-rl")



        svg3.append("g").call(d3.axisLeft(y))
            .attr("transform", "translate(20, 20)")


        svg3
            .selectAll("vertLines")
            .data(new_data)
            .enter()
            .append("line")
            .attr("x1", function (d) { return (x(d.name)) })
            .attr("x2", function (d) { return (x(d.name)) })
            .attr("y1", function (d) { return (y(d.sumstat.min) + adju) })
            .attr("y2", function (d) { return (y(d.sumstat.max) + adju) })
            .attr("stroke", "black")
            .style("width", 40)

        var boxWidth = 10
        svg3
            .selectAll("boxes")
            .data(new_data)
            .enter()
            .append("rect")
            .attr("x", function (d) { return (x(d.name) - boxWidth / 2) })
            .attr("y", function (d) { return (y(d.sumstat.q3)) + adju })
            .attr("height", function (d) { return (y(d.sumstat.q1) - y(d.sumstat.q3)) })
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", function (d) { return myColor(d.sumstat.q3) })

        svg3
            .selectAll("medianLines")
            .data(new_data)
            .enter()
            .append("line")
            .attr("x1", function (d) { return (x(d.name) - boxWidth / 2) })
            .attr("x2", function (d) { return (x(d.name) + boxWidth / 2) })
            .attr("y1", function (d) { return (y(d.sumstat.median)) + adju })
            .attr("y2", function (d) { return (y(d.sumstat.median)) + adju })
            .attr("stroke", "black")
            .style("width", 80)
    })

}

render2('2018')
