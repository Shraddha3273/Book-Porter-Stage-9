import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableHighlight,
  ScrollView,
FlatList} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import {BookSearch} from 'react-native-google-books';

import MyHeader from '../components/MyHeader';
//import { FlatList } from 'react-native-gesture-handler';

export default class BookRequestScreen extends Component {
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:"",
      requestId : "",
      requestedBookName : "",
      bookStatus : "",
      userDocId : "",
      docId  : "",
      isBookRequestActive : "",
      showFlatList : false,
      dataSource : "",
      imageLink : ""
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }


addRequest = async (bookName,reasonToRequest) => {
  var userId = this.state.userId
  var randomRequestId = this.createUniqueId()
  var books = await BookSearch.searchbook(bookName, 'AIzaSyDhqEpLYf-YNul9kCi8EcrnAKWCYyE_YyA')
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name":bookName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
        "book_status" : "requested",
        "date" : firebase.firestore.FieldValue.serverTimestamp(),
        "image_link" : books.data[0].volumeInfo.imageLinks.smallThumbnail
    })

await this.getBookRequest () 
db.collection('users').where('email_id', '==', userId).get().then().then(
  (snapshot) => {
    snapshot.forEach((doc) => {
      db.collection('users').doc(doc.id).update({
        isBookRequestActive : true
      })
    })
  })

    this.setState({
        bookName :'',
        reasonToRequest : '',
        requestId : randomRequestId
    })

    return Alert.alert("Book Requested Successfully")
  }

  getBookRequest = () => {
var bookRequest = db.collection('requested_books').where('user_id', '==', this.state.userId).get().
then((snapshot)=> {
  snapshot.forEach((doc) => {
    if (doc.data().book_status !== 'received') {
this.setState({
  requestId : doc.data().request_id,
  requestedBookName : doc.data().book_name,
  bookStatus : doc.data().book_status,
  docId : doc.id
})
    }
  })
})
  }

getActiveBookRequest = () => {
  db.collection('users').where('email_id', '==', this.state.userId).onSnapshot(
    querySnap => {
      querySnap.forEach((doc) => {
this.setState({
  isBookRequestActive : doc.data().isBookRequestActive,
  userDocId : doc.id
})
      })
    }
  )
}

componentDidMount(){
  this.getBookRequest();
  this.getActiveBookRequest();
}

sendNotification = () => {
  // to get first name and last name
db.collection('users').where('email_id', '==', this.state.userId).get().then
((snapshot) => {
  snapshot.forEach((doc) => {
    var name = doc.data().first_name
    var lastName = doc.data().last_name
  })
})

// to get donor id and book name
db.collection('all_notifications').where('request_id', '==', this.state.requestId)
.get().then((snapshot) => {
  snapshot.forEach((doc) => {
    var donorId = doc.data().donor_id
    var bookName = doc.data().book_name


//targert user id is the donor id to send notification to the user
db.collection('all_notifications').add({
  "targeted_user_id" : donorId,
  "message" : name + " " + lastName + " " + "received the book " + bookName,
  "notification_status" : "unread",
  "book_name" : bookName
})
})
})
}

updateBookRequestStatus = () => {
// updating the book status after receiving the book
db.collection('requested_books').doc(this.state.docId).update({
  book_status : 'received'
})

// getting the  doc id to update the users doc
db.collection('users').where('email_id', '==', this.state.userId).get().then
((snapshot) => {
  snapshot.forEach((doc) => {
    db.collection('users').doc(doc.id).update({
      isBookRequestActive : false
    })
  })
})
}

receivedBooks = (bookName) => {
var userId = this.state.userId
var requestId = this.state.requestId

db.collection('received_books').add({
  "user_id" : userId,
  "book_name" : bookName,
  "request_id" : requestId,
  "bookStatus" : "unread"
})
}

async getBooksFromAPI (bookName) {
this.setState({
  bookName : bookName
})
if (bookName.length > 2) {
var books = await BookSearch.searchbook(bookName, 'AIzaSyDhqEpLYf-YNul9kCi8EcrnAKWCYyE_YyA')
this.setState ({
  dataSource : books.data,
  showFlatList : true
})
}
}

renderItem = ({item, i}) => {
  let obj = {
    title : item.volumeInfo.title,
    selfLink : item.selfLink,
    buyLink : item.saleInfo.buyLink,
    imageLink : item.volumeInfo.imageLinks
  }
return(
<TouchableHighlight 
style = {styles.highlight}
activeOpacity = {0.6}
underlayColor = '#82CAFA'
onPress = {() => {
  this.setState ({
    showFlatList : false,
    bookName : item.volumeInfo.title
  })
}}
bottomDivider
>
<Text>{item.volumeInfo.title}</Text>
</TouchableHighlight>
  );
}

  render(){
    if (this.state.isBookRequestActive === true) {
return (
  <View style = {{flex : 1, justifyContent : 'center'}}>
  <View style = {styles.requestStatus}>
    <Text>Book Name</Text>
<Text>{this.state.requestedBookName}</Text>
<Text>Book Status</Text>
<Text>{this.state.bookStatus}</Text>
  </View>
  <TouchableOpacity 
  style = {styles.button}
  onPress = {() => {
    this.sendNotification()
    this.updateBookRequestStatus()
    this.receivedBooks(this.state.requestedBookName)
  }}
  >
<Text>I have received the book.</Text>
  </TouchableOpacity>
  </View>
)
    }

else {
  return(
    <View style={{flex:1}}>
      <MyHeader title="Request Book" navigation ={this.props.navigation}/>
    <View>

      <TextInput
        style ={styles.formTextInput}
        placeholder={"Enter the book name"}
        onChangeText={(text)=>{this.getBooksFromAPI(text)}}
        onClear = {text => {this.getBooksFromAPI('')}}//
        value={this.state.bookName}
      />

{this.state.showFlatList ?
(<FlatList 
data = {this.state.dataSource}
renderItem = {this.renderItem}
enableEmptySections = {true}
style = {{marginTop : 10}}
keyExtractor = {(item, index) => index.toString()}
/>) 
: (
<View style = {{alignItems : 'center', justifyContent : 'center'}}>
      <TextInput
        style ={[styles.formTextInput,{height:300}]}
        multiline
        numberOfLines ={8}
                placeholder={"Why do you need the book ?"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
            
        </View>
        )}
        </View>
        </View>
    )
  }
}
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#91E5FF',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#21CBFF",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20,
    },
    requestStatus : {
      borderColor : '#91E5FF',
      borderWidth : 2,
      justifyContent : 'center',
      alignItems : 'center',
    },
    highlight : {
      alignItems : 'center',
      backgroundColor : '#82CAFA',
      width : '80%',
      padding : 10
    }
  })
