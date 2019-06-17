import React from 'react';
import {View,Text, Dimensions, StyleSheet, ScrollView, FlatList, StatusBar, ActivityIndicator, RefreshControl} from 'react-native';
import axios from 'axios';
import Image from 'react-native-scalable-image';
import { TouchableOpacity } from 'react-native-gesture-handler';

const upvoteImg = require('../../assets/upvote-icon.png');
const SCREEN_WIDTH = Dimensions.get('window').width

class ViewPost extends React.Component
{
        constructor(props)
        {
                super(props);
                this.state = {
                        heading : "heading",
                        content : "content",
                        apiData : [],
                        apiDataComments : [],
                        commentsLoaded : false,
                        isRefreshing : false,
                        postTitle : "",
                        postAuthor : "",
                        goldAward : 0,
                        silverAward : 0,
                        platinumAward : 0,
                        score : 0,
                        url : "",
                        type : "",
                        link : "",
                        selftext : "",
                        nsfw : null,
                }
                this.renderComments  = this.renderComments.bind(this);
                this.fetchSinglePost = this.fetchSinglePost.bind(this);
                this.renderAcitivityIndicator = this.renderAcitivityIndicator.bind(this);
                this.refresh = this.refresh.bind(this);
                this.navigateToUrl = this.navigateToUrl.bind(this);
        }
        navigateToUrl(url, type, name)
        {
                const {navigation} = this.props;
                this.props.navigation.navigate('webPage',{
                        url : url,
                        type : type,
                        name : name
                });
        }
        async componentWillMount()
        {
                const {navigation} = this.props;
                await this.setState({
                        postTitle : navigation.getParam("title", ""),
                        postAuthor : navigation.getParam("author", ""),
                        goldAward : navigation.getParam("gold", ""),
                        silverAward : navigation.getParam("silver", ""),
                        platinumAward : navigation.getParam("platinum", ""),
                        score : navigation.getParam("score", ""),
                        link : navigation.getParam("link", ""),
                        url :  navigation.getParam("url", ""),
                        type : navigation.getParam("type", ""),
                        selfText : navigation.getParam("selftext", ""),
                        nsfw : navigation.getParam("nsfw", "")
                });
                //
                this.fetchSinglePost();
        }
        async fetchSinglePost()
        {
                var url = this.state.link;
                var self = this;
                await axios.get(url)
                .then(function(response){
                        self.setState({
                                apiData : response.data,
                                apiDataComments : response.data[1].data.children,
                                commentsLoaded : true,
                                isRefreshing : false,
                        });
                })
        }
        renderComments({item, index})
        {
                if(index < this.state.apiDataComments.length - 1)
                {
                        return(
                                <View style={styles.commentContainer}>
                                        <Text style={styles.commentBodyText}>{item.data.body}</Text>
                                        <Text style={styles.commentAuthorText}>{item.data.author}</Text>
                                        <View style={styles.commentInfoView} >
                                                <Image width={15} height={15} source={upvoteImg} />
                                                <Text style={styles.commentUpvoteText}>
                                                        {item.data.score}
                                                </Text>
                                        </View>
                                </View>
                        );
                }
                else
                {
                return null;
                }

        }

