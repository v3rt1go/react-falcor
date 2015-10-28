'use strict';
const React = require('react');
// Defining data
const model = new falcor.Model({
  // If we would want it to read from the server we would do something like
  // source: new falcor.HttpDataSource('./model.json');
  // cache is where falcor on client stores its cache data
  cache: {
    recipies: [
      {
        name: 'Cookies',
        instructions: 'bake them'
      },
      {
        name: 'Brownies',
        instrcutions: 'also bake them'
      }
    ]
  }
});

// Fetching data
// using model.get() - falcor lazy evaluates this so it's actually fetched when
// it's needed
// Falcor is built and very optimised to get small pieces of data at one time,
// different from other libraries that are optimised to return the full chunk of
// data - with this in mind, remember to choose the right tool for the job :)
// The below way of getting data is called the Path query. where we write in
// strings as we would query an array - at list simillar
model.get('recipies[0]["name", "instructions"]');
// The same as the above can be achieved with this syntax:
// Path queries like the one above are actually converted by falcor to the form
// below, automatically when the query is ran
model.get('recipies[0].name')
  .then(data => console.log(data));
model.get(['recipies', 0, ['name', 'instructions']])
  .then(data => console.log(data));
// To get multiple items we have to use a range like operator. Ranges are not
  // really implemented in javascript, but falcor understands them.
  // Unfortuneatly there is no all operator, so if we want to load all, and we
  // don't know the exat numer we have to use a big range ...
model.get('recipies[0..99]["name", "instructions"]')
  .then(data => console.log(data));

const App = React.createClass({
  render() {
    return <h1>Hello World</h1>;
  }
});
React.render( <App />, window.document.getElementById('target') );
