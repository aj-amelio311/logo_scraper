const axios = require("axios")
const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request");
const xlsx = require("xlsx");
const {URL} = require("url");

const workbook = xlsx.readFile('sites.xlsx');
const sheet_name_list = workbook.SheetNames;
const sites = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])

let download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

sites.forEach((site) => {
  var url = new URL(site.site_url)
  axios.get(url.origin).then((response) => {
    let html = response.data;
    let $ = cheerio.load(html)
    $("img").each(function(index) {
      let img = $(this).attr("src");
      if (img.indexOf("logo") >= 0) {
        let imgLink;
        if (img.startsWith("http") || img.startsWith("www")) {
          imgLink = img
        } else {
          imgLink = url.origin + img
        }
        let obj = {
          siteName: site.site_name,
          logo: imgLink,
          siteId: site.site_id,
          extension: "." + imgLink.slice((imgLink.lastIndexOf(".") - 1 >>> 0) + 2)
        }
        download(obj.logo, "output/" + obj.siteName + "-" + obj.siteId + obj.extension, function(){
        });
      }
    });
  }).catch((e) => {
  });
})