        renderAcitivityIndicator()
        {
                if(!this.state.commentsLoaded)
                {
                        return(
                        <View style={styles.activityIndicatorStyle}>
                                <ActivityIndicator size="large" color="#0090ab" />
                        </View>
                        );
                }
                return null;
        }
        refresh()
        {
                if(!this.state.isRefreshing)
                {
                        this.setState({
                        isRefreshing : true,
                        });
                        this.fetchSinglePost();
                }

        }
        render()
        {
                return(
                        <ScrollView
                                refreshControl={
                                <RefreshControl 
                                refreshing={this.state.isRefreshing}
                                onRefresh={this.refresh}
                                progressBackgroundColor={"#00161A"}
                                colors={["#0090ab","#0090ab","#00161A"]}
                                />}
                                style={styles.parentContainer}>
                                        <StatusBar backgroundColor="#001316"/>
                                        <View style={styles.headerBar}>
                                                <Text style={styles.headerBarTitle}>
                                                        {this.state.postTitle}
                                                </Text>
                                                <Text style={styles.headerBarUsername}>{this.state.postAuthor}</Text>
                                                <View style={styles.headerBarInfo} >
                                                        <Image width={18} height={18} source={upvoteImg} />
                                                        <Text style={styles.headerUpvoteText}>
                                                        {this.state.score}
                                                        </Text>
                                                        {this.state.silverAward != null ? (<Text style={styles.silver}>
                                                        Silver x{this.state.silverAward}
                                                        </Text>):(null)}
                                                        {this.state.goldAward != null ? ( <Text style={styles.gold}>
                                                        Gold x{this.state.goldAward}
                                                        </Text>):(null)}
                                                        {this.state.platinumAward != null ? (<Text style={styles.platinum}>
                                                        Platinum x{this.state.platinumAward}
                                                        </Text>):(null)}      
                                                        {this.state.nsfw?(<Text style={styles.nsfw}>NSFW</Text>):(null)}   
                                                </View>
                                        </View>
                                        <TouchableOpacity onPress={()=>{this.navigateToUrl(this.state.url,this.state.type,this.state.postTitle)}}>
                                                <Text style={styles.postUrlText}>link : {this.state.url}</Text>
                                        </TouchableOpacity>
                                        {this.state.type == "image"?(<Image width={SCREEN_WIDTH} source={{uri : this.state.url}} />):(null)}
                                        {this.state.type == "selftext"?(<Text style={styles.selfText}>{this.state.selfText}</Text>):(null)}
                                        <View style={styles.commentHeader}>
                                                <Text style={{color : "white", fontFamily : "Quicksand-Bold"}}>Comments</Text>
                                        </View>
                                        {this.renderAcitivityIndicator()}
                                        <FlatList
                                        keyExtractor={(item, index)=>item.data.id}
                                        data = {this.state.apiDataComments}
                                        renderItem = {this.renderComments}
                                        style = {{paddingBottom : "10%"}}

                                        />
                        </ScrollView>
                );
        }
}
export default ViewPost;

const styles = StyleSheet.create({
    nsfw : {
        marginLeft : 20,
        bottom : 4,
        fontFamily : "Quicksand-Bold",
        color : "red"
    },
    parentContainer : {
        backgroundColor : "#00161A",
    },
    selfText : {
        marginLeft : 8,
        fontFamily : "Quicksand-Regular",
        color : "white"
    },
    commentHeader : {
        marginTop : 25,
        backgroundColor : "#0090ab", 
        width : "100%", 
        justifyContent : "center", 
        alignItems : "center", 
        height : 50
    },
    postUrlText : {
        color : "#0090ab",
        fontFamily : "Quicksand-Bold",
        marginBottom : 20,
        marginTop : 5,
        marginLeft : 8
    },
    activityIndicatorStyle : {
        marginTop : 20,
        paddingBottom : 20,
    },
    silver: {
        bottom : 4,
        marginLeft : 20,
        color : "#c0c0c0",
        fontFamily : "Quicksand-Bold",      
    },
    gold : {
        bottom : 4,
        marginLeft : 10,
        color : "#ffff00",
        fontFamily : "Quicksand-Bold",      

    },
    platinum : {
        bottom : 4,
        marginLeft : 10,
        color : "#e5e4e2",
        fontFamily : "Quicksand-Bold",      

    },
    headerBarUsername : {
        fontFamily : "Quicksand-Regular",
        color : "white",
        bottom : 5,
        
    },
    headerUpvoteText : {
        color : "white",
        fontFamily : "Quicksand-Bold",
        bottom : 4,
        left : 8
    },
    headerBar : {
       
        backgroundColor : "#00161A",
        width : "100%",
        justifyContent : "center",       
        paddingLeft : 8,
        paddingTop : 10,
        paddingBottom : 10,
    },
    headerBarTitle : {
        textAlign : "left",
        fontSize : 15,
        color : "white",
        fontFamily : "Quicksand-Bold",
        marginBottom : 10,
    },
    headerBarInfo : {
        flexDirection : "row",
        marginTop : 10
    },

    commentInfoView : {
        flexDirection : "row",
        marginTop : 20,
    },
    commentUpvoteText : {
        color : "white",
        fontFamily : "Quicksand-Bold",
        bottom : 4,
        left : 8
    },
    commentContainer : {
        borderRadius : 7,
        backgroundColor : "#00353f",
        marginTop : 10,
        marginLeft : 5,
        marginRight : 5,
        padding : 5,
        
    },
    commentBodyText : {
        fontFamily : "Quicksand-Bold",
        color : "white",
    },
    commentAuthorText : {
        fontFamily : "Quicksand-Regular",
        color : "white",
    },
});