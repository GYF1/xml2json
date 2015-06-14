/**
 * Created by guoyinfeng on 3/5/15.
 */
console.log('hello world!!!');

//var parseString = require('xml2js').parseString;
//var xml = "<root>Hello xml2js!</root>"
//parseString(xml, function (err, result) {
//    console.dir(result);
//});

var fs = require('fs'),
    xml2js = require('xml2js');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//mongoose.connect('mongodb://localhost/my_database');
mongoose.connect('mongodb://username:password@host:port/databasename');

var locationSchema = new Schema({
    code: String,
    name: String,
    category: String,
    parentId : Schema.Types.ObjectId
});

var Location = mongoose.model('Location', locationSchema);

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/2013年统计用区划代码和城乡划分代码(截止2013年8月31日).xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        //console.dir(result);
        //var jsonChina = JSON.stringify(result);
        //fs.writeFile(__dirname + '/China.txt', jsonChina, function (err) {
        //    if (err) throw err;
        //});
        for (var country in result) {
            for (var i1 = 0, len1 = result[country].province.length; i1 < len1; i1++) {
                var objProvinceLevel = result[country].province[i1];
                var objProvince = objProvinceLevel['$'];
                objProvince.parentId = null;
                objProvince.category = 'province';

                var promiseProvince = Location.create(objProvince);
                promiseProvince.then(function (province) {
                    // city...
                    for (var i2 = 0, len2 = objProvinceLevel.city.length; i2 < len2; i2++) {
                        var objCityLevel = objProvinceLevel.city[i2];
                        var objCity = objCityLevel['$'];


                        //if (objCity.name === '泰州市') {
                        //    console.log('province::'+JSON.stringify(province));
                        //}
                        objCity.parentId = province._id;
                        objCity.category = 'city';

                        var promiseCity = Location.create(objCity);
                        promiseCity.then(function (city) {
                            // country...
                            for (var i3 = 0, len3 = objCityLevel.county.length; i3 < len3; i3++) {
                                var objCountyLevel = objCityLevel.county[i3];
                                var objCounty = objCountyLevel['$'];
                                objCounty.parentId = city._id;
                                objCounty.category = 'county';

                                var promiseCountry = Location.create(objCounty);
                                promiseCountry.then(function (country) {
                                    // town...
                                    for (var i4 = 0, len4 = objCountyLevel.town.length; i4 < len4; i4++) {
                                        var objTownLevel = objCountyLevel.town[i4];
                                        var objTown = objTownLevel['$'];
                                        objTown.parentId = country._id;
                                        objTown.category = 'town';

                                        var promiseTown = Location.create(objTown);
                                        promiseTown.then(function (town) {
                                            // village...
                                            for (var i5 = 0, len5 = objTownLevel.village.length; i5 < len5; i5++) {
                                                var objVillageLevel = objTownLevel.village[i5];
                                                var objVillage = objVillageLevel['$'];
                                                objVillage.parentId = town._id;
                                                objVillage.category = 'village';
                                                var promiseVillage = Location.create(objVillage);
                                                promiseVillage.then(function (village) {
                                                    // done...
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })

                    }
                })
            }
        }

        console.log('Done');
    });
});
//mongoimport --db <db-name> --collection <coll-name> --type json --file seed.json --jsonArray
//2013年统计用区划代码和城乡划分代码(截止2013年8月31日)