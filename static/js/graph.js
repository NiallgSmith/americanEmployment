// Queue function makes us await the data

queue()
    .defer(d3.json, "/wages")
    .await(introGraph);

// Variables to store data labels, as the data comes in encoded.

var genders = ["Male", "Female"]
var races = ["non", "Other", "Hispanic", "White"]
var occupations = ["non", "Management", "Sales", "Clerical", "Service", "Professional", "Other"]
var sectors = ["Other", "Manufacturing", "Construction"]
var unions = ["Non union", "Union"]

function introGraph(error, wagesJson) {
    var wages = wagesJson;
    // create wage bands to give us workable bands for graphs.
    wages.forEach(function (d){
        if (d["WAGE"] <= 5) d["wageband"] = 1;
        else if (d["WAGE"] <= 10) d["wageband"] = 2;
        else if (d["WAGE"] <= 15) d["wageband"] = 3;
        else if (d["WAGE"] <= 20) d["wageband"] = 4;
        else if (d["WAGE"] <= 25) d["wageband"] = 5;
        else d["wageband"] = 6;

        // recode numbers to text, again for presentation reasons.
        d["SEX"] = genders[d["SEX"]];
        d["RACE"] = races[d["RACE"]];
        d['OCCUPATION'] = occupations[d['OCCUPATION']]
        d['SECTOR'] = sectors[d['SECTOR']]
        d['UNION'] = unions[d['UNION']]

    })

    var ndx = crossfilter(wagesJson);


    // A basic display of the wages (grouped). This allows us to see quickly
    // the effect of any part of the data when filtering for gender or whatever.
    var avgWages = ndx.dimension(function (d) {
        return d["wageband"];
    })
    var avgWagesGroup = avgWages.group();
    var avgWagesChart = dc.barChart("#overview");
    avgWagesChart
        .width(600)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(avgWages)
        .group(avgWagesGroup)
        .transitionDuration(500)
        .elasticY(false)
        .xAxisLabel("Wage")
        .x(d3.scale.linear().domain([1,7]))
        //.x(d3.scale.ordinal().domain(["<=5", "<=10", "<=15", "<=20", "<=25", ">25"]))
        //.xUnits(dc.units.ordinal("5", "10", "15", "20", "25", "30"))
        .yAxis().ticks(6);


    // Pie charts displaying the various basic break downs of the sample group. Gender, Race, occupation etc.
    var gender = ndx.dimension(function (d) {
        return d["SEX"]
    })
    var groupGender = gender.group();
    var genderChart = dc.pieChart("#gender");
    genderChart
        .height(220)
        .radius(90)
        .transitionDuration(750)
        .dimension(gender)
        .group(groupGender);



    var race = ndx.dimension(function (d) {
        return d["RACE"]
    })
    
    var groupRace = race.group();
    var raceChart = dc.pieChart("#race");
    raceChart
        .height(220)
        .radius(90)
        .transitionDuration(1000)
        .dimension(race)
        .group(groupRace);

// This chart gave little useful information.

    // var married = ndx.dimension(function (d) {
    //     return d['MARR 0=Unmarried 1=Married']
    // })
    // var groupMarried = married.group();
    // var marriedChart = dc.pieChart("#married");
    // marriedChart
    //     .height(440)
    //     .width(440)
    //     .radius(180)
    //     .innerRadius(95)
    //     .transitionDuration(1000)
    //     .dimension(married)
    //     .group(groupMarried);


    var occupation = ndx.dimension(function (d) {
        return d['OCCUPATION']
    })
    var groupOccupation = occupation.group();
    var occupationChart = dc.pieChart("#occupation");
    occupationChart
        .height(220)
        .radius(90)
        .transitionDuration(750)
        .dimension(occupation)
        .group(groupOccupation);


    var sector = ndx.dimension(function (d) {
        return d['SECTOR']
    })
    var groupSector = sector.group();
    var sectorChart = dc.pieChart("#sector");
    sectorChart
        .height(220)
        .radius(90)
        .transitionDuration(750)
        .dimension(sector)
        .group(groupSector);


    var occupationBar = dc.barChart("#occupationBar");
    occupationBar
        .width(600)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(occupation)
        .group(groupOccupation)
        .transitionDuration(500)
        .elasticY(false)
        .xAxisLabel("Employment type")
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .yAxis().ticks(6);


    var union = ndx.dimension(function (d) {
        return d['UNION']
    })
    var groupUnion = union.group();
    var unionChart = dc.pieChart("#union");
    unionChart
        .height(220)
        .radius(90)
        .transitionDuration(750)
        .dimension(union)
        .group(groupUnion);

    // An average of wages by employment type. To be applied to the employment type bar chart.

    var occwage = occupation.group()
        .reduce(
            function reduceAdd(p, d) {
                ++p.count;
                p.total += d["WAGE"]
                return p;
            },
            function reduceRemove(p, d) {
                --p.count;
                p.total -= d["WAGE"]
                return p;
            },
            function reduceInit() {
                return {count:0, total:0};
            });

    var occwageChart = dc.barChart("#avgoccwage");
    occwageChart
        .width(600)
        .height(300)
        .dimension(occupation)
        .group(occwage)
        .elasticY(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Average wage")
        .valueAccessor(function (p) {
            // console.log(p)
            return p.value.total / p.value.count;
        });

    var occwageLineChart = dc.lineChart("#avgoccwageline")
    occwageLineChart
        .width(600)
        .height(300)
        .dimension(occupation)
        .group(occwage)
        .elasticY(true)
        .colors('red')
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Average wage")
        .valueAccessor(function (p) {
            // console.log(p)
            return p.value.total / p.value.count;
        });


    var lastChart = dc.compositeChart("#lastChart")

    lastChart
        .width(600)
        .height(300)
        .shareTitle(false)
        .elasticY(false)
        .group(groupOccupation)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Average wage")
        // .compose([occupationBar,
        //     occwageLineChart.useRightYAxis()
        // ])
        .compose([
            occupationBar
            ,
            occwageLineChart.useRightYAxis(true)
                ])
        .yAxisLabel("Number of employees")
        .rightYAxisLabel("Average Wage");


  //      .valueAccessor(function (p) {
  //          // console.log(p)
  //          return p.value.total / p.value.count;
  //      });


    dc.renderAll();
}
