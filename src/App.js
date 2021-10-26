import React from 'react';
import { Router, Switch, Route, /*Link*/ } from "react-router-dom";
import store from './store';
import history from './history';
import { Provider } from 'react-redux';
import { ProtectedRouteAuth } from './components/ProtectedRoute';
import './helpers/storeListener';

const Home = React.lazy(() => import('./pages/Home'));
const Room = React.lazy(() => import('./pages/Room'));

const App = () => {
  return (
    <Provider store={store}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Router history={history}>
          <Switch>
            <ProtectedRouteAuth path="/room" render={() => <Room/>} />
            <ProtectedRouteAuth path="/room/:roomId" render={() => <Room/>} />
            <Route path="/" render={() => <Home/>} />
          </Switch>
        </Router>
      </React.Suspense>
    </Provider>
  );
}

export default App;
