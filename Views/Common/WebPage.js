import React from 'react';
import {View, StyleSheet, Text, Image, TouchableOpacity, Modal, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob'


const secureImage = require('../../assets/https-lock.png');
const downloadImage = require('../../assets/download-icon.png');
const Url = require('url-parse');

class WebPage extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            fontLoaded : false,
            modalVisible : false,
        }
        this.downloadFile = this.downloadFile.bind(this);
    }    
    async downloadFile()
    {
        
        this.setState({
            modalVisible : true,
        });
        let dirs = RNFetchBlob.fs.dirs;
        const {navigation} = this.props;
        const url = navigation.getParam('url', 'https://google.com');
        const name = navigation.getParam('name',"default");
        const type = navigation.getParam('type', "default");
        var self = this;
        if(type == "image")
        {
            await RNFetchBlob
            .config({
                path : dirs.DownloadDir + "/reflex/"+name+".jpg",
            })
            .fetch('GET', url, {
            })
            .then((res) => {
                self.setState({
                    modalVisible : false,
                });
            })
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
        const type = navigation.getParam('type', "default");
        if(this.state.fontLoaded)
        {
            return(<View style={styles.webViewContainer}>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={this.state.modalVisible}
                    >
                        <View style={{flex : 1,justifyContent : "center"}}>
                            <View style={{alignSelf : "center",backgroundColor : "#222632", height : "20%",justifyContent : "center", width : "80%", paddingBottom : 20, borderRadius : 20}}>
                                <Text style={{alignSelf : "center", color : "white", fontFamily:"Quicksand-Bold",marginBottom : 20}}>Downloading file</Text>
                                <ActivityIndicator size="large" color="#0090ab" />
                            </View>
                        </View>
                    </Modal>
                    <View style={{flexDirection : 'row', justifyContent : 'center'}}>
                        <Image style={{width : 10, height : 10,marginTop : 6, marginRight : 5}} source={secureImage}/>
                        <Text style={styles.containerText}>{hostname}</Text></View>
                        <WebView style={styles.webView} source={{uri : url}}/>
                        {type=="image"?(<TouchableOpacity onPress={()=>{
                            this.downloadFile();
                        }}>
                            <View style={{flexDirection : 'row', justifyContent : 'center', paddingTop : 20, marginBottom : 5}}>
                                <Image style={{width : 25, height : 25}} source={downloadImage} />
                            </View>
                        </TouchableOpacity>):(null)}
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