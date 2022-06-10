<template>
  <div id="box">
    <div id="chartdiv" ref="chartdiv">
    </div>
  </div>
</template>


<style scoped>
#chartdiv {
  width: 800px;
  height: 800px;
  max-width: 70%;
  max-height: 90%;
}
</style>


<script>
/* eslint-disable */
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { each } from '@amcharts/amcharts5/.internal/core/util/Array';

export default {
  name: 'plot',

  props: {
    kValue: {
      type: Number,
    },

    itrationsLimit: {
      type: Number,
      required: true,
    },

    generatedData: {
      type: Object,
      required: true
    },

    genDataLength: {
      type: Number,
      required: true
    }
  },

  mounted() {
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("chartdiv");
    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    var colorSet = am5.ColorSet.new(root, { step: 3 });

    // цвета сгенерируем в зависимости от k
    var colors = []
    for (var i = 0; i < this.kValue * 2; i += 2) {
      colors.push(colorSet.getIndex(i))
    }

    var genData = {}
    for (var i = 0; i < this.genDataLength; i++) {
      var elem = {
        id: this.generatedData[i].id,
        claster: this.generatedData[i].claster,
        distToCentriod: this.generatedData[i].distToCentriod,
        x: this.generatedData[i].x,
        y: this.generatedData[i].y,
        val: this.generatedData[i].val
      }
      genData[i] = elem;
    }


    var yearData = {};
    var yearWCSS = {};
    var centriodsData = {};
    var firstYear = 1;
    var lastYear = this.itrationsLimit;
    var currentYear = firstYear;


    // тут блок кода для работы алгоритма k-средних /////////////////////////////////////////////////////////////////////////
    

    // расстояние между двумя точками
    function twoPointsDistance(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // создаем начальные центроиды
    var centriods = {};
    for (var i = 0; i < this.kValue; i++) {
      centriods[i] = {
        x: Math.random(), 
        y: Math.random(),
      }
    }
    
    // тут сам алгоритм
    for (var year = firstYear; year <= lastYear; year++) {
      // переменная для подчсчета суммы квадратов расстояний до назначенных кластеров
      var wcss = 0;

      // 1. для каждой точки ставим ближайщий центроид
      for (var pointID = 0; pointID < this.genDataLength; pointID++) {
        // вычислили расстояние для 0 центроида
        var closestID = 0;
        var dist = twoPointsDistance(
          genData[pointID].x,
          genData[pointID].y,
          centriods[0].x,
          centriods[0].y
        )
        // сравниваем с расстоянием до других центроидов
        for (var centroidID = 1; centroidID < this.kValue; centroidID++) {
          var currDist = twoPointsDistance(
            genData[pointID].x,
            genData[pointID].y,
            centriods[centroidID].x,
            centriods[centroidID].y
          )
          if (dist > currDist) {
            dist = currDist;
            closestID = centroidID;
          }
        }
        // кладем ближайщее расстояние и назначаем центроид точке
        genData[pointID].distToCentriod = dist;
        genData[pointID].claster = closestID;

        wcss += dist * dist;
      }

      yearWCSS[year] = wcss;

      // 2. пересчитываем центроиды
      var allCentriodsEqual = true;
      for (var centroidID = 0; centroidID < this.kValue; centroidID++) {
        var sumPointsOfCentriodX = 0;
        var sumPointsOfCentriodY = 0;
        var amountPointsOfCentriod = 0;
        for (var pointID = 0; pointID < this.genDataLength; pointID++) {
          if (genData[pointID].claster == centroidID) {
            sumPointsOfCentriodX += genData[pointID].x;
            sumPointsOfCentriodY += genData[pointID].y;
            amountPointsOfCentriod++;
          }
        }
        if (centriods[centroidID].x != sumPointsOfCentriodX / amountPointsOfCentriod) {
          allCentriodsEqual = false;
        }
        if (centriods[centroidID].y != sumPointsOfCentriodY / amountPointsOfCentriod) {
          allCentriodsEqual = false;
        }
        centriods[centroidID].x = sumPointsOfCentriodX / amountPointsOfCentriod; 
        centriods[centroidID].y = sumPointsOfCentriodY / amountPointsOfCentriod;
        //console.log(centriods[centroidID].x, centriods[centroidID].y, centroidID, amountPointsOfCentriod)
      }

      // тут заполняем историю работы алгоритма
      
      //var data = []
      //yearData[year] = data;  // эта штука для истории перемещений, можно сделать с центроидами!
      yearData[year] = new Array;
      centriodsData[year] = new Array;

      for (var i = 0; i < this.genDataLength; i++) {
        var dObj = {
          id: genData[i].id,
          name: genData[i].id,
          continent: genData[i].claster,
          settings: { fill: colors[genData[i].claster] },
          x: genData[i].x,
          y: genData[i].y,
          value: genData[i].val
        }
        //data.push(dObj);
        yearData[year].push(dObj); 
        if (year == firstYear) {
          genData[i].data = [dObj];
        } 
        else {
          genData[i].data.push(dObj);
        }
      }

      for (var i = 0; i < this.kValue; i++) {
        var dObj = {
          id: i,
          name: i,
          continent: i,
          settings: { fill: colors[i] },
          x: centriods[i].x,
          y: centriods[i].y
        }
        centriodsData[year].push(dObj);
      }
      
      // тут досрочный выход из цикла
      if (allCentriodsEqual == true) {
        lastYear = year;
        break;
      }
    }


    // main container
    var mainContainer = root.container.children.push(am5.Container.new(root, {
      width: am5.p100,
      height: am5.p100,
      layout: root.verticalLayout
    }))

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = mainContainer.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelY: "zoomXY",
      pinchZoomX:true,
      pinchZoomY:true
    }));

    // тут надо будет вычислить подходящую разметку (по идее, от 0 до 1, так как данные стандартизированы)
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
      min: -0.05,
      max: 1.05,
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    xAxis.children.push(am5.Label.new(root, { text: "metric X", x: am5.p50, centerX: am5.p50 }));

    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      min: -0.05,
      max: 1.05,
      renderer: am5xy.AxisRendererY.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));

    yAxis.children.moveValue(am5.Label.new(root, { text: "metric Y", rotation: -90, y: am5.p50, centerX: am5.p50 }), 0);

    // тут надо разобраться с кружками
    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var bubbleSeries = chart.series.push(am5xy.LineSeries.new(root, {
      calculateAggregates: false, // turned off heat rules
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "y",
      valueXField: "x",
      valueField: "value"
    }));

    bubbleSeries.strokes.template.set("visible", false);

    var centroidSeries = chart.series.push(am5xy.LineSeries.new(root, {
      calculateAggregates: false,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "y",
      valueXField: "x"
    }));

    centroidSeries.strokes.template.set("visible", false);

    // Add bullet
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Bullets
    var circleTemplate = am5.Template.new({ tooltipY: 0 });
    circleTemplate.states.create("transparent", { opacity: 0.25 });

    circleTemplate.events.on("pointerover", handleOver);
    circleTemplate.events.on("pointerout", handleOut);
    //circleTemplate.events.on("click", handleClick);

    function handleOver(e) {
      var target = e.target;
      am5.array.each(bubbleSeries.dataItems, function(dataItem) {
        if (dataItem.bullets) {
          var bullet = dataItem.bullets[0];
          if (bullet) {
            var sprite = bullet.get("sprite");
            if (sprite && sprite != target) {
              sprite.states.applyAnimate("transparent");
            }
          }
        }
      })
    }

    function handleOut(e) {
      am5.array.each(bubbleSeries.dataItems, function(dataItem) {
        if (dataItem.bullets) {
          var bullet = dataItem.bullets[0];
          if (bullet) {
            var sprite = bullet.get("sprite");
            if (sprite) {
              sprite.states.applyAnimate("default");
            }
          }
        }
      })
    }

