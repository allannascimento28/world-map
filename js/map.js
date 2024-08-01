var margin = { top: 20, right: 20, bottom: 40, left: 40 },
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    sens = 0.25,
    focused;

var speed = -0.15,
    start = 0;

var colorList = [
    "#e9e9f8", "#e2e2f6", "#dcdcf4", "#d6d6f2", "#cfcff0", "#c9c9ee", "#c3c3ed", "#bdbdeb",
    "#aaaae5", "#a4a4e3", "#9d9de1", "#9797df", "#9191dd", "#8a8adc", "#8484da", "#7e7ed8",
    "#6b6bd0", "#6565d0", "#5f5fce", "#5858cc", "#5252cb", "#4c4cc9", "#4646c7", "#3f3fc5",
    "#3636b5", "#3434af", "#3333a9", "#3131a3", "#2f2f9c", "#2d2d96", "#2b2b90", "#292989",
    "#232377", "#222270", "#20206a", "#1e1e64", "#1c1c5e", "#1a1a57", "#181851", "#16164b"
];

var datasets = [
    {
        active: true,
        url: "https://gist.githubusercontent.com/cpietsch/9b8254b1608e2fc6de58dc561d77e81f/raw/dead294663def98f00f8cc4d3df024a0f26a9257/meat.csv",
    }
];

var tipClicked = false;

var projections = [
    {
        name: "globe",
        active: true,
        initialScale: 245,
        clipAngle: 90,
        geo: d3.geo
            .orthographic()
            .scale(245)
            .rotate([0, 0])
            .translate([width / 2, height / 2])
            .clipAngle(90),
    },
    {
        name: "map",
        active: true,
        initialScale: 245 / 1.5,
        clipAngle: null,
        geo: d3.geo
            .winkel3()
            .scale(245 / 1.5)
            .translate([width / 2, height / 2])
            .rotate([0, 0]),
    },
    {
        name: "map",
        active: true,
        initialScale: 245 / 2.5,
        clipAngle: null,
        geo: d3.geo
            .mercator()
            .scale(245 / 2.5)
            .translate([width / 2, height / 2])
            .rotate([0, 0]),
    },
];

var scales = [
    {
        name: "linear",
        scale: d3.scale.linear().range([0, width]),
    },
    {
        name: "linear",
        scale: d3.scale.linear().range([height, 0]),
    },
];

var state = {
    mode: "globe",
    projection: projections[0],
    dataset: datasets[0],
    scale: 1,
    translate: [0, 0],
    play: false,
    x: scales[0],
    y: scales[1],
};

var xAxis = d3.svg.axis().scale(state.x.scale).orient("bottom");

var yAxis = d3.svg
    .axis()
    .scale(state.y.scale)
    .orient("left")
    .tickFormat(d3.format("s"));

var tip = d3.tip().attr("class", "d3-tip").offset([-5, 0]);

var path = d3.geo.path().projection(state.projection.geo);

var scale = 1;
var translate = [0, 60];
var rotate;

var zoom = d3.behavior
    .zoom()
    .center([0, 0])
    .translate(translate)
    .on("zoom", function (d) {
        scale = d3.event.scale;
        translate = d3.event.translate;
        rotate = state.projection.geo.rotate();

        // console.log("zoom", d3.event);

        state.projection.geo
            .rotate([
                (translate[0] / scale) * sens,
                -(translate[1] / scale) * sens,
                0,
            ])
            .scale(state.projection.initialScale * d3.event.scale);

        inner.selectAll("path").attr("d", function (d) {
            return d.geometry ? path(d.geometry) : path(d);
        });
    });

var menu = d3
    .select("body")
    .append("div")
    .classed("menu", true)
    .classed("side", true);

menu.append("div")
    .classed("button", true)
    .text("Globe")
    .on("click", function () {
        transform2d(0);
    });
// .append("img")
// .attr("src", "img/globe.svg")

//the MAP button
menu.append("div")
    .classed("button", true)
    .text("Map")
    .on("click", function () {
        transform2d(1);
    });
