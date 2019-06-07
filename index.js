/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import { createStackNavigator, createAppContainer } from "react-navigation";
import MainPage from './Views/Home/MainPage';
import WebPage from './Views/Home/WebPage';

const AppNavigator = createStackNavigator(
                    {   
                        main : MainPage,
                        webPage : WebPage,
                    },
                    {
                        initialRouteName :  "main",
                        headerMode : "none",
                    },);

AppRegistry.registerComponent(appName, () => createAppContainer(AppNavigator));
