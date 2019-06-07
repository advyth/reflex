import React from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';

import {WebView} from 'react-native-webview';

const secureImage = require('../../assets/https-lock.png');
const Url = require('url-parse');

class WebPage extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            fontLoaded : false,
        }
    }    
    async componentDidMount()
    {
        
          this.setState({fontLoaded : true}); //set fontLoaded states to true after loading is done
    }
    render()
    {
        const {navigation} = this.props;
        const url = navigation.getParam('url', 'https://google.com');
        const urlParsed = new Url(url);
        var hostname = urlParsed.protocol +"//"+ urlParsed.hostname;
        if(this.state.fontLoaded)
        {
            return(<View style={styles.webViewContainer}>
                <View style={{flexDirection : 'row', justifyContent : 'center'}}><Image style={{width : 10, height : 10,marginTop : 6, marginRight : 5}} source={secureImage}/><Text style={styles.containerText}>{hostname}</Text></View>
                <WebView style={styles.webView} source={{uri : url}}/>
              </View>              
              );
        }
        else
        {
            return null;
        }
        
    }
}
export default WebPage;

const styles=StyleSheet.create({
    webView : { 
        flex : 1,
    },
    webViewContainer : {
        flex : 1,
        backgroundColor : '#222632',
        paddingTop :20,
        paddingBottom : 10,

    },
    containerText : {
        color : "#5cf442",
        alignSelf : 'center',
        marginBottom : 20,
        fontFamily : 'Quicksand-Bold',
    },
});