// .append("img")
// .attr("src", "img/map.svg")

var menuTitle = menu.append("div")
    .classed("title", true);

    menuTitle.append("h3")
    .classed("head-title", true)
    .text("Bring to your country");

    menuTitle.append("p")
    .classed("sub-title", true)
    .text("Review the capital requirements below.");

var getInTouch = menuTitle.append("p")
    .classed("sub-title", true)
    .text("Click on your country. ");

var playButton = menu
    .append("div")
    .classed("button play", true)
    .text("Pause")
    .on("click", function () {
        var d = d3.select(this);

        if (d.text() == "Play") {
            state.play = true;
            d.text("Pause");
        } else {
            state.play = false;
            d.text("Play");
        }
    });

//setTimeout(transformScatter, 800);

var graticule = d3.geo.graticule();

var svg = d3
    .select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom)
    .call(tip)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var axis = svg.append("g").style("opacity", 0);
var inner = svg.append("g");
var outer = svg.append("g");

outer.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "water")
    .attr("d", path);

inner.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "graticule")
    .attr("d", path);

axis.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end");
// .text("fleischkonsum (kg/woche)");

axis.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end");
// .text("population")

var colorScaleAbs = d3.scale.quantile().range(colorList);

var colorScaleDiverging = d3.scale.quantile().range(colorList);

var colorScale;
var data;

var reverseCountryMap = {};
var isoCodesMap;
var globalDataMap;

var transform2d = function (id) {
    console.log("transform", id);

    state.play = false;
    playButton.text("PLAY");

    if (id == 0) {
        inner.selectAll(".graticule").transition().style("opacity", 1);
    }
    if (id == 1) {
        outer.selectAll(".water").transition().style("opacity", 0);
    }

    var b = projections[id];
    var a = projections[id + 1 > 1 ? 0 : 1];

    svg.call(zoom.scale(scale).translate(translate).event)
        .transition()
        .duration(function () {
            var distance = Math.abs(translate[0]) + Math.abs(translate[1]);
            return distance * 2;
        })
        .call(zoom.scale(1).translate([0, 0]).event)
        .each("end", function () {
            inner
                .selectAll("path")
                .transition()
                .duration(1000)
                // .ease("circle-out")
                // .attrTween("d", projectionTween(active(projections).geo, inactive(projections).geo))

                .attrTween("d", geoUtils.projectionTween(a.geo, b.geo))
                .each("end", function (d, i) {
                    if (i != 0) return;

                    state.projection = b;
                    path.projection(state.projection.geo);

                    if (id == 0) {
                        outer
                            .selectAll(".water")
                            .transition()
                            .style("opacity", 1);
                        //zoom.event(svg);
                    }
                });
        });
};

var keyList = [];
var dataList = [];

var un_country = []

d3.text("./data/data.csv", function(data) {
    var parsedCSV = d3.csv.parseRows(data);
    keyList = parsedCSV[0];
    for(let i = 1 ; i < parsedCSV.length ; i++) {
        let item = {};
        parsedCSV[i].map((val, index) => {
            item[keyList[index]] = val;
        })
        if(ISO3List[item[keyList[1]]]) {
            item['numeric'] = ISO3List[item[keyList[1]]].numeric;
            item['alpha3'] = ISO3List[item[keyList[1]]].alpha3;
            item['iso'] = ISO3List[item[keyList[1]]].alpha3;
        } else {
            un_country.push(item);
        }
        dataList.push(item);
    }
});

d3.queue().defer(
        d3.json,
        "https://gist.githubusercontent.com/cpietsch/9b8254b1608e2fc6de58dc561d77e81f/raw/dead294663def98f00f8cc4d3df024a0f26a9257/world-110m.json"
    )
    .defer(
        d3.csv,
        "https://gist.githubusercontent.com/cpietsch/9b8254b1608e2fc6de58dc561d77e81f/raw/dead294663def98f00f8cc4d3df024a0f26a9257/iso3166.csv"
    )
    .defer(d3.csv, datasets[0].url)
    .await(ready);

