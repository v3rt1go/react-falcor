/* global falcor */
'use strict';
const React = require('react');
const _ = require('lodash');
const $ref = falcor.Model.ref;
const $atom = falcor.Model.atom;

// Defining data
const model = new falcor.Model({
  // If we would want it to read from the server we would do something like
  // source: new falcor.HttpDataSource('./model.json');
  // cache is where falcor on client stores its cache data
  cache: {
    ingredientsById: {
      1: {
        name: 'Flour',
        description: 'White and powdery'
      },
      2: {
        name: 'Chocolate chips',
        description: 'Simply delicious'
      }
    },
    recipes: [
      {
        name: 'Cookies',
        instructions: 'bake them',
        ingredients: [
          // We can reference a relation by either using the below syntax with
          // the $ref helper fron falcor.Model.ref
          $ref('ingredientsById[1]'),
          // Or using the syntax below - this is the recommended way
          { $type: 'ref', value: ['ingredientsById', 2] }
        ],
        authors: { $type: 'atom', value: ['Alex', 'Cip', 'Ed'] }
      },
      {
        name: 'Brownies',
        instructions: 'also bake them',
        ingredients: [
          { $type: 'ref', value: ['ingredientsById', 1] }
        ],
        authors: $atom(['Cip', 'Raluca'])
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
model.get('recipes[0]["name", "instructions"]');
// The same as the above can be achieved with this syntax:
// Path queries like the one above are actually converted by falcor to the form
// below, automatically when the query is ran
model.get('recipes[0].name')
  .then(data => console.log(data));
model.get(['recipes', 0, ['name', 'instructions']])
  .then(data => console.log(data));
// To get multiple items we have to use a range like operator. Ranges are not
  // really implemented in javascript, but falcor understands them.
  // Unfortuneatly there is no all operator, so if we want to load all, and we
  // don't know the exat numer we have to use a big range ...
model.get('recipes[0..99]["name", "instructions"]')
  .then(data => console.log(data));

// To get data that is referenced with type="ref" we can call it like so:
// where name and description ar the properties of the referenced object
model.get('recipes[0..99].ingredients[0..99]["name", "description"]')
  .then(data => console.log(data));
// We can combine data from both objects (recipes and ingredients) by putting
// two paths in the model.get method
model.get(
  'recipes[0..99].ingredients[0..99]["name", "description"]',
  'recipes[0..99]["name", "instructions", "authors"]'
).then(data => console.log(data));

// Setting up React

const App = React.createClass({
  // This type of defining functions in objects is specific to ES6. It's called
  // enhanced object literal syntax and it's pretty much the same thing as
  // writing render: function() {} inside the object
  render() {
    return (
      <div>
        <RecipeList />
      </div>
    );
  }
});

const RecipeList = React.createClass({
  getInitialState() {
    return {
      recipes: []
    };
  },
  componentWillMount() {
    model.get(
      ['recipes', {from: 0, to: 99}, Recipe.queries.recipe()],
      ['recipes', {from: 0, to: 99}, 'ingredients', {from: 0, to: 99}, Ingredients.queries.ingredients()]
    ).then(data => {
      console.log('RECIPES:', data.json.recipes);
      this.setState({
        // falcor returns an object, event though we might expect an array. It
        // returns an object because besides the data array that we would expect
        // it will add some other metadata props like id etc. to keep track of
        // oprdering and current page data. We use _.values to extract a normal
        // js array from the object. _.values takes an object and returns an
        // array of the values from all the enumerable properties of the object
        recipes: _.values(data.json.recipes)
      });
    });
  },
  render() {
    return (
      <div>
        {
          this.state.recipes.map((recipe, index) => {
            // Using ES6 arrow functions properly handles this bindings, so in
            // this case this is actually the same this as the scope that holds
            // this arrow function - so the react this, instead of this being
            // the caller of the function
            return (
              // Here we are using the spread operator to deserialize an object
              // to it's props and values
              <Recipe key={index} {...recipe} />
            );
          })
        }
      </div>
    );
  }
});

const Recipe = React.createClass({
  statics: {
    queries: {
      recipe() {
        return _.union( Name.queries.recipe(), Instructions.queries.recipe() );
      },
      ingredients() {
        return Ingredients.queries.ingredients();
      }
    }
  },
  render() {
    return (
      <div>
        <Name {..._.pick(this.props, Name.queries.recipe())} />
        <Instructions instructions={this.props.instructions} />
        <Ingredients ingredients={this.props.ingredients} />
      </div>
    );
  }
});

const Name = React.createClass({
  statics: {
    queries: {
      recipe() {
        return ["name", "authors"];
      }
    }
  },
  render() {
    return (
      <div>
        <h1>{this.props.name}</h1>
        <h1>{JSON.stringify(this.props.authors)}</h1>
      </div>
    );
  }
});

const Instructions = React.createClass({
  statics: {
    queries: {
      recipe() {
        return ["instructions"];
      }
    }
  },
  render() {
    return (
      <h2>{this.props.instructions}</h2>
    );
  }
});

const Ingredients = React.createClass({
  statics: {
    queries: {
      ingredients() {
        return ["name", "description"];
      }
    }
  },
  render() {
    return (
      <h3>{JSON.stringify(this.props.ingredients)}</h3>
    );
  }
});

React.render( <App />, window.document.getElementById('target') );
