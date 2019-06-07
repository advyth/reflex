import { createStackNavigator, createAppContainer } from "react-navigation";
import MainPage from './Views/Home/MainPage';

const AppNavigator = createStackNavigator(
                    {   
                        main : MainPage,
                        webPage : WebPage,
                    },
                    {
                        initialRouteName :  "main",
                        headerMode : "none",
                    },);
  
export default AppNavigator;