/*
    var selectedDataItem;
    function handleClick(e) {
      if (selectedDataItem == e.target.dataItem) {
        am5.array.each(bubbleSeries.dataItems, function(dataItem) {
          var bullet = dataItem.bullets[0];
          var sprite = bullet.get("sprite");
          sprite.set("fillOpacity", 1);
        })
        lineSeries.data.clear();
      }
      else {
        selectedDataItem = e.target.dataItem;

        lineSeries.data.setAll(countries[selectedDataItem.dataContext.id].data);
        lineSeries.show();

        am5.array.each(bubbleSeries.dataItems, function(dataItem) {
          var bullet = dataItem.bullets[0];
          var sprite = bullet.get("sprite");
          if (dataItem != selectedDataItem) {
            sprite.set("fillOpacity", 0.15);
          }
          else {
            sprite.set("fillOpacity", 1);
          }
        })
      }
    }
*/

    bubbleSeries.bullets.push(function() {
      var bulletCircle = am5.Circle.new(root, {
        radius: 5,
        templateField: "settings",
        fillOpacity: 0.9,
        tooltipText: "[fontSize:18px; bold]{name}[/]\nMetric Y: {valueY}\nMetric X: {valueX}\ncurrent class: {continent}"
      }, circleTemplate);
      return am5.Bullet.new(root, {
        sprite: bulletCircle
      });
    });

    centroidSeries.bullets.push(function() {
      var centroidCircle = am5.Star.new(root, {
        radius: 12,
        strokeWidth: 2,
        templateField: "settings",
        fillOpacity: 0.9,
        tooltipText: "[fontSize:18px; bold]{name}[/]\nMetric Y: {valueY}\nMetric X: {valueX}\nCentriod id: {id}"
      }, circleTemplate);
      return am5.Bullet.new(root, {
        sprite: centroidCircle
      });
    });

    /*
    Add heat rule
    // https://www.amcharts.com/docs/v5/concepts/settings/heat-rules/
    bubbleSeries.set("heatRules", [{
      target: circleTemplate,
      min: 3,
      max: 35,
      dataField: "value",
      key: "radius", maxValue: 4000
    }]);

    // line series
    var lineSeries = chart.series.push(am5xy.LineSeries.new(root, {
      valueXField: "x",
      valueYField: "y",
      xAxis: xAxis,
      yAxis: yAxis,
      stroke: am5.color(0x00000)

    }))

    lineSeries.strokes.template.set("strokeOpacity", 0.3);

    lineSeries.bullets.push(function() {
      var bulletCircle = am5.Circle.new(root, {
        radius: 2,
        fill: lineSeries.stroke

      });
      return am5.Bullet.new(root, {
        sprite: bulletCircle
      });
    });
    */


    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    chart.set("cursor", am5xy.XYCursor.new(root, {
      xAxis: xAxis,
      yAxis: yAxis,
      snapToSeries: [bubbleSeries]
    }));

    // Add scrollbars
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    //chart.set("scrollbarX", am5.Scrollbar.new(root, {
    //  orientation: "horizontal",
    //  exportable:false
    //}));

    //chart.set("scrollbarY", am5.Scrollbar.new(root, {
    //  orientation: "vertical",
    //  exportable:false
    //}));

    // Label
    var yearLabel = chart.plotContainer.children.push(am5.Label.new(root, {
      text: currentYear.toString(),
      fontSize: "7em",
      fill: am5.color(0x000000),
      opacity: 0.15,
      x: am5.p50,
      y: am5.p50,
      fontFamily: "Courier New",
      textAlign: "right",
      centerY: am5.p50,
      centerX: am5.p50
    }));

    // Create controls
    var yearSliderContainer = mainContainer.children.push(am5.Container.new(root, {
      width: am5.percent(100),
      layout: root.horizontalLayout,
      paddingLeft: 70,
      paddingRight: 40,
      exportable:false
    }));

    var playButton = yearSliderContainer.children.push(am5.Button.new(root, {
      themeTags: ["play"],
      centerY: am5.p50,
      marginRight: 20,
      icon: am5.Graphics.new(root, {
        themeTags: ["icon"]
      })
    }));

    playButton.events.on("click", function() {
      if (playButton.get("active")) {
        slider.set("start", slider.get("start") + 0.0001);
      } else {
        slider.animate({
          key: "start",
          to: 1,
          duration: 15000 * (1 - slider.get("start"))
        });
      }
    });

    var slider = yearSliderContainer.children.push(am5.Slider.new(root, {
      orientation: "horizontal",
      start: 0,
      centerY: am5.p50
    }));

    slider.on("start", function(start) {
      if (start === 1) {
        playButton.set("active", false);
      }
    });

    slider.events.on("rangechanged", function() {
      updateSeriesData(
        firstYear + Math.round(slider.get("start", 0) * (lastYear - firstYear))
      );
    });



