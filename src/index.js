import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import * as serviceWorker from './serviceWorker';
import './styles.css';
import Navbar from "./Navbar/Navbar";

const App = lazy(() => import("./App.js"));
const Projects = lazy(() => import('./Projects/Projects.js'));
const CiteForm = lazy(() => import('./CiteForm/CiteForm.js'));
const EditForm = lazy(() => import('./EditForm/EditForm.js'));
const WebsiteAutofill = lazy(() => import('./WebsiteAutofill/WebsiteAutofill.js'));
const Settings = lazy(() => import('./Settings/Settings.js'));

function loadingComponent(Component) {
  return props => (
    <Suspense fallback={<div />}>
      <Component {...props} />
    </Suspense>
  );
}

ReactDOM.render(
    <Provider store={store}>
        <Router>
        	<div>
	        	<Navbar/>
	        	<Switch>
		            <Route path="/" exact component={loadingComponent(App)} />
		            <Route path="/projects" component={loadingComponent(Projects)} />
		            <Route path="/cite" component={loadingComponent(CiteForm)} />
		            <Route path="/edit" component={loadingComponent(EditForm)} />
		            <Route path="/website" component={loadingComponent(WebsiteAutofill)} />
		            <Route path="/settings" component={loadingComponent(Settings)} />
	         	</Switch>
         	</div>
        </Router>
    </Provider>,
    document.getElementById('root')
);

serviceWorker.register();