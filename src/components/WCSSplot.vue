<template>
  <div id="bxx">
    <div id="wcssdiv" ref="wcssdiv">
    </div>
  </div>
</template>


<style scoped>
#cdiv {
  width: 400px;
  height: 400px;
  max-width: 40%;
  max-height: 60%;
}
</style>


<script>
/* eslint-disable */
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { each } from '@amcharts/amcharts5/.internal/core/util/Array';

export default {
  name: 'wcss-plot',

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
    var root = am5.Root.new("wcssdiv");

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    var colorSet = am5.ColorSet.new(root, { step: 3 });

    var color = colorSet.getIndex(0);

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
    var yearWCSS = [];
    var centriodsData = {};
    var firstYear = 1;
    var lastYear = this.itrationsLimit;
    var currentYear = firstYear;

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

      yearWCSS.push(wcss);

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


    var chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX"
    }));

    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomX"
    }));
    cursor.lineY.set("visible", false);

    function refactorData(data) {
      var newData = []
      for (var i = 0; i < yearWCSS.length; i++) {
        newData.push({
          iteration: i,
          value: data[i]
        })
      }
    }

    var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0,
      baseInterval: {
        timeUnit: "iteration",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));

    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "iteration",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));

    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    var dataa = refactorData(yearWCSS);
    series.data.setAll(dataa);

    series.appear(1000);
    chart.appear(1000, 100);
  },

  beforeUnmount() {
    if (this.root) {
      this.root.dispose();
    }
  }
}
</script>