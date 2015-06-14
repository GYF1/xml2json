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
        var arrProvince2Insert = [];
        var arrCities2Insert = [];
        var arrCounties2Insert = [];
        var arrTowns2Insert = [];
        var arrVillages2Insert = [];

        var mapCodeCities = {};
        var mapCodeCounties = {};
        var mapCodeTowns = {};
        var mapCodeVillages = {};
        for (var country in result) {
            for (var i1 = 0, len1 = result[country].province.length; i1 < len1; i1++) {
                var objProvinceLevel = result[country].province[i1];
                var objProvince = objProvinceLevel['$'];
                objProvince.parentId = null;
                objProvince.category = 'province';
                arrProvince2Insert.push(objProvince);
                mapCodeCities[objProvince.code] = objProvinceLevel.city;
            }
            Location.collection.insert(arrProvince2Insert, function(err, provinces) {
                if (err) {
                    // TODO: handle error
                    console.log('provinces err::::');
                    console.log(err)
                } else {
                    console.info('%d provinces were successfully stored.', provinces.length);
                    for (var v1 = 0, t1 = provinces.length; v1 < t1; v1++) {
                        var objSavedProvince = provinces[v1];
                        //console.log('province:::'+JSON.stringify(docs[v1]));

                        var arrCities = mapCodeCities[objSavedProvince.code];
                        if (arrCities !== undefined) {
                            for (var cityi = 0, citylen = arrCities.length; cityi < citylen; cityi++) {
                                var objCity = arrCities[cityi]['$'];
                                objCity.parentId = objSavedProvince._id;
                                objCity.category = 'city';
                                //console.log(objCity);
                                arrCities2Insert.push(objCity);
                                mapCodeCounties[objCity.code] = arrCities[cityi].county;
                            }
                        }
                    }
                    Location.collection.insert(arrCities2Insert, function(err, cities) {
                        if (err) {
                            console.log('cities err::::');
                            console.log(err)
                        } else {
                            console.info('%d cities were successfully stored.', cities.length);

                            for (var v2 = 0, t2 = cities.length; v2 < t2; v2++) {
                                var objSavedCity = cities[v2];
                                var arrCounties = mapCodeCounties[objSavedCity.code];
                                if (arrCounties !== undefined) {
                                    for (var countyi = 0, countylen = arrCounties.length; countyi < countylen; countyi++) {
                                        var objCounty = arrCounties[countyi]['$'];
                                        objCounty.parentId = objSavedCity._id;
                                        objCounty.category = 'county';
                                        arrCounties2Insert.push(objCounty);
                                        mapCodeTowns[objCounty.code] = arrCounties[countyi].town;
                                    }
                                }
                            }

                            Location.collection.insert(arrCounties2Insert, function(err, counties) {
                                if (err) {
                                    console.log('counties err::::');
                                    console.log(err)
                                } else {
                                    console.info('%d counties were successfully stored.', counties.length);

                                    for (var v3 = 0, t3 = counties.length; v3 < t3; v3++) {
                                        var objSavedCounty = counties[v3];
                                        var arrTowns = mapCodeTowns[objSavedCounty.code];
                                        if (arrTowns !== undefined) {
                                            for (var towni = 0, townlen = arrTowns.length; towni < townlen; towni++) {
                                                var objTown = arrTowns[towni]['$'];
                                                objTown.parentId = objSavedCounty._id;
                                                objTown.category = 'town';
                                                arrTowns2Insert.push(objTown);
                                                mapCodeVillages[objTown.code] = arrTowns[towni].village;
                                            }
                                        }
                                    }
                                    Location.collection.insert(arrTowns2Insert, function(err, towns) {
                                        if (err) {
                                            console.log('towns err::::');
                                            console.log(err)
                                        } else {
                                            console.info('%d towns were successfully stored.', towns.length);

                                            for (var v4 = 0, t4 = towns.length; v4 < t4; v4++) {
                                                var objSavedTown = towns[v4];
                                                var arrVillages = mapCodeVillages[objSavedTown.code];
                                                if (arrVillages !== undefined) {
                                                    for (var villagei = 0, villagelen = arrVillages.length; villagei < villagelen; villagei++) {
                                                        var objVillage = arrVillages[villagei]['$'];
                                                        objVillage.parentId = objSavedTown._id;
                                                        objVillage.category = 'village';
                                                        arrVillages2Insert.push(objVillage);
                                                    }
                                                }
                                            }
                                            Location.collection.insert(arrVillages2Insert, function(err, villages) {
                                                if (err) {
                                                    console.log('villages err::::');
                                                    console.log(err)
                                                } else {
                                                    console.info('%d villages were successfully stored.', villages.length);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });

                }
            });
        }

        console.log('Done');
    });
});
//mongoimport --db <db-name> --collection <coll-name> --type json --file seed.json --jsonArray
//2013年统计用区划代码和城乡划分代码(截止2013年8月31日)