//Important function??
function ready(error, world, isoCodes, ds1) {
    datasets[0].data = dataList;
    datasets[0].data.forEach(function (d) {
        d[keyList[6]] = d[keyList[6]].replaceAll(',', '').replaceAll('$', '') * 1;
    });
    datasets[0].map = d3.map(datasets[0].data, function (d) {
        return d.iso;
    });

    isoCodes.forEach(function (d) {
        d.numeric *= 1;
        d[keyList[2]] *= 1;
        d.gdp *= 1;
    });
    isoCodesMap = d3.map(isoCodes, function (d) {
        return d.numeric;
    });
    globalDataMap = d3.map(isoCodes, function (d) {
        return d.alpha3;
    });

    // filter out antarctica
    world.objects.countries.geometries =
        world.objects.countries.geometries.filter(function (d) {
            return d.id != 10;
        });

    var land = {
        type: "GeometryCollection",
        geometries: geoUtils.polygons(world.objects.countries.geometries),
    };

    var nodes = topojson.feature(world, land).features.map(function (d) {
        //exterior(d.geometry);
        //var centroid = path.centroid(d.geometry);
        var iso = isoCodesMap.get(d.id);

        return {
            iso: reverseCountryMap[d.id],
            // x: centroid[0],
            // y: centroid[1],
            // ox: centroid[0],
            // oy: centroid[1],
            geometry: d.geometry,
            //dorling: dorling(d.geometry)
        };
    });

    var populationExtent = d3.extent(datasets[0].data, function (d) {
        return d[keyList[6]];
    });
    var max = Math.max(
        Math.abs(populationExtent[0]),
        Math.abs(populationExtent[1])
    );
    console.log(populationExtent, max);
    $("#loading").hide();

    colorScaleDiverging.domain([-max, max]);

    colorScaleAbs.domain([
        0,
        d3.max(datasets[0].data, function (d) {
            return d[keyList[6]];
        }),
    ]);

    colorScale = colorScaleAbs;

    var getColor = function (d) {
        var entry = state.dataset.map.get(d.iso);
        return entry ? colorScale(entry[keyList[6]]) : "#B5B5B5";
    };

    state.x.scale.domain(
        d3.extent(state.dataset.data, function (d) {
            return d[keyList[6]];
        })
    );
    state.y.scale.domain(
        d3.extent(isoCodes, function (d) {
            return d.gdp;
        })
    );

    axis.select(".x.axis").call(xAxis);
    axis.select(".y.axis").call(yAxis);

    tip.html(function (d) {
        if (!d || !d.iso) return;
        var map = state.dataset.map.get(d.iso);
        return `<strong class="info-title">${ map[keyList[1]] }</strong>
        <p>
            <span class="info-head">Status:</span>
            <span class="info-cont color-1 btn-cont">${ map[keyList[5]] }</span>
        </p>
        <p>
            <span class="info-head">Population:</span>
            <span class="info-cont color-2">${ Number(map[keyList[2]]).toLocaleString() }</span>
        </p>
        <p>
            <span class="info-head">Average Age:</span>
            <span class="info-cont color-3">${ Number(map[keyList[4]]).toLocaleString() }</span>
        </p>
        <p>
            <span class="info-head">Target Locations Onboarded:</span>
            <span class="info-cont color-5">${ Number(map[keyList[3]]).toLocaleString() }</span>
        </p>
        <p>
            <span class="info-head">Minimum Capital Requirement (USD):</span>
            <span class="info-cont color-6">$${ Number(map[keyList[6]]).toLocaleString() }</span>
        </p>
        `;
    });

    var world = inner
        .selectAll("path.land")
        .data(nodes)
        .enter()
        .append("path")
        .attr("class", "land")
        .attr("d", function (d) {
            return path(d.geometry);
        })
        .style("fill", getColor)
        .classed("noData", function (d) {
            return !state.dataset.map.get(d.iso);
        })
        .on("mouseover", d => {
            tipClicked = false;
            tip.show;
        })
        .on("mousemove", tip.show)
        .on("click", d => {
            tipClicked = true;
            tip.show;
        })
        .on("mouseout", function(d) {
            if(tipClicked) return;
            setTimeout(tip.hide, 1000);
        });

    svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(765, -5)");

    axis.select(".x.axis").call(xAxis);
    axis.select(".y.axis").call(yAxis);

    // legend on the top left
    var legend = d3.legend
        .color()
        .labelFormat(d3.format(".2f"))
        .useClass(false)
        .labelFormat(function (d) {
            return Math.floor(d).toLocaleString();
        })
        .scale(colorScale)
        //.orient("horizontal")
        //.title("Meat Consumption per week in kg")
        // .title("Happiness Score");

    svg.select(".legendQuant").call(legend);

    zoom.event(svg);

    d3.timer(function () {
        if (state.play) {
            // active(projections).geo
            //  .rotate([speed * start++, -15])

            // svg.selectAll("path").attr("d", path)
            zoom.translate([translate[0] + 5 * speed, translate[1]]).event(svg);
        }
    });
}

