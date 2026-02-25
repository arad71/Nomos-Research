import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';

import { isAuthenticated } from '../utils/auth';

type PrivateRouteType = {
  component: React.ComponentType<any>;
};

export const PrivateRoute: FC<PrivateRouteType> = ({ component: Component }) =>
  isAuthenticated() === true ? <Component /> : <Navigate to="/login" replace />;
