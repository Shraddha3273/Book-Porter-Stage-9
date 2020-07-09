import React, { Component} from 'react';
import {StyleSheet, View, Text,TouchableOpacity} from 'react-native';
import { DrawerItems} from 'react-navigation-drawer';
import {Avatar} from 'react-native-elements';
// import * as ImagePicker from  'expo-image-picker';
import db from '../config';
import firebase from 'firebase';

export default class CustomSideBarMenu extends Component{
  constructor(){
    super();
    this.state = {
      // image : '#',
      userId : firebase.auth().currentUser.email,
      name : '', 
      docId : ''
    }
  }

 /*fetchImage = (imageName) => {
  var storageRef = firebase.storage().ref().child("user_profiles/" + imageName);
  storageRef.getDownloadURL().then((url) => {
    this.setState({
      image : url
    })
    .catch((error) => {
      this.setState({
        image : '#'
      })
    })
  })
} */

getUserProfile () {
  db.collection('users').where('email_id', '==', this.state.userId).onSnapshot
((querySnap) => {
  querySnap.forEach((doc) => {
    this.setState({
    name : doc.data().first_name + " " + doc.data().last_name,
    docId : doc.id,
    // image : doc.data().image,
    })
  })
})
}

componentDidMount (){
  this.getUserProfile();
  // this.fetchImage(this.state.userId);
}

/*uploadImage = async (uri, imageName) => {
var response = await fetch(uri);
var blob = await response.blob();
var ref = firebase.storage().ref().child("user_profiles/" + imageName);
return ref.put(blob).then((response) => {
  this.fetchImage(imageName);
})
}

selectPicture = async () => {
const {cancelled, uri} = await ImagePicker.launchImageLibraryAsync({
mediaTypes : ImagePicker.mediaTypeOptions.All,
allowsEditing : true,
aspect : [4,3],
quality : 1,
})
if (!cancelled) {
this.uploadImage(uri, this.state.userId);
}
} */

  render(){
    return(
      <View style={{flex:1}}>
        <View style={styles.drawerItemsContainer}>
          <DrawerItems {...this.props}/>
        </View>
        <View style={styles.logOutContainer}>
          <TouchableOpacity style={styles.logOutButton}
          onPress = {() => {
              this.props.navigation.navigate('WelcomeScreen')
              firebase.auth().signOut()
          }}>
            <Text>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container : {
    flex:1
  },
  drawerItemsContainer:{
    flex:0.8
  },
  logOutContainer : {
    flex:0.2,
    justifyContent:'flex-end',
    paddingBottom:30
  },
  logOutButton : {
    height:30,
    width:'100%',
    justifyContent:'center',
    padding:10
  },
  logOutText:{
    fontSize: 30,
    fontWeight:'bold'
  },
  profileImage : {
  flex : 0.75,
  width : "40%",
  height : "40%"
  }
})
