import React from 'react';
import { BrowserRouter as Router, Switch, Route, /*Link*/ } from "react-router-dom";
import store from './store';
import { Provider } from 'react-redux';

const Home = React.lazy(() => import('./pages/Home'));
const Room = React.lazy(() => import('./pages/Room'));

const App = () => {
  return (
    <Provider store={store}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Router>
          <Switch>
            <Route path="/room" render={() => <Room/>} />
            <Route path="/" render={() => <Home/>} />
          </Switch>
        </Router>
      </React.Suspense>
    </Provider>
  );
}

export default App;
