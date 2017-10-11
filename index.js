const rp = require('request-promise-native');
const cheerio = require('cheerio');

// const fs = require('fs');
// const util = require('util');
// const print_obj = obj => console.log(util.inspect(obj, { depth: null, colors: true }));

function load_scraper(json_source) {
  // console.log('Source:')
  // print_obj(json_source)
  const callback = this.async();
  this.cacheable();
  load_scraper_object(json_source)
    .then(res => {
      // console.log('Load scraper result:')
      // print_obj(res)
      callback(null, JSON.stringify(res))
    })
    .catch(err => callback(err))
}

const load_scraper_object = async json_source => {
  const scrape_tasks = JSON.parse(json_source);
  const scrape_results = {}
  for(let task_name in scrape_tasks) {
    scrape_results[task_name] = await scrape(scrape_tasks[task_name])
  }
  return scrape_results;
}


const scrape = async task => {
  const $ = await get_dom(task.url);
  const cher_elems = $(task.selector);
  if(task.find_one) {
    return parse_one($, cher_elems, task.data);
  } else {
    return parse_many($, cher_elems, task.data);
  }
}

const get_dom = async url => cheerio.load(await rp(url));

const parse_one = ($, cher_elems, data) =>
  parse_elem(cher_elems.first());

const parse_many = ($, cher_elems, data) =>
  cher_elems.map((_, elem) => parse_elem($(elem), data)).get();

const parse_elem = (cher_elem, data) => {
  const elem_data = {};
  for(let key in data) {
    elem_data[key] = extract_data(cher_elem, data[key]);
  }
  return elem_data;
}

const extract_data = (cher_elem, data_def) => {
  const cher_fn = cher_elem[data_def.func];
  if(typeof cher_fn !== 'function') {
    throw new Error(`${data_def.func} is not a valid cheerio function`);
  }
  return cher_fn.apply(cher_elem, data_def.args);
}

module.exports = load_scraper;


// let fdata = fs.readFileSync('./functions.scraper.json');
// let fobj = load_scraper(fdata);
// print_obj(fobj);
// // load_scraper_object(fdata)
// //   .then(obj => console.log(util.inspect(obj, { depth: null, colors: true })))
// //   .catch(err => console.error(err));