/*
//    // Create the map chart
//    // https://www.amcharts.com/docs/v5/charts/map-chart/
//    var navMap = chart.plotContainer.children.push(am5map.MapChart.new(root, {
//      projection: am5map.geoNaturalEarth1(),
//      rotationX: -11,
//      width: 250,
//      height: 150,
//      x: am5.percent(100),
//      y: am5.percent(100),
//      centerY: am5.percent(100),
//      centerX: am5.percent(100),
//      panY: "none",
//      panX: "none"
//    }));


//    // Create main polygon series for countries
//    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
//    var polygonSeries = navMap.series.push(am5map.MapPolygonSeries.new(root, {
//      geoJSON: am5geodata_continentsLow,
//      exclude: ["antarctica"]
//    }));


//    var polygonTemplate = polygonSeries.mapPolygons.template;

//    polygonTemplate.setAll({
//      templateField: "settings",
//      tooltipText: "{name}",
//      interactive: true
//    });

//    polygonTemplate.states.create("disabled", {
//      fill: root.interfaceColors.get("disabled")
//    });


//    polygonTemplate.events.on("pointerover", handleContinentOver);
//    polygonTemplate.events.on("click", handleContinentClick);
//    polygonTemplate.events.on("pointerout", handleOut);

//    function handleContinentOver(e) {
//      var target = e.target;
//      am5.array.each(bubbleSeries.dataItems, function(dataItem) {
//        if (dataItem.bullets) {
//          var bullet = dataItem.bullets[0];
//          if (bullet) {
//            var sprite = bullet.get("sprite");
//            if (sprite) {
//              if (target.dataItem.dataContext.code == sprite.dataItem.dataContext.continent) {
//                sprite.states.applyAnimate("default");
//              }
//              else {
//                sprite.states.applyAnimate("transparent");
//              }
//            }
//          }
//        }
//      })
//    }

//    var selectedContinent;

//    function handleContinentClick(e) {
//      var target = e.target;
//      if (target.dataItem == selectedContinent) {
//        selectedContinent = undefined;


//        am5.array.each(polygonSeries.dataItems, function(dataItem) {
//          var mapPolygon = dataItem.get("mapPolygon");
//          mapPolygon.states.applyAnimate("default");
//        })

//        am5.array.each(bubbleSeries.dataItems, function(dataItem) {
//          var bullet = dataItem.bullets[0];
//          if (bullet) {
//            var sprite = bullet.get("sprite");
//            if (sprite) {
//              sprite.set("forceHidden", false);
//            }
//          }
//        })
//      }
//      else {
//        selectedContinent = target.dataItem;

//        am5.array.each(polygonSeries.dataItems, function(dataItem) {
//          var mapPolygon = dataItem.get("mapPolygon");
//          if (dataItem != selectedContinent) {
//            mapPolygon.states.applyAnimate("disabled");
//          }
//          else {
//            mapPolygon.states.applyAnimate("default");
//          }
//        })

//        am5.array.each(bubbleSeries.dataItems, function(dataItem) {
//          if (dataItem.bullets) {
//            var bullet = dataItem.bullets[0];
//            var sprite = bullet.get("sprite");
//            if (target.dataItem.dataContext.code == sprite.dataItem.dataContext.continent) {
//              sprite.set("forceHidden", false);
//            }
//            else {
//              sprite.set("forceHidden", true);
//            }
//          }
//        })
//      }
//    }


//    polygonSeries.data.setAll([
//      { id: "europe", code: "EU", settings: { fill: colors.EU } },
//      { id: "northAmerica", code: "NA", settings: { fill: colors.NA } },
//      { id: "southAmerica", code: "SA", settings: { fill: colors.SA } },
//      { id: "asia", code: "AS", settings: { fill: colors.AS } },
//      { id: "africa", code: "AF", settings: { fill: colors.AF } },
//      { id: "oceania", code: "OC", settings: { fill: colors.OC } }
//    ])
*/


    function updateSeriesData(year) {
      if (currentYear != year) {
        currentYear = year;
        var dataC = centriodsData[year];
        //var dataP = yearData[year];

        var i = 0;
        am5.array.each(dataC, function(item) {
          centroidSeries.data.setIndex(i, item);
          i++;
        });
        //var j = 0;
        //am5.array.each(dataP, function(item) {
        //  bubbleSeries.data.setIndex(i, item);
        //  j++;
        //});

        bubbleSeries.data.setAll(yearData[currentYear]);
        //centroidSeries.data.setAll(centriodsData[currentYear]);

        yearLabel.set("text", year.toString());
      }
    }

    bubbleSeries.data.setAll(yearData[currentYear]);
    centroidSeries.data.setAll(centriodsData[currentYear]);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    bubbleSeries.appear(1000);
    centroidSeries.appear(1000);
    chart.appear(1000, 100);
  },

  beforeUnmount() {
    if (this.root) {
      this.root.dispose();
    }
  }
}
</script>