const axios = require("axios")
const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request");
const xlsx = require("xlsx");
const { URL } = require("url");

const workbook = xlsx.readFile('all_logos_test.xlsx');
const sheet_name_list = workbook.SheetNames;
const sites = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])

let download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback); 
    });
};

let increment = 0;

sites.forEach((site) => {
    let cleanURL;
    if (site.site_url.startsWith("http")) {
        cleanURL = site.site_url;
    } else {
        cleanURL = "http://www." + site.site_url;
    }
    let url = new URL(cleanURL)
    axios.get(url.origin).then((response) => {
        if (response.status === 200 && response !== undefined) {
            let html = response.data;
            let $ = cheerio.load(html)   
            $("img").each(function (index) {               
                if (index < 4) {
                    let img = $(this).attr("src");
                    if (img.indexOf("logo") >= 0) {
                        let imgLink;
                        if (img.indexOf("http") >= 0 || img.indexOf("www") >= 0) {
                            imgLink = img
                        } else {
                            imgLink = url.origin + "/" + img
                        }
                        let obj = {
                            siteName: site.site_name.replace(/\s/g, '').replace(/[^\w\s]/gi, ''),
                            logo: imgLink.split("?").shift(),
                            host: url.origin,
                            imagepath: img,
                            siteId: site.site_id,
                            extension: "." + imgLink.slice((imgLink.lastIndexOf(".") - 1 >>> 0) + 2).split("?").shift().split(";").shift()
                        }              
                        axios.get(obj.logo).then((response) => {
                            increment++;
                            if (response.status === 200) {
                                if (obj.extension == ".png" || obj.extension == ".jpg" || obj.extension == ".jpeg" || obj.extension === ".svg") {
                                    console.log(obj)
                                    download(obj.logo, "output/" + obj.siteName + "-" + obj.siteId + "-" + increment + obj.extension, function () { });
                                }
                            }
                        }).catch((e) => {
                        })
                    }
                }
            });           
        }
    }).catch((e) => {
    });
})