var geoUtils = {};

geoUtils.exterior = function (d) {
    // From Jason Davis https://www.jasondavies.com/maps/dorling-world/
    switch (d.type) {
        case "Polygon":
            d.coordinates = [d.coordinates[0]];
            break;
        case "MultiPolygon":
            d.coordinates = [[d.coordinates[0][0]]];
            break;
    }
    return d;
};

geoUtils.projectRing = function (coordinates) {
    var ring = [];
    d3.geo.stream(
        { type: "Polygon", coordinates: [coordinates] },
        state.projection.geo.stream({
            point: function (x, y) {
                ring.push([x, y]);
            },
            lineStart: geoUtils.noop,
            lineEnd: geoUtils.noop,
            polygonStart: geoUtils.noop,
            polygonEnd: geoUtils.noop,
            sphere: geoUtils.noop,
        })
    );
    ring.push(ring[0]);
    return ring;
};

geoUtils.dorling = function (d) {
    // From Jason Davis https://www.jasondavies.com/maps/dorling-world/
    switch (d.type) {
        case "Polygon":
            return geoUtils.circle(geoUtils.projectRing(d.coordinates[0]));
        case "MultiPolygon":
            return geoUtils.circle(geoUtils.projectRing(d.coordinates[0][0]));
    }
    return { radius: 0, coordinates: [] };
};

geoUtils.polygons = function (geometries) {
    // From Jason Davis https://www.jasondavies.com/maps/dorling-world/
    var id = 0;
    return d3.merge(
        geometries.map(function (geometry) {
            var iso = isoCodesMap.get(geometry.id);
            var isoName = iso ? iso.alpha3 : "";

            return (
                geometry.type === "MultiPolygon"
                    ? geometry.arcs
                    : [geometry.arcs]
            ).map(function (d) {
                reverseCountryMap[++id] = isoName;
                return { id: id, type: "Polygon", arcs: d, parent: geometry };
            });
        })
    );
};

geoUtils.noop = function () {};

geoUtils.projectionTween = function (projection0, projection1) {
    // by Mike Bostock
    return function (d) {
        var t = 0;

        var projection = d3.geo
            .projection(project)
            .scale(1)
            .translate([width / 2, height / 2]);

        var path = d3.geo.path().projection(projection);

        function project(λ, φ) {
            (λ *= 180 / Math.PI), (φ *= 180 / Math.PI);
            var p0 = projection0([λ, φ]),
                p1 = projection1([λ, φ]);
            var x = (1 - t) * p0[0] + t * p1[0];
            var y = (1 - t) * -p0[1] + t * -p1[1];

            // hacky error workaround
            if (x == Infinity || x == -Infinity) x = -height - 1;
            if (y == Infinity || y == -Infinity) y = -height - 1;

            if (isNaN(x)) x = -height;
            if (isNaN(y)) y = -height;

            return [x, y];
        }

        return function (_) {
            t = _;
            return d.geometry ? path(d.geometry) : path(d);
        };
    };
};

$('body').on('click', '.btn-cont', function() {
    alert("Status: " + $(this).text())
});