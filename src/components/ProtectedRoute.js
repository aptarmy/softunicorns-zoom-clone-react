import { useSelector, useDispatch} from 'react-redux';
import { Redirect, Route } from 'react-router';
import { listenUserLogin } from '../helpers/storeListener';
import { setTobeRedirected } from '../store/redirectReducer';
import history from '../history';

const ProtectedRouteAuth = (props) => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  if(user.id === null) {
    const redirectTo = history.location.pathname;
    dispatch(setTobeRedirected({ to: history.location.pathname, from: '/', type: 'AUTH_REQUIRED' }));
    listenUserLogin(() => {
      history.push(redirectTo);
      dispatch(setTobeRedirected(null));
    });
    return <Route {...props} render={() => <Redirect to="/" replace />}/>;
  }
  if(user.id !== null) {
    return <Route {...props} />;
  }
}

export { ProtectedRouteAuth };