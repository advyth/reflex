import React from "react";
import axios from "axios";
import {
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  Text,
  Dimensions,
  ActivityIndicator,
  TextInput,
  View,
  DrawerLayoutAndroid,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
} from "react-native";
import Image from "react-native-scalable-image";
import HTML from "react-native-render-html";

const heart = require("../../assets/heart-icon.png");
const menu_icon = require("../../assets/menu-icon.png");

class MainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      view_width: 0, //State which contains the width of the post card, required for responsive image
      apiData: [], //Array which holds top level api data
      apiChildren: [], //Array which holds api children containing the post data
      isLoading: false,
      isRefreshing: false,
      url: "https://reddit.com/r/popular.json", //Default subreddit used by app
      pre_subreddits: [
        "popular",
        "all",
        "technology",
        "productivity",
        "battlestations",
      ], //Favourite subreddits
      current_subreddit: "popular", //Default subreddit name
      search_text: "", //Subreddit search textfield state
      subreddit_exists: null,
      noMoreData: false,
      modalVisible: false,
    };
    this.navigateToWebPage = this.navigateToWebPage.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.renderPost = this.renderPost.bind(this);
    this.setLayout = this.setLayout.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.refresh = this.refresh.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderSideBar = this.renderSideBar.bind(this);
    this.handleSubredditSearch = this.handleSubredditSearch.bind(this);
    this.renderList = this.renderList.bind(this);
    this.requestStoragePermission = this.requestStoragePermission.bind(this);
  }
  async requestStoragePermission() {
    try {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Reflex file permission",
          message: "Reflex needs file access to save pictures",
          buttonNegative: "Don't allow",
          buttonPositive: "Allow",
        }
      );
    } catch (err) {
      console.warn(err);
    }
  }
  async componentDidMount() { //load the fonts asynchronously
    this.setState({ fontLoaded: true }); //set fontLoaded states to true after loading is done
    this.requestStoragePermission();
  }
  async handleSubredditSearch(text) {
    await this.setState({
      search_text: text,
    });
    console.log(this.state.search_text);
  }
  componentWillMount() {
    this.fetchData();
  }

  async refresh() {
    this.setState({
      isRefreshing: true,
    });
    this.fetchData();
  }
  async fetchData(new_url) {
    var self = this;
    var url;
    new_url == null ? (url = this.state.url) : (url = new_url);
    await axios
      .get(url)
      .then(function (response) {
        if (response.data.data.children[0].kind != "t5") {
          if (self.state.apiChildren.length == 0 || new_url == null) {
            self.setState({
              apiData: response.data.data,
              apiChildren: response.data.data.children,
              isLoading: false,
              isRefreshing: false,
              subreddit_exists: true,
              modalVisible: false,
            });
          } else {
            var new_children = self.state.apiChildren.concat(
              response.data.data.children
            );
            self.setState({
              apiData: response.data.data,
              apiChildren: new_children,
              isLoading: false,
              isRefreshing: false,
              subreddit_exists: true,
              modalVisible: false,
            });
          }
        } else {
          //alert("Subreddit does not exist");
          console.log(response.data.data.children[0].kind);
          self.setState({
            modalVisible: false,
            subreddit_exists: false,
          });
        }
      })
      .catch(function (error) {
        //alert("Subreddit does not exist");
        console.log(error.message);
        self.setState({
          modalVisible: false,
          subreddit_exists: false,
        });
      });
  }
  navigateToWebPage(url, type, name) {
    this.props.navigation.navigate("webPage", {
      url: url,
      type: type,
      name: name,
    });
  }
  async setLayout(event) {
    if (this.state.view_width == 0) {
      await this.setState({
        view_width: event.nativeEvent.layout.width,
      });
    }
  }
  renderPost({ item }) {
    var width = Dimensions.get("window").width;
    if (item.data.post_hint == "image") {
      return (
        <View onLayout={this.setLayout} style={styles.postContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              const postData = {
                title: item.data.title,
                author: item.data.author_fullname,
                score: item.data.score,
                silver: item.data.gildings.gid_1,
                gold: item.data.gildings.gid_2,
                platinum: item.data.gildings.gid_3,
                link: "https://reddit.com" + item.data.permalink + ".json",
                url: item.data.url,
                type: "image",
                nsfw: item.data.over_18,
              };
              this.props.navigation.navigate("viewPost", postData);
            }}
            onLongPress={() => {
              this.navigateToWebPage(item.data.url, "image", item.data.title);
            }}
          >
            <Text style={styles.titleText}>{item.data.title}</Text>
            <Text style={styles.username}>u/{item.data.author_fullname}</Text>
            <Text style={styles.subreddit}>r/{item.data.subreddit}</Text>
            {item.data.over_18 ? (
              <Text
                style={{
                  color: "red",
                  fontFamily: "Quicksand-Bold",
                  marginLeft: 8,
                  marginBottom: 8,
                }}
              >
                nsfw
              </Text>
            ) : null}
            <Image
              width={this.state.view_width}
              source={{ uri: item.data.url }}
            />
            <View style={styles.info}>
              <Image
                height={22}
                width={22}
                style={styles.heart}
                source={heart}
              />
              <Text style={styles.upvotes}>{item.data.ups}</Text>
              {item.data.gildings.gid_1 != null ? (
                <Text style={styles.silver}>
                  Silver x{item.data.gildings.gid_1}
                </Text>
              ) : null}
              {item.data.gildings.gid_2 != null ? (
                <Text style={styles.gold}>
                  Gold x{item.data.gildings.gid_2}
                </Text>
              ) : null}
              {item.data.gildings.gid_3 != null ? (
                <Text style={styles.platinum}>
                  Platinum x{item.data.gildings.gid_3}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (item.data.selftext != "") {
      var html = String(item.data.selftext_html);
      html = html.replace(/\&lt\;/g, "<");
      html = html.replace(/\&gt\;/g, ">");
      html = html.replace(/<!-- SC_OFF -->/g, "");
      html = html.replace(/<!-- SC_ON -->/g, "");
      html = html.replace(/&amp;#39;/g, "'");
      html = html.replace(/&amp;quot;/g, '"');
      html = html.replace(/&amp;#x200B;/g, "<br><br>");
      html = html.replace(/&amp;amp;/g, "&");
      return (
        <View style={styles.postContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              const postData = {
                title: item.data.title,
                author: item.data.author_fullname,
                score: item.data.score,
                silver: item.data.gildings.gid_1,
                gold: item.data.gildings.gid_2,
                platinum: item.data.gildings.gid_3,
                link: "https://reddit.com" + item.data.permalink + ".json",
                url: item.data.url,
                type: "selftext",
                selftext: item.data.selftext,
                nsfw: item.data.over_18,
              };
              this.props.navigation.navigate("viewPost", postData);
            }}
            onLongPress={() => {
              this.navigateToWebPage(item.data.url, "image", item.data.title);
            }}
          >
            <Text style={styles.titleText}>{item.data.title}</Text>
            <Text style={styles.username}>u/{item.data.author_fullname}</Text>
            <Text style={styles.subreddit}>r/{item.data.subreddit}</Text>
            {item.data.over_18 ? (
              <Text
                style={{
                  color: "red",
                  fontFamily: "Quicksand-Bold",
                  marginLeft: 8,
                  marginBottom: 3,
                }}
              >
                nsfw
              </Text>
            ) : null}
            <HTML
              onLinkPress={(event, href, object) => {
                this.navigateToWebPage(href);
              }}
              tagsStyles={{
                p: {
                  color: "white",
                  fontFamily: "Quicksand-Regular",
                  marginLeft: 8,
                  fontSize: 12,
                },
                ul: {
                  color: "white",
                  fontFamily: "Quicksand-Bold",
                  fontSize: 10,
                },
                li: { color: "white" },
                h1: {
                  color: "white",
                  fontFamily: "Quicksand-Bold",
                  marginLeft: 8,
                },
                h2: {
                  color: "white",
                  fontFamily: "Quicksand-Bold",
                  marginLeft: 8,
                },
                h3: {
                  color: "white",
                  fontFamily: "Quicksand-Bold",
                  marginLeft: 8,
                },
                h4: {
                  color: "white",
                  fontFamily: "Quicksand-Bold",
                  marginLeft: 8,
                },
                h1: {
                  color: "white",
                  fontFamily: "Quicksand-Bold",
                  marginLeft: 8,
                },
                h5: {
                  color: "white",
                  fontFamily: "Quicksand-Bold",
                  marginLeft: 8,
                },
              }}
              html={html}
              imagesMaxWidth={Dimensions.get("window").width}
            />
            <View style={styles.info}>
              <Image
                height={22}
                width={22}
                style={styles.heart}
                source={heart}
              />
              <Text style={styles.upvotes}>{item.data.ups}</Text>
              {item.data.gildings.gid_1 != null ? (
                <Text style={styles.silver}>
                  Silver x{item.data.gildings.gid_1}
                </Text>
              ) : null}
              {item.data.gildings.gid_2 != null ? (
                <Text style={styles.gold}>
                  Gold x{item.data.gildings.gid_2}
                </Text>
              ) : null}
              {item.data.gildings.gid_3 != null ? (
                <Text style={styles.platinum}>Platinum x{item.data.gid_3}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (item.data.selftext == "") {
      return (
        <View style={styles.postContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              const postData = {
                title: item.data.title,
                author: item.data.author_fullname,
                score: item.data.score,
                silver: item.data.gildings.gid_1,
                gold: item.data.gildings.gid_2,
                platinum: item.data.gildings.gid_3,
                link: "https://reddit.com" + item.data.permalink + ".json",
                url: item.data.url,
                type: "url",
                nsfw: item.data.over_18,
              };
              this.props.navigation.navigate("viewPost", postData);
            }}
            onLongPress={() => {
              this.navigateToWebPage(item.data.url, "image", item.data.title);
            }}
          >
            <Text style={styles.titleText}>{item.data.title}</Text>
            <Text style={styles.username}>u/{item.data.author_fullname}</Text>
            <Text style={styles.subreddit}>r/{item.data.subreddit}</Text>
            {item.data.over_18 ? (
              <Text
                style={{
                  color: "red",
                  fontFamily: "Quicksand-Bold",
                  marginLeft: 8,
                  marginBottom: 3,
                }}
              >
                nsfw
              </Text>
            ) : null}
            <Text
              onPress={() => {
                this.navigateToWebPage(item.data.url);
              }}
              style={styles.urlText}
            >
              {item.data.url}
            </Text>
            <View style={styles.info}>
              <Image
                height={22}
                width={22}
                style={styles.heart}
                source={heart}
              />
              <Text style={styles.upvotes}>{item.data.ups}</Text>
              {item.data.gildings.gid_1 != null ? (
                <Text style={styles.silver}>
                  Silver x{item.data.gildings.gid_1}
                </Text>
              ) : null}
              {item.data.gildings.gid_2 != null ? (
                <Text style={styles.gold}>
                  Gold x{item.data.gildings.gid_2}
                </Text>
              ) : null}
              {item.data.gildings.gid_3 != null ? (
                <Text style={styles.platinum}>
                  Platinum x{item.data.gildings.gid_3}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  }

  renderSeperator() {
    return <View style={styles.seperator}></View>;
  }
  async loadMore() {
    if (!this.state.isLoading) {
      await this.setState({
        isLoading: true,
      });
      var after = await this.state.apiData.after;
      if (after != null) {
        var url = this.state.url + "?after=" + after;
        this.fetchData(url);
      }
    }
  }
  renderFooter() {
    if (this.state.apiData.after != null) {
      return (
        <View style={styles.footerView}>
          <ActivityIndicator size="large" color="#0090ab" />
        </View>
      );
    } else {
      return (
        <View style={styles.footerView}>
          <Text
            style={{
              color: "white",
              fontFamily: "Quicksand-Bold",
              alignSelf: "center",
            }}
          >
            No more posts :(
          </Text>
        </View>
      );
    }
  }
  renderSideBar() {
    return (
      <View style={styles.sideMenu}>
        <View style={styles.sideMenuHeaderBar}>
          <Text style={styles.sideMenuHeaderText}>subreddits</Text>
        </View>
        <Text style={{ color: "#0090ab", fontFamily: "Quicksand-Bold" }}>
          Search
        </Text>
        <TextInput
          ref={(ref) => {
            this.searchBarRef = ref;
          }}
          autoCapitalize={"none"}
          onSubmitEditing={() => {
            this.setUrl(this.state.search_text);
          }}
          s
          style={styles.searchInput}
          onChangeText={(text) => {
            this.handleSubredditSearch(text);
          }}
        />
        <Text
          style={{
            color: "#0090ab",
            fontFamily: "Quicksand-Bold",
            marginTop: 30,
          }}
        >
          Favourites
        </Text>
        {this.state.pre_subreddits.map(function (item, key) {
          return (
            <TouchableOpacity
              key={key}
              onPress={() => {
                this.setUrl(item);
              }}
              style={styles.sideMenuItem}
            >
              <Text style={styles.sideMenuText}>r/{item}</Text>
            </TouchableOpacity>
          );
        }, this)}
      </View>
    );
  }
  async setUrl(subreddit) {
    if (subreddit != null) {
      this.setState({
        modalVisible: true,
      });
      await this.setState({
        url: "https://reddit.com/r/" + subreddit + ".json",
        current_subreddit: subreddit,
      });
      if (this.flatListRef != null) {
        await this.flatListRef.scrollToOffset({ animated: true, offset: 0 });
        this.drawerRef.closeDrawer();
      } else {
        this.drawerRef.closeDrawer();
      }
      this.fetchData();
      this.searchBarRef.clear();
    }
  }
  renderList() {
    if (this.state.subreddit_exists == null) {
      return (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator color="#0090ab" />
        </View>
      );
    } else if (this.state.subreddit_exists) {
      return (
        <FlatList
          ref={(ref) => {
            this.flatListRef = ref;
          }}
          initialNumToRender={0}
          data={this.state.apiChildren}
          renderItem={this.renderPost}
          keyExtractor={(item, index) => item.data.id}
          onEndReached={this.loadMore}
          onEndReachedThreshold={0.01}
          ListFooterComponent={this.renderFooter}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this.refresh}
              progressBackgroundColor={"#00161A"}
              colors={["#0090ab", "#0090ab", "#00161A"]}
            />
          }
        />
      );
    } else {
      return (
        <Text
          style={{
            color: "white",
            fontFamily: "Quicksand-Regular",
            alignSelf: "center",
            marginTop: "30%",
          }}
        >
          Subreddit does not exist!
        </Text>
      );
    }
  }
  render() {
    var loading = this.state.isLoading;
    return (
      <View style={{ backgroundColor: "black", flex: 1 }}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <View
              style={{
                alignSelf: "center",
                backgroundColor: "#222632",
                height: "20%",
                justifyContent: "center",
                width: "80%",
                paddingBottom: 20,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  color: "white",
                  fontFamily: "Quicksand-Bold",
                  marginBottom: 20,
                }}
              >
                Loading subreddit
              </Text>
              <ActivityIndicator size="large" color="#0090ab" />
            </View>
          </View>
        </Modal>
        <StatusBar backgroundColor="#001316" />
        <DrawerLayoutAndroid
          ref={(ref) => {
            this.drawerRef = ref;
          }}
          drawerWidth={300}
          drawerPosition={DrawerLayoutAndroid.positions.Left}
          renderNavigationView={this.renderSideBar}
        >
          <View style={styles.parentContainer}>
            <View style={styles.headerBar}>
              <View style={styles.headerLeftContainer}>
                <TouchableOpacity
                  style={styles.headerTouchableOpacity}
                  onPress={() => {
                    this.drawerRef.openDrawer();
                  }}
                >
                  <Image width={35} height={35} source={menu_icon} />
                </TouchableOpacity>
              </View>
              <View style={styles.headerCenterContainer}>
                <Text style={styles.headerText}>reflex</Text>
              </View>
            </View>
            <View style={styles.subredditBar}>
              <View style={styles.headerCenterContainer}>
                <Text style={styles.subredditBarText}>
                  r/{this.state.current_subreddit}
                </Text>
              </View>
            </View>
            {this.renderList()}
          </View>
        </DrawerLayoutAndroid>
      </View>
    );
  }
}

export default MainPage;

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    backgroundColor: "black",
    width: "100%",
    height: "100%",
  },
  subredditBar: {
    backgroundColor: "#0090ab",
    width: "100%",
    height: "6%",
  },
  subredditBarText: {
    marginTop: 10,
    fontFamily: "Quicksand-Bold",
    color: "black",
    fontSize: 12,
  },
  searchInput: {
    color: "#0090ab",
    textAlign: "center",
    fontFamily: "Quicksand-Bold",
    marginTop: 20,
    backgroundColor: "black",
    width: "90%",
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 5,
    borderColor: "#0090ab",
  },
  sideMenuHeaderBar: {
    backgroundColor: "#00161A",
    width: "100%",
    height: "12%",
    justifyContent: "center",
  },
  sideMenuHeaderText: {
    marginTop: 15,
    alignSelf: "center",
    flex: 1,
    fontFamily: "Quicksand-Bold",
    color: "#0090ab",
    fontSize: 20,
  },
  sideMenuItem: {
    marginTop: 20,
    backgroundColor: "#0090ab",
    width: "90%",
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 5,
  },
  sideMenuText: {
    color: "#111214",
    fontFamily: "Quicksand-Bold",
    fontSize: 15,
    marginLeft: 10,
  },
  sideMenu: {
    flex: 1,
    backgroundColor: "#00161A",
    height: "100%",
    alignItems: "center",
  },
  heart: {
    marginRight: 8,
    marginLeft: 8,
  },
  silver: {
    marginLeft: 5,
    color: "#c0c0c0",
    fontFamily: "Quicksand-Regular",
  },
  gold: {
    marginLeft: 5,
    color: "#ffff00",
    fontFamily: "Quicksand-Regular",
  },
  platinum: {
    marginLeft: 5,
    color: "#e5e4e2",
    fontFamily: "Quicksand-Regular",
  },
  username: {
    color: "white",
    fontFamily: "Quicksand-Light",
    marginLeft: 8,
    fontSize: 11,
    marginBottom: 10,
  },
  headerLeftContainer: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 20,
    left: 10,
  },
  headerCenterContainer: {
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  headerTouchableOpacity: {
    width: 100,
    height: 100,
  },
  headerBar: {
    backgroundColor: "#00161A",
    width: "100%",
    height: "12%",
    flexDirection: "row",
  },
  headerText: {
    marginTop: 20,
    fontFamily: "Quicksand-Bold",
    color: "#0090ab",
    fontSize: 20,
  },
  postContainer: {
    alignSelf: "center",
    marginTop: 20,
    paddingTop: 10,
    backgroundColor: "#111214",
    width: "96%",
    borderRadius: 5,
    marginBottom: 5,
  },
  selfText: {
    color: "white",
    fontFamily: "Quicksand-Regular",
    fontSize: 12,
    paddingRight: 10,
    marginLeft: 8,
    marginBottom: 10,
  },
  titleText: {
    color: "#0090ab",
    fontFamily: "Quicksand-Bold",
    fontSize: 12,
    paddingRight: 10,
    marginLeft: 8,
    marginBottom: 10,
  },
  urlText: {
    color: "white",
    fontFamily: "Quicksand-Regular",
    fontSize: 12,
    paddingRight: 10,
    marginLeft: 8,
    marginBottom: 10,
  },
  seperator: {
    backgroundColor: "white",
    width: "100%",
    height: 1,
  },
  footerView: {
    marginTop: 20,
    paddingBottom: 5,
  },
  subreddit: {
    color: "white",
    fontFamily: "Quicksand-Light",
    marginLeft: 8,
    fontSize: 10,
    marginBottom: 10,
  },
  info: {
    flexDirection: "row",
    paddingBottom: 25,
    paddingTop: 20,
  },
  upvotes: {
    color: "white",
    fontFamily: "Quicksand-Bold",
    marginRight: 5,
  },
});
