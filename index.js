/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import { createStackNavigator, createAppContainer } from "react-navigation";
import MainPage from './Views/Home/MainPage';
import WebPage from './Views/Common/WebPage'

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
