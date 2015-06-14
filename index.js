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

//var District = mongoose.model('District', { name: String });
//var kitty = new District({ name: 'Zildjian' });
//kitty.save(function (err, product, numberAffected) {
//    if (err) {
//        console.log('meow');
//    } else {
//        console.log('saved');
//    }
//});

var locationSchema = new Schema({
    code: String,
    name: String,
    category: String,
    parentId : Schema.Types.ObjectId
});

var Location = mongoose.model('Location', locationSchema);

var parser = new xml2js.Parser();
console.log('__dirname:::'+__dirname);
fs.readFile(__dirname + '/2013年统计用区划代码和城乡划分代码(截止2013年8月31日).xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        console.log('\n')
        console.log('\n')
        //console.dir(result);
        //console.log(JSON.stringify(result));
        //var jsonChina = JSON.stringify(result);
        //fs.writeFile(__dirname + '/China.txt', jsonChina, function (err) {
        //    if (err) throw err;
        //    console.log('It\'s saved!');
        //});
        for (var country in result) {
            //console.log(JSON.stringify(result[country]));
            console.log('province.length::'+result[country].province.length);
            for (var i1 = 0, len1 = result[country].province.length; i1 < len1; i1++) {
                var objProvinceLevel = result[country].province[i1];
                var objProvince = objProvinceLevel['$'];
                objProvince.parentId = null;
                objProvince.category = 'province';
                var locationProvince = new Location(objProvince);
                locationProvince.save(function (err, province, numberAffected) {
                    if (err) {
                        console.log('meow');
                    } else {
                        console.log('saved');
                        console.log(province);

                        for (var i2 = 0, len2 = objProvinceLevel.city.length; i2 < len2; i2++) {
                            var objCityLevel = objProvinceLevel.city[i2];
                            var objCity = objCityLevel['$'];
                            objCity.parentId = province._id;
                            objCity.category = 'city';
                            var locationCity = new Location(objCity);
                            locationCity.save(function (err, city, numberAffected) {
                                if (err) {
                                    console.log('meow');
                                } else {
                                    console.log('saved');
                                    console.log(city);

                                    for (var i3 = 0, len3 = objCityLevel.county.length; i3 < len3; i3++) {
                                        var objCountyLevel = objCityLevel.county[i3];
                                        var objCounty = objCountyLevel['$'];
                                        objCounty.parentId = city._id;
                                        objCounty.category = 'country';
                                        var locationCounty = new Location(objCounty);
                                        locationCounty.save(function (err, country, numberAffected) {
                                            if (err) {
                                                console.log('meow');
                                            } else {
                                                console.log('saved');
                                                console.log(country);

                                                for (var i4 = 0, len4 = objCountyLevel.town.length; i4 < len4; i4++) {
                                                    var objTownLevel = objCountyLevel.town[i4];
                                                    var objTown = objTownLevel['$'];
                                                    objTown.parentId = country._id;
                                                    objTown.category = 'town';
                                                    var locationTown = new Location(objTown);
                                                    locationTown.save(function (err, town, numberAffected) {
                                                        if (err) {
                                                            console.log('meow');
                                                        } else {
                                                            console.log('saved');
                                                            console.log(town);

                                                            for (var i5 = 0, len5 = objTownLevel.village.length; i5 < len5; i5++) {
                                                                var objVillageLevel = objTownLevel.village[i5];
                                                                var objVillage = objVillageLevel['$'];
                                                                objVillage.parentId = town._id;
                                                                objVillage.category = 'village';
                                                                var locationVillage = new Location(objVillage);
                                                                locationVillage.save(function (err, village, numberAffected) {
                                                                    if (err) {
                                                                        console.log('meow');
                                                                    } else {
                                                                        console.log('saved');
                                                                        console.log(village);
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
            //for (var city in result[country]) {
            //    console.log(JSON.stringify(city));
            //    console.log('\n')
            //    console.log('\n')
            //}
        }

        console.log('Done');
    });
});
//mongoimport --db <db-name> --collection <coll-name> --type json --file seed.json --jsonArray
//2013年统计用区划代码和城乡划分代码(截止2013年8月31日)