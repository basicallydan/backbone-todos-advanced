// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Global app namespace
var App = {};

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `done` attributes.
  App.Todo = Backbone.Model.extend({

    // Default attributes for the todo item.
    defaults: function() {
      return {
        title: 'e.g. Reticulate splines...',
        description: '',
        order: App.Todos.nextOrder(),
        done: false
      };
    },

    // Ensure that each todo created has `title`.
    initialize: function() {
      if (!this.get('title')) {
        this.set({'title': this.defaults().title});
      }
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get('done')});
    },

    // Remove this Todo from *localStorage* and delete its view.
    clear: function() {
      this.destroy();
    }

  });

  // Todo Collection
  // ---------------

  // The collection of todos is backed by *localStorage* instead of a remote
  // server.
  App.TodoList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: App.Todo,

    // Save all of the todo items under the `'todos'` namespace.
    localStorage: new Store('todos-backbone'),

    // Filter down the list of all todo items that are finished.
    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: function(todo) {
      return todo.get('order');
    }

  });

  // Create our global collection of **Todos**.
  App.Todos = new App.TodoList();

  // Todo Item View
  // --------------

  // The DOM element for a todo item...
  var TodoView = Backbone.View.extend({

    //... is a list tag.
    tagName:  'li',

    // Cache the template function for a single item.
    template: Handlebars.compile($('#item-template').html()),
    // template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      'click .toggle'       : 'toggleDone',
      'click a.destroy'     : 'clear',
      'dblclick .title'     : 'edit',
      'keypress .edit'      : 'updateOnEnter',
      'blur .edit'          : 'finishEditingTitle',
      'click .description'  : 'editDescription',
      'keypress .edit-desc' : 'updateOnEnter',
      'blur .edit-desc'     : 'finishEditingDescription',
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.titleInput = this.$('.edit');
      this.descriptionInput = this.$('.edit-desc');

      return this;
    },

    // Toggle the `'done'` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `'editing'` mode, displaying the input field.
    edit: function() {
      this.$el.addClass('editing');
      this.titleInput.focus();
    },

    editDescription: function() {
      this.$el.addClass('editing-description');
      this.descriptionInput.focus();
    },

    // Close the `'editing'` mode, saving changes to the todo.
    finishEditingTitle: function() {
      var value = this.titleInput.val();
      if (!value) this.clear();
      this.model.save({title: value});
      this.$el.removeClass('editing');
    },

    finishEditingDescription: function() {
      var value = this.descriptionInput.val();
      if (!value) value = '';
      this.model.save({description: value});
      this.$el.removeClass('editing-description');
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) {
        this.finishEditingTitle();
        this.finishEditingDescription();
      }
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }

  });

  // The Application
  // ---------------


  // Register a handlebars helper to pluralise the word 'item'
  Handlebars.registerHelper('pluraliseItem', function(word, numVal) {
    return numVal === 1 ? 'item' : 'items';
  });

  Handlebars.registerHelper('truthySwitch', function(thing, truthyResult, falsyResult) {
    falsyResult = falsyResult || '';
    return thing ? truthyResult : falsyResult;
  });

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $('#todoapp'),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: Handlebars.compile($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      'keypress #new-todo':  'createOnEnter',
      'click #clear-completed': 'clearCompleted',
      'click #toggle-all': 'toggleAllComplete'
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      this.titleInput = this.$('#new-todo');
      this.allCheckbox = this.$('#toggle-all')[0];

      App.Todos.bind('add', this.addOne, this);
      App.Todos.bind('reset', this.addAll, this);
      App.Todos.bind('all', this.render, this);

      this.footer = this.$('footer');
      this.main = $('#main');

      App.Todos.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var done = App.Todos.done().length;
      var remaining = App.Todos.remaining().length;

      if (App.Todos.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      } else {
        this.main.hide();
        this.footer.hide();
      }

      this.allCheckbox.checked = !remaining;
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$('#todo-list').append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      App.Todos.each(this.addOne);
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.titleInput.val()) return;

      App.Todos.create({title: this.titleInput.val()});
      this.titleInput.val('');
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
      _.each(App.Todos.done(), function(todo){ todo.clear(); });
      return false;
    },

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      App.Todos.each(function (todo) { todo.save({'done': done}); });
    }

  });

  // Finally, we kick things off by creating the **App**.
  var view = new AppView();
});
