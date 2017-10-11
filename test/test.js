const util = require('util');
const readFile = util.promisify(require('fs').readFile);
const runLoaders = util.promisify(require('loader-runner').runLoaders);
const path = require('path');

const loader_path = path.resolve(__dirname, '../index.js');
const resource_path = path.resolve(__dirname, './resources/functions.scraper.json');
const expected_path = path.resolve(__dirname, './resources/expected_scrape_data.json');

let _expected;

const expected = async () => {
  if(_expected == null) _expected = {
    cacheable: true,
    object: JSON.parse(await readFile(expected_path))
  };
  return _expected;
};

const actual = async () => {
  // console.log('Resource path: ', resource_path)
  const result = await runLoaders({
    resource: resource_path,
    loaders: [loader_path],
  });
  // console.log(util.inspect(result, { depth: null, colors: true }));
  return {
    cacheable: result.cacheable,
    object: JSON.parse(result.result)
  }
};

describe('loader', () => {
  it('should match the expected data', async () => {
    // console.log('RUNNING')
    const actual_result = await actual();
    const expected_result = await expected();
    expect(actual_result).toEqual(expected_result)
  